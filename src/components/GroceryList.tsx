/**
 * @file components/GroceryList.tsx
 * @description Aggregates ingredients from all saved recipes to generate a unified Grocery List.
 */

import React, { useMemo } from 'react';
import { ShoppingCart, CheckSquare } from 'lucide-react';
import { useStore } from '../lib/store';

export const GroceryList: React.FC = () => {
  const { recipes } = useStore();

  // Aggregate ingredients smartly based on exact name match. 
  // In a robust production app, this would use NLP to normalize names ("tomatoes", "tomato").
  const aggregatedIngredients = useMemo(() => {
    const map = new Map<string, { amount: number, unit: string }>();
    
    recipes.forEach(recipe => {
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

  if (aggregatedIngredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-textSecondary gap-4 text-center">
        <ShoppingCart size={48} className="text-surface border border-white/10 rounded-full p-2" />
        <p className="text-xl">Your grocery list is empty.</p>
        <p className="text-sm">Add recipes to see your shopping ingredients here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Grocery List</h2>
          <p className="text-textSecondary">Everything you need for your planned meals.</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
           <ShoppingCart size={18} /> Print List
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aggregatedIngredients.map((item, idx) => (
            <li 
              key={idx} 
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 border border-transparent hover:border-white/5 transition-all group"
            >
              <div className="text-textSecondary group-hover:text-primary transition-colors cursor-pointer">
                <CheckSquare size={24} />
              </div>
              <div>
                <p className="text-lg font-medium text-white capitalize">{item.name}</p>
                <p className="text-sm text-textSecondary">
                  {item.amount.toFixed(Math.max(0, (item.amount.toString().split('.')[1] || '').length))} {item.unit}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
