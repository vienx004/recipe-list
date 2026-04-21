/**
 * @file lib/store.tsx
 * @description Global state management using React Context. 
 * Handles reading/writing to Firebase, with a graceful fallback to LocalStorage
 * so the app remains fully functional even without valid Firebase credentials!
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Recipe } from '../types';
import { v4 as uuidv4 } from 'uuid';
// We import Firestore basics, but wrap them in try-catch
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, RECIPES_COLLECTION } from './firebase';

interface StoreContextType {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  isFirebaseActive: boolean;
  inStockItems: string[];
  addInStockItem: (name: string) => void;
  removeInStockItem: (name: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);

  const [inStockItems, setInStockItems] = useState<string[]>(() => {
    const raw = localStorage.getItem('local_instock');
    return raw ? JSON.parse(raw) : [];
  });

  const saveInStockItems = (items: string[]) => {
    localStorage.setItem('local_instock', JSON.stringify(items));
    setInStockItems(items);
  };

  const addInStockItem = (name: string) => {
    const formatted = name.toLowerCase().trim();
    if (formatted && !inStockItems.includes(formatted)) {
      saveInStockItems([...inStockItems, formatted]);
    }
  };

  const removeInStockItem = (name: string) => {
    saveInStockItems(inStockItems.filter(i => i !== name.toLowerCase().trim()));
  };

  // Use LocalStorage as a fallback mechanism so the UX is preserved
  const getLocalRecipes = (): Recipe[] => {
    const raw = localStorage.getItem('local_recipes');
    return raw ? JSON.parse(raw) : [];
  };

  const saveLocalRecipes = (newRecipes: Recipe[]) => {
    localStorage.setItem('local_recipes', JSON.stringify(newRecipes));
    setRecipes(newRecipes);
  };

  useEffect(() => {
    // Attempt to listen to Firestore. If it fails (e.g. invalid mock key), fallback to local
    try {
      const colRef = collection(db, RECIPES_COLLECTION);
      const unsubscribe = onSnapshot(colRef, 
        (snapshot) => {
          setIsFirebaseActive(true);
          const fbRecipes: Recipe[] = [];
          snapshot.forEach((doc) => {
            fbRecipes.push({ id: doc.id, ...doc.data() } as Recipe);
          });
          setRecipes(fbRecipes);
        },
        (error) => {
          console.warn('Firestore subscription failed, falling back to LocalStorage.', error.message);
          setIsFirebaseActive(false);
          setRecipes(getLocalRecipes());
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore initialization failed entirely. Using LocalStorage.');
      setIsFirebaseActive(false);
      setRecipes(getLocalRecipes());
    }
  }, []);

  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = { ...recipe, id: uuidv4() };
    if (isFirebaseActive) {
      try {
        const docRef = doc(collection(db, RECIPES_COLLECTION), newRecipe.id);
        await setDoc(docRef, newRecipe);
        return;
      } catch (err) {
        console.error("Firebase save failed:", err);
      }
    }
    saveLocalRecipes([...recipes, newRecipe]);
  };

  const updateRecipe = async (recipe: Recipe) => {
    if (isFirebaseActive) {
      try {
        const docRef = doc(db, RECIPES_COLLECTION, recipe.id);
        // Exclude ID from being rewritten if we just want to update data payload
        const { id, ...data } = recipe;
        await updateDoc(docRef, data as any);
        return;
      } catch (err) {
        console.error("Firebase update failed:", err);
      }
    }
    saveLocalRecipes(recipes.map(r => r.id === recipe.id ? recipe : r));
  };

  const deleteRecipe = async (id: string) => {
    if (isFirebaseActive) {
      try {
        const docRef = doc(db, RECIPES_COLLECTION, id);
        await deleteDoc(docRef);
        return;
      } catch (err) {
        console.error("Firebase delete failed:", err);
      }
    }
    saveLocalRecipes(recipes.filter(r => r.id !== id));
  };

  const toggleFavorite = async (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
      await updateRecipe({ ...recipe, isFavorite: !recipe.isFavorite });
    }
  };

  return (
    <StoreContext.Provider value={{
      recipes, addRecipe, updateRecipe, deleteRecipe, toggleFavorite, isFirebaseActive,
      inStockItems, addInStockItem, removeInStockItem
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
