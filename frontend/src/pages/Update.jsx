import { useState, useEffect } from 'react';
import { Plus, Minus, Save, PackagePlus, Search, Edit2, X, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { useProducts } from '../Hooks/useProducts';
import api from '../api/axios';

export default function UpdateProducts() {
  const { products, loading, fetchProducts, updateProduct, addProduct, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []); // Remove fetchProducts dependency to prevent infinite loop

  const handlePriceChange = (productId, newPrice) => {
    // Don't update immediately - just for local state management
    // Actual save happens in handleSaveProduct
  };

  const handleQuantityChange = (productId, delta) => {
    // Don't update immediately - just for local state management
    // Actual save happens in handleSaveProduct
  };

  const handleSaveProduct = async (localProduct) => {
    const success = await updateProduct(localProduct._id, {
      price: localProduct.price,
      stock: localProduct.stock,
    });
    
    if (success) {
      toast.success(`${localProduct.name} updated successfully`);
      return true;
    }
    return false;
  };

  const handleAddProduct = async (newProduct) => {
    const addedProduct = await addProduct(newProduct);
    
    if (addedProduct) {
      toast.success('Product added successfully');
      setShowAddModal(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchProducts(); // Refresh the products list
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Delete error:', error);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Update Products</h1>
          <p className="text-gray-600 mt-1">Update prices, quantities, and add new products</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <PackagePlus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
          />
        </div>
      </div>

      {/* Products List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProducts.map((product) => (
          <ProductUpdateCard
            key={product._id}
            product={product}
            onPriceChange={handlePriceChange}
            onQuantityChange={handleQuantityChange}
            onSave={handleSaveProduct}
            onDelete={handleDeleteProduct}
            deleteConfirm={deleteConfirm}
            setDeleteConfirm={setDeleteConfirm}
          />
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddProduct}
        />
      )}
    </div>
  );
}

// Product Update Card Component
function ProductUpdateCard({ product, onPriceChange, onQuantityChange, onSave, onDelete, deleteConfirm, setDeleteConfirm }) {
  const [localProduct, setLocalProduct] = useState(product);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalProduct(product);
  }, [product]);

  const handleSave = async () => {
    setSaving(true);
    const success = await onSave(localProduct);
    if (success) {
      // Reset localProduct to match the updated product
      setLocalProduct({ ...localProduct });
    }
    setSaving(false);
  };

  const hasChanges = 
    parseFloat(localProduct.price) !== parseFloat(product.price) || 
    parseInt(localProduct.stock) !== parseInt(product.stock);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        {/* Product Info with Delete Button */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>
          <button
            onClick={() => setDeleteConfirm(product._id)}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Price Update */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Price (KSh)
          </label>
          <input
            type="number"
            value={localProduct.price}
            onChange={(e) => setLocalProduct({ ...localProduct, price: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            min="0"
          />
        </div>

        {/* Quantity Update */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Quantity
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocalProduct({ ...localProduct, stock: Math.max(0, localProduct.stock - 1) })}
              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            
            <input
              type="number"
              value={localProduct.stock}
              onChange={(e) => setLocalProduct({ ...localProduct, stock: parseInt(e.target.value) || 0 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center w-24"
              min="0"
            />
            
            <button
              onClick={() => setLocalProduct({ ...localProduct, stock: localProduct.stock + 1 })}
              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>

            <div className="flex-1 text-right">
              <p className="text-sm text-gray-600">Current Stock</p>
              <p className="text-xl font-bold text-gray-900">{product.stock}</p>
            </div>
          </div>
        </div>

        {/* Total Value */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Value:</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(localProduct.price * localProduct.stock)}
            </span>
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            loading={saving}
            className="w-full flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </Button>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm === product._id && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => onDelete(product._id)}
                  variant="danger"
                  className="flex-1"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setDeleteConfirm(null)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Product Modal
function AddProductModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    costPrice: '',
    stock: '',
    lowStockThreshold: 10,
    unit: 'piece',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sku || !formData.price || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice) || 0,
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
      };
      
      await onSuccess(productData);
      // Reset form
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        price: '',
        costPrice: '',
        stock: '',
        lowStockThreshold: 10,
        unit: 'piece',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="piece">Piece</option>
                  <option value="kg">Kilogram</option>
                  <option value="liter">Liter</option>
                  <option value="box">Box</option>
                  <option value="pack">Pack</option>
                  <option value="meter">Meter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (KSh) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price (KSh)
                </label>
                <input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Stock *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Add Product
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}