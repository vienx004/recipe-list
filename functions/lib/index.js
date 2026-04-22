"use strict";
/**
 * @file functions/src/index.ts
 * @description Firebase Cloud Function to securely proxy Gemini API requests.
 * Prevents API key exposure and implements user-based rate limiting to prevent DDoS.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecipe = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const generative_ai_1 = require("@google/generative-ai");
const uuid_1 = require("uuid");
admin.initializeApp();
const db = admin.firestore();
// Rate Limit Configuration
const MAX_REQUESTS_PER_HOUR = 5;
exports.generateRecipe = (0, https_1.onCall)({
    // You can enforce App Check to ensure only your authorized frontend app can call this function
    // enforceAppCheck: true, 
    cors: true,
    secrets: ["GEMINI_API_KEY"] // Ensure API Key is passed securely
}, async (request) => {
    // 1. Authenticate Request
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "You must be logged in to generate recipes.");
    }
    const uid = request.auth.uid;
    // 2. Rate Limiting Logic via Firestore
    const rateLimitRef = db.collection("rateLimits").doc(uid);
    await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(rateLimitRef);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        if (!doc.exists) {
            // First request ever
            transaction.set(rateLimitRef, { count: 1, lastReset: now });
        }
        else {
            const data = doc.data();
            const lastReset = data.lastReset || 0;
            let count = data.count || 0;
            // Reset if an hour has passed
            if (now - lastReset > oneHour) {
                count = 1;
                transaction.set(rateLimitRef, { count, lastReset: now }, { merge: true });
            }
            else {
                // Check if limit exceeded
                if (count >= MAX_REQUESTS_PER_HOUR) {
                    throw new https_1.HttpsError("resource-exhausted", "You have exceeded your recipe generation limit. Please try again later.");
                }
                // Increment count
                transaction.update(rateLimitRef, { count: count + 1 });
            }
        }
    });
    // 3. Extract the Query
    const query = request.data.query;
    if (!query || typeof query !== 'string') {
        throw new https_1.HttpsError("invalid-argument", "Query is required.");
    }
    // 4. Securely Call Gemini
    const API_KEY = process.env.GEMINI_API_KEY || "";
    if (!API_KEY) {
        console.warn("Missing GEMINI_API_KEY environment variable. Returning mock.");
        return {
            id: (0, uuid_1.v4)(),
            title: "Mock Backend Recipe (API Key Missing)",
            description: "Please configure GEMINI_API_KEY in Google Cloud Secret Manager.",
            ingredients: [{ name: "Mock Ingredient", amount: 1, unit: "unit" }],
            instructions: ["Step 1: Setup secret.", "Step 2: Try again."],
            isFavorite: false,
            prepTimeMinutes: 5,
            imageUrl: "https://images.unsplash.com/photo-1498837167339-444ea46cb1e5?auto=format&fit=crop&q=80&w=1080"
        };
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
    const prompt = `
      You are an expert culinary chef. The user wants a recipe based on this request: "${query}".
      Create a highly appetizing, easy-to-follow recipe. Include realistic prep times and vivid descriptions.
      
      CRITICAL INGREDIENT INSTRUCTION:
      For the "name" field of each ingredient, you MUST use ONLY the base, simple root form of the item. Strip away any preparation, form, or state adjectives. 
      Examples: 
        - Use "carrot" instead of "diced carrots" or "shredded carrots"
        - Use "lemon" instead of "lemon zest" or "lemon wedges"
        - Use "chicken breast" instead of "boneless skinless chicken breast cut into cubes"
        - Use "garlic" instead of "minced garlic cloves"
        
      You MUST return the output ONLY as a valid JSON object with the following schema, and zero markdown formatting (do not wrap in \`\`\`json).
      {
        "title": "Recipe Title",
        "description": "Appetizing description of the recipe",
        "ingredients": [
          { "name": "base ingredient name", "amount": 1.5, "unit": "cups" }
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
        const cleanedText = responseText.replace(/```(?:json)?\n?/g, "").trim();
        const parsed = JSON.parse(cleanedText);
        return {
            id: (0, uuid_1.v4)(),
            title: parsed.title || "AI Recipe",
            description: parsed.description || "",
            ingredients: parsed.ingredients || [],
            instructions: parsed.instructions || [],
            isFavorite: false,
            prepTimeMinutes: parsed.prepTimeMinutes || 30,
            imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1080"
        };
    }
    catch (error) {
        console.error("Gemini Failure:", error);
        if (error?.status === 429) {
            throw new https_1.HttpsError("resource-exhausted", "Your Gemini API credits are depleted or rate limit reached.");
        }
        throw new https_1.HttpsError("internal", "Failed to generate recipe.");
    }
});
//# sourceMappingURL=index.js.map