/**
 * @file lib/gemini.ts
 * @description Integration with the secure backend Firebase Cloud Function.
 * The client no longer holds the GEMINI_API_KEY, preventing API abuse and DDoS.
 */

import { httpsCallable } from "firebase/functions";
import type { Recipe } from "../types";
import { functions } from "./firebase";
import { v4 as uuidv4 } from "uuid";

/**
 * Calls the secure Firebase Cloud Function to generate a recipe.
 * The backend handles calling Gemini, enforcing Rate Limits, and verifying Auth.
 * @param query {string} The natural language query from the user
 * @returns {Promise<Recipe>} A promise that resolves to a newly created Recipe object.
 */
export async function generateRecipe(query: string): Promise<Recipe> {
  try {
    const generateRecipeCall = httpsCallable<{ query: string }, Recipe>(
      functions,
      "generateRecipe"
    );
    const result = await generateRecipeCall({ query });
    return result.data;
  } catch (error: any) {
    console.error("Error generating recipe from Cloud Function:", error);
    
    // Provide a mocked fallback for Local Storage / Guest mode 
    // or if the deployed function is not available.
    if (error?.code !== 'resource-exhausted') {
      console.warn("Falling back to mock recipe for development/guest UX.");
      return {
        id: uuidv4(),
        title: "Mock AI Recipe (Backend Not Deployed / Guest Mode)",
        description: "Firebase Cloud functions are either uninitialized or in Guest mode.",
        ingredients: [{ name: "Mock Ingredient", amount: 1, unit: "unit" }],
        instructions: ["Step 1: Check backend.", "Step 2: Try again."],
        isFavorite: false,
        prepTimeMinutes: 5,
        imageUrl: "https://images.unsplash.com/photo-1498837167339-444ea46cb1e5?auto=format&fit=crop&q=80&w=1080"
      };
    }
    
    throw new Error(error.message || "Failed to generate recipe.");
  }
}
