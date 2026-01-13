import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

const CartDrawer = () => {
  const { cart, isOpen, toggleCart, removeFromCart, cartTotal } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={toggleCart}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="h-full w-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in transition-colors duration-300">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              Your Cart
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            </h2>
            <button 
              onClick={toggleCart}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                   <ShoppingBag className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                </div>
                <div>
                   <h3 className="text-gray-900 dark:text-white font-medium">Your cart is empty</h3>
                   <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Looks like you haven't added anything yet.</p>
                </div>
                <button 
                  onClick={toggleCart}
                  className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Start Shopping &rarr;
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {cart.map((item) => (
                  <li key={item.id} className="flex py-2">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                          <h3 className="line-clamp-1 mr-4">
                            <Link to={`/product/${item.id}`} onClick={toggleCart} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{item.name}</Link>
                          </h3>
                          <p className="whitespace-nowrap font-bold">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.description}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-gray-500 dark:text-gray-400">Qty 1</p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer / Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white mb-4">
                <p>Subtotal</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                   {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(cartTotal)}
                </p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 mb-6">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="mt-6">
                <Link
                  to="/checkout"
                  onClick={toggleCart}
                  className="w-full flex items-center justify-center rounded-xl border border-transparent bg-gray-900 dark:bg-gray-100 px-6 py-4 text-base font-bold text-white dark:text-gray-900 shadow-sm hover:bg-black dark:hover:bg-white transition-colors"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartDrawer
