import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Loader2, ShieldCheck, Users, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from '../context/ToastContext'

const AdminDashboard = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    if (user?.role === 'admin') {
        fetchRequests()
    }
  }, [user, navigate])

  if (user && user.role !== 'admin') {
      return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-md w-full">
                  <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">You must be an admin to view this page. Your current role is: <span className="font-bold text-red-600 capitalize">{user.role || 'User'}</span></p>
                  <button onClick={() => navigate('/')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all active:scale-95">Go Home</button>
              </div>
          </div>
      )
  }

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_requests')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setRequests(data)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId, userId) => {
    try {
        const { error: reqError } = await supabase
            .from('seller_requests')
            .update({ status: 'approved' })
            .eq('id', requestId)
        
        if (reqError) throw reqError

        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'seller' })
            .eq('id', userId)

        if (profileError) throw profileError

        fetchRequests()
        toast.success('User approved as Seller!')

    } catch (error) {
        console.error('Error approving:', error)
        toast.error('Failed to approve.')
    }
  }

  const handleReject = async (requestId) => {
    if (!confirm('Are you sure you want to reject this request?')) return

    try {
        const { error } = await supabase
            .from('seller_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId)
        
        if (error) throw error
        fetchRequests()
    } catch (error) {
        console.error('Error rejecting:', error)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  )

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-blue-600" />
                    Admin Dashboard
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Manage seller requests and overall platform security.</p>
            </div>
            <div className="flex items-center gap-4 bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{requests.length}</span>
                    <span className="text-xs text-gray-500">Requests</span>
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors duration-300">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Seller Applications</h3>
          </div>
          
          {requests.length === 0 ? (
             <div className="p-20 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-full mb-4">
                    <Users className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-lg font-medium">No pending requests found.</p>
                <p className="text-sm mt-1">When users apply to sell, they'll appear here.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shop Information</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applicant</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{req.shop_name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 max-w-xs" title={req.description}>
                              {req.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-400 mr-3">
                                  {req.profiles?.email?.[0].toUpperCase()}
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white font-medium">{req.profiles?.email}</div>
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-[10px] uppercase tracking-wider font-bold rounded-lg border 
                          ${req.status === 'approved' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50' : 
                            req.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50' : 
                            'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(req.created_at).toLocaleDateString()}
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {req.status === 'pending' ? (
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => handleApprove(req.id, req.user_id)}
                                    className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-1">
                                    <CheckCircle2 size={14} /> Approve
                                </button>
                                <button 
                                    onClick={() => handleReject(req.id)}
                                    className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-1">
                                    <XCircle size={14} /> Reject
                                </button>
                            </div>
                        ) : (
                            <span className="text-gray-400 dark:text-gray-600 italic text-xs">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

