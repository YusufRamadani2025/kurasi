import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Package, Upload, ArrowLeft, Loader2 } from 'lucide-react'

const EditProduct = () => {
  const { id } = useParams()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [status, setStatus] = useState('available')
  const [category, setCategory] = useState('Electronics')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      
      // Security check: only owner can edit
      if (user && data.seller_id !== user.id && user.role !== 'admin') {
          alert("You don't have permission to edit this product.")
          navigate('/my-shop')
          return
      }

      setName(data.name)
      setDescription(data.description)
      setPrice(data.price)
      setStatus(data.status || 'available')
      setCategory(data.category || 'Electronics')
      setImagePreview(data.image_url)
    } catch (error) {
      console.error('Error fetching product:', error)
      alert('Error fetching product details.')
      navigate('/my-shop')
    } finally {
      setLoading(false)
    }
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
    setUploading(true)
    
    try {
      let publicUrl = imagePreview

      // If new image is selected, upload it
      if (image) {
          const fileExt = image.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `${user.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, image)

          if (uploadError) throw uploadError

          const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath)
            
          publicUrl = data.publicUrl
      }

      // Update Database
      const { error: dbError } = await supabase
        .from('products')
        .update({
            name,
            description,
            price: parseFloat(price),
            image_url: publicUrl,
            status: status,
            category: category
        })
        .eq('id', id)

      if (dbError) throw dbError

      alert('Product updated successfully!')
      navigate('/my-shop')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
             <div className="flex flex-col items-center">
                 <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                 <span className="text-gray-500 dark:text-gray-400 font-medium">Loading product...</span>
             </div>
        </div>
    )
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
          <div className="bg-white dark:bg-gray-900 px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
               <Package className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Edit Product
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* Image Upload Area */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Image</label>
              <div 
                onClick={() => document.getElementById('image-input').click()}
                className="mt-1 flex flex-col items-center justify-center px-6 pt-10 pb-10 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
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
                    <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload new image</span>
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
                disabled={uploading}
                className={`w-full sm:w-auto px-8 py-3 border border-transparent rounded-lg shadow-lg text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5 ${uploading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> Saving...
                  </span>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProduct