import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Inbox from './pages/Inbox';
import OwnerOnboarding from './pages/OwnerOnboarding';
import OwnerDashboard from './pages/OwnerDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OwnerLogin from './pages/OwnerLogin';

function App() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            style: {
              background: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      <Navbar />
      <main className="pb-20 md:pb-0">
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderTracking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/owner-onboarding" element={<OwnerOnboarding />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/" element={
          <div className="p-8 text-center mt-10">
            <h1 className="text-5xl font-display font-bold text-primary mb-6">FeastFlow</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Order your favorite food with a single tap.</p>
            <Link to="/menu" className="btn-primary text-lg">Browse Menu</Link>
          </div>
        } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
