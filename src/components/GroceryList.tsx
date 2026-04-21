/**
 * @file components/GroceryList.tsx
 * @description Aggregates ingredients from all saved recipes to generate a unified Grocery List.
 */

import React, { useMemo, useState } from 'react';
import { ShoppingCart, CheckSquare, Square } from 'lucide-react';
import { useStore } from '../lib/store';

export const GroceryList: React.FC = () => {
  const { recipes, inStockItems } = useStore();

  // Tracks explicit toggles, overriding Pantry defaults.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const toggleItem = (itemId: string, currentlyChecked: boolean) => {
    setOverrides(prev => ({
      ...prev,
      [itemId]: !currentlyChecked
    }));
  };

  // Aggregate ingredients smartly based on exact name match. 
  const aggregatedIngredients = useMemo(() => {
    const map = new Map<string, { amount: number, unit: string }>();

    const scheduledRecipes = recipes.filter(r => r.scheduledDate);

    scheduledRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
        if (map.has(key)) {
          const existing = map.get(key)!;
          map.set(key, { amount: existing.amount + ing.amount, unit: existing.unit });
        } else {
          map.set(key, { amount: ing.amount, unit: ing.unit });
        }
      });
    });

    return Array.from(map.entries()).map(([key, data]) => {
      const name = key.split('|')[0];
      return {
        name,
        amount: data.amount,
        unit: data.unit
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [recipes]);

  // Split items into active and completed (crossed out) groups
  const categorizedItems = useMemo(() => {
    const active: typeof aggregatedIngredients = [];
    const completed: typeof aggregatedIngredients = [];

    aggregatedIngredients.forEach(item => {
      const itemId = `${item.name}-${item.unit}`;
      const isPantry = inStockItems.some(stock => item.name.toLowerCase() === stock || item.name.toLowerCase().includes(stock));

      let isChecked = isPantry;
      if (overrides[itemId] !== undefined) {
        isChecked = overrides[itemId];
      }

      if (isChecked) {
        completed.push(item);
      } else {
        active.push(item);
      }
    });

    return { active, completed };
  }, [aggregatedIngredients, inStockItems, overrides]);

  if (aggregatedIngredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-textSecondary gap-4 text-center">
        <ShoppingCart size={48} className="text-surface border border-secondary/20 rounded-full p-2" />
        <p className="text-xl">Your grocery list is empty.</p>
        <p className="text-sm">Add recipes from your timeline to see your shopping ingredients here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-textPrimary mb-2">Grocery List</h2>
          <p className="text-textSecondary">Everything you need for your planned meals.</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Active Ingredients */}
        {categorizedItems.active.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorizedItems.active.map((item, idx) => {
                const itemId = `${item.name}-${item.unit}`;
                return (
                  <li
                    key={`active-${idx}`}
                    onClick={() => toggleItem(itemId, false)}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 border border-transparent hover:border-secondary/20 transition-all cursor-pointer group"
                  >
                    <div className="transition-colors text-textSecondary group-hover:text-secondary">
                      <Square size={24} />
                    </div>
                    <div className="transition-all duration-300">
                      <p className="text-lg font-medium text-textPrimary capitalize">{item.name}</p>
                      <p className="text-sm text-textSecondary">
                        {item.amount.toFixed(Math.max(0, (item.amount.toString().split('.')[1] || '').length))} {item.unit}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Checked off ingredients */}
        {categorizedItems.completed.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-textPrimary mb-4 px-2 opacity-70">Completed</h3>
            <div className="glass-panel p-6 rounded-2xl opacity-70 hover:opacity-100 transition-opacity">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorizedItems.completed.map((item, idx) => {
                  const itemId = `${item.name}-${item.unit}`;
                  return (
                    <li
                      key={`completed-${idx}`}
                      onClick={() => toggleItem(itemId, true)}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 border border-secondary/20 bg-surface/30 transition-all cursor-pointer group"
                    >
                      <div className="transition-colors text-secondary group-hover:text-textPrimary">
                        <CheckSquare size={24} />
                      </div>
                      <div className="transition-all duration-300 line-through text-textSecondary">
                        <p className="text-lg font-medium text-textPrimary capitalize">{item.name}</p>
                        <p className="text-sm text-textSecondary">
                          {item.amount.toFixed(Math.max(0, (item.amount.toString().split('.')[1] || '').length))} {item.unit}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
