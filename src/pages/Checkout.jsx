import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, CreditCard, Loader2 } from 'lucide-react';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart(); // Use cartTotal directly
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('manual_transfer');

  useEffect(() => {
    if (user && user.address) {
      setAddress(user.address);
    }
  }, [user]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (cart.length === 0) throw new Error("Your cart is empty");
      if (!address) throw new Error("Please provide a shipping address");

      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: cartTotal,
          shipping_address: address,
          status: 'paid', // Simulating instant payment for MVP
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: 1, // Assume 1 for now as per current CartContext
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Clear Cart & Redirect
      clearCart();
      alert('Order placed successfully!');
      navigate('/orders');

    } catch (error) {
      alert(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
          Go back to shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Shipping & Payment */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <MapPin className="text-blue-600" /> Shipping Address
            </h2>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
              required
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <CreditCard className="text-blue-600" /> Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="payment" 
                  value="manual_transfer"
                  checked={paymentMethod === 'manual_transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">Bank Transfer (Manual)</div>
                  <div className="text-sm text-gray-500">Transfer to BCA 1234567890</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm text-gray-500">Pay when you receive</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
           <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
           <div className="space-y-4 mb-6">
             {cart.map(item => (
               <div key={item.id} className="flex justify-between items-center text-sm">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover"/>}
                   </div>
                   <span>{item.name} <span className="text-gray-500">x1</span></span>
                 </div>
                 <span className="font-medium">Rp {parseInt(item.price).toLocaleString('id-ID')}</span>
               </div>
             ))}
           </div>
           
           <div className="border-t pt-4 flex justify-between items-center font-bold text-lg mb-6">
             <span>Total</span>
             <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
           </div>

           <button 
             onClick={handleCheckout}
             disabled={loading}
             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
           >
             {loading ? <Loader2 className="animate-spin" /> : <Truck />}
             Place Order
           </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;