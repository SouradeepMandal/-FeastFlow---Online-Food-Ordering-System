import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress, savePaymentMethod, clearCartItems } from '../features/cart/cartSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, Banknote, Loader2 } from 'lucide-react';

const Checkout = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress, cartItems, itemsPrice, taxPrice, deliveryFee, totalPrice, paymentMethod: savedMethod } = cart;
  const { user } = useSelector((state) => state.auth);

  const [address, setAddress] = useState(shippingAddress?.street || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.zipCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || '');
  const [paymentMethod, setPaymentMethodState] = useState(savedMethod || 'Card');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const shippingData = { street: address, city, zipCode: postalCode, country };
    dispatch(saveShippingAddress(shippingData));
    dispatch(savePaymentMethod(paymentMethod));

    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Build order payload matching the server schema
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          foodItem: item.foodItem,
          name: item.name,
          qty: item.qty,
          image: item.image || '',
          price: item.price,
        })),
        deliveryAddress: shippingData,
        paymentMethod,
        itemsPrice: Number(itemsPrice),
        taxPrice: Number(taxPrice),
        deliveryFee: Number(deliveryFee),
        totalPrice: Number(totalPrice),
      };

      const { data: order } = await axios.post('/api/orders', orderPayload, config);

      // For Card payment — create Stripe payment intent
      if (paymentMethod === 'Card') {
        try {
          await axios.post(
            '/api/orders/create-payment-intent',
            { totalPrice: Number(totalPrice) },
            config
          );
          // In a full Stripe integration you'd use the clientSecret with Stripe Elements.
          // For now we mark the order as placed and go to tracking.
          toast.success('Order placed! Redirecting to tracking...');
        } catch {
          // Stripe intent failed (e.g. test key), but order was still created
          toast.success('Order placed! Redirecting to tracking...');
        }
      } else {
        toast.success('Order placed! Cash on Delivery confirmed.');
      }

      // Clear the cart
      dispatch(clearCartItems());

      // Navigate to the real order tracking page
      navigate(`/order/${order._id}`);
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Failed to place order';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-8 text-primary">Checkout</h1>

        <form onSubmit={submitHandler} className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-soft">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Delivery Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="123 Main Street"
                  value={address}
                  required
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="New York"
                    value={city}
                    required
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="10001"
                    value={postalCode}
                    required
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="United States"
                  value={country}
                  required
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-soft">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Method
            </h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Card' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}>
                <input
                  type="radio"
                  className="w-4 h-4 text-primary"
                  name="paymentMethod"
                  value="Card"
                  checked={paymentMethod === 'Card'}
                  onChange={(e) => setPaymentMethodState(e.target.value)}
                />
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-medium">Credit or Debit Card (Stripe)</span>
              </label>
              <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Cash' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}>
                <input
                  type="radio"
                  className="w-4 h-4 text-primary"
                  name="paymentMethod"
                  value="Cash"
                  checked={paymentMethod === 'Cash'}
                  onChange={(e) => setPaymentMethodState(e.target.value)}
                />
                <Banknote className="w-5 h-5 text-green-600" />
                <span className="font-medium">Cash on Delivery</span>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-soft">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {cartItems.map((item) => (
                <div key={item.foodItem} className="flex justify-between">
                  <span>{item.name} × {item.qty}</span>
                  <span className="font-medium text-gray-900 dark:text-white">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <div className="flex justify-between"><span>Subtotal</span><span>${itemsPrice || '0.00'}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span>${deliveryFee || '0.00'}</span></div>
              <div className="flex justify-between"><span>Tax (15%)</span><span>${taxPrice || '0.00'}</span></div>
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <span>Total</span>
                <span>${totalPrice || '0.00'}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cartItems.length === 0}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Placing Order...
              </>
            ) : (
              `Place Order · $${totalPrice || '0.00'}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
