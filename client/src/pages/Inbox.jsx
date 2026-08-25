import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

function Inbox() {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', { withCredentials: true });
      const data = response.data;
      const processed = data.map(n => ({ ...n, isNew: !n.read }));
      setNotifications(processed);
      
      // If there are unread items, tell backend to mark them all as read to clear the counter
      if (processed.some(n => n.isNew)) {
        await axios.put('/api/notifications/mark-all-read', {}, { withCredentials: true })
          .catch(err => console.error('Failed to mark all as read', err));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading inbox...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto mt-6">
      <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-6">Inbox</h2>
      
      {notifications.length === 0 ? (
        <p className="text-gray-500">No new messages.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((note) => (
            <div 
              key={note._id} 
              className={`p-5 rounded-2xl border ${!note.isNew ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' : 'bg-white dark:bg-gray-800 border-primary shadow-sm relative'}`}
            >
              {note.isNew && (
                <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              )}
              <div className="flex justify-between items-start">
                <div className="pr-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 block">
                    {note.type.replace(/_/g, ' ')}
                  </span>
                  <p className={`text-lg ${!note.isNew ? 'text-gray-600 dark:text-gray-300' : 'text-gray-900 dark:text-white font-medium'}`}>
                    {note.message}
                  </p>
                  {note.link && (
                    <Link to={note.link} className="inline-block mt-3 text-primary hover:underline font-medium">
                      View Action →
                    </Link>
                  )}
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                {new Date(note.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Inbox;
