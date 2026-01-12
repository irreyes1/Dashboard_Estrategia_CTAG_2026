import React, { useState } from 'react';
import { Objective, Status, Priority, ActionItem, Comment } from '../types';
import { X, Save, Plus, Trash2, Send, Calendar, User, AlertTriangle } from 'lucide-react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../constants';

interface ObjectiveDetailProps {
  objective: Objective;
  onClose: () => void;
  onUpdate: (updated: Objective) => void;
}

export const ObjectiveDetail: React.FC<ObjectiveDetailProps> = ({ objective, onClose, onUpdate }) => {
  const [localObj, setLocalObj] = useState<Objective>({ ...objective });
  const [newAction, setNewAction] = useState('');
  const [newComment, setNewComment] = useState('');

  const handleSave = () => {
    onUpdate(localObj);
    onClose();
  };

  const addAction = () => {
    if (!newAction.trim()) return;
    const item: ActionItem = {
      id: Date.now().toString(),
      text: newAction,
      isCompleted: false
    };
    setLocalObj(prev => ({ ...prev, actions: [...prev.actions, item] }));
    setNewAction('');
  };

  const toggleAction = (id: string) => {
    setLocalObj(prev => ({
      ...prev,
      actions: prev.actions.map(a => a.id === id ? { ...a, isCompleted: !a.isCompleted } : a)
    }));
  };

  const removeAction = (id: string) => {
    setLocalObj(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a.id !== id)
    }));
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Usuario', // In a real app, this would be the logged in user
      text: newComment,
      timestamp: new Date().toLocaleString()
    };
    setLocalObj(prev => ({ ...prev, comments: [...prev.comments, comment] }));
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 shrink-0">
          <div>
            <span className="inline-block px-2 py-1 text-xs font-semibold tracking-wide text-gray-500 uppercase bg-gray-200 rounded-md mb-2">
              {localObj.category}
            </span>
            <h2 className="text-2xl font-bold text-gray-800 leading-tight">{localObj.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Metadata Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
              <select 
                value={localObj.status}
                onChange={(e) => setLocalObj({...localObj, status: e.target.value as Status})}
                className={`w-full p-2 rounded-lg border-none text-sm font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer ${STATUS_COLORS[localObj.status]}`}
              >
                <option value="Pending">Pendiente</option>
                <option value="In Progress">En Proceso</option>
                <option value="Completed">Completado</option>
                <option value="Delayed">Retrasado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Prioridad</label>
              <select 
                value={localObj.priority}
                onChange={(e) => setLocalObj({...localObj, priority: e.target.value as Priority})}
                className={`w-full p-2 rounded-lg border-none text-sm font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer ${PRIORITY_COLORS[localObj.priority]}`}
              >
                <option value="Low">Baja</option>
                <option value="Medium">Media</option>
                <option value="High">Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Fecha Límite
              </label>
              <input 
                type="date" 
                value={localObj.deadline}
                onChange={(e) => setLocalObj({...localObj, deadline: e.target.value})}
                className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Responsable
              </label>
              <input 
                type="text" 
                value={localObj.owner}
                onChange={(e) => setLocalObj({...localObj, owner: e.target.value})}
                className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Descripción</h3>
            <textarea 
              value={localObj.description}
              onChange={(e) => setLocalObj({...localObj, description: e.target.value})}
              className="w-full p-3 rounded-lg border border-gray-200 text-gray-700 focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
            />
          </div>

          {/* Action Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Plan de Acción</h3>
              <span className="text-xs text-gray-500">
                {localObj.actions.filter(a => a.isCompleted).length}/{localObj.actions.length} completado
              </span>
            </div>
            
            <div className="space-y-2 mb-3">
              {localObj.actions.map(action => (
                <div key={action.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group">
                  <input 
                    type="checkbox" 
                    checked={action.isCompleted}
                    onChange={() => toggleAction(action.id)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                  />
                  <span className={`flex-1 text-sm ${action.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {action.text}
                  </span>
                  <button 
                    onClick={() => removeAction(action.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {localObj.actions.length === 0 && (
                <p className="text-sm text-gray-400 italic py-2">No hay acciones definidas.</p>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAction()}
                placeholder="Añadir nueva acción..."
                className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={addAction}
                disabled={!newAction.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Comentarios y Seguimiento</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-4 mb-4 max-h-60 overflow-y-auto">
              {localObj.comments.map(comment => (
                <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-xs text-indigo-900">{comment.author}</span>
                    <span className="text-xs text-gray-400">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
              ))}
              {localObj.comments.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4">Sin comentarios registrados.</p>
              )}
            </div>
            
            <div className="relative">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full p-3 pr-12 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm min-h-[80px]"
              />
              <button 
                onClick={addComment}
                disabled={!newComment.trim()}
                className="absolute bottom-3 right-3 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};