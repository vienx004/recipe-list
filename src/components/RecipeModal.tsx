/**
 * @file components/RecipeModal.tsx
 * @description Global popup component for displaying and editing recipe details.
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, CalendarDays, Heart, HeartOff, Edit3, Save, Trash2, Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import type { Recipe, Ingredient } from '../types';

export const RecipeModal: React.FC = () => {
  const { selectedRecipe, setSelectedRecipe, updateRecipe } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Recipe | null>(null);

  // Sync state cleanly when the modal opens
  useEffect(() => {
    if (selectedRecipe) {
      setEditedRecipe(JSON.parse(JSON.stringify(selectedRecipe)));
      setIsEditing(false);
    }
  }, [selectedRecipe]);

  if (!selectedRecipe || !editedRecipe) return null;

  const handleSave = async () => {
    if (editedRecipe) {
      await updateRecipe(editedRecipe);
      setSelectedRecipe(editedRecipe);
      setIsEditing(false);
    }
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = { ...editedRecipe };
    updated.ingredients[index] = { ...updated.ingredients[index], [field]: value };
    setEditedRecipe(updated);
  };

  const removeIngredient = (index: number) => {
    const updated = { ...editedRecipe };
    updated.ingredients.splice(index, 1);
    setEditedRecipe(updated);
  };

  const addIngredient = () => {
    const updated = { ...editedRecipe };
    updated.ingredients.push({ name: '', amount: 1, unit: 'whole' });
    setEditedRecipe(updated);
  };

  const handleInstructionChange = (index: number, value: string) => {
    const updated = { ...editedRecipe };
    updated.instructions[index] = value;
    setEditedRecipe(updated);
  };

  const removeInstruction = (index: number) => {
    const updated = { ...editedRecipe };
    updated.instructions.splice(index, 1);
    setEditedRecipe(updated);
  };

  const addInstruction = () => {
    const updated = { ...editedRecipe };
    updated.instructions.push('');
    setEditedRecipe(updated);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => {
          if (!isEditing) setSelectedRecipe(null);
        }}
      />

      {/* Modal Dialog */}
      <div className={`relative glass-panel w-full ${isEditing ? 'max-w-5xl' : 'max-w-4xl'} max-h-[90vh] overflow-y-auto rounded-3xl flex flex-col transform animate-in zoom-in-95 duration-500 shadow-2xl bg-surface transition-all`}>
        
        {/* Top Floating Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full text-secondary hover:text-accent transition-colors shadow-sm border border-secondary/20"
              title="Edit Recipe"
            >
              <Edit3 size={20} />
            </button>
          )}
          <button
            onClick={() => {
              if (isEditing) {
                // Discard edits
                setEditedRecipe(JSON.parse(JSON.stringify(selectedRecipe)));
                setIsEditing(false);
              } else {
                setSelectedRecipe(null);
              }
            }}
            className="p-2 bg-background/50 hover:bg-background/80 backdrop-blur-sm rounded-full text-textPrimary hover:text-red-400 transition-colors shadow-sm border border-secondary/20"
            title={isEditing ? "Discard Changes" : "Close"}
          >
            <X size={24} />
          </button>
        </div>

        {/* Top Split Section */}
        <div className="flex flex-col md:flex-row w-full flex-1">
          {/* Image Box */}
          <div className="w-full md:w-2/5 h-64 md:h-auto relative shrink-0">
            <img
              src={editedRecipe.imageUrl}
              alt={editedRecipe.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-surface to-transparent" />
          </div>

          {/* Content Box */}
          <div className="w-full md:w-3/5 p-8 flex flex-col gap-6 relative z-10 bg-surface">
            
            {/* Header Block */}
            <div>
              <div className="flex items-center gap-3 text-textSecondary mb-2 font-medium">
                <Clock size={16} /> 
                {isEditing ? (
                  <input 
                    type="number"
                    value={editedRecipe.prepTimeMinutes || 0}
                    onChange={(e) => setEditedRecipe({...editedRecipe, prepTimeMinutes: parseInt(e.target.value) || 0})}
                    className="input-field !py-1 w-20 text-center"
                    min="0"
                  />
                ) : (
                  <span>{editedRecipe.prepTimeMinutes} mins</span>
                )}
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={editedRecipe.title}
                  onChange={(e) => setEditedRecipe({...editedRecipe, title: e.target.value})}
                  className="input-field text-2xl font-bold mb-3 w-full"
                  placeholder="Recipe Title"
                />
              ) : (
                <h3 className="text-3xl font-bold text-textPrimary mb-2 cursor-pointer hover:text-secondary transition-colors" onClick={() => setIsEditing(true)}>
                  {editedRecipe.title}
                </h3>
              )}

              {isEditing ? (
                <textarea
                  value={editedRecipe.description}
                  onChange={(e) => setEditedRecipe({...editedRecipe, description: e.target.value})}
                  className="input-field w-full text-sm min-h-[80px]"
                  placeholder="Description..."
                />
              ) : (
                <p className="text-textSecondary leading-relaxed">{editedRecipe.description}</p>
              )}
            </div>

            {/* Ingredients & Instructions Grid */}
            <div className={`grid grid-cols-1 ${isEditing ? '' : 'md:grid-cols-2'} gap-8`}>
              
              {/* INGREDIENTS */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-secondary">Ingredients</h4>
                  {isEditing && (
                    <button onClick={addIngredient} className="text-secondary hover:text-accent p-1">
                      <Plus size={16} />
                    </button>
                  )}
                </div>
                
                <ul className="space-y-2">
                  {editedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex flex-wrap sm:flex-nowrap gap-2 text-sm text-textSecondary bg-secondary/5 p-2 rounded-lg items-center group">
                      {isEditing ? (
                        <>
                          <input 
                            type="number" 
                            step="0.01"
                            value={ing.amount} 
                            onChange={(e) => handleIngredientChange(i, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-16 shrink-0 input-field !p-1 text-center"
                          />
                          <input 
                            type="text" 
                            value={ing.unit} 
                            onChange={(e) => handleIngredientChange(i, 'unit', e.target.value)}
                            className="w-20 shrink-0 input-field !p-1 text-center"
                            placeholder="Unit"
                          />
                          <input 
                            type="text" 
                            value={ing.name} 
                            onChange={(e) => handleIngredientChange(i, 'name', e.target.value)}
                            className="w-full sm:w-auto sm:flex-1 input-field !p-1"
                            placeholder="Ingredient"
                          />
                          <button onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-500 p-1">
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-textPrimary">{ing.amount} {ing.unit}</span>
                          <span>{ing.name}</span>
                        </>
                      )}
                    </li>
                  ))}
                  {isEditing && editedRecipe.ingredients.length === 0 && (
                     <li className="text-sm text-textSecondary italic">No ingredients added.</li>
                  )}
                </ul>
              </div>

              {/* INSTRUCTIONS */}
              <div>
                 <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-accent">Instructions</h4>
                  {isEditing && (
                    <button onClick={addInstruction} className="text-accent hover:opacity-80 p-1">
                      <Plus size={16} />
                    </button>
                  )}
                </div>
                
                <ol className="list-decimal list-inside space-y-3 text-sm text-textSecondary">
                  {editedRecipe.instructions.map((step, i) => (
                    <li key={i} className="pl-2 group relative">
                      {isEditing ? (
                        <div className="flex gap-2 items-start mt-1">
                          <textarea 
                            value={step} 
                            onChange={(e) => handleInstructionChange(i, e.target.value)}
                            className="flex-1 input-field !py-1 text-sm min-h-[60px]"
                            placeholder={`Step ${i + 1}`}
                          />
                          <button onClick={() => removeInstruction(i)} className="text-red-400 hover:text-red-500 mt-2 p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <span>{step}</span>
                      )}
                    </li>
                  ))}
                  {isEditing && editedRecipe.instructions.length === 0 && (
                     <li className="text-sm text-textSecondary italic list-none">No steps added.</li>
                  )}
                </ol>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Full-Width Action Bar */}
        <div className="w-full p-6 border-t border-secondary/20 flex flex-col sm:flex-row items-center gap-6 justify-center bg-surface/50 rounded-b-3xl shrink-0">
          
          {isEditing ? (
            <>
               <button
                onClick={() => {
                  setEditedRecipe(JSON.parse(JSON.stringify(selectedRecipe)));
                  setIsEditing(false);
                }}
                className="btn-secondary min-w-[200px]"
               >
                 Cancel Changes
               </button>
               <button
                onClick={handleSave}
                className="btn-primary flex justify-center items-center gap-2 min-w-[200px]"
               >
                 <Save size={18} /> Save Edits
               </button>
            </>
          ) : (
            <>
              <button
                onClick={async () => {
                  const toggled = !selectedRecipe.isFavorite;
                  const updated = { ...selectedRecipe, isFavorite: toggled };
                  await updateRecipe(updated);
                  setSelectedRecipe(updated);
                }}
                className={`${selectedRecipe.isFavorite ? 'btn-secondary text-red-500 hover:text-red-500 hover:border-red-500/30' : 'btn-primary'} flex justify-center items-center gap-2 min-w-[200px] py-3 px-6`}
              >
                {selectedRecipe.isFavorite ? (
                  <>
                    <HeartOff size={18} /> Remove Favorite
                  </>
                ) : (
                  <>
                    <Heart size={18} /> Save to Favorites
                  </>
                )}
              </button>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-3 bg-background p-3 rounded-xl border border-secondary/20 min-w-[220px]">
                  <CalendarDays className="text-secondary shrink-0" size={20} />
                  <label htmlFor="schedule-date" className="text-sm font-semibold text-textPrimary shrink-0">
                    Add to Date:
                  </label>
                  <input
                    id="schedule-date"
                    type="date"
                    value={''}
                    onChange={async (e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const newDate = new Date(`${val}T12:00:00Z`).toISOString();
                      const existingDates = selectedRecipe.scheduledDates || [];
                      
                      // Only add if not already scheduled for this exact date
                      if (!existingDates.includes(newDate)) {
                        const updated = { ...selectedRecipe, scheduledDates: [...existingDates, newDate], isFavorite: true };
                        await updateRecipe(updated);
                        setSelectedRecipe(updated);
                      }
                    }}
                    className="input-field !py-1.5 !px-3 text-sm flex-1 cursor-pointer hover:border-accent"
                  />
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
