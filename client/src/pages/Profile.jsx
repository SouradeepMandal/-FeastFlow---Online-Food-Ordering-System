import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Package, Heart, LogOut } from 'lucide-react';
import { logout } from '../features/auth/authSlice';
import axios from 'axios';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.name);
      setEmail(user.email);
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'wishlist') fetchWishlist();
    }
  }, [navigate, user, activeTab]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders/myorders', { withCredentials: true });
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get('/api/auth/wishlist', { withCredentials: true });
      setWishlist(data);
    } catch (error) {
      console.error(error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/auth/profile', { name, email, password }, { withCredentials: true });
      alert('Profile updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft p-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-display font-bold text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-xl">{user?.name}</h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'profile' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                <User className="w-5 h-5" /> Account Details
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                <Package className="w-5 h-5" /> Order History
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'wishlist' ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                <Heart className="w-5 h-5" /> Wishlist
              </button>
              <button 
                onClick={logoutHandler}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-8"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft p-8 min-h-[500px]">
            
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 border-b pb-4">Update Profile</h2>
                <form onSubmit={submitHandler} className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">New Password (optional)</label>
                    <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
                  </div>
                  <button type="submit" className="btn-primary mt-4">Save Changes</button>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 border-b pb-4">Order History</h2>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">You haven't placed any orders yet.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order._id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-primary transition-colors">
                        <div>
                          <p className="font-bold">Order #{order._id.substring(0,8)}</p>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-4 items-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.orderStatus}
                          </span>
                          <span className="font-bold text-lg">${order.totalPrice.toFixed(2)}</span>
                          <button onClick={() => navigate(`/order/${order._id}`)} className="text-primary font-semibold hover:underline">
                            Track
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 border-b pb-4">My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your wishlist is empty.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.map(item => (
                      <div key={item._id} className="flex gap-4 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                        <div>
                          <h3 className="font-bold hover:text-primary cursor-pointer" onClick={() => navigate(`/menu`)}>{item.name}</h3>
                          <p className="text-primary font-semibold">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
