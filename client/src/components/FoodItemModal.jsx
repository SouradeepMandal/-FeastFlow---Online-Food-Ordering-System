import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Plus, Minus, Info } from 'lucide-react';
import { addToCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';

const FoodItemModal = ({ food, onClose }) => {
  const dispatch = useDispatch();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('regular');
  const [wantsExtraCheese, setWantsExtraCheese] = useState(false);

  // Dynamic pricing
  const basePrice = food.price;
  const sizeMultiplier = size === 'large' ? 1.5 : 1;
  const cheesePrice = wantsExtraCheese ? 1.5 : 0;
  
  const currentItemPrice = (basePrice * sizeMultiplier) + cheesePrice;
  const total = currentItemPrice * qty;

  const handleAddToCart = () => {
    // We send a customized item object to cart
    dispatch(addToCart({ 
      ...food, 
      price: currentItemPrice, 
      size, 
      extraCheese: wantsExtraCheese,
      foodItem: `${food._id}-${size}-${wantsExtraCheese}`, // unique ID for cart
      originalId: food._id,
      qty 
    }));
    toast.success(`${food.name} added to cart!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-surface-dark w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image Hero */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative">
          <img 
            src={food.image || food.images?.[0] || 'https://via.placeholder.com/600x600'} 
            alt={food.name}
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r"></div>
          
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <h2 className="text-3xl font-display font-bold leading-tight mb-2">{food.name}</h2>
            <div className="flex gap-2">
              {food.isVegetarian && <span className="bg-green-600/90 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Veg</span>}
              {food.isSpicy && <span className="bg-red-600/90 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Spicy</span>}
            </div>
          </div>
        </div>

        {/* Right: Details & Options */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
          
          <div className="flex-1">
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
              {food.description}
            </p>

            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex gap-3 text-sm text-primary-dark dark:text-primary-light">
              <Info className="w-5 h-5 shrink-0" />
              <p>Prepared fresh upon order. Estimated prep time: {food.preparationTime || 15} mins.</p>
            </div>

            {/* Size Customization */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Size</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSize('regular')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                    size === 'regular' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  Regular
                </button>
                <button 
                  onClick={() => setSize('large')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                    size === 'large' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  Large (+50%)
                </button>
              </div>
            </div>

            {/* Add-ons */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Add-ons</h3>
              <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                wantsExtraCheese ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    wantsExtraCheese ? 'bg-primary border-primary' : 'border-gray-400'
                  }`}>
                    {wantsExtraCheese && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="font-medium">Extra Cheese</span>
                </div>
                <span className="font-semibold">+$1.50</span>
              </label>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto bg-white dark:bg-surface-dark">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Total Price</span>
              <span className="text-3xl font-display font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-4">
              {/* Stepper */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shrink-0">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-lg">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add Button */}
              <button 
                onClick={handleAddToCart}
                className="btn-primary flex-1 py-4 text-lg font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
              >
                Add to Cart
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default FoodItemModal;
