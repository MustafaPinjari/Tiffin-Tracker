import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { 
  TrashIcon, 
  PencilIcon, 
  CalendarIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useOrders } from '../context/OrderContext';

interface ManageTiffinProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderDeleted: (message: string) => void;
}

interface Order {
  id: string;
  date: string;
  numberOfTiffins: number;
  pricePerTiffin: number;
  totalAmount: number;
}

export function ManageTiffin({ isOpen, onClose, onOrderDeleted }: ManageTiffinProps) {
  const { getAllOrders, deleteOrder, updateOrder } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editTiffins, setEditTiffins] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const allOrders = getAllOrders();
      console.log('All orders:', allOrders); // Debug log
      
      // Filter out any orders with invalid IDs and remove duplicates
      const validOrders = allOrders.filter(order => order.id && order.id.trim() !== '');
      
      // Remove duplicates by date (keep the most recent one)
      const uniqueOrders = validOrders.reduce((acc, current) => {
        const existingIndex = acc.findIndex(order => order.date === current.date);
        if (existingIndex >= 0) {
          // Keep the one with the most recent ID (assuming newer IDs are longer/different)
          acc[existingIndex] = current;
        } else {
          acc.push(current);
        }
        return acc;
      }, [] as Order[]);
      
      // Sort orders by date (newest first)
      const sortedOrders = uniqueOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(sortedOrders);
    }
  }, [isOpen, getAllOrders]);

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = format(parseISO(order.date), 'MMM d, yyyy');
    const dayStr = format(parseISO(order.date), 'EEEE');
    
    return dateStr.toLowerCase().includes(searchLower) || 
           dayStr.toLowerCase().includes(searchLower) ||
           order.numberOfTiffins.toString().includes(searchLower) ||
           order.totalAmount.toString().includes(searchLower);
  });

  const handleDeleteOrder = (id: string) => {
    deleteOrder(id);
    const deletedOrder = orders.find(order => order.id === id);
    if (deletedOrder) {
      const dateStr = format(parseISO(deletedOrder.date), 'MMM d, yyyy');
      onOrderDeleted(`Order for ${dateStr} deleted successfully`);
    }
    setOrders(prev => prev.filter(order => order.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleBulkDelete = () => {
    selectedOrders.forEach(id => {
      deleteOrder(id);
    });
    onOrderDeleted(`${selectedOrders.size} order${selectedOrders.size > 1 ? 's' : ''} deleted successfully`);
    setOrders(prev => prev.filter(order => !selectedOrders.has(order.id)));
    setSelectedOrders(new Set());
  };

  const handleEditOrder = (id: string, newTiffins: number) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      const updatedOrderData = {
        date: order.date,
        numberOfTiffins: newTiffins,
        pricePerTiffin: order.pricePerTiffin,
        totalAmount: newTiffins * order.pricePerTiffin
      };
      updateOrder(id, updatedOrderData);
      setOrders(prev => prev.map(o => o.id === id ? { ...updatedOrderData, id } : o));
      setEditingOrder(null);
      const dateStr = format(parseISO(order.date), 'MMM d, yyyy');
      onOrderDeleted(`Order for ${dateStr} updated successfully`);
    }
  };

  const toggleOrderSelection = (id: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOrders(newSelected);
  };

  const selectAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] border border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Manage Tiffin Orders</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by date, day, or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-xl pl-10 pr-4 py-3 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Bulk Actions */}
          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={selectAllOrders}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {selectedOrders.size === filteredOrders.length ? 'Deselect All' : 'Select All'}
                </button>
                {selectedOrders.size > 0 && (
                  <span className="text-sm text-gray-400">
                    {selectedOrders.size} selected
                  </span>
                )}
              </div>
              {selectedOrders.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete Selected
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {searchTerm ? 'No orders found matching your search' : 'No orders found'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id || `order-${index}-${order.date}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`bg-gray-800/50 rounded-2xl p-4 border transition-colors ${
                      selectedOrders.has(order.id) 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Selection Checkbox */}
                        <button
                          onClick={() => toggleOrderSelection(order.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            selectedOrders.has(order.id)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          {selectedOrders.has(order.id) && (
                            <CheckIcon className="h-3 w-3 text-white" />
                          )}
                        </button>

                        {/* Order Info */}
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-white font-medium">
                              {format(parseISO(order.date), 'MMM d, yyyy')}
                            </h3>
                            <span className="text-gray-400 text-sm">
                              {format(parseISO(order.date), 'EEEE')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            {editingOrder === order.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={editTiffins}
                                  onChange={(e) => setEditTiffins(parseInt(e.target.value) || 1)}
                                  className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-sm"
                                />
                                <span className="text-gray-400 text-sm">tiffin(s)</span>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-sm">
                                {order.numberOfTiffins} tiffin{order.numberOfTiffins > 1 ? 's' : ''}
                              </span>
                            )}
                            <span className="text-blue-400 font-medium">₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {editingOrder === order.id ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditOrder(order.id, editTiffins)}
                              className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                            >
                              <CheckIcon className="h-4 w-4 text-white" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingOrder(null)}
                              className="w-8 h-8 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
                            >
                              <XMarkIcon className="h-4 w-4 text-white" />
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setEditingOrder(order.id);
                                setEditTiffins(order.numberOfTiffins);
                              }}
                              className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                            >
                              <PencilIcon className="h-4 w-4 text-white" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setShowDeleteConfirm(order.id)}
                              className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                            >
                              <TrashIcon className="h-4 w-4 text-white" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-sm w-full border border-gray-700"
              >
                <h3 className="text-lg font-semibold text-white mb-2">Delete Order</h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete the order for{' '}
                  <span className="font-medium text-white">
                    {(() => {
                      const order = orders.find(o => o.id === showDeleteConfirm);
                      return order ? format(parseISO(order.date), 'MMM d, yyyy') : '';
                    })()}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(showDeleteConfirm)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}