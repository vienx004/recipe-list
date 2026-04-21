/**
 * @file components/RecipeModal.tsx
 * @description Global popup component for displaying recipe details.
 */

import React from 'react';
import { X, Clock, CalendarDays, Heart, HeartOff } from 'lucide-react';
import { useStore } from '../lib/store';

export const RecipeModal: React.FC = () => {
  const { selectedRecipe, setSelectedRecipe, updateRecipe } = useStore();

  if (!selectedRecipe) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setSelectedRecipe(null)}
      />

      {/* Modal Dialog */}
      <div className="relative glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl flex flex-col transform animate-in zoom-in-95 duration-500 shadow-2xl bg-surface">
        <button
          onClick={() => setSelectedRecipe(null)}
          className="absolute top-4 right-4 z-50 p-2 bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full text-textPrimary transition-colors"
        >
          <X size={24} />
        </button>

        {/* Top Split Section */}
        <div className="flex flex-col md:flex-row w-full flex-1">
          {/* Image Box */}
          <div className="w-full md:w-2/5 h-64 md:h-auto relative shrink-0">
            <img
              src={selectedRecipe.imageUrl}
              alt={selectedRecipe.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-surface to-transparent" />
          </div>

          {/* Content Box */}
          <div className="w-full md:w-3/5 p-8 flex flex-col gap-6 relative z-10 bg-surface">
            <div>
              <div className="flex items-center gap-3 text-textSecondary mb-2 font-medium">
                <Clock size={16} /> {selectedRecipe.prepTimeMinutes} mins
              </div>
              <h3 className="text-3xl font-bold text-textPrimary mb-2">{selectedRecipe.title}</h3>
              <p className="text-textSecondary leading-relaxed">{selectedRecipe.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-secondary mb-3">Ingredients</h4>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex gap-2 text-sm text-textSecondary bg-secondary/5 p-2 rounded-lg">
                      <span className="font-bold text-textPrimary">{ing.amount} {ing.unit}</span>
                      {ing.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-accent mb-3">Instructions</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-textSecondary">
                  {selectedRecipe.instructions.map((step, i) => (
                    <li key={i} className="pl-2">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Action Bar */}
        <div className="w-full p-6 border-t border-secondary/20 flex flex-col sm:flex-row items-center gap-6 justify-center bg-surface/50 rounded-b-3xl shrink-0">
          <button
            onClick={async () => {
              const toggled = !selectedRecipe.isFavorite;
              const updated = { ...selectedRecipe, isFavorite: toggled };
              await updateRecipe(updated);
              setSelectedRecipe(updated);
            }}
            className={`${selectedRecipe.isFavorite ? 'btn-secondary text-red-500 hover:text-red-500 hover:border-red-500/30' : 'btn-primary'} flex justify-center items-center gap-2 min-w-[200px] py-3 px-6`}
          >
            {selectedRecipe.isFavorite ? (
              <>
                <HeartOff size={18} /> Remove Favorite
              </>
            ) : (
              <>
                <Heart size={18} /> Save to Favorites
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-3 bg-background p-3 rounded-xl border border-secondary/20 min-w-[220px]">
            <CalendarDays className="text-secondary shrink-0" size={20} />
            <label htmlFor="schedule-date" className="text-sm font-semibold text-textPrimary shrink-0">
              Cook on:
            </label>
            <input
              id="schedule-date"
              type="date"
              value={selectedRecipe.scheduledDate ? selectedRecipe.scheduledDate.split('T')[0] : ''}
              onChange={async (e) => {
                const val = e.target.value;
                const newDate = val ? new Date(`${val}T12:00:00Z`).toISOString() : undefined;
                const updated = { ...selectedRecipe, scheduledDate: newDate, isFavorite: true };
                await updateRecipe(updated);
                setSelectedRecipe(updated);
              }}
              className="input-field !py-1.5 !px-3 text-sm flex-1 cursor-pointer hover:border-accent"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
