import { useState, useEffect } from 'react';
import { AlertTriangle, Package, RefreshCw, X } from 'lucide-react';
import { useProducts } from '../Hooks/useProducts';
import toast from 'react-hot-toast';

const Notification = () => {
  const { products, loading } = useProducts();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!products.length) return;

    const newNotifications = [];

    // Low Stock Alerts
    const lowStockProducts = products.filter(product => 
      product.stock <= product.lowStockThreshold && product.stock > 0
    );

    lowStockProducts.forEach(product => {
      newNotifications.push({
        id: `low-stock-${product._id}`,
        type: 'low-stock',
        title: 'Low Stock Alert',
        message: `${product.name} is running low on stock. Only ${product.stock} ${product.unit || 'pieces'} remaining.`,
        timestamp: new Date(),
        product: product
      });
    });

    // Out of Stock Alerts
    const outOfStockProducts = products.filter(product => product.stock === 0);

    outOfStockProducts.forEach(product => {
      newNotifications.push({
        id: `out-of-stock-${product._id}`,
        type: 'out-of-stock',
        title: 'Out of Stock',
        message: `${product.name} is completely out of stock. Please restock soon.`,
        timestamp: new Date(),
        product: product
      });
    });

    setNotifications(newNotifications);
  }, [products]);

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500">No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 p-4 rounded-lg relative ${
                notification.type === 'out-of-stock' 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <button
                onClick={() => clearNotification(notification.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {notification.type === 'out-of-stock' ? (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  ) : (
                    <Package className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${
                    notification.type === 'out-of-stock' 
                      ? 'text-red-800' 
                      : 'text-yellow-800'
                  }`}>
                    {notification.title}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    notification.type === 'out-of-stock' 
                      ? 'text-red-700' 
                      : 'text-yellow-700'
                  }`}>
                    {notification.message}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs">
                    <span className={
                      notification.type === 'out-of-stock' 
                        ? 'text-red-600' 
                        : 'text-yellow-600'
                    }>
                      SKU: {notification.product.sku}
                    </span>
                    <span className={
                      notification.type === 'out-of-stock' 
                        ? 'text-red-600' 
                        : 'text-yellow-600'
                    }>
                      Current Stock: {notification.product.stock} {notification.product.unit || 'pieces'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;