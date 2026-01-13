import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../context/CartContext'
import { ArrowLeft, ShoppingCart, User, Store, Mail, MapPin, Loader2, Star, ShoppingBag } from 'lucide-react'

const SellerProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  useEffect(() => {
    fetchSellerData()
  }, [id])

  const fetchSellerData = async () => {
    try {
      setLoading(true)
      
      // 1. Fetch Seller Profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'seller')
        .single()

      if (sellerError) throw sellerError
      setSeller(sellerData)

      // 2. Fetch Seller's Products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', id)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError
      setProducts(productsData)

      // 3. Calculate Seller Rating (Average of all product reviews)
      if (productsData && productsData.length > 0) {
        const productIds = productsData.map(p => p.id)
        const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('rating')
            .in('product_id', productIds)
        
        if (reviewsData && reviewsData.length > 0) {
            const totalRating = reviewsData.reduce((sum, item) => sum + item.rating, 0)
            const avg = (totalRating / reviewsData.length).toFixed(1)
            setAverageRating(avg)
            setTotalReviews(reviewsData.length)
        }
      }

    } catch (error) {
      console.error('Error fetching seller data:', error)
      // Redirect if seller not found or error
      // navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAdd = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  if (loading) {
    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
             <div className="flex flex-col items-center">
                 <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                 <span className="text-gray-500 dark:text-gray-400 font-medium">Loading seller profile...</span>
             </div>
        </div>
    )
  }

  if (!seller) {
      return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-950 text-center p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Seller Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">The seller you are looking for does not exist or is no longer active.</p>
            <Link to="/" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Return to Home</Link>
        </div>
      )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen font-sans text-gray-900 dark:text-gray-100 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
        </button>

        {/* Seller Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mb-12 transition-colors duration-300">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative"></div>
            <div className="px-8 pb-8">
                <div className="relative -mt-12 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
                    <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-900 p-1 shadow-md">
                        <div className="h-full w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            {seller.avatar_url ? (
                                <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-gray-400" />
                            )}
                        </div>
                    </div>
                    <div className="flex-1 pb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                            {seller.full_name || seller.email?.split('@')[0]}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 mt-3 text-sm">
                            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                                <Store className="h-4 w-4" /> Verified Seller
                            </span>
                            {totalReviews > 0 && (
                                <span className="flex items-center gap-1.5 text-yellow-700 dark:text-yellow-400 font-medium bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-full border border-yellow-100 dark:border-yellow-800">
                                    <Star className="h-4 w-4 fill-current" /> {averageRating} ({totalReviews} Reviews)
                                </span>
                            )}
                            {seller.address && (
                                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                    <MapPin className="h-4 w-4 text-gray-400" /> {seller.address}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                                <ShoppingBag className="h-4 w-4 text-gray-400" />
                                {products.length} Active Listings
                            </span>
                        </div>
                    </div>
                    <div className="pb-2">
                        <button 
                            onClick={() => window.location.href = `mailto:${seller.email}`}
                            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                        >
                            <Mail className="h-4 w-4" /> Contact
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Product Grid */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Latest from {seller.full_name || 'this seller'}</h2>
        
        {products.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <div className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4">
                    <ShoppingBag className="h-full w-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
                <p className="text-gray-500 dark:text-gray-400">This seller hasn't listed any items yet.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
                    <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className={`w-full h-full object-cover object-center ${product.status === 'sold' ? 'grayscale opacity-75' : ''}`}
                    />
                    
                    {product.status === 'sold' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                            <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider shadow-lg transform -rotate-6">
                                Sold Out
                            </span>
                        </div>
                    )}

                    <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2.5 py-1 rounded-md text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                    </div>
                    
                    {/* Quick Add Button - Hide if sold */}
                    {product.status !== 'sold' && (
                        <button 
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 active:scale-95 z-10 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0"
                            title="Add to Cart"
                        >
                            <ShoppingCart className="h-4 w-4" />
                        </button>
                    )}
                    </div>
                    
                    <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {product.name}
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.category || 'Uncategorized'}</p>
                    
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow hidden sm:block">
                        {product.description || 'No description available.'}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(product.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    </div>
                </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  )
}

export default SellerProfile
