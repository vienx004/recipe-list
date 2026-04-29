/**
 * @file lib/store.tsx
 * @description Global state management using React Context. 
 * Handles Firebase Authentication, reading/writing safely segregated docs to Firestore, 
 * with a graceful fallback to LocalStorage!
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Recipe } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { db, RECIPES_COLLECTION, auth } from './firebase';

interface StoreContextType {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'userId'>) => Promise<Recipe>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  isFirebaseActive: boolean;
  inStockItems: string[];
  addInStockItem: (name: string) => void;
  removeInStockItem: (name: string) => void;
  customGroceryItems: { id: string; name: string; isCompleted: boolean }[];
  addCustomGroceryItem: (name: string) => void;
  toggleCustomGroceryItem: (id: string) => void;
  selectedRecipe: Recipe | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  firebaseError: string | null;

  // Auth contexts
  user: User | null;
  authLoading: boolean;
  logout: () => void;
  isGuestMode: boolean;
  setIsGuestMode: (val: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [inStockItems, setInStockItems] = useState<string[]>([]);
  const [customGroceryItems, setCustomGroceryItems] = useState<{ id: string; name: string; isCompleted: boolean }[]>([]);

  // Monitor Authentication Pipeline globally
  useEffect(() => {
    let unsubscribe: () => void;
    try {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      });
    } catch (err: any) {
      console.warn("Auth initialization failed. Running offline.", err);
      setAuthLoading(false);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const saveLocalInStock = (items: string[]) => {
    localStorage.setItem('local_instock', JSON.stringify(items));
    setInStockItems(items);
  };

  const addInStockItem = async (name: string) => {
    const formatted = name.toLowerCase().trim();
    if (!formatted || inStockItems.includes(formatted)) return;

    const newItems = [...inStockItems, formatted];
    if (user && isFirebaseActive) {
      try {
        await setDoc(doc(db, "userSettings", user.uid), { inStockItems: newItems }, { merge: true });
      } catch (err) { console.error("Firebase settings save failed", err); }
    }
    saveLocalInStock(newItems);
  };

  const removeInStockItem = async (name: string) => {
    const updated = inStockItems.filter(i => i !== name.toLowerCase().trim());
    if (user && isFirebaseActive) {
      try {
        await setDoc(doc(db, "userSettings", user.uid), { inStockItems: updated }, { merge: true });
      } catch (err) { }
    }
    saveLocalInStock(updated);
  };

  const saveLocalCustomItems = (items: { id: string; name: string; isCompleted: boolean }[]) => {
    localStorage.setItem('local_custom_grocery', JSON.stringify(items));
    setCustomGroceryItems(items);
  };

  const addCustomGroceryItem = async (name: string) => {
    if (!name.trim()) return;
    const newItem = { id: uuidv4(), name: name.trim(), isCompleted: false };
    const updated = [...customGroceryItems, newItem];
    if (user && isFirebaseActive) {
      try {
        await setDoc(doc(db, "userSettings", user.uid), { customGroceryItems: updated }, { merge: true });
      } catch (err) { console.error("Firebase settings save failed", err); }
    }
    saveLocalCustomItems(updated);
  };

  const toggleCustomGroceryItem = async (id: string) => {
    const updated = customGroceryItems.map(i => i.id === id ? { ...i, isCompleted: !i.isCompleted } : i);
    if (user && isFirebaseActive) {
      try {
        await setDoc(doc(db, "userSettings", user.uid), { customGroceryItems: updated }, { merge: true });
      } catch (err) { }
    }
    saveLocalCustomItems(updated);
  };

  const getLocalRecipes = (): Recipe[] => {
    const raw = localStorage.getItem('local_recipes');
    return raw ? JSON.parse(raw) : [];
  };

  const saveLocalRecipes = (newRecipes: Recipe[]) => {
    localStorage.setItem('local_recipes', JSON.stringify(newRecipes));
    setRecipes(newRecipes);
  };

  // Attach database listeners ONLY when auth resolves
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Clear or load localized data strictly when logged out
      setIsFirebaseActive(false);
      setRecipes(getLocalRecipes());
      const raw = localStorage.getItem('local_instock');
      setInStockItems(raw ? JSON.parse(raw) : []);
      const rawCustom = localStorage.getItem('local_custom_grocery');
      setCustomGroceryItems(rawCustom ? JSON.parse(rawCustom) : []);
      return;
    }

    // Connect to securely scoped Firestore records mapped tightly to the UI User ID
    try {
      const colRef = collection(db, RECIPES_COLLECTION);
      const q = query(colRef, where("userId", "==", user.uid));

      const unsubRecipes = onSnapshot(q,
        (snapshot) => {
          setIsFirebaseActive(true);
          setFirebaseError(null);
          const fbRecipes: Recipe[] = [];
          snapshot.forEach((doc) => {
            fbRecipes.push({ id: doc.id, ...doc.data() } as Recipe);
          });
          setRecipes(fbRecipes);
        },
        (error) => {
          console.warn('Firestore subscription failed, falling back to LocalStorage.', error.message);
          setFirebaseError(error.message);
          setIsFirebaseActive(false);
          setRecipes(getLocalRecipes());
        }
      );

      // Listen to scoped user inventory
      const unsubSettings = onSnapshot(doc(db, "userSettings", user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.inStockItems) {
            setInStockItems(data.inStockItems);
            localStorage.setItem('local_instock', JSON.stringify(data.inStockItems));
          }
          if (data.customGroceryItems) {
            setCustomGroceryItems(data.customGroceryItems);
            localStorage.setItem('local_custom_grocery', JSON.stringify(data.customGroceryItems));
          }
        } else {
          setInStockItems([]);
          setCustomGroceryItems([]);
        }
      }, (error) => {
        console.warn("Failed fetching settings", error.message);
      });

      return () => {
        unsubRecipes();
        unsubSettings();
      };
    } catch (e: any) {
      console.warn('Firestore initialization failed entirely. Using LocalStorage.');
      setFirebaseError(e.message || "Unknown init error");
      setIsFirebaseActive(false);
      setRecipes(getLocalRecipes());
    }
  }, [user, authLoading]);

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'userId'>) => {
    const newRecipe: Recipe = { ...recipe, id: uuidv4(), userId: user?.uid };
    if (user && isFirebaseActive) {
      try {
        const docRef = doc(collection(db, RECIPES_COLLECTION), newRecipe.id);
        await setDoc(docRef, newRecipe);
        return newRecipe;
      } catch (err) {
        console.error("Firebase save failed:", err);
      }
    }
    saveLocalRecipes([...recipes, newRecipe]);
    return newRecipe;
  };

  const updateRecipe = async (recipe: Recipe) => {
    if (user && isFirebaseActive) {
      try {
        const docRef = doc(db, RECIPES_COLLECTION, recipe.id);
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
    if (user && isFirebaseActive) {
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

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGuestMode(false);
    }
  };

  return (
    <StoreContext.Provider value={{
      recipes, addRecipe, updateRecipe, deleteRecipe, toggleFavorite, isFirebaseActive,
      inStockItems, addInStockItem, removeInStockItem,
      customGroceryItems, addCustomGroceryItem, toggleCustomGroceryItem,
      selectedRecipe, setSelectedRecipe, firebaseError,
      user, authLoading, logout,
      isGuestMode, setIsGuestMode
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