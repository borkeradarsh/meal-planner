'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Check, Plus } from 'lucide-react';
import { useState } from 'react';

const ShoppingListCard = ({ items = [] }) => {
  const [checkedItems, setCheckedItems] = useState(new Set());

  const toggleItem = (index) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  const checkedCount = checkedItems.size;
  const totalItems = items.length;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  if (!items || items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingCart size={32} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No Shopping List Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Generate a meal plan to see what ingredients you need to buy!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200"
        >
          Generate Meal Plan
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Shopping List
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {checkedCount} of {totalItems} items collected
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200"
          >
            <Plus size={16} />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
            {Math.round(progress)}% complete
          </span>
        </div>
      </div>

      {/* Shopping Items */}
      <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
        {items.map((item, index) => {
          const isChecked = checkedItems.has(index);
          const itemName = typeof item === 'string' ? item : item.item;
          const quantity = typeof item === 'object' ? item.quantity : null;
          const unit = typeof item === 'object' ? item.unit : null;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                isChecked
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700'
              }`}
              onClick={() => toggleItem(index)}
            >
              {/* Checkbox */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  isChecked
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 dark:border-gray-500 hover:border-blue-500'
                }`}
              >
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <Check size={14} className="text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* Item Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-medium transition-all duration-200 ${
                      isChecked
                        ? 'text-green-700 dark:text-green-400 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {itemName}
                  </span>
                  {quantity && unit && (
                    <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                      {quantity} {unit}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            💡 Tap items to check them off
          </span>
          {checkedCount === totalItems && totalItems > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold"
            >
              <Check size={16} />
              All done!
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShoppingListCard;
