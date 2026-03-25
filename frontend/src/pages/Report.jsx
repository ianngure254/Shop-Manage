import { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, AlertCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';
import Loading from '../components/common/Loading';

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDailyReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/reports/daily?date=${selectedDate}`);
      
      if (response.data?.success) {
        const { summary, products } = response.data.data;
        
        setReportData({
          products,
          summary: {
            totalRevenue: summary.totalRevenue || 0,
            totalItemsSold: summary.totalItemsSold || 0
          }
        });
      } else {
        setReportData({ products: [], summary: { totalRevenue: 0, totalItemsSold: 0 } });
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError('Connection to server failed');
      toast.error('Failed to sync reports');
      setReportData({ products: [], summary: { totalRevenue: 0, totalItemsSold: 0 } });
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDailyReport();
  }, [fetchDailyReport]);

  const summary = reportData?.summary || {};
  const rawProducts = reportData?.products || [];

  const filteredProducts = useMemo(() => {
    return rawProducts.filter(p => 
      p.productName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rawProducts, searchTerm]);

  const cumulativeTotals = useMemo(() => {
    return filteredProducts.reduce((acc, item) => ({
      qty: acc.qty + (Number(item.quantitySold) || 0),
      stock: acc.stock + (Number(item.stockLeft) || 0),
      value: acc.value + (Number(item.totalAmount) || 0)
    }), { qty: 0, stock: 0, value: 0 });
  }, [filteredProducts]);

  const exportToCSV = () => {
    const headers = ['Product Name', 'Items Sold', 'Remaining Stock', 'Total Value'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(item => [
        `"${item.productName}"`,
        item.quantitySold || 0,
        item.stockLeft || 0,
        `"${formatCurrency(item.totalAmount || 0)}"`
      ].join(',')),
      '',
      'Totals',
      `,"${cumulativeTotals.qty}","${cumulativeTotals.stock}","${formatCurrency(cumulativeTotals.value)}"`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (loading) return <Loading text="Loading report..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Reports</h1>
          <p className="text-gray-600 text-sm">Report for {format(new Date(selectedDate), 'PPPP')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            max={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-12 text-center bg-red-50 rounded-lg border border-red-200 text-red-600">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" />
          <p className="font-bold">{error}</p>
          <button onClick={fetchDailyReport} className="mt-4 text-sm underline">Try Again</button>
        </div>
      ) : (
        <>
          {/* Product Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="font-bold text-gray-800">Products</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Items Sold</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((item) => (
                      <tr key={item.productId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900 font-medium">{item.productName}</td>
                        <td className="px-6 py-4 text-center text-blue-600 font-semibold">{item.quantitySold || 0}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${item.stockLeft < 10 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {item.stockLeft || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(item.totalAmount || 0)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No products found</td>
                    </tr>
                  )}
                </tbody>

                {/* Totals Row */}
                {filteredProducts.length > 0 && (
                  <tfoot className="bg-gray-100">
                    <tr>
                      <td className="px-6 py-4 font-bold text-gray-900">Totals</td>
                      <td className="px-6 py-4 text-center font-bold text-blue-600">{cumulativeTotals.qty}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{cumulativeTotals.stock}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">{formatCurrency(cumulativeTotals.value)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}