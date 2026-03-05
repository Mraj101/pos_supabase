import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Categories from './pages/Categories'
import Products from './pages/Products'
import Customers from './pages/Customers'
import NewSale from './pages/NewSale'
import Payments from './pages/Payments'
import CustomerLedger from './pages/CustomerLedger'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"          element={<Dashboard />} />
            <Route path="categories"         element={<Categories />} />
            <Route path="products"           element={<Products />} />
            <Route path="customers"          element={<Customers />} />
            <Route path="new-sale"           element={<NewSale />} />
            <Route path="payments"           element={<Payments />} />
            <Route path="ledger/:customerId" element={<CustomerLedger />} />
            <Route path="reports"            element={<Reports />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
