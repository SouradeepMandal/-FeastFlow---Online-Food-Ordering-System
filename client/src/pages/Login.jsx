import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { login, loginOtp, reset } from '../features/auth/authSlice';
import { LogIn, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [searchParams] = useSearchParams();
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    password: '',
    otp: '',
  });

  const { email, password, otp } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    if (isSuccess || user) {
      if (isSuccess) toast.success('Welcome back!');
      // Regular login always goes to customer-facing pages
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
    
    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Please enter your email first');
      return;
    }
    
    setIsSendingOtp(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('OTP sent to your email');
        setOtpSent(true);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (loginMethod === 'password') {
      const userData = { email, password };
      dispatch(login(userData));
    } else {
      const userData = { email, otp };
      dispatch(loginOtp(userData));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-primary flex items-center justify-center gap-2">
            <LogIn className="w-8 h-8" />
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-2">Log in to order your favorites</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
            <button
              onClick={() => setLoginMethod('password')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                loginMethod === 'password'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setLoginMethod('otp')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                loginMethod === 'otp'
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              OTP
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="input-field"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              required
            />
          </div>

          {loginMethod === 'password' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                className="input-field"
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Enter password"
                required
              />
            </div>
          )}

          {loginMethod === 'otp' && (
            <div>
              <label className="block text-sm font-medium mb-2">OTP</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={onChange}
                  placeholder="Enter 6-digit OTP"
                  required={otpSent}
                  disabled={!otpSent}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || !email}
                  className="btn-secondary whitespace-nowrap flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {isSendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={isLoading || (loginMethod === 'otp' && !otpSent)}>
            {isLoading ? 'Loading...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          New to FeastFlow?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </p>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-400 mb-2">Are you a Restaurant Owner?</p>
          <Link
            to="/owner-login"
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
          >
            🍽️ Go to Owner Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
