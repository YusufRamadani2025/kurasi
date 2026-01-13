import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, CreditCard, Loader2 } from 'lucide-react';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
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
      toast.success('Order placed successfully!');
      navigate('/orders');

    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 dark:text-blue-400 hover:underline">
          Go back to shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Shipping & Payment */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                <MapPin className="text-blue-600 dark:text-blue-500" /> Shipping Address
              </h2>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full address..."
                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-32 resize-none transition-all"
                required
              />
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                <CreditCard className="text-blue-600 dark:text-blue-500" /> Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="manual_transfer"
                    checked={paymentMethod === 'manual_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Bank Transfer (Manual)</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Transfer to BCA 1234567890</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Cash on Delivery</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Pay when you receive</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 h-fit transition-colors duration-300">
             <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
             <div className="space-y-4 mb-6">
               {cart.map(item => (
                 <div key={item.id} className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                        {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover"/>}
                     </div>
                     <span className="text-gray-900 dark:text-white font-medium">
                       {item.name} <span className="text-gray-500 dark:text-gray-400 ml-1">x1</span>
                     </span>
                   </div>
                   <span className="font-bold text-gray-900 dark:text-white">
                     {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
                   </span>
                 </div>
               ))}
             </div>
             
             <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between items-center font-bold text-lg mb-6 text-gray-900 dark:text-white">
               <span>Total</span>
               <span className="text-blue-600 dark:text-blue-400">
                 {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(cartTotal)}
               </span>
             </div>

             <button 
               onClick={handleCheckout}
               disabled={loading}
               className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:scale-100 active:scale-95 flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20"
             >
               {loading ? <Loader2 className="animate-spin" /> : <Truck size={20} />}
               Place Order
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;