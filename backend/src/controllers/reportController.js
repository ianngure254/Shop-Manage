import Product from '../models/Product.js';

import asyncHandler from '../utils/asyncHandler.js';

const getDailyReport = asyncHandler(async (req, res, next) => {
  const { date } = req.query;
  
  const reportDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(reportDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(reportDate.setHours(23, 59, 59, 999));

  // Note: Since sales are disabled, this report shows cumulative totals
  // When sales are implemented, add date filtering for accurate daily reports
  const products = await Product.find().select('name sku price stock totalSold createdAt updatedAt');

  const totalRevenue = products.reduce((sum, product) => sum + (product.totalSold * product.price), 0);
  const totalItemsSold = products.reduce((sum, product) => sum + product.totalSold, 0);

  const productSales = products
    .filter(product => product.totalSold > 0)
    .map(product => ({
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      quantitySold: product.totalSold,
      totalAmount: product.totalSold * product.price,
      stockLeft: product.stock,
      lastUpdated: product.updatedAt
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold);

  const report = {
    date: reportDate.toISOString().split('T')[0],
    summary: {
      totalRevenue,
      totalItemsSold,
      note: "This shows cumulative totals. Daily sales tracking requires sales module implementation."
    },
    products: productSales
  };

  res.status(200).json({
    success: true,
    message: 'Daily report generated successfully',
    data: report
  });
});

export { getDailyReport };