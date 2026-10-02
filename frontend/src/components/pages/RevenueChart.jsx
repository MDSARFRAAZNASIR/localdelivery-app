import React, { useEffect, useState } from 'react';
import {XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import axios from 'axios';

const RevenueChart = () => {
  const [data, setData] = useState([]);
const REACT_APP_API_BASE = process.env.REACT_APP_API || "/api";



  useEffect(() => {
    const fetchStats = async () => {
      try {
        // const backendUrl = `${REACT_APP_API_BASE}`;

        const { data } = await axios.get(`${REACT_APP_API_BASE}/admin/stats/revenue`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        
        // Format the ID for the chart (e.g., "2026-03-25" -> "25 Mar")
        const formattedData = data.map(item => ({
          date: new Date(item._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          revenue: item.revenue,
          orders: item.orders
        }));
        
        setData(formattedData);
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    };
    fetchStats();
  }, [REACT_APP_API_BASE]);

  return (
    <div style={{ width: '100%', height: 300, backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h3>Last 7 Days Revenue (₹)</h3>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;