import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SellerRequest from './pages/SellerRequest'
import AdminDashboard from './pages/AdminDashboard'
import AddProduct from './pages/AddProduct'
import ProductDetail from './pages/ProductDetail'
import SellerDashboard from './pages/SellerDashboard'
import EditProduct from './pages/EditProduct'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import OrderHistory from './pages/OrderHistory'
import CartDrawer from './components/CartDrawer'
import SellerProfile from './pages/SellerProfile'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Navbar />
                <CartDrawer />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/seller-request" element={<SellerRequest />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/add-product" element={<AddProduct />} />
                  <Route path="/edit-product/:id" element={<EditProduct />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/seller/:id" element={<SellerProfile />} />
                  <Route path="/my-shop" element={<SellerDashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<OrderHistory />} />
                </Routes>
              </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App