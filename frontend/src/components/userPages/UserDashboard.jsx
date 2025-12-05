// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch('https://localdelivery-app-backend.vercel.app/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed');
        setUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally { setLoading(false); }
    };

    fetchProfile();
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await fetch('https://localdelivery-app-backend.vercel.app/user/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load orders');
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message);
      } finally { setOrdersLoading(false); }
    };
    fetchOrders();
  }, [token]);

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-2">Welcome, {user.username}</h2>
        <p className="text-sm text-gray-600">Email: {user.useremail}</p>
        <p className="text-sm text-gray-600">Phone: {user.userphone || 'Not provided'}</p>
        <div className="mt-4">
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded"
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Your Orders</h3>
        {ordersLoading ? (
          <div>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div>No orders yet.</div>
        ) : (
          <ul className="space-y-3">
            {orders.map(o => (
              <li key={o._id} className="border p-3 rounded flex justify-between items-start">
                <div>
                  <div className="font-medium">{o.parcel?.description || 'Parcel'}</div>
                  <div className="text-sm text-gray-500">Status: {o.status}</div>
                  <div className="text-sm text-gray-500">Price: ₹{o.price}</div>
                </div>
                <div>
                  <button className="text-sm text-blue-600" onClick={() => navigate(`/order/${o._id}`)}>View</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
