import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import { ArrowRight, CheckCircle, Shield, Truck, ShoppingBag, ShoppingCart, SearchX, User, Star, Store, MapPin } from 'lucide-react'

const Home = () => {
  const [products, setProducts] = useState([])
  const [sellers, setSellers] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  const categories = ['All', 'Electronics', 'Fashion', 'Collectibles', 'Furniture', 'Art', 'Vehicles', 'Other']

  useEffect(() => {
    fetchProducts()
    fetchSellers()
    fetchRecentReviews()
  }, [])

  const fetchRecentReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(full_name, email, avatar_url),
          product:products(name, image_url)
        `)
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) throw error
      setRecentReviews(data)
    } catch (error) {
      console.error('Error fetching recent reviews:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles(email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSellers = async () => {
    try {
      const { data: sellersData, error: sellersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .limit(10)

      if (sellersError) throw sellersError

      const sellersWithRatings = await Promise.all(sellersData.map(async (seller) => {
        const { data: productsData } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', seller.id)
        
        if (productsData && productsData.length > 0) {
          const productIds = productsData.map(p => p.id)
          const { data: reviewsData } = await supabase
            .from('reviews')
            .select('rating')
            .in('product_id', productIds)
          
          if (reviewsData && reviewsData.length > 0) {
            const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
            return { ...seller, avgRating: avg.toFixed(1), totalReviews: reviewsData.length }
          }
        }
        return { ...seller, avgRating: 0, totalReviews: 0 }
      }))

      setSellers(sellersWithRatings)
    } catch (error) {
      console.error('Error fetching sellers:', error)
    }
  }

  const handleQuickAdd = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
             <div className="flex flex-col items-center">
                 <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <span className="text-gray-500 dark:text-gray-400 font-medium">Loading marketplace...</span>
             </div>
        </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {!searchQuery && (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-28">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <div className="text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-6">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                          Live Marketplace
                      </div>
                      <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight mb-4 lg:mb-6">
                          Discover Quality <br/>
                          <span className="text-blue-600 dark:text-blue-500">Pre-owned Goods.</span>
                      </h1>
                      <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                          Kurasi connects you with trusted sellers offering unique, verified items. 
                          Safe transactions, quality assurance, and a community of enthusiasts.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                          <a href="#browse" className="inline-flex justify-center items-center px-6 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">
                              Start Browsing
                          </a>
                          {(!user || user.role !== 'seller') && (
                            <Link to={user ? "/seller-request" : "/register"} className="inline-flex justify-center items-center px-6 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-all">
                                Become a Seller
                            </Link>
                          )}
                      </div>
                      
                      <div className="mt-8 lg:mt-10 flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-gray-500 dark:text-gray-400 font-medium">
                          <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" /> Verified Sellers
                          </div>
                          <div className="flex items-center gap-2">
                              <Shield className="h-5 w-5 text-blue-500" /> Secure Platform
                          </div>
                      </div>
                  </div>
                  
                  <div className="relative hidden lg:block">
                       <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl transform rotate-2"></div>
                       <img 
                          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                          alt="Product Showcase" 
                          className="relative rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full object-cover transform -rotate-1 hover:rotate-0 transition-transform duration-500"
                       />
                  </div>
              </div>
          </div>
        </div>
      )}

      <main id="browse" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full flex-grow">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {searchQuery ? `Search results for "${searchQuery}"` : 'Explore Categories'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
                  {searchQuery ? `Found ${filteredProducts.length} items` : 'Find exactly what you\'re looking for'}
                </p>
            </div>
        </div>
        
        {!searchQuery && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => (
                  <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
             <div className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4">
                 <SearchX className="h-full w-full" />
             </div>
             <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-6">
               {searchQuery ? "We couldn't find anything matching your search." : "Try selecting a different category."}
             </p>
             {searchQuery && (
               <Link to="/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                 Clear search and browse all products
               </Link>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
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
                      <div className="flex items-center gap-2">
                          <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-400">
                              {product.seller?.email?.[0].toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{product.seller?.email?.split('@')[0]}</span>
                      </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Recommended Sellers Section */}
        {sellers.length > 0 && !searchQuery && (
          <div className="mt-16 sm:mt-24">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  Recommended Sellers
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Top rated curators you might like</p>
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
              {sellers.map((seller) => (
                <div key={seller.id} className="min-w-[260px] snap-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">
                  <div className="h-20 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
                      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                        <div className="h-20 w-20 rounded-full bg-white dark:bg-gray-900 p-1">
                            <div className="h-full w-full rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center">
                                {seller.avatar_url ? (
                                    <img src={seller.avatar_url} alt={seller.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} className="text-gray-400 dark:text-gray-500" />
                                )}
                            </div>
                        </div>
                      </div>
                  </div>
                  <div className="pt-12 pb-6 px-5 flex flex-col items-center flex-grow">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 mb-1">
                      {seller.full_name || seller.email?.split('@')[0]}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Store className="h-3.5 w-3.5 text-blue-500 fill-current" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Verified Seller</span>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                        <div className="flex text-yellow-400">
                            <Star className={`h-3.5 w-3.5 ${seller.totalReviews > 0 ? 'fill-current' : 'opacity-30'}`} />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {seller.totalReviews > 0 ? seller.avgRating : 'No reviews'}
                        </span>
                        {seller.totalReviews > 0 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                ({seller.totalReviews})
                            </span>
                        )}
                    </div>
                    {seller.address && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-4 line-clamp-1">
                            <MapPin className="h-3 w-3" /> {seller.address}
                        </p>
                    )}
                    <div className="mt-auto w-full pt-4">
                        <Link 
                        to={`/seller/${seller.id}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all border border-gray-200 dark:border-gray-700 hover:border-transparent flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                        >
                        Visit Shop <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searchQuery && (
          <div className="mt-24 sm:mt-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Aman dan Terlindungi</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Komunitas jual beli aman dan seru, tempat pembeli dan penjual berbagi review asli yang terverifikasi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentReviews.length > 0 ? (
                recentReviews.map((review) => (
                  <div key={review.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex text-blue-600">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-200 dark:text-gray-700" : ""} />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-6 flex-grow italic">
                      "{review.comment}"
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                          {review.user?.avatar_url ? (
                            <img src={review.user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={16} /></div>
                          )}
                        </div>
                        <div className="leading-tight">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[80px]">
                            {review.user?.full_name || review.user?.email?.split('@')[0]}
                          </p>
                          <p className="text-[10px] text-gray-500">Pembeli</p>
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50">
                        <img src={review.product?.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                )) 
              ) : (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex text-blue-600 mb-3"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 italic">"Barangnya bagus banget, masih mulus sesuai deskripsi. Pengiriman cepat!"</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">U</div>
                        <div><p className="text-xs font-bold text-gray-900 dark:text-white">User_{i}</p><p className="text-[10px] text-gray-500">Pembeli</p></div>
                      </div>
                      <div className="h-10 w-10 rounded-lg bg-gray-100"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {!searchQuery && (
        <section className="relative bg-gray-900 py-20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600 rounded-full blur-[120px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
              Download Kurasi untuk <br className="hidden sm:block" /> iPhone dan Android
            </h2>
            <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg">
              Dapatkan pengalaman belanja barang kurasi terbaik langsung dari smartphone kamu.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#" className="transform transition hover:scale-105 active:scale-95">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-12 w-auto" />
              </a>
              <a href="#" className="transform transition hover:scale-105 active:scale-95">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-12 w-auto" />
              </a>
            </div>
          </div>
        </section>
      )}
      
      <Footer />
    </div>
  )
}

export default Home
