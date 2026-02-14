import mongoose from 'mongoose';
 
const productSchema = mongoose.Schema({

    name: {
        type : String,
        required : true,
        trim: true,
        minlength: 2,
        maxlength: 50,

    },

        sku: {
     type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9-]+$/, 'SKU can only contain letters, numbers, and hyphens']

        },
     price: {
        type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      set: (val) => Math.round(val * 100) / 100
     },

     stock: {
    type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0

     },

    lowStockThreshold: {
    type: Number,
      default: 10,
      min: [0, 'Threshold cannot be negative']

    },

    unit: {
    type: String,
      enum: ['piece', 'kg', 'liter', 'box', 'pack', 'meter', 'other'],
      default: 'piece'
    },

    totalSold: {
    type: Number,
    default: 0,
    min: 0
    },

    lastRestocked: {
    type: Date,
    default: null
    }
},
{
    timestamps:true,
      toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

        //search by indexes.
        productSchema.index({name: 'text', sku: 'text'});
        productSchema.index({ stock: 1 });
        productSchema.index({ createdAt: -1 });

           //update stock after sale..
           productSchema.methods.reduceStock = async function (quantity) {
            if(this.stock < quantity) {
                throw new Error(`Insufficient stock. Available: ${this.stock}, Required: ${quantity} `);

            }
            this.stock -= quantity;
            this.totalSold += quantity;
            
            return await this.save();
           };

           //increase Stock
           productSchema.methods.increaseStock = async function(quantity) {
            this.stock += quantity;
            this.lastRestocked = new Date();
            return await this.save();
           }
           //Get low stock products
           productSchema.statics.getLowStockProducts = function () {
    return this.find({
    //isActive: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }
  }).sort({ stock: 1 });

           }
           //Get product by category
           
           //search products
    productSchema.statics.searchProducts = function (query) {
  return this.find({
    $text: { $search: query }
  }).sort({ score: { $meta: 'textScore' } });
};

export default mongoose.model('Product', productSchema);