/**
 * @file components/RecipeSearch.tsx
 * @description Page for creating new recipes via the Gemini AI integration.
 */

import React, { useState } from 'react';
import { Search, Loader2, Plus, Clock } from 'lucide-react';
import { generateRecipe } from '../lib/gemini';
import { useStore } from '../lib/store';
import type { Recipe } from '../types';

export const RecipeSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { addRecipe } = useStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const recipe = await generateRecipe(query);
      setGeneratedRecipe(recipe);
    } catch (err) {
      setError("Failed to generate recipe. Please ensure your Gemini API key is configured.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCalendar = async () => {
    if (!generatedRecipe) return;
    try {
      // For this demo, let's schedule it for today if saved directly from search
      const today = new Date().toISOString();
      await addRecipe({ ...generatedRecipe, scheduledDate: today, isFavorite: true });
      alert("Recipe Saved to Calendar and Favorites!");
      setGeneratedRecipe(null);
      setQuery('');
    } catch (err) {
      console.error(err);
      alert("Error saving recipe.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
          What are you craving?
        </h2>
        <p className="text-lg text-textSecondary max-w-2xl mx-auto">
          Describe the meal you want or list the ingredients you have, and our AI Chef will craft a perfect recipe for you.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-primary group-focus-within:text-accent transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface/50 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-32 text-lg text-white placeholder-textSecondary focus:bg-surface focus:border-primary focus:ring-0 transition-all shadow-xl"
          placeholder="e.g., Spicy Shrimp Tacos, or 'I have beef, rice, and broccoli'"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute inset-y-2 right-2 btn-primary rounded-xl flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Generated Recipe Preview Card */}
      {generatedRecipe && (
        <div className="glass-panel rounded-3xl overflow-hidden mt-8 flex flex-col md:flex-row transform transition-all duration-500 hover:shadow-2xl">
          {/* Image Placeholder */}
          <div className="w-full md:w-2/5 h-64 md:h-auto relative">
            <img 
              src={generatedRecipe.imageUrl} 
              alt={generatedRecipe.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent md:bg-gradient-to-r" />
          </div>

          <div className="w-full md:w-3/5 p-8 flex flex-col gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 text-textSecondary mb-2 font-medium">
                <Clock size={16} /> {generatedRecipe.prepTimeMinutes} mins
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{generatedRecipe.title}</h3>
              <p className="text-textSecondary leading-relaxed">{generatedRecipe.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-primary mb-3">Ingredients</h4>
                <ul className="space-y-2">
                  {generatedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex gap-2 text-sm text-textSecondary bg-background/50 p-2 rounded-lg">
                      <span className="font-bold text-white">{ing.amount} {ing.unit}</span>
                      {ing.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-accent mb-3">Instructions</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-textSecondary">
                  {generatedRecipe.instructions.map((step, i) => (
                    <li key={i} className="pl-2">{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-4 border-t border-white/10">
              <button 
                onClick={handleSaveToCalendar}
                className="btn-primary flex-1 flex justify-center items-center gap-2"
              >
                <Plus size={18} /> Save to My List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
