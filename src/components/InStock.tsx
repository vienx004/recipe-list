/**
 * @file components/InStock.tsx
 * @description Page for tracking ingredients currently on hand.
 * Items here will automatically mark matching items as "checked" in the Grocery List.
 */

import React, { useState } from 'react';
import { PackageOpen, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';

export const InStock: React.FC = () => {
  const { inStockItems, addInStockItem, removeInStockItem } = useStore();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addInStockItem(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent via-secondary to-textPrimary p-1">
          Pantry Inventory
        </h2>
        <p className="text-lg text-textSecondary max-w-2xl mx-auto">
          Keep track of ingredients you already have. We'll automatically cross them off your upcoming grocery list.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group max-w-xl mx-auto w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <PackageOpen className="w-5 h-5 text-secondary transition-colors" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full bg-surface border-2 border-secondary/20 rounded-2xl py-4 pl-12 pr-16 text-lg text-textPrimary placeholder-textSecondary focus:border-accent focus:ring-0 transition-all shadow-xl"
          placeholder="e.g. olive oil, rice, salt"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="absolute inset-y-2 right-2 btn-primary !py-2 !px-3 rounded-xl flex items-center justify-center opacity-90 disabled:opacity-50"
          title="Add Ingredient"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="glass-panel p-6 rounded-3xl mt-4">
        {inStockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-textSecondary gap-4 text-center">
            <PackageOpen size={48} className="text-surface border border-secondary/20 rounded-full p-2 bg-secondary/10" />
            <p className="text-lg">Your pantry is empty.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inStockItems.map((item, idx) => (
              <li 
                key={idx}
                className="flex items-center justify-between p-4 bg-background/50 border border-secondary/10 rounded-xl hover:border-secondary/30 transition-all group"
              >
                <span className="font-medium text-textPrimary capitalize">{item}</span>
                <button
                  onClick={() => removeInStockItem(item)}
                  className="text-textSecondary hover:text-red-500 transition-colors p-1"
                  title="Remove from pantry"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
