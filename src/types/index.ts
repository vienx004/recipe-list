/**
 * @file types/index.ts
 * @description Centralized type definitions for the Recipe AI application.
 * 
 * This file contains all interfaces and typed models utilized across the entire application,
 * ensuring strict typings for the payload coming from Gemini and stored into Firebase.
 */

/**
 * Represents a single ingredient inside a recipe.
 * Provides granular tracking useful for the consolidated Grocery List feature.
 */
export interface Ingredient {
  /** The name of the ingredient (e.g. 'Tomatoes') */
  name: string;
  /** Quantity (e.g. 2, 0.5) */
  amount: number;
  /** Unit of measurement (e.g. 'cups', 'lbs', 'whole') */
  unit: string;
}

/**
 * Represents a Recipe which could be a purely user-created entity
 * or generated dynamically by the Gemini AI.
 */
export interface Recipe {
  /** Unique identifier for the recipe (Firebase document ID) */
  id: string;
  /** Title of the recipe */
  title: string;
  /** Short description showcasing what the recipe is about */
  description: string;
  /** List of precisely typed ingredients required */
  ingredients: Ingredient[];
  /** Step by step instructions */
  instructions: string[];
  /** Indicates if the user has marked this recipe as a favorite */
  isFavorite: boolean;
  /** Optional date ISO string representing when this recipe is planned in the calendar */
  scheduledDate?: string;
  /** Image URL for visual flair, could be an external placeholder or Gemini provided flavor */
  imageUrl?: string;
  /** Estimated time to cook inside minutes */
  prepTimeMinutes?: number;
}
