import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, User, LogOut, Sun, Moon, Menu as MenuIcon, X, Mail, Store } from 'lucide-react';
import { logout } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import axios from 'axios';

const Navbar = () => {
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const { data } = await axios.get('/api/notifications/unread-count', { withCredentials: true });
          setUnreadCount(data.unreadCount || 0);
        } catch (error) {
          console.error('Failed to fetch unread notifications', error);
        }
      }
    };
    fetchUnreadCount();
    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(intervalId);
  }, [user]);

  const toggleTheme = () => setIsDark(!isDark);

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to={user?.role === 'admin' ? '/admin' : user?.role === 'restaurant_owner' ? '/owner' : '/'} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-display font-bold text-xl shadow-lg shadow-primary/30">
              F
            </div>
            <span className="font-display font-bold text-2xl tracking-tight hidden sm:block">FeastFlow</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/menu" className="font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Menu</Link>
            
            <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </span>
              )}
            </Link>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-700 pl-8">
                {user.role === 'customer' && (
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/onboarding/trigger', {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${user.token}` }
                        });
                        const data = await res.json();
                        if (res.ok) toast.success(data.message);
                        else toast.error(data.message);
                      } catch (e) {
                        toast.error('Failed to trigger onboarding');
                      }
                    }}
                    className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    Become a Partner
                  </button>
                )}
                {user.role === 'admin' && (
                  <div className="flex gap-3 mr-4">
                    <Link to="/admin" className="text-xs font-semibold px-3 py-1 bg-primary text-white hover:bg-primary-dark rounded-full transition-colors flex items-center shadow-md">
                      Admin Dashboard
                    </Link>
                    <Link to="/menu" className="text-xs font-semibold px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-colors flex items-center">
                      Customer View
                    </Link>
                    <Link to="/owner" className="text-xs font-semibold px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-colors flex items-center">
                      Owner View
                    </Link>
                  </div>
                )}
                {user.role === 'restaurant_owner' && (
                  <div className="flex gap-3 mr-4">
                    <Link to="/owner" className="text-xs font-semibold px-3 py-1 bg-primary text-white hover:bg-primary-dark rounded-full transition-colors flex items-center shadow-md">
                      Owner Dashboard
                    </Link>
                  </div>
                )}
                <Link to="/inbox" className="relative text-gray-400 hover:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200 hover:text-primary transition-colors">
                  <User className="w-5 h-5" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>
                <button onClick={logoutHandler} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-700 pl-8">
                <Link to="/login" className="font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Log In</Link>
                <Link to="/register" className="btn-primary py-2 px-6">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 dark:text-gray-300">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 px-4 py-6 space-y-4 shadow-xl">
          <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)} className="block font-semibold py-2">Menu</Link>
          <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="block font-semibold py-2 flex items-center gap-2">
            Cart 
            {cartItems.length > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                {cartItems.reduce((a, c) => a + c.qty, 0)}
              </span>
            )}
          </Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block font-semibold py-2 text-primary">
                  Admin Dashboard
                </Link>
              )}
              {user.role === 'restaurant_owner' && (
                <Link to="/owner" onClick={() => setIsMobileMenuOpen(false)} className="block font-semibold py-2 text-primary">
                  Owner Dashboard
                </Link>
              )}
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block font-semibold py-2">
                My Profile
              </Link>
              <button onClick={() => { logoutHandler(); setIsMobileMenuOpen(false); }} className="block font-semibold py-2 text-red-500 w-full text-left">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block font-semibold py-2">Log In</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block font-semibold py-2 text-primary">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
