/**
 * @file __tests__/RecipeActions.test.tsx
 * @description Validates complex core interactions: saving a recipe, adding to a calendar timeline.
 * Targets the globally mounted RecipeModal where execution actions thrive.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeModal } from '../components/RecipeModal';
import { useStore } from '../lib/store';
import '@testing-library/jest-dom';

vi.mock('../lib/store', () => ({
  useStore: vi.fn(),
}));

const mockUpdateRecipe = vi.fn();
const mockSetSelectedRecipe = vi.fn();

const fakeRecipe = {
  id: 'recipe-001',
  title: 'Test Pasta',
  description: 'Boil it',
  ingredients: [{ name: 'noodles', amount: 1, unit: 'box' }],
  instructions: ['Boil water'],
  isFavorite: false,
  prepTimeMinutes: 10
};

describe('Recipe Action Controls (Favorites & Calendar)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue({
      selectedRecipe: fakeRecipe,
      setSelectedRecipe: mockSetSelectedRecipe,
      updateRecipe: mockUpdateRecipe
    });
  });

  it('toggles the Favorite status and persists it via updateRecipe', async () => {
    render(<RecipeModal />);

    // Validate normal modal render
    expect(screen.getByText('Test Pasta')).toBeInTheDocument();

    // Click Save to Favorites
    const favButton = screen.getByText('Save to Favorites');
    expect(favButton).toBeInTheDocument();
    
    fireEvent.click(favButton);

    await waitFor(() => {
       // Should dispatch an update turning it into a favorite
       expect(mockUpdateRecipe).toHaveBeenCalledWith({
           ...fakeRecipe,
           isFavorite: true // The toggle executes payload change
       });
       // Resaturate modal hook manually
       expect(mockSetSelectedRecipe).toHaveBeenCalled();
    });
  });

  it('updates the scheduled calendar date explicitly', async () => {
    render(<RecipeModal />);

    // Find the date input field explicitly mapped under "Cook on"
    const dateInput = screen.getByLabelText('Cook on:');
    
    // Simulate picking May 20th 2026
    fireEvent.change(dateInput, { target: { value: '2026-05-20' } });

    await waitFor(() => {
       // updateRecipe should be slammed heavily with the exact ISO date layout securely formatted!
       expect(mockUpdateRecipe).toHaveBeenCalledWith(
          expect.objectContaining({
             scheduledDate: '2026-05-20T12:00:00.000Z',
             isFavorite: true // The architecture automatically favorites deliberately scheduled events
          })
       );
    });
  });
});
