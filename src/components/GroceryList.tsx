/**
 * @file components/GroceryList.tsx
 * @description Aggregates ingredients from all saved recipes to generate a unified Grocery List.
 */

import React, { useMemo, useState } from 'react';
import { ShoppingCart, CheckSquare, Square, Plus } from 'lucide-react';
import { useStore } from '../lib/store';

export const GroceryList: React.FC = () => {
  const { recipes, inStockItems, customGroceryItems, addCustomGroceryItem, toggleCustomGroceryItem } = useStore();
  const [customInput, setCustomInput] = useState('');

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

    const scheduledRecipes = recipes.filter(r => r.scheduledDates && r.scheduledDates.length > 0);

    scheduledRecipes.forEach(recipe => {
      const timesScheduled = recipe.scheduledDates!.length;
      recipe.ingredients.forEach(ing => {
        const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
        const addedAmount = ing.amount * timesScheduled;

        if (map.has(key)) {
          const existing = map.get(key)!;
          map.set(key, { amount: existing.amount + addedAmount, unit: existing.unit });
        } else {
          map.set(key, { amount: addedAmount, unit: ing.unit });
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
    type GroceryListItem = { name: string; amount: number; unit: string; isCustom?: boolean; id?: string };
    const active: GroceryListItem[] = [];
    const completed: GroceryListItem[] = [];

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
        active.push({ ...item, isCustom: false });
      }
    });

    customGroceryItems.forEach(item => {
      if (item.isCompleted) {
        completed.push({ name: item.name, amount: 0, unit: '', isCustom: true, id: item.id });
      } else {
        active.push({ name: item.name, amount: 0, unit: '', isCustom: true, id: item.id });
      }
    });

    return { active, completed };
  }, [aggregatedIngredients, inStockItems, overrides, customGroceryItems]);

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
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-textPrimary mb-2">Grocery List</h2>
          <p className="text-textSecondary">Everything you need for your planned meals.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addCustomGroceryItem(customInput);
            setCustomInput('');
          }}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Add custom item..."
            className="input-field !py-2 !px-4 flex-1 md:w-64"
          />
          <button type="submit" className="btn-primary !p-2 rounded-xl" disabled={!customInput.trim()}>
            <Plus size={20} />
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-8">
        {/* Active Ingredients */}
        {categorizedItems.active.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorizedItems.active.map((item, idx) => {
                const itemId = item.isCustom ? item.id : `${item.name}-${item.unit}`;
                return (
                  <li
                    key={`active-${idx}`}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-surface/50 border border-transparent hover:border-secondary/20 transition-all group"
                  >
                    <div
                      className="flex items-center gap-4 cursor-pointer flex-1"
                      onClick={() => item.isCustom ? toggleCustomGroceryItem(item.id!) : toggleItem(itemId!, false)}
                    >
                      <div className="transition-colors text-textSecondary group-hover:text-secondary">
                        <Square size={24} />
                      </div>
                      <div className="transition-all duration-300">
                        <p className="text-lg font-medium text-textPrimary capitalize">{item.name}</p>
                        {!item.isCustom && (
                          <p className="text-sm text-textSecondary">
                            {item.amount.toFixed(Math.max(0, (item.amount.toString().split('.')[1] || '').length))} {item.unit}
                          </p>
                        )}
                      </div>
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
                  const itemId = item.isCustom ? item.id : `${item.name}-${item.unit}`;
                  return (
                    <li
                      key={`completed-${idx}`}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-surface/50 border border-secondary/20 bg-surface/30 transition-all group"
                    >
                      <div
                        className="flex items-center gap-4 cursor-pointer flex-1"
                        onClick={() => item.isCustom ? toggleCustomGroceryItem(item.id!) : toggleItem(itemId!, true)}
                      >
                        <div className="transition-colors text-secondary group-hover:text-textPrimary">
                          <CheckSquare size={24} />
                        </div>
                        <div className="transition-all duration-300 line-through text-textSecondary">
                          <p className="text-lg font-medium text-textPrimary capitalize">{item.name}</p>
                          {!item.isCustom && (
                            <p className="text-sm text-textSecondary">
                              {item.amount.toFixed(Math.max(0, (item.amount.toString().split('.')[1] || '').length))} {item.unit}
                            </p>
                          )}
                        </div>
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
