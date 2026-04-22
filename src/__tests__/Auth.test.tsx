/**
 * @file __tests__/Auth.test.tsx
 * @description Unit tests for the authentication UI ensuring vital buttons render.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Auth } from '../components/Auth';
import '@testing-library/jest-dom';

// Securely mock Firebase to prevent network requests during Unit tests
vi.mock('../lib/firebase', () => ({
  auth: {},
  db: {}
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn()
}));

describe('Authentication UI Component', () => {
  it('renders Google Auth button and essential login form fields', () => {
    render(<Auth />);

    // Explicitly check for UI components rendering cleanly
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('toggles organically between Login and Sign Up mode text when clicked', () => {
    render(<Auth />);

    // Defaults to Log In context
    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();

    // Fire event click switching to Sign Up
    const toggleButton = screen.getByText('Sign Up');
    fireEvent.click(toggleButton);

    // Should immediately morph text to "Get Started" Context
    expect(screen.getByRole('heading', { name: /Get Started/i })).toBeInTheDocument();
  });
});
