import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Store, ArrowLeft, Loader2 } from 'lucide-react'

const SellerRequest = () => {
    const [shopName, setShopName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user) {
            alert('You must be logged in to apply.')
            navigate('/login')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase
                .from('seller_requests')
                .insert([
                    { 
                        user_id: user.id, 
                        shop_name: shopName, 
                        description: description 
                    }
                ])

            if (error) throw error

            alert('Request sent successfully! Please wait for admin approval.')
            navigate('/')
        } catch (error) {
            console.error('Error sending request:', error)
            alert('Failed to send request: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-md mx-auto">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Marketplace
                </button>

                <div className="bg-white dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none transition-colors duration-300">
                    <div className="flex justify-center mb-6">
                        <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                            <Store className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Become a Seller</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-8">Start selling your curated items on Kurasi and reach more buyers.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="shopName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Shop Name</label>
                            <input
                                type="text"
                                id="shopName"
                                required
                                placeholder="e.g. Vintage Treasures"
                                className="block w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent py-2.5 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 transition-colors outline-none"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Shop Description</label>
                            <textarea
                                id="description"
                                rows={4}
                                required
                                placeholder="Tell us about what you plan to sell..."
                                className="block w-full border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent py-2.5 px-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 transition-colors outline-none resize-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending Request...
                                </>
                            ) : 'Send Request'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default SellerRequest

