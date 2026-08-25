import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function OwnerOnboarding() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const requestId = searchParams.get('id');

  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    address: '',
    fssaiNumber: '',
    gstNumber: '',
    bankDetails: '',
  });

  // Simulated file uploads
  const [fssaiDocUrl, setFssaiDocUrl] = useState('https://dummyimage.com/600x400/000/fff&text=FSSAI+Doc');
  const [gstDocUrl, setGstDocUrl] = useState('https://dummyimage.com/600x400/000/fff&text=GST+Doc');

  const [loading, setLoading] = useState(false);

  if (!token || !requestId) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Invalid Link</h2>
        <p>Please use the link sent to your inbox to access this page.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          token,
          requestId,
          restaurantDetails: formData,
          documents: [
            { type: 'fssai_license', url: fssaiDocUrl },
            { type: 'gst_certificate', url: gstDocUrl },
          ]
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Submission failed');

      toast.success(data.message);
      navigate('/inbox');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-6">Complete Restaurant Onboarding</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Please provide your restaurant details and legal documents for AI verification.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Restaurant Name</label>
          <input required name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="E.g., Spice Symphony" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuisine</label>
          <input required name="cuisine" value={formData.cuisine} onChange={handleChange} className="input-field" placeholder="E.g., North Indian" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Address</label>
          <input required name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="123 Food Street, City, State, ZIP" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">FSSAI License Number</label>
            <input required name="fssaiNumber" value={formData.fssaiNumber} onChange={handleChange} className="input-field" placeholder="14-digit FSSAI" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST Number</label>
            <input required name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="input-field" placeholder="15-digit GSTIN" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Account Details (Mock)</label>
          <input required name="bankDetails" value={formData.bankDetails} onChange={handleChange} className="input-field" placeholder="Account Number, IFSC" />
        </div>

        <div className="pt-4">
          <p className="text-sm text-gray-500 mb-2">Note: For this prototype, document URLs are mocked.</p>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3"
          >
            {loading ? 'Submitting & Verifying...' : 'Submit for Verification'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OwnerOnboarding;
