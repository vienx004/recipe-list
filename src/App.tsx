/**
 * @file App.tsx
 * @description Root application component setting up routing and global state provider.
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { Layout } from './components/Layout';
import { RecipeSearch } from './components/RecipeSearch';
import { RecipeList } from './components/RecipeList';
import { CalendarView } from './components/CalendarView';
import { GroceryList } from './components/GroceryList';

import { InStock } from './components/InStock';

export const App: React.FC = () => {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<RecipeSearch />} />
            <Route path="favorites" element={<RecipeList />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="groceries" element={<GroceryList />} />
            <Route path="instock" element={<InStock />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;
