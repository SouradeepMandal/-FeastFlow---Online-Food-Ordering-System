import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, clearCartItems } from '../features/cart/cartSlice';
import { Trash2, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const { user } = useSelector((state) => state.auth);

  const addToCartHandler = (item, qty) => {
    dispatch(addToCart({ ...item, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-8">
        <ShoppingBag className="text-primary w-10 h-10" />
        Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-2xl shadow-soft">
          <ShoppingBag className="mx-auto w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
          <Link to="/menu" className="btn-primary inline-block mt-6">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.map((item) => (
                  <li key={item.foodItem} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image || 'https://placehold.co/150x150/f97316/white?text=Food'}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/150x150/f97316/white?text=Food'; }}
                      />
                      <div>
                        <p className="font-bold text-lg">{item.name}</p>
                        {item.restaurant && (
                          <p className="text-xs text-gray-500 mb-1">
                            🍴 {typeof item.restaurant === 'object' ? item.restaurant.name : item.restaurant}
                          </p>
                        )}
                        <div className="text-primary font-semibold">${Number(item.price).toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <select 
                        value={item.qty} 
                        onChange={(e) => addToCartHandler(item, Number(e.target.value))}
                        className="input-field py-2 px-3 w-20 text-center font-semibold bg-gray-50 dark:bg-gray-800"
                      >
                        {[...Array(item.countInStock || 10).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                      
                      <button 
                        type="button" 
                        onClick={() => removeFromCartHandler(item.foodItem)}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-soft p-6 sticky top-24">
              <h2 className="text-2xl font-bold border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${cart.itemsPrice || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${cart.deliveryFee || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (15%)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${cart.taxPrice || '0.00'}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>${cart.totalPrice || '0.00'}</span>
                </div>
              </div>

              <button 
                type="button"
                className="btn-primary w-full mt-8"
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Proceed To Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
