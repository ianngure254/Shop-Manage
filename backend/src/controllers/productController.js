import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const createProduct = asyncHandler(async (req, res, next) => {
  const { name, sku, price, stock, lowStockThreshold, category, description } = req.body;

  // Validation
  if (!name || !sku || !price || stock === undefined) {
    throw new ApiError(400, 'Name, SKU, price, and stock are required');
  }

  // Check if SKU already exists
  const existingProduct = await Product.findOne({ sku });
  if (existingProduct) {
    throw new ApiError(400, 'Product with this SKU already exists');
  }

  const product = await Product.create({
    name,
    sku,
    price,
    stock,
    lowStockThreshold: lowStockThreshold || 10,
    category: category || 'General',
    description: description || '',
    totalSold: 0
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

const getAllProducts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 50, category, search } = req.query;
  
  // Build query
  const query = {};
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    message: 'Products retrieved successfully',
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({
    success: true,
    message: 'Product retrieved successfully',
    data: { product }
  });
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, lowStockThreshold, category, description, totalSold, unit } = req.body;

  // Validate numeric fields
  if (price !== undefined && (isNaN(price) || price < 0)) {
    throw new ApiError(400, 'Price must be a non-negative number');
  }
  
  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    throw new ApiError(400, 'Stock must be a non-negative number');
  }

  if (lowStockThreshold !== undefined && (isNaN(lowStockThreshold) || lowStockThreshold < 0)) {
    throw new ApiError(400, 'Low stock threshold must be a non-negative number');
  }

  if (totalSold !== undefined && (isNaN(totalSold) || totalSold < 0)) {
    throw new ApiError(400, 'Total sold must be a non-negative number');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Update fields
  if (name) product.name = name;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;
  if (category) product.category = category;
  if (description !== undefined) product.description = description;
  if (totalSold !== undefined) product.totalSold = totalSold;
  if (unit !== undefined) product.unit = unit;

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  await Product.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

const searchProducts = asyncHandler(async (req, res, next) => {
  const { q, category } = req.query;
  
  if (!q) {
    throw new ApiError(400, 'Search query is required');
  }

  const query = {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { sku: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } }
    ]
  };

  if (category) query.category = category;

  const products = await Product.find(query).sort({ name: 1 });

  res.status(200).json({
    success: true,
    message: 'Products found',
    data: { products }
  });
});

const getLowStockProducts = asyncHandler(async (req, res, next) => {
  const { threshold = 10 } = req.query;

  const products = await Product.find({
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    stock: { $gt: 0 }
  }).sort({ stock: 1 });

  res.status(200).json({
    success: true,
    message: 'Low stock products retrieved',
    data: { products }
  });
});

export {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
    getLowStockProducts
}