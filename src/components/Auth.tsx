/**
 * @file components/Auth.tsx
 * @description Provides a beautiful full-screen authentication gate utilizing Firebase Auth.
 * Handles both user Sign Up and dynamic Log In without routing redirects.
 */

import React, { useState } from 'react';
import { ChefHat, Loader2, Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
//import { useStore } from '../lib/store';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //const { setIsGuestMode } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 glass-panel p-8 sm:p-10 rounded-3xl border border-secondary/20 shadow-2xl animate-in zoom-in-95 fade-in duration-500">

        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-secondary to-accent p-4 rounded-2xl shadow-xl shadow-accent/20 mb-4">
            <ChefHat className="text-textPrimary" size={40} />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-textPrimary to-textSecondary text-center">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-textSecondary text-center mt-2 font-medium">
            {isLogin ? 'Sign in to access your personal cookbooks and meal plans.' : 'Create your secure profile.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-medium animate-in slide-in-from-top-2">
            Incorrect username or password.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-secondary/20 rounded-xl py-3 pl-10 pr-4 text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder="Password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-secondary/20 rounded-xl py-3 pl-10 pr-4 text-textPrimary placeholder:text-textSecondary/50 focus:outline-none focus:border-secondary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px bg-secondary/20 flex-1" />
          <span className="text-textSecondary text-sm font-medium uppercase tracking-wider">or</span>
          <div className="h-px bg-secondary/20 flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-surface border border-secondary/20 hover:bg-secondary/10 hover:border-secondary transition-colors py-3 rounded-xl flex items-center justify-center gap-3 text-textPrimary font-bold shadow-sm"
        >
          {/* Official minimal Google G-Logo SVG */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {/*}
        <button
          type="button"
          onClick={() => setIsGuestMode(true)}
          disabled={loading}
          className="w-full mt-4 bg-transparent border border-secondary/20 hover:bg-secondary/5 transition-colors py-3 rounded-xl flex items-center justify-center gap-3 text-textSecondary font-bold shadow-sm"
        >
          Try it as a Guest (Local Storage)
        </button> 
        */}

        <div className="mt-6 text-center text-sm font-medium text-textSecondary">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="text-secondary hover:text-accent font-bold transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};
