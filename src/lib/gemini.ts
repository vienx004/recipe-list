/**
 * @file lib/gemini.ts
 * @description Integration with Google's Gemini Pro API.
 * 
 * We use the Generative AI SDK to construct a structured recipe based on user input.
 * The prompt ensures that the returning payload explicitly matches our expected JSON shape
 * so that we can directly parse and use it in our TS types.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Recipe } from "../types";
import { v4 as uuidv4 } from "uuid";

// We extract the API key from environment variables (using Vite's import.meta.env prefix)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Initialize the Gemini client. We will instantiate it here.
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Calls Gemini to generate a recipe based on a search query or a set of ingredients.
 * @param query {string} The natural language query from the user (e.g. "Spicy chicken tacos")
 * @returns {Promise<Recipe>} A promise that resolves to a newly created Recipe object.
 */
export async function generateRecipe(query: string): Promise<Recipe> {
  if (!API_KEY) {
    console.warn("No Gemini API key found. Using mock response.");
    // Fallback Mock for UX demonstration if API key is missing
    return {
      id: uuidv4(),
      title: "Mock AI Recipe (Missing API Key)",
      description: "Please add VITE_GEMINI_API_KEY to your .env file to see real results.",
      ingredients: [{ name: "Mock Ingredient", amount: 1, unit: "unit" }],
      instructions: ["Step 1: Setup specific ENV key.", "Step 2: Try again."],
      isFavorite: false,
      prepTimeMinutes: 5,
      imageUrl: "https://images.unsplash.com/photo-1498837167339-444ea46cb1e5?auto=format&fit=crop&q=80&w=1080"
    };
  }

  // We explicitly use "gemini-flash-lite-latest" as it is highly robust, free-tier friendly, and generally suffers fewer wait-times
  const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

  const prompt = `
    You are an expert culinary chef. The user wants a recipe based on this request: "${query}".
    Create a highly appetizing, easy-to-follow recipe. Include realistic prep times and vivid descriptions.
    
    You MUST return the output ONLY as a valid JSON object with the following schema, and zero markdown formatting (do not wrap in \`\`\`json).
    {
      "title": "Recipe Title",
      "description": "Appetizing description of the recipe",
      "ingredients": [
        { "name": "Ingredient name", "amount": 1.5, "unit": "cups" }
      ],
      "instructions": [
        "Step 1...",
        "Step 2..."
      ],
      "prepTimeMinutes": 30
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Attempt to cleanse any accidental markdown
    const cleanedText = responseText.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    // Construct the final Recipe object complying with our internal schema
    const recipe: Recipe = {
      id: uuidv4(), // Client-side generated ID, will be overwritten if stored natively in firestore, but good for local
      title: parsed.title || "AI Recipe",
      description: parsed.description || "",
      ingredients: parsed.ingredients || [],
      instructions: parsed.instructions || [],
      isFavorite: false,
      prepTimeMinutes: parsed.prepTimeMinutes || 30,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1080" // Realistic food placeholder
    };

    return recipe;
  } catch (error) {
    console.error("Error generating recipe from Gemini:", error);
    throw new Error("Failed to generate recipe.");
  }
}
