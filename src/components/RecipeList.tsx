/**
 * @file components/RecipeList.tsx
 * @description Displays a grid of favorited or saved recipes using a visually rich card layout.
 */

import React from 'react';
import { Heart, Clock, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';

export const RecipeList: React.FC = () => {
  const { recipes, toggleFavorite, deleteRecipe, setSelectedRecipe } = useStore();

  const favoriteRecipes = recipes.filter(r => r.isFavorite);

  if (favoriteRecipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-textSecondary gap-4 text-center">
        <Heart size={48} className="text-surface border border-secondary/20 rounded-full p-2" />
        <p className="text-xl">You haven't favored any recipes yet.</p>
        <p className="text-sm">Head over to the Discover tab to find your next meal!</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-textPrimary mb-2">My Favorite Recipes</h2>
        <p className="text-textSecondary">Your curated personal cookbook.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteRecipes.map(recipe => (
          <div 
            key={recipe.id} 
            className="glass-panel rounded-2xl overflow-hidden group flex flex-col hover:border-secondary transition-colors cursor-pointer"
            onClick={() => setSelectedRecipe(recipe)}
          >
            
            <div className="relative h-48 overflow-hidden">
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(recipe.id);
                }}
                className="absolute top-4 right-4 p-2 bg-background/50 backdrop-blur-sm rounded-full text-red-500 hover:text-white hover:bg-red-500 transition-colors"
                title="Remove from favorites"
              >
                <Heart size={20} fill="currentColor" />
              </button>
            </div>

            <div className="p-6 flex flex-col flex-1 gap-4 relative">
              <div>
                <h3 className="text-xl font-bold text-textPrimary mb-1 line-clamp-1">{recipe.title}</h3>
                <p className="text-sm text-textSecondary line-clamp-2">{recipe.description}</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-textSecondary mt-auto">
                <span className="flex items-center gap-1 bg-surface px-2 py-1 rounded-md border border-secondary/20">
                  <Clock size={14} className="text-primary"/> {recipe.prepTimeMinutes}m
                </span>
                <span className="bg-surface px-2 py-1 rounded-md border border-secondary/20 mx-auto lg:mx-0">
                  {recipe.ingredients.length} ingredients
                </span>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRecipe(recipe.id);
                  }}
                  className="ml-auto text-textSecondary hover:text-red-500 transition-colors"
                  title="Delete from cookbook entirely"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};
