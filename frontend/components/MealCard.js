'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, ChefHat, Flame, Heart, ChevronDown, ChevronUp } from 'lucide-react';

const MealCard = ({ meal, index }) => {
  const isLegacyFormat = typeof meal === 'string';
  const [showAllSteps, setShowAllSteps] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white">
              <ChefHat size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                {isLegacyFormat ? `Meal ${index + 1}` : meal.title}
              </h3>
              {!isLegacyFormat && meal.cookTime && (
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Clock size={14} />
                  <span>{meal.cookTime}</span>
                </div>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Heart size={16} />
          </motion.button>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {isLegacyFormat ? meal : meal.description}
        </p>

        {/* Legacy format - simple display */}
        {isLegacyFormat && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
          >
            Cook This Meal
          </motion.button>
        )}

        {/* New structured format */}
        {!isLegacyFormat && (
          <div className="space-y-4">
            {/* Ingredients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pantry Ingredients */}
              {meal.ingredientsUsed && meal.ingredientsUsed.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    From Your Pantry
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {meal.ingredientsUsed.map((ingredient, idx) => (
                      <span
                        key={idx}
                        className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Ingredients */}
              {meal.missingIngredients && meal.missingIngredients.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Need to Buy
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {meal.missingIngredients.map((ingredient, idx) => (
                      <span
                        key={idx}
                        className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nutrition Info */}
            {meal.nutrition && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Flame size={16} />
                  Nutrition per serving
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {meal.nutrition.calories}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Cal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {meal.nutrition.protein}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {meal.nutrition.carbs}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {meal.nutrition.fat}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Fat</div>
                  </div>
                </div>
              </div>
            )}

            {/* Cooking Steps */}
            {meal.steps && meal.steps.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <ChefHat size={16} />
                    Cooking Instructions ({meal.steps.length} steps)
                  </h4>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAllSteps(!showAllSteps)}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium text-sm px-3 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                  >
                    {showAllSteps ? 'Show Less' : 'Show All'}
                    {showAllSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </motion.button>
                </div>
                
                <AnimatePresence>
                  {!showAllSteps ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          1
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                          {meal.steps[0]}
                        </p>
                      </div>
                      {meal.steps.length > 1 && (
                        <p className="text-xs text-blue-500 font-medium ml-9">
                          +{meal.steps.length - 1} more steps
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {meal.steps.map((step, stepIndex) => (
                        <motion.div
                          key={stepIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: stepIndex * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                            {stepIndex + 1}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 leading-relaxed">
                            {step}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
              >
                Cook This Meal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
              >
                Recipe
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MealCard;
