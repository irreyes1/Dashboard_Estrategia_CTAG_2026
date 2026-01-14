
import React, { useState } from 'react';
import { Objective, Status, Priority, ActionItem, Comment } from '../types';
import { X, Save, Plus, Trash2, Send, Calendar, User, MessageSquare, ChevronDown, ChevronUp, BarChart, Edit2, Check } from 'lucide-react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../constants';

interface ObjectiveDetailProps {
  objective: Objective;
  onClose: () => void;
  onUpdate: (updated: Objective) => void;
}

export const ObjectiveDetail: React.FC<ObjectiveDetailProps> = ({ objective, onClose, onUpdate }) => {
  const [localObj, setLocalObj] = useState<Objective>({ ...objective });
  // New Action Form States
  const [newActionText, setNewActionText] = useState('');
  const [newActionDate, setNewActionDate] = useState('');
  const [newActionComment, setNewActionComment] = useState('');
  const [newActionDiff, setNewActionDiff] = useState<number>(5);
  const [newActionImp, setNewActionImp] = useState<number>(5);
  const [newActionOwner, setNewActionOwner] = useState(objective.owner);
  
  const [activeActionCommentId, setActiveActionCommentId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  
  // Comment Editing State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const handleSave = () => {
    onUpdate(localObj);
    onClose();
  };

  const addAction = () => {
    if (!newActionText.trim()) return;
    
    const initialComments: Comment[] = newActionComment.trim() ? [{
      id: Date.now().toString() + 'c',
      author: 'Usuario',
      text: newActionComment,
      timestamp: new Date().toLocaleString()
    }] : [];

    const item: ActionItem = {
      id: Date.now().toString(),
      text: newActionText,
      isCompleted: false,
      deadline: newActionDate,
      comments: initialComments,
      difficulty: newActionDiff,
      impact: newActionImp,
      owner: newActionOwner
    };
    
    setLocalObj(prev => ({ ...prev, actions: [...prev.actions, item] }));
    
    // Reset form
    setNewActionText('');
    setNewActionDate('');
    setNewActionComment('');
    setNewActionDiff(5);
    setNewActionImp(5);
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

  const updateActionOwner = (id: string, newOwner: string) => {
    setLocalObj(prev => ({
      ...prev,
      actions: prev.actions.map(a => a.id === id ? { ...a, owner: newOwner } : a)
    }));
  };

  const addCommentToAction = (actionId: string) => {
    if (!newCommentText.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Usuario',
      text: newCommentText,
      timestamp: new Date().toLocaleString()
    };

    setLocalObj(prev => ({
      ...prev,
      actions: prev.actions.map(a => {
        if (a.id === actionId) {
          return { ...a, comments: [...a.comments, comment] };
        }
        return a;
      })
    }));
    setNewCommentText('');
  };

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  const saveEditComment = (actionId: string, commentId: string) => {
    if (!editCommentText.trim()) return;

    setLocalObj(prev => ({
      ...prev,
      actions: prev.actions.map(a => {
        if (a.id === actionId) {
          return {
            ...a,
            comments: a.comments.map(c => c.id === commentId ? { ...c, text: editCommentText } : c)
          };
        }
        return a;
      })
    }));
    setEditingCommentId(null);
  };

  const deleteComment = (actionId: string, commentId: string) => {
    if (!window.confirm('¿Eliminar comentario?')) return;
    setLocalObj(prev => ({
        ...prev,
        actions: prev.actions.map(a => {
            if (a.id === actionId) {
                return {
                    ...a,
                    comments: a.comments.filter(c => c.id !== commentId)
                };
            }
            return a;
        })
    }));
  };

  const OWNER_OPTIONS = ["JD", "Presidente", "Vicepresidente", "Tesorero", "Secretario", "Gerencia", "Área Social", "Área Deportiva", "Área Financiera", "Área RRHH"];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
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
                <User className="w-3 h-3" /> Resp. Objetivo
              </label>
              <select 
                value={localObj.owner}
                onChange={(e) => setLocalObj({...localObj, owner: e.target.value})}
                className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                {OWNER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
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

          {/* Action Items & Comments */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Plan de Acción y Comentarios</h3>
              <span className="text-xs text-gray-500">
                {localObj.actions.filter(a => a.isCompleted).length}/{localObj.actions.length} completado
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              {localObj.actions.map(action => (
                <div key={action.id} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    {/* Action Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 hover:bg-gray-50">
                        <input 
                            type="checkbox" 
                            checked={action.isCompleted}
                            onChange={() => toggleAction(action.id)}
                            className="w-5 h-5 mt-1 sm:mt-0 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 shrink-0"
                        />
                        <div className="flex-1 min-w-0 w-full">
                            <span className={`block text-sm font-medium ${action.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                {action.text}
                            </span>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                                <select 
                                    value={action.owner || localObj.owner}
                                    onChange={(e) => updateActionOwner(action.id, e.target.value)}
                                    className="bg-transparent border-none p-0 text-[10px] font-bold text-indigo-600 focus:ring-0 cursor-pointer"
                                >
                                    {OWNER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <span className="text-gray-300">|</span>
                                {action.deadline ? (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3"/> {action.deadline}
                                    </span>
                                ) : <span className="italic text-gray-400">Sin fecha</span>}
                                <span className="text-gray-300">|</span>
                                <span className="flex items-center gap-1" title="Dificultad (0-10)">
                                    <BarChart className="w-3 h-3 text-blue-400"/> Dif: {action.difficulty || 5}
                                </span>
                                <span className="flex items-center gap-1" title="Impacto (0-10)">
                                    <BarChart className="w-3 h-3 text-rose-400"/> Imp: {action.impact || 5}
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                             <button 
                                onClick={() => setActiveActionCommentId(activeActionCommentId === action.id ? null : action.id)}
                                className={`p-2 rounded-full transition-colors flex items-center gap-1 ${activeActionCommentId === action.id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-400'}`}
                                title="Comentarios"
                             >
                                 <MessageSquare className="w-4 h-4" />
                                 {action.comments.length > 0 && <span className="text-xs font-bold">{action.comments.length}</span>}
                             </button>
                             <button 
                                onClick={() => removeAction(action.id)}
                                className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                             >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Action Comments Section */}
                    {activeActionCommentId === action.id && (
                        <div className="bg-gray-50 p-4 border-t border-gray-100 animate-fade-in">
                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Historial de la acción</h4>
                             <div className="space-y-3 mb-3 max-h-40 overflow-y-auto custom-scrollbar">
                                {action.comments.length > 0 ? action.comments.map(comment => (
                                    <div key={comment.id} className="bg-white p-3 rounded shadow-sm border border-gray-100 group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-xs text-indigo-900">{comment.author}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-gray-400">{comment.timestamp}</span>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <button onClick={() => startEditComment(comment)} className="text-gray-400 hover:text-blue-600"><Edit2 className="w-3 h-3"/></button>
                                                    <button onClick={() => deleteComment(action.id, comment.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3"/></button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {editingCommentId === comment.id ? (
                                            <div className="flex gap-2 mt-1">
                                                <input 
                                                    type="text" 
                                                    value={editCommentText}
                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                    className="flex-1 p-1 text-xs border border-blue-300 rounded focus:outline-none"
                                                    autoFocus
                                                />
                                                <button onClick={() => saveEditComment(action.id, comment.id)} className="text-green-600"><Check className="w-4 h-4"/></button>
                                                <button onClick={() => setEditingCommentId(null)} className="text-gray-400"><X className="w-4 h-4"/></button>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-700 leading-relaxed">{comment.text}</p>
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-xs text-gray-400 italic">No hay comentarios aún.</p>
                                )}
                             </div>
                             
                             <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="Añadir nota de seguimiento..."
                                    className="flex-1 p-2 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-indigo-500"
                                    onKeyDown={(e) => e.key === 'Enter' && addCommentToAction(action.id)}
                                />
                                <button 
                                    onClick={() => addCommentToAction(action.id)}
                                    disabled={!newCommentText.trim()}
                                    className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    <Send className="w-3 h-3" />
                                </button>
                             </div>
                        </div>
                    )}
                </div>
              ))}
              {localObj.actions.length === 0 && (
                <p className="text-sm text-gray-400 italic py-2">No hay planes de acción definidos.</p>
              )}
            </div>

            {/* Add New Action Form (Expanded) */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">Nueva Acción:</p>
                
                <input 
                    type="text" 
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    placeholder="Descripción de la tarea..."
                    className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-400 mb-1">Fecha Prevista</label>
                        <input 
                            type="date" 
                            value={newActionDate}
                            onChange={(e) => setNewActionDate(e.target.value)}
                            className="p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 w-full"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-400 mb-1">Responsable</label>
                        <select 
                            value={newActionOwner}
                            onChange={(e) => setNewActionOwner(e.target.value)}
                            className="p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 w-full bg-white"
                        >
                            {OWNER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-400 mb-1">Comentario Inicial</label>
                        <input 
                            type="text" 
                            value={newActionComment}
                            onChange={(e) => setNewActionComment(e.target.value)}
                            placeholder="Nota opcional..."
                            className="p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-indigo-500 w-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                         <div className="flex justify-between text-[10px] mb-1">
                             <span className="text-blue-600 font-bold">Dificultad</span>
                             <span className="font-bold text-gray-600">{newActionDiff}</span>
                         </div>
                         <input 
                            type="range" min="0" max="10" 
                            value={newActionDiff} 
                            onChange={(e) => setNewActionDiff(parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            title="0 = Fácil, 10 = Muy Difícil"
                        />
                        <div className="flex justify-between text-[8px] text-gray-400">
                             <span>Fácil</span><span>Difícil</span>
                        </div>
                    </div>
                    <div>
                         <div className="flex justify-between text-[10px] mb-1">
                             <span className="text-rose-600 font-bold">Impacto</span>
                             <span className="font-bold text-gray-600">{newActionImp}</span>
                         </div>
                         <input 
                            type="range" min="0" max="10" 
                            value={newActionImp} 
                            onChange={(e) => setNewActionImp(parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                            title="0 = Sin Impacto, 10 = Alto Impacto"
                        />
                        <div className="flex justify-between text-[8px] text-gray-400">
                             <span>Bajo</span><span>Alto</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={addAction}
                    disabled={!newActionText.trim()}
                    className="w-full p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm transition-colors mt-2"
                >
                    <Plus className="w-4 h-4" /> Añadir Acción
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
