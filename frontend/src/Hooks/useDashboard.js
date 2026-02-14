// // frontend/src/hooks/useDashboard.js
// import { useState, useEffect } from 'react';
// import api from '../api/axios';

// export const useDashboard = () => {
//   const [stats, setStats] = useState({
//     totalProducts: 0,
//     totalRevenue: 0,
//     lowStockCount: 0,
//     lowStockItems: []
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const response = await api.get('/dashboard/stats');
//         setStats(response.data); // Axios interceptor returns .data
//       } catch (err) {
//         console.error("Dashboard Fetch Error", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, []);

//   return { stats, loading };
// };