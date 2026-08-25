import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../features/auth/authSlice';
import { Store, ChefHat, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const OwnerLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === 'restaurant_owner') {
      navigate('/owner');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/owner-login', {
        username: formData.username,
        password: formData.password,
      }, { withCredentials: true });

      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        dispatch({ type: 'auth/login/fulfilled', payload: response.data });
        toast.success(`Welcome back, ${response.data.name}! 👨‍🍳`);
        navigate('/owner');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-rose-700 flex-col items-center justify-center p-16">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative z-10 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
              <Store className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">FeastFlow</h1>
          <p className="text-xl text-orange-100 mb-12 font-light">Restaurant Owner Portal</p>

          <div className="space-y-6 text-left">
            {[
              { icon: ChefHat, title: 'Manage Your Menu', desc: 'Add, edit, and control your dish offerings in real-time' },
              { icon: ArrowRight, title: 'Live Order Pipeline', desc: 'Track all incoming orders and manage your kitchen flow' },
              { icon: Shield, title: 'AI Marketing Tools', desc: 'Generate stunning content for your restaurant brand' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-orange-200 text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-950">
        <div className="w-full max-w-md">
          {/* Logo (mobile) */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/30">
              <Store className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">FeastFlow</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-white mb-2">Owner Sign In</h2>
            <p className="text-gray-400">Access your restaurant management portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Owner Username / Email
              </label>
              <input
                type="email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="your-email@example.com"
                required
                className="w-full px-4 py-3.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 placeholder-gray-600 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1.5">This is your email address sent in the approval notification.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Owner Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your owner password"
                  required
                  className="w-full px-4 py-3.5 bg-gray-900 border border-gray-700 text-white rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 placeholder-gray-600 pr-12 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Your password was sent via email when your application was approved.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all shadow-xl shadow-orange-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing in...</span></>
              ) : (
                <><ChefHat className="w-5 h-5" /><span>Enter Owner Portal</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-800 space-y-3">
            <p className="text-center text-gray-500 text-sm">Not an owner yet?</p>
            <div className="flex gap-3">
              <Link
                to="/login"
                className="flex-1 py-3 text-center rounded-xl text-gray-300 bg-gray-900 hover:bg-gray-800 border border-gray-700 font-medium transition-colors text-sm"
              >
                Customer Login
              </Link>
              <Link
                to="/menu"
                className="flex-1 py-3 text-center rounded-xl text-gray-300 bg-gray-900 hover:bg-gray-800 border border-gray-700 font-medium transition-colors text-sm"
              >
                Browse Menu
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-gray-600 text-xs">
            Having trouble? Contact{' '}
            <a href="mailto:souradeepmandal459@gmail.com" className="text-orange-500 hover:underline">
              support@feastflow.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerLogin;
