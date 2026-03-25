//  import Sale from '../models/Sale.js';
// import Product from '../models/Product.js';
// import asyncHandler from '../utils/asyncHandler.js';
// import ApiError from '../utils/ApiError.js';

// const createSale = asyncHandler(async (req, res, next) => {
//   const { items, paymentMethod, customerName, customerPhone } = req.body;

//   // Validation
//   if (!items || !Array.isArray(items) || items.length === 0) {
//     throw new ApiError(400, 'Sale items are required');
//   }

//   if (!paymentMethod) {
//     throw new ApiError(400, 'Payment method is required');
//   }

//   // Validate each item and calculate totals
//   let totalAmount = 0;
//   const saleItems = [];

//   for (const item of items) {
//     const { productId, quantity, unitPrice } = item;

//     if (!productId || !quantity || quantity <= 0) {
//       throw new ApiError(400, 'Valid product ID and quantity are required for each item');
//     }

//     // Check if product exists and has enough stock
//     const product = await Product.findById(productId);
//     if (!product) {
//       throw new ApiError(404, `Product with ID ${productId} not found`);
//     }

//     if (product.stock < quantity) {
//       throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`);
//     }

//     const itemTotal = quantity * (unitPrice || product.price);
//     totalAmount += itemTotal;

//     saleItems.push({
//       productId: product._id,
//       productName: product.name,
//       sku: product.sku,
//       quantity,
//       unitPrice: unitPrice || product.price,
//       total: itemTotal
//     });

//     // Update product stock and totalSold
//     product.stock -= quantity;
//     product.totalSold += quantity;
//     await product.save();
//   }

//   // Create sale record
//   const sale = await Sale.create({
//     items: saleItems,
//     totalAmount,
//     paymentMethod,
//     // customerName: customerName || 'Walk-in Customer',
//     // customerPhone: customerPhone || '',
//     status: 'completed',
//     saleDate: new Date()
//   });

//   // Populate sale with product details for response
//   const populatedSale = await Sale.findById(sale._id).populate('items.productId', 'name sku');

//   res.status(201).json({
//     success: true,
//     message: 'Sale completed successfully',
//     data: { sale: populatedSale }
//   });
// });

// const getAllSales = asyncHandler(async (req, res, next) => {
//   const { page = 1, limit = 50, status, paymentMethod, startDate, endDate } = req.query;
  
//   // Build query
//   const query = {};
//   if (status) query.status = status;
//   if (paymentMethod) query.paymentMethod = paymentMethod;
  
//   if (startDate || endDate) {
//     query.saleDate = {};
//     if (startDate) query.saleDate.$gte = new Date(startDate);
//     if (endDate) query.saleDate.$lte = new Date(endDate);
//   }

//   const sales = await Sale.find(query)
//     .sort({ saleDate: -1 })
//     .limit(limit * 1)
//     .skip((page - 1) * limit)
//     .populate('items.productId', 'name sku');

//   const total = await Sale.countDocuments(query);

//   res.status(200).json({
//     success: true,
//     message: 'Sales retrieved successfully',
//     data: {
//       sales,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     }
//   });
// });

// const getSaleById = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   const sale = await Sale.findById(id).populate('items.productId', 'name sku');
//   if (!sale) {
//     throw new ApiError(404, 'Sale not found');
//   }

//   res.status(200).json({
//     success: true,
//     message: 'Sale retrieved successfully',
//     data: { sale }
//   });
// });

// const getSalesByDateRange = asyncHandler(async (req, res, next) => {
//   const { startDate, endDate, page = 1, limit = 50 } = req.query;

//   if (!startDate || !endDate) {
//     throw new ApiError(400, 'Start date and end date are required');
//   }

//   const query = {
//     saleDate: {
//       $gte: new Date(startDate),
//       $lte: new Date(endDate)
//     }
//   };

//   const sales = await Sale.find(query)
//     .sort({ saleDate: -1 })
//     .limit(limit * 1)
//     .skip((page - 1) * limit)
//     .populate('items.productId', 'name sku');

//   const total = await Sale.countDocuments(query);

//   res.status(200).json({
//     success: true,
//     message: 'Sales retrieved successfully',
//     data: {
//       sales,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     }
//   });
// });

// const deleteSale = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   const sale = await Sale.findById(id);
//   if (!sale) {
//     throw new ApiError(404, 'Sale not found');
//   }

//   // Restore stock for each item (only if sale was completed)
//   if (sale.status === 'completed') {
//     for (const item of sale.items) {
//       const product = await Product.findById(item.productId);
//       if (product) {
//         product.stock += item.quantity;
//         product.totalSold -= item.quantity;
//         await product.save();
//       }
//     }
//   }

//   await Sale.findByIdAndDelete(id);

//   res.status(200).json({
//     success: true,
//     message: 'Sale deleted and stock restored successfully'
//   });
// });

// const getTodaySales = asyncHandler(async (req, res, next) => {
//   const today = new Date();
//   const startOfDay = new Date(today.setHours(0, 0, 0, 0));
//   const endOfDay = new Date(today.setHours(23, 59, 59, 999));

//   const sales = await Sale.find({
//     saleDate: {
//       $gte: startOfDay,
//       $lte: endOfDay
//     }
//   }).sort({ saleDate: -1 }).populate('items.productId', 'name sku');

//   const totalSales = sales.length;
//   const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
//   const totalItemsSold = sales.reduce((sum, sale) => 
//     sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
//   );

//   res.status(200).json({
//     success: true,
//     message: 'Today\'s sales retrieved successfully',
//     data: {
//       sales,
//       summary: {
//         totalSales,
//         totalRevenue,
//         totalItemsSold,
//         date: today.toISOString().split('T')[0]
//       }
//     }
//   });
// });

// export {
//   createSale,
//   getAllSales,
//   getSaleById,
//   getSalesByDateRange,
//   deleteSale,
//   getTodaySales
// }