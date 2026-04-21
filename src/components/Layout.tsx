/**
 * @file components/Layout.tsx
 * @description Main application shell providing the global structure, navigation,
 * and a visually striking dark-mode backdrop with subtle glassmorphism headers.
 */

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ChefHat, CalendarDays, ShoppingCart, Heart, Search } from 'lucide-react';
import { useStore } from '../lib/store';

export const Layout: React.FC = () => {
  const { isFirebaseActive } = useStore();

  const navItems = [
    { to: '/', icon: <Search size={20} />, label: 'Discover' },
    { to: '/favorites', icon: <Heart size={20} />, label: 'Favorites' },
    { to: '/calendar', icon: <CalendarDays size={20} />, label: 'Calendar' },
    { to: '/groceries', icon: <ShoppingCart size={20} />, label: 'Groceries' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Navigation Bar with Glassmorphism */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-xl shadow-lg shadow-accent/20">
            <ChefHat className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-textSecondary">
            Gemini Kitchen
          </h1>
        </div>
        
        {/* Status Indicator for Firebase. Helpful for debugging without breaking UX */}
        <div className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isFirebaseActive ? 'bg-secondary' : 'bg-orange-500'}`} />
          <span className="hidden sm:inline">
            {isFirebaseActive ? 'Cloud Sync Active' : 'Local Storage Mode'}
          </span>
        </div>
      </header>

      {/* Main Layout containing Side Nav and Page Content */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        
        {/* Sidebar Navigation */}
        <aside className="w-20 lg:w-64 border-r border-white/10 hidden md:flex flex-col py-8 px-4 gap-2">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive 
                  ? 'bg-primary/20 text-primary scale-105 border border-primary/30 shadow-lg' 
                  : 'text-textSecondary hover:bg-surface hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          ))}
        </aside>

        {/* Dynamic Page Content Outlet */}
        <main className="flex-1 w-full relative">
          {/* Subtle Background Glow Elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="p-6 md:p-8 lg:p-12 relative z-10 w-full h-full overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible only on small screens) */}
      <nav className="md:hidden sticky bottom-0 z-50 glass-panel border-t border-white/10 flex justify-around p-4 pb-safe justify-items-center">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `p-3 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-primary/20 text-primary' : 'text-textSecondary hover:text-white'
              }`
            }
          >
            {item.icon}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
