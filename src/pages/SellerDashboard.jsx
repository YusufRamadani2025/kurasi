import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Plus, Trash2, Edit, ArrowRight, Loader2 } from 'lucide-react'

const SellerDashboard = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) fetchMyProducts()
  }, [user])

  const fetchMyProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data)
    } catch (error) {
      console.error('Error fetching my products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Update UI
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      alert('Error deleting product: ' + error.message)
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
             <div className="flex flex-col items-center">
                 <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                 <span className="text-gray-500 dark:text-gray-400 font-medium">Loading your shop...</span>
             </div>
        </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
          <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Shop</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your inventory and view performance</p>
          </div>
          <Link 
              to="/add-product" 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
              <Plus className="h-5 w-5" />
              Add New Product
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="h-20 w-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
               <Plus className="h-10 w-10 text-blue-400 dark:text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your inventory is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 mt-2 max-w-sm text-center">Start building your catalog by adding your first unique item.</p>
            <Link to="/add-product" className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-6 py-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
              List an Item Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="group relative bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                      <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                          <Link 
                              to={`/edit-product/${product.id}`}
                              className="bg-white text-blue-600 p-2.5 rounded-full hover:bg-blue-50 transition-colors shadow-lg transform hover:scale-110"
                              title="Edit Product"
                          >
                              <Edit className="h-5 w-5" />
                          </Link>
                          <button 
                              onClick={() => handleDelete(product.id)}
                              className="bg-white text-red-600 p-2.5 rounded-full hover:bg-red-50 transition-colors shadow-lg transform hover:scale-110"
                              title="Delete Product"
                          >
                              <Trash2 className="h-5 w-5" />
                          </button>
                      </div>
                  </div>
                  
                  <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                              product.status === 'sold' 
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700' 
                              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900/50'
                          }`}>
                              {product.status === 'sold' ? 'Sold' : 'Active'}
                          </span>
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 font-bold mb-4">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                      </p>
                      <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                          <span>{new Date(product.created_at).toLocaleDateString()}</span>
                          <Link to={`/product/${product.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">View Live</Link>
                      </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerDashboard