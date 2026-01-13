import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { ShoppingBag, LogOut, User, LayoutDashboard, PlusCircle, Store, Sun, Moon, Search, X, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

const Navbar = () => {
  const { user, signOut } = useAuth()
  const { cart, toggleCart } = useCart()
  const { isDarkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsMobileSearchOpen(false)
    } else {
      navigate('/')
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 relative">
          
          {/* Brand & Search */}
          <div className="flex items-center gap-4 flex-1">
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                <Star className="h-5 w-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Kurasi</span>
            </Link>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-md w-full ml-4 hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
              />
            </form>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isMobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* Cart Trigger */}
            <button 
              onClick={toggleCart}
              className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ShoppingBag className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900">
                  {cart.length}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-1 sm:gap-3">
                {/* Role-based Links (Icons only on mobile) */}
                {user.role === 'seller' ? (
                  <Link 
                    to="/my-shop" 
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm"
                    title="My Shop"
                  >
                    <Store className="h-5 w-5 sm:h-4 sm:w-4" />
                    <span className="hidden lg:inline">My Shop</span>
                  </Link>
                ) : user.role === 'admin' ? (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard className="h-5 w-5 sm:h-4 sm:w-4" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </Link>
                ) : (
                   <Link 
                     to="/seller-request" 
                     className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-sm"
                     title="Start Selling"
                   >
                     <PlusCircle className="h-5 w-5 sm:h-4 sm:w-4" />
                     <span className="hidden lg:inline">Start Selling</span>
                   </Link>
                )}

                {/* Divider */}
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>

                {/* User Menu */}
                <div className="flex items-center gap-1 sm:gap-3">
                   <Link to="/profile" className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors group">
                      <div className="text-right hidden lg:block leading-tight group-hover:text-blue-600 transition-colors">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.full_name || user.email.split('@')[0]}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role || 'Member'}</p>
                      </div>
                      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors overflow-hidden">
                          {user.avatar_url ? (
                              <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                              <User className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                          )}
                      </div>
                   </Link>
                   {/* Logout hidden on really small screens, maybe put in profile? No, let's keep it but small */}
                   <button 
                      onClick={signOut}
                      className="hidden sm:block p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Logout"
                   >
                      <LogOut className="h-5 w-5" />
                   </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm px-3 py-2">
                  Log in
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow-md hidden sm:block">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Search Bar Overlay */}
        {isMobileSearchOpen && (
          <div className="md:hidden py-3 pb-4 border-t border-gray-100 dark:border-gray-800 animate-slide-down">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
              />
            </form>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

