import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ChefHat, Truck, MapPin, Package, Loader2, AlertTriangle } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const steps = [
  { name: 'Placed', icon: Package },
  { name: 'Confirmed', icon: CheckCircle },
  { name: 'Preparing', icon: ChefHat },
  { name: 'Out for Delivery', icon: Truck },
  { name: 'Delivered', icon: MapPin },
];

const OrderTracking = () => {
  const { id: orderId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('Placed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentStepIndex = steps.findIndex((s) => s.name === orderStatus);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId || orderId === 'mock123') {
        setLoading(false);
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`/api/orders/${orderId}`, config);
        setOrder(data);
        setOrderStatus(data.orderStatus || 'Placed');
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, user]);

  // Real-time status via Socket.IO
  useEffect(() => {
    if (!orderId || orderId === 'mock123') return;
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.emit('joinOrderRoom', orderId);
    socket.on('orderStatusUpdated', (data) => {
      if (data.orderId === orderId || data.orderId?.toString() === orderId) {
        setOrderStatus(data.status);
      }
    });
    return () => socket.disconnect();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertTriangle className="mx-auto w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order not found</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/menu" className="btn-primary inline-block">Back to Menu</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-clay p-8 md:p-12 relative overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 font-medium">
            Order #{orderId?.substring(0, 8)?.toUpperCase()}
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold">
            <Clock className="w-5 h-5" />
            Estimated Delivery: 30-45 mins
          </div>
        </div>

        {/* Tracking steps */}
        <div className="relative z-10 mt-8 mb-12 px-4">
          <div className="flex justify-between items-center relative">
            {/* Background track */}
            <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-0 rounded-full" />
            {/* Active track */}
            <motion.div
              className="absolute top-6 left-0 h-1 bg-primary z-0 rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: currentStepIndex / (steps.length - 1) }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ width: '100%' }}
            />
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.name} className="relative z-10 flex flex-col items-center gap-2">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white dark:border-surface-dark ${
                      isActive ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}
                    animate={{ scale: isCurrent ? 1.15 : 1, boxShadow: isCurrent ? '0 0 20px rgba(249,115,22,0.4)' : 'none' }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <span className={`text-xs font-bold text-center ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        {order && order.orderItems?.length > 0 && (
          <div className="relative z-10 mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
            <h2 className="text-lg font-bold mb-4">Items Ordered</h2>
            <ul className="space-y-3">
              {order.orderItems.map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || 'https://placehold.co/48x48/f97316/white?text=F'}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => { e.target.src = 'https://placehold.co/48x48/f97316/white?text=F'; }}
                    />
                    <span>{item.name} × {item.qty}</span>
                  </div>
                  <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-lg">
              <span>Total Paid</span>
              <span className="text-primary">${order.totalPrice?.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="relative z-10 text-center mt-10">
          <Link to="/menu" className="text-gray-500 hover:text-primary transition-colors font-medium">
            ← Continue Ordering
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
