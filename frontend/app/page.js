'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Package, ChefHat, ShoppingCart } from 'lucide-react';

// Import our new components
import Navigation from '@/components/Navigation';
import PantryCard from '@/components/PantryCard';
import MealCard from '@/components/MealCard';
import ShoppingListCard from '@/components/ShoppingListCard';
import AddItemModal from '@/components/AddItemModal';
import ToastContainer from '@/components/ToastContainer';

export default function PantryMealPlannerPage() {
  // State management
  const [currentPage, setCurrentPage] = useState('pantry');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [pantry, setPantry] = useState([]);
  const [mealPlan, setMealPlan] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPantry, setLoadingPantry] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [cookingMode, setCookingMode] = useState('home'); // 'home' or 'professional'

  // Backend API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

  // Toast system
  const addToast = (message, type = 'info', title = null, duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, title, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Load pantry items on component mount
  useEffect(() => {
    loadPantryItems();
  }, []);

  const loadPantryItems = async () => {
    try {
      setLoadingPantry(true);
      const response = await fetch(`${API_BASE}/api/pantry`);
      const result = await response.json();
      
      if (result.success) {
        setPantry(result.data || []);
      } else {
        console.error('Failed to load pantry items:', result.error);
        setPantry([]);
        addToast('Failed to load pantry items', 'error');
      }
    } catch (error) {
      console.error('Error loading pantry items:', error);
      setPantry([]);
      addToast('Failed to connect to backend. Make sure the server is running.', 'error');
    } finally {
      setLoadingPantry(false);
    }
  };

  // Add item to pantry
  const addItem = async (itemData) => {
    try {
      const response = await fetch(`${API_BASE}/api/pantry/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      const result = await response.json();
      
      if (result.success) {
        setPantry(prev => [...prev, result.data]);
        addToast(`${itemData.name} added successfully!`, 'success');
      } else {
        addToast('Failed to add item: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      addToast('Failed to add item. Please try again.', 'error');
    }
  };

  // Remove item from pantry
  const removeItem = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/pantry/delete/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        setPantry(prev => prev.filter(item => item.id !== id));
        addToast('Item removed successfully!', 'success');
      } else {
        addToast('Failed to remove item: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      addToast('Failed to remove item. Please try again.', 'error');
    }
  };

  // Update item quantity
  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`${API_BASE}/api/pantry/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPantry(prev => prev.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        ));
      } else {
        addToast('Failed to update item: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      addToast('Failed to update item. Please try again.', 'error');
    }
  };

  // Generate meal plan
  const generateMealPlan = async () => {
    if (pantry.length === 0) {
      addToast('Please add some pantry items first!', 'warning');
      return;
    }

    setIsGenerating(true);
    setMealPlan(null);

    try {
      const response = await fetch(`${API_BASE}/api/meal-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cookingMode }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMealPlan(result.data);
        addToast('Meal plan generated successfully!', 'success');
        setCurrentPage('meals');
      } else {
        addToast(result.error || 'Failed to generate meal plan', 'error');
      }
    } catch (err) {
      console.error('Error generating meal plan:', err);
      addToast('An error occurred while generating the meal plan', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Render pantry page
  const renderPantryPage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-10"
        >
          <Package size={40} className="text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Your Smart Pantry
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
          Organize your ingredients and let AI create amazing meals from what you have
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-1 px-2 rounded-2xl transition-all duration-200 shadow-lg"
        >
          <Plus size={20} />
        Add Ingredient
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateMealPlan}
          disabled={isGenerating || pantry.length === 0}
          className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles size={20} />
          )}
          {isGenerating ? 'Generating...' : 'Generate Meal Plan'}
        </motion.button>
      </div>

      {/* Pantry Grid */}
      {loadingPantry ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : pantry.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {pantry.map((item) => (
              <PantryCard
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                onEdit={() => {}} // TODO: Add edit functionality
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={48} className="text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your pantry is empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Start adding ingredients to unlock AI-powered meal planning and smart recipe suggestions
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg"
          >
            Add Your First Ingredient
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );

  // Render meals page
  const renderMealsPage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-10"
        >
          <ChefHat size={40} className="text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          AI Meal Suggestions
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Personalized recipes crafted from your pantry ingredients
        </p>
        
        {/* Cooking Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl flex gap-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCookingMode('home')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                cookingMode === 'home'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🍳 Home Cook
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCookingMode('professional')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                cookingMode === 'professional'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              👨‍🍳 Professional
            </motion.button>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      {!mealPlan && !isGenerating && (
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateMealPlan}
            disabled={pantry.length === 0}
            className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg mx-auto disabled:cursor-not-allowed"
          >
            <Sparkles size={20} />
            Generate {cookingMode === 'professional' ? 'Professional' : 'Home Cook'} Recipes
          </motion.button>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 border-4 border-purple-200 dark:border-purple-800 border-t-purple-500 rounded-full animate-spin mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Creating Your Meal Plan
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            AI is analyzing your pantry and generating personalized recipes...
          </p>
        </motion.div>
      )}

      {/* Meals Grid */}
      {mealPlan && mealPlan.meals && (
        <motion.div
          layout
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {mealPlan.meals.map((meal, index) => (
            <MealCard key={index} meal={meal} index={index} />
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!mealPlan && !isGenerating && pantry.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChefHat size={48} className="text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No ingredients to cook with
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Add some ingredients to your pantry first, then come back to generate amazing meal ideas
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage('pantry')}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg"
          >
            Go to Pantry
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );

  // Render shopping page
  const renderShoppingPage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
          <ShoppingCart size={40} className="text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Smart Shopping List
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Everything you need to cook your planned meals
        </p>
      </div>

      {/* Shopping List */}
      <div className="max-w-2xl mx-auto">
        <ShoppingListCard items={mealPlan?.shoppingList || []} />
      </div>
    </motion.div>
  );

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {/* Navigation */}
        <Navigation
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {currentPage === 'pantry' && (
              <motion.div key="pantry">
                {renderPantryPage()}
              </motion.div>
            )}
            {currentPage === 'meals' && (
              <motion.div key="meals">
                {renderMealsPage()}
              </motion.div>
            )}
            {currentPage === 'shopping' && (
              <motion.div key="shopping">
                {renderShoppingPage()}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Floating Add Button (only on pantry page) */}
        <AnimatePresence>
          {currentPage === 'pantry' && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAddModalOpen(true)}
              className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-40"
            >
              <Plus size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Add Item Modal */}
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addItem}
        />

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />

        {/* Footer */}
        <footer className="mt-16 flex py-8 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Powered by <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">IBM watsonx AI</span>
              {' • '}Built with <span className="font-semibold">Next.js 14</span> & <span className="font-semibold">Tailwind CSS</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
