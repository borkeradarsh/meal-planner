'use client';

import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, Edit3, Package } from 'lucide-react';
import { useState } from 'react';

const PantryCard = ({ item, onUpdateQuantity, onRemove, onEdit }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    setIsUpdating(true);
    await onUpdateQuantity(item.id, newQuantity);
    setIsUpdating(false);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'grains': '🌾',
      'vegetables': '🥕',
      'fruits': '🍎',
      'dairy': '🥛',
      'meat': '🥩',
      'spices': '🌶️',
      'canned': '🥫',
      'frozen': '❄️',
      'default': '📦'
    };
    return icons[category?.toLowerCase()] || icons.default;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
              {getCategoryIcon(item.category)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white capitalize">
                {item.name}
              </h3>
              {item.category && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                  {item.category}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onEdit?.(item)}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            <Edit3 size={16} />
          </button>
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
            "{item.notes}"
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Quantity:
            </span>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuantityChange(Math.max(1, item.quantity - 1))}
                disabled={isUpdating || item.quantity <= 1}
                className="w-8 h-8 rounded-lg bg-white dark:bg-gray-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Minus size={14} />
              </motion.button>
              
              <span className="font-bold text-lg min-w-[3rem] text-center text-gray-900 dark:text-white">
                {item.quantity}
              </span>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating}
                className="w-8 h-8 rounded-lg bg-white dark:bg-gray-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Plus size={14} />
              </motion.button>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {item.unit}
            </span>
          </div>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onRemove(item.id)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="px-6 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Updated {new Date(item.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
};

export default PantryCard;
