import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ChefHat, Truck, MapPin, Package } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const OrderTracking = () => {
  const { id: orderId } = useParams();
  
  // In a real app, you would fetch initial order details here
  const [orderStatus, setOrderStatus] = useState('Placed');
  
  const steps = [
    { name: 'Placed', icon: Package },
    { name: 'Confirmed', icon: CheckCircle },
    { name: 'Preparing', icon: ChefHat },
    { name: 'Out for Delivery', icon: Truck },
    { name: 'Delivered', icon: MapPin },
  ];

  const currentStepIndex = steps.findIndex(step => step.name === orderStatus);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL);

    // Join the specific order room
    socket.emit('joinOrderRoom', orderId);

    // Listen for status updates
    socket.on('orderStatusUpdated', (data) => {
      console.log('Order status updated:', data);
      setOrderStatus(data.status);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-clay p-8 md:p-12 relative overflow-hidden">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative z-10 text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Track Your Order
          </h1>
          <p className="text-gray-500 font-medium">Order #{orderId.substring(0, 8)}</p>
          <div className="inline-flex items-center gap-2 mt-4 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold">
            <Clock className="w-5 h-5" />
            Estimated Delivery: 30-45 mins
          </div>
        </div>

        {/* Tracking progress bar */}
        <div className="relative z-10 mt-16 mb-8">
          <div className="flex justify-between items-center relative">
            
            {/* Background track */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 z-0 rounded-full"></div>
            
            {/* Active track (animated) */}
            <motion.div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: currentStepIndex / (steps.length - 1) }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ width: '100%' }}
            />

            {/* Steps */}
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.name} className="relative z-10 flex flex-col items-center gap-3">
                  <motion.div 
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-4 ${
                      isActive 
                        ? 'bg-primary border-white dark:border-surface-dark text-white shadow-lg' 
                        : 'bg-gray-100 dark:bg-gray-800 border-white dark:border-surface-dark text-gray-400'
                    }`}
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      boxShadow: isCurrent ? '0 0 20px rgba(255, 75, 62, 0.4)' : 'none'
                    }}
                  >
                    <Icon className="w-5 h-5 md:w-7 md:h-7" />
                  </motion.div>
                  <span className={`text-xs md:text-sm font-bold ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 text-center mt-12">
          <Link to="/" className="text-gray-500 hover:text-primary transition-colors font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
