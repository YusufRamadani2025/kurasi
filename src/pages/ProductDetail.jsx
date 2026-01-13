import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Mail, ShieldCheck, UserCheck, Star, Calendar, ShoppingCart, Camera, Loader2, User, Share2 } from 'lucide-react'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Review States
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImage, setReviewImage] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    if (user) {
      checkPurchaseStatus();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles(email, full_name, avatar_url)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setProduct(data)
      fetchRelatedProducts(data.category, data.id)
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Product not found!')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async (category, currentId) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                seller:profiles(email)
            `)
            .eq('category', category)
            .neq('id', currentId)
            .limit(4)
        
        if (error) throw error
        setRelatedProducts(data)
    } catch (error) {
        console.error('Error fetching related products:', error)
    }
  }

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(full_name, email, avatar_url)
      `)
      .eq('product_id', id)
      .order('created_at', { ascending: false });
    
    if (data) setReviews(data);
  };

  const checkPurchaseStatus = async () => {
    const { data: purchaseData } = await supabase
      .from('order_items')
      .select('id, orders(user_id)')
      .eq('product_id', id)
      .eq('orders.user_id', user.id);
      
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', id)
      .eq('user_id', user.id)
      .single();

    if (purchaseData && purchaseData.length > 0 && !existingReview) {
      setCanReview(true);
    } else {
      setCanReview(false);
    }
  };

  const handleContactSeller = () => {
    if (!product) return
    const subject = `Inquiry: ${product.name}`
    const body = `Hi, I am interested in your listing for "${product.name}" on Kurasi.`
    window.location.href = `mailto:${product.seller?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
  
  const handleAddToCart = () => {
    if (product) {
        addToCart(product)
        alert('Product added to cart!');
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      let imageUrl = null;

      if (reviewImage) {
        const fileExt = reviewImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(fileName, reviewImage);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: id,
          user_id: user.id,
          rating: reviewRating,
          comment: reviewComment,
          image_url: imageUrl
        });

      if (error) throw error;

      setReviewComment('');
      setReviewImage(null);
      setReviewRating(5);
      alert('Thank you for your review!');
      fetchReviews();
      checkPurchaseStatus();

    } catch (error) {
      alert(error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
  )
  
  if (!product) return null

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen font-sans text-gray-900 dark:text-gray-100 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Main Image Column */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                 <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative">
                     <img 
                       src={product.image_url} 
                       alt={product.name} 
                       className="absolute inset-0 w-full h-full object-cover"
                     />
                 </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                            product.status === 'sold' 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700' 
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50'
                        }`}>
                            {product.status === 'sold' ? 'Sold Out' : 'Available'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(product.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Share2 size={18} />
                    </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                    {product.name}
                </h1>
                
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 mt-4">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(product.price)}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 py-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">About this item</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm whitespace-pre-line">
                        {product.description}
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center overflow-hidden border border-blue-200 dark:border-blue-800">
                            {product.seller?.avatar_url ? (
                                <img src={product.seller.avatar_url} alt="Seller" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-blue-700 dark:text-blue-400 font-bold text-lg">{product.seller?.email?.[0].toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-wider">Seller</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{product.seller?.full_name || product.seller?.email?.split('@')[0]}</p>
                        </div>
                        <Link to={`/seller/${product.seller_id}`} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            View Shop
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.status === 'sold'}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:scale-100"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {product.status === 'sold' ? 'Sold Out' : 'Add to Cart'}
                    </button>
                    <button
                        onClick={handleContactSeller}
                        className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Mail className="h-5 w-5" />
                        Contact Seller
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 dark:text-white flex items-center gap-2">
                Customer Reviews
                {reviews.length > 0 && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {reviews.length}
                    </span>
                )}
            </h2>
            
            {/* Add Review Form */}
            {canReview && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-12 transition-colors duration-300">
                    <h3 className="text-lg font-semibold mb-6 dark:text-white">Write a Review</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        className={`p-1 transition-transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-700'}`}
                                    >
                                        <Star fill={star <= reviewRating ? "currentColor" : "none"} size={28} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Thoughts</label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                rows="4"
                                placeholder="What do you think about this item?"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo (Optional)</label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm">
                                    <Camera size={20} className="text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{reviewImage ? 'Change Photo' : 'Upload Photo'}</span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setReviewImage(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                                {reviewImage && <span className="text-sm text-gray-500 truncate max-w-[200px]">{reviewImage.name}</span>}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submittingReview}
                            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-md"
                        >
                            {submittingReview ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={18} className="animate-spin" /> Submitting...
                                </span>
                            ) : 'Post Review'}
                        </button>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                        <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No reviews yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">Be the first to share your experience!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                                        {review.user?.avatar_url ? (
                                            <img src={review.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{review.user?.full_name || 'Anonymous'}</p>
                                        <div className="flex text-yellow-400 mt-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-300 dark:text-gray-700" : ""} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">{review.comment}</p>
                            
                            {review.image_url && (
                                <div className="w-full sm:w-48 aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <img src={review.image_url} alt="Review" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Similar Products Section */}
        {relatedProducts.length > 0 && (
            <div className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-16">
                <h2 className="text-2xl font-bold mb-8 dark:text-white">Similar Items</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map((item) => (
                        <Link key={item.id} to={`/product/${item.id}`} className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative">
                                <img 
                                    src={item.image_url} 
                                    alt={item.name} 
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                {item.status === 'sold' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                                        <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider transform -rotate-6">
                                            Sold Out
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {item.name}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{item.category}</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail