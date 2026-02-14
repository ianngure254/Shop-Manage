// const Product = require('../models/Product');
// const Sale = require('../models/Sale');

// exports.getDashboardStats = async (req, res) => {
//   try {
//     // 1. Get Total Product Count
//     const totalProducts = await Product.countDocuments();

//     // 2. Get Total Sales Revenue (Aggregation)
//     const salesStats = await Sale.aggregate([
//       { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
//     ]);
//     const totalRevenue = salesStats.length > 0 ? salesStats[0].totalRevenue : 0;

//     // 3. Get Low Stock Products
//     // We fetch products where stock is less than their specific threshold
//     const lowStockItems = await Product.find({
//       $expr: { $lte: ["$stock", "$lowStockThreshold"] }
//     }).select('name stock');

//     res.status(200).json({
//       success: true,
//       data: {
//         totalProducts,
//         totalRevenue,
//         lowStockCount: lowStockItems.length,
//         lowStockItems // Sending the list for your "Low Stock Alerts" section
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };