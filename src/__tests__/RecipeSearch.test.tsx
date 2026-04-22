/**
 * @file __tests__/RecipeSearch.test.tsx
 * @description Unit tests for the AI Search and Generation UI.
 * Verifies that typing and clicking calls the precise Gemini functions securely.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecipeSearch } from '../components/RecipeSearch';
import { useStore } from '../lib/store';
import { generateRecipe } from '../lib/gemini';
import '@testing-library/jest-dom';

// Mocks
vi.mock('../lib/store', () => ({
  useStore: vi.fn(),
}));

vi.mock('../lib/gemini', () => ({
  generateRecipe: vi.fn(),
  discoverRecipes: vi.fn()
}));

const mockAddRecipe = vi.fn();
const mockSetSelectedRecipe = vi.fn();

describe('RecipeSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue({
      recipes: [],
      addRecipe: mockAddRecipe,
      setSelectedRecipe: mockSetSelectedRecipe
    });
  });

  it('renders search bar prominently', () => {
    render(<RecipeSearch />);
    expect(screen.getByPlaceholderText(/Spicy Shrimp Tacos/i)).toBeInTheDocument();
  });

  it('generates a recipe directly when submitted', async () => {
    const mockGeneratedRecipe = {
      title: 'Spicy Tacos',
      description: 'Delicious tacos',
      ingredients: [],
      instructions: [],
      prepTimeMinutes: 15
    };

    (generateRecipe as any).mockResolvedValue(mockGeneratedRecipe);
    mockAddRecipe.mockResolvedValue({ id: '123', ...mockGeneratedRecipe });

    render(<RecipeSearch />);

    const input = screen.getByPlaceholderText(/Spicy Shrimp Tacos/i);
    fireEvent.change(input, { target: { value: 'Spicy Tacos' } });

    const submitBtn = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // Must call the Gemini backend
      expect(generateRecipe).toHaveBeenCalledWith('Spicy Tacos');
      // Must subsequently add to the local global store
      expect(mockAddRecipe).toHaveBeenCalledWith(mockGeneratedRecipe);
    });

    // And MUST immediately surface that new recipe onto the Display preview!
    expect(await screen.findByRole('heading', { name: 'Spicy Tacos' })).toBeInTheDocument();
  });
});
