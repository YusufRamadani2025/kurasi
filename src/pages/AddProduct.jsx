import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Upload, Package, ArrowLeft, Loader2 } from 'lucide-react'

const AddProduct = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState('available')
  const [category, setCategory] = useState('Electronics')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirect if not seller
  if (user && user.role !== 'seller' && user.role !== 'admin') {
    return <div className="p-12 text-center text-red-600 font-bold dark:bg-gray-950 min-h-screen">Unauthorized. Sellers only.</div>
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image) return alert('Please upload an image')
    
    setLoading(true)
    try {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, image)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('products')
        .insert([
          {
            name,
            description,
            price: parseFloat(price),
            image_url: publicUrl,
            seller_id: user.id,
            status: status,
            category: category
          }
        ])

      if (dbError) throw dbError

      alert('Product added successfully!')
      navigate('/my-shop')
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Failed to add product: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <button 
            onClick={() => navigate('/my-shop')}
            className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 text-center">
            <div className="mx-auto h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
               <Package className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Add New Product
            </h1>
            <p className="text-blue-100 mt-2 text-sm max-w-sm mx-auto">
              Share your curated item with the community. Please ensure photos are clear and details are accurate.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* Image Upload Area */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Image</label>
              <div 
                onClick={() => document.getElementById('image-input').click()}
                className={`mt-1 flex flex-col items-center justify-center px-6 pt-10 pb-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group
                  ${imagePreview ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
              >
                {imagePreview ? (
                  <div className="space-y-4 text-center w-full">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md">
                       <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                          Change Image
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <Upload className="h-8 w-8" />
                    </div>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                      <span className="relative font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500">Upload a file</span>
                      <span className="pl-1">or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
              <input id="image-input" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Vintage Leica M3 Camera"
                  className="block w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent py-3 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 transition-colors outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Price (IDR)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-500 sm:text-sm font-medium">Rp</span>
                  </div>
                  <input
                    type="number"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 transition-colors outline-none"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent py-3 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 transition-colors outline-none"
                >
                    <option value="available">Available</option>
                    <option value="sold">Sold Out</option>
                </select>
              </div>
              
               <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent py-3 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 transition-colors outline-none"
                >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Collectibles">Collectibles</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Art">Art</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the condition, history, and key features..."
                  className="block w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent py-3 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 transition-colors outline-none resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-end gap-4">
              <button
                 type="button"
                 onClick={() => navigate('/my-shop')}
                 className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                  Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto px-8 py-3 border border-transparent rounded-lg shadow-lg text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> Publishing...
                  </span>
                ) : 'Publish Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct

