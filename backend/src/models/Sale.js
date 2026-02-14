// import mongoose from 'mongoose';

// const saleItemSchema = mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   productName: {
//     type: String,
//     required: true
//   },
//   sku: {
//     type: String,
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: [true, 'Quantity is required'],
//     min: [1, 'Quantity must be at least 1']
//   },
//   unitPrice: {
//     type: Number,
//     required: [true, 'Unit price is required'],
//     min: [0, 'Unit price cannot be negative']
//   },
//   total: {
//     type: Number,
//     required: true
//   }
// });

// const saleSchema = mongoose.Schema({
//   saleNumber: {
//     type: String,
//     unique: true,
//     required: true
//   },
//   items: [saleItemSchema],
//   totalAmount: {
//     type: Number,
//     required: true
//   },
//   paymentMethod: {
//     type: String,
//     required: true,
//     enum: ['cash', 'card', 'mobile', 'bank']
//   },
  
  
//   status: {
//     type: String,
//     default: 'completed',
//     enum: ['pending', 'completed', 'cancelled']
//   },
//   saleDate: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// //saleSchema.index({ saleNumber: 1 });
// saleSchema.index({ saleDate: -1 });

// export default mongoose.model('Sale', saleSchema);
