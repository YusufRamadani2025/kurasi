import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Initialize directly from localStorage
    const savedCart = localStorage.getItem('kurasi_cart')
    return savedCart ? JSON.parse(savedCart) : []
  })
  const [isOpen, setIsOpen] = useState(false)

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('kurasi_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((prev) => {
      // Check if item already exists
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        // Don't duplicate for unique items, maybe just alert or ignore
        // Since these are "unique" pre-owned items, usually quantity is 1
        return prev
      }
      return [...prev, product]
    })
    // Auto-open removed as per user request
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const toggleCart = () => setIsOpen(!isOpen)
  
  const cartTotal = cart.reduce((total, item) => total + item.price, 0)

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      isOpen, 
      toggleCart,
      cartTotal 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
