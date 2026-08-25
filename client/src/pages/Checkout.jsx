import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress, savePaymentMethod } from '../features/cart/cartSlice';

const Checkout = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.street || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.zipCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');
  const [paymentMethod, setPaymentMethodState] = useState(cart.paymentMethod || 'Card');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ street: address, city, zipCode: postalCode, country, state: 'State' }));
    dispatch(savePaymentMethod(paymentMethod));
    
    // In a real app we would navigate to a review page or open Stripe modal
    // Here we'll just mock placing the order for now to demonstrate UI
    alert('Payment integration (Stripe) would open here!');
    navigate('/order/mock123'); // navigate to an order tracking page
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-soft">
        <h1 className="text-3xl font-display font-bold mb-8 text-primary">Checkout</h1>
        
        <form onSubmit={submitHandler}>
          <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input
                type="text"
                className="input-field"
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
                value={country}
                required
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4">Payment Method</h2>
          <div className="space-y-3 mb-8">
            <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-primary transition-colors">
              <input
                type="radio"
                className="w-4 h-4 text-primary"
                id="Card"
                name="paymentMethod"
                value="Card"
                checked={paymentMethod === 'Card'}
                onChange={(e) => setPaymentMethodState(e.target.value)}
              />
              <span className="font-medium">Credit or Debit Card (Stripe)</span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-primary transition-colors">
              <input
                type="radio"
                className="w-4 h-4 text-primary"
                id="Cash"
                name="paymentMethod"
                value="Cash"
                checked={paymentMethod === 'Cash'}
                onChange={(e) => setPaymentMethodState(e.target.value)}
              />
              <span className="font-medium">Cash on Delivery</span>
            </label>
          </div>

          <button type="submit" className="btn-primary w-full">
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
