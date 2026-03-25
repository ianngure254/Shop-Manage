import { useState, useEffect } from 'react';
import { Search, AlertTriangle, Package } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';
import Loading from '../components/common/Loading';
import { useProducts } from '../Hooks/useProducts';

export default function Products() {
  const { products, loading, fetchProducts, updateProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, low-stock, out-of-stock
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [quantitySoldInput, setQuantitySoldInput] = useState({});

  useEffect(() => {
    fetchProducts();
    
  }, [fetchProducts]);

  const handleQuantitySoldUpdate = async (productId) => {
    const quantityToAdd = parseInt(quantitySoldInput[productId] || 0);
    
    if (!quantityToAdd || quantityToAdd <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const product = products.find(p => p._id === productId);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    // Ensure totalSold is properly initialized
    const currentTotalSold = parseInt(product.totalSold) || 0;
    const currentStock = parseInt(product.stock) || 0;

    if (quantityToAdd > currentStock) {
      toast.error(`Cannot sell more than available stock (${currentStock} units)`);
      return;
    }

    try {
      setUpdatingProductId(productId);
      
      // Calculate new values
      const newStock = currentStock - quantityToAdd;
      const newTotalSold = currentTotalSold + quantityToAdd;
      
      // Use context updateProduct for consistency
      const success = await updateProduct(productId, {
        stock: newStock,
        totalSold: newTotalSold
      });

      if (success) {
        toast.success(`Successfully updated quantity sold for ${product.name}`);
        
        // Clear input
        setQuantitySoldInput(prev => ({
          ...prev,
          [productId]: ''
        }));
      } else {
        toast.error('Update failed - no success response');
      }
      
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update quantity sold');
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'low-stock') {
      return matchesSearch && product.stock <= product.lowStockThreshold && product.stock > 0;
    }
    if (filter === 'out-of-stock') {
      return matchesSearch && product.stock === 0;
    }
    return matchesSearch;
  });

  // Calculate totals
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.totalSold * p.price), 0);
  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;

  if (loading) return <Loading />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Products Inventory</h1>
        <p className="text-gray-600 mt-1">View all products and stock levels</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-600">Total Products</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <Package className="w-8 h-8 md:w-10 md:h-10 text-blue-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-600">Total Stock</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{totalStock}</p>
            </div>
            <Package className="w-8 h-8 md:w-10 md:h-10 text-green-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md bg-purple-50 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-600">Total Sold Value</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
            <Package className="w-8 h-8 md:w-10 md:h-10 text-purple-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs md:text-sm text-gray-600">Low Stock Items</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{lowStockCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 md:px-4 rounded-lg font-medium transition-colors text-sm md:text-base ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('low-stock')}
              className={`px-3 py-2 md:px-4 rounded-lg font-medium transition-colors text-sm md:text-base ${
                filter === 'low-stock'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setFilter('out-of-stock')}
              className={`px-3 py-2 md:px-4 rounded-lg font-medium transition-colors text-sm md:text-base ${
                filter === 'out-of-stock'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (KSh)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Left
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sold Value (KSh)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Update Quantity Sold
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const soldValue = product.totalSold * product.price;
                  const initialQuantity = product.stock + product.totalSold;
                  
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {initialQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                        {formatCurrency(soldValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {product.stock === 0 ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        ) : product.stock <= product.lowStockThreshold ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={product.unit || 'pieces'}
                          onChange={(e) => {
                            updateProduct(product._id, { unit: e.target.value });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="pieces">Pieces</option>
                          <option value="kg">Kg</option>
                          <option value="litres">Litres</option>
                          <option value="boxes">Boxes</option>
                          <option value="packs">Packs</option>
                          <option value="metres">Metres</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            max={product.stock}
                            value={quantitySoldInput[product._id] || ''}
                            onChange={(e) => setQuantitySoldInput(prev => ({ ...prev, [product._id]: e.target.value }))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Qty"
                          />
                          <button
                            onClick={() => handleQuantitySoldUpdate(product._id)}
                            disabled={updatingProductId === product._id || product.stock === 0}
                            className="px-3 py-1 text-sm rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {updatingProductId === product._id ? 'Updating...' : 'Update'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No products found
            </div>
          ) : (
            filteredProducts.map((product) => {
              const soldValue = product.totalSold * product.price;
              const initialQuantity = (parseInt(product.stock) || 0) + (parseInt(product.totalSold) || 0);
              
              return (
                <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  {/* Product Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{product.name}</h3>
                      <p className="text-xs md:text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      {product.stock === 0 ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      ) : product.stock <= product.lowStockThreshold ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Price</p>
                      <p className="font-semibold">{formatCurrency(product.price)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Unit</p>
                      <select
                        value={product.unit || 'pieces'}
                        onChange={(e) => {
                          updateProduct(product._id, { unit: e.target.value });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="pieces">Pieces</option>
                        <option value="kg">Kg</option>
                        <option value="litres">Litres</option>
                        <option value="boxes">Boxes</option>
                        <option value="packs">Packs</option>
                        <option value="metres">Metres</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-gray-500">Initial Qty</p>
                      <p className="font-semibold">{initialQuantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sold</p>
                      <p className="font-semibold">{product.totalSold}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Left</p>
                      <p className="font-semibold">{product.stock}</p>
                    </div>
                  </div>

                  {/* Total Value */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sold Value</span>
                      <span className="font-bold text-lg">{formatCurrency(soldValue)}</span>
                    </div>
                  </div>

                  {/* Update Quantity Sold */}
                  <div className="border-t pt-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        max={product.stock}
                        value={quantitySoldInput[product._id] || ''}
                        onChange={(e) => setQuantitySoldInput(prev => ({ ...prev, [product._id]: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Quantity to sell"
                      />
                        <button
                      onClick={() => {
                    
          const current = parseFloat(quantitySoldInput[product._id]) || 0;
          const newValue = Math.min(product.stock, current + 0.25);
          setQuantitySoldInput(prev => ({ ...prev, [product._id]: newValue.toString() }));
        }}
        className="px-2 py-2 text-gray-500 hover:bg-gray-100 border-l"
                   >  
                        {updatingProductId === product._id ? 'Updating...' : 'Update'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}


