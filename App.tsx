
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ListTodo, Menu, Search, Filter, CheckCircle2, Circle, Plus, Send, Calendar, MessageSquare, ChevronDown, ChevronUp, User, Trash2, Lock, ArrowRight, ChevronRight, Minimize2, Maximize2, BarChart2, MousePointer2, Save, Upload, Download, Gavel, Zap, Hourglass, Users, Star, Users2, Megaphone, Trophy, Dumbbell, Wrench, Network, Banknote, Wallet, BarChart3, Laptop, CalendarDays, Clock, PenTool, ClipboardList, Edit2, Check, X, FileText, Video, MapPin, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, CartesianGrid, ReferenceLine, Label } from 'recharts';
import { INITIAL_OBJECTIVES, INITIAL_MEETINGS, CATEGORIES, STATUS_COLORS, PRIORITY_COLORS } from './constants';
import { Objective, ActionItem, Comment, Meeting, Document, MeetingType } from './types';
import { Dashboard } from './components/Dashboard';
import { ObjectiveDetail } from './components/ObjectiveDetail';

// ----------------------------------------------------------------------
// THEME CONFIGURATION
// ----------------------------------------------------------------------
const THEME = {
  primary: 'bg-[#e11d48]', 
  primaryHover: 'hover:bg-[#be123c]',
  textPrimary: 'text-[#e11d48]',
  sidebar: 'bg-[#171717]',
  sidebarActive: 'bg-[#e11d48]',
};

// Pastel Color Mapping for Categories
const CATEGORY_THEMES: Record<string, string> = {
  'Funcionamiento JD': 'bg-sky-50 border-sky-200 text-sky-900',
  'Área Social': 'bg-emerald-50 border-emerald-200 text-emerald-900',
  'Área Deportiva': 'bg-orange-50 border-orange-200 text-orange-900', 
  'Mantenimiento': 'bg-stone-100 border-stone-200 text-stone-700', 
  'Área RRHH': 'bg-purple-50 border-purple-200 text-purple-900',
  'Área Financiera': 'bg-yellow-50 border-yellow-200 text-yellow-900',
};

const ICON_MAP: Record<string, React.ElementType> = {
  'gavel': Gavel, 'zap': Zap, 'hourglass': Hourglass, 'users': Users,
  'star': Star, 'users-2': Users2, 'megaphone': Megaphone, 'trophy': Trophy,
  'dumbbell': Dumbbell, 'wrench': Wrench, 'network': Network, 'banknote': Banknote,
  'wallet': Wallet, 'bar-chart-3': BarChart3, 'laptop': Laptop, 'default': Circle
};

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

// FEEDBACK MODAL
interface FeedbackModalProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}
const FeedbackModal: React.FC<FeedbackModalProps> = ({ message, type, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center animate-fade-in-up">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {type === 'success' ? <CheckCircle2 className="w-6 h-6"/> : <AlertTriangle className="w-6 h-6"/>}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{type === 'success' ? 'Éxito' : 'Error'}</h3>
            <p className="text-gray-600 text-sm mb-6">{message}</p>
            <button onClick={onClose} className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                Cerrar
            </button>
        </div>
    </div>
);

// OBJECTIVE CARD (Updated with Inline Actions)
interface ObjectiveCardProps {
  objective: Objective;
  progress: number;
  onClick: () => void;
  onUpdate: (obj: Objective) => void;
  categoryColor: string;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, progress, onClick, onUpdate, categoryColor }) => {
  const Icon = ICON_MAP[objective.iconKey] || ICON_MAP['default'];
  const [expanded, setExpanded] = useState(false);
  const [newActionText, setNewActionText] = useState('');

  const handleAddAction = (e: React.FormEvent) => {
      e.stopPropagation();
      if(!newActionText.trim()) return;
      const newAction: ActionItem = {
          id: Date.now().toString(),
          text: newActionText,
          isCompleted: false,
          comments: [],
          difficulty: 5,
          impact: 5
      };
      onUpdate({...objective, actions: [...objective.actions, newAction]});
      setNewActionText('');
  }

  const toggleAction = (e: React.MouseEvent, actionId: string) => {
      e.stopPropagation();
      const updatedActions = objective.actions.map(a => a.id === actionId ? {...a, isCompleted: !a.isCompleted} : a);
      onUpdate({...objective, actions: updatedActions});
  }

  return (
    <div className="border-l-4 border-transparent hover:border-l-[#e11d48] transition-all duration-200 bg-white">
        <div className="p-4 cursor-pointer group hover:bg-gray-50" onClick={onClick}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${categoryColor} bg-opacity-50`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 text-sm md:text-base group-hover:text-[#e11d48] transition-colors">
                    {objective.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${STATUS_COLORS[objective.status]}`}>{objective.status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${PRIORITY_COLORS[objective.priority]}`}>{objective.priority}</span>
                    </div>
                </div>
                </div>
                <div className="text-right hidden sm:block">
                    <span className="text-xs text-gray-400 font-medium flex items-center justify-end gap-1 mb-1"><Calendar className="w-3 h-3"/> {objective.deadline}</span>
                    <span className="text-xs text-gray-500 flex items-center justify-end gap-1"><User className="w-3 h-3"/> {objective.owner}</span>
                </div>
            </div>
            
            <p className="text-sm text-gray-500 line-clamp-2 pl-[52px] mb-3">{objective.description}</p>

            <div className="pl-[52px] flex items-center gap-4">
                <div className="flex-1">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : progress > 50 ? 'bg-blue-500' : 'bg-orange-400'}`} style={{ width: `${progress}%` }} />
                    </div>
                </div>
                <div className="flex gap-3 text-[10px] text-gray-400 font-medium items-center">
                    <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-gray-300" /><span>{objective.actions.filter(a => a.isCompleted).length}/{objective.actions.length}</span></div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                    </button>
                </div>
            </div>
        </div>

        {/* Inline Actions Manager */}
        {expanded && (
            <div className="pl-[68px] pr-4 pb-4 bg-gray-50/50 border-t border-gray-100 animate-fade-in">
                <div className="space-y-2 mt-2">
                    {objective.actions.map(action => (
                        <div key={action.id} className="flex items-center gap-2 text-sm group">
                            <input 
                                type="checkbox" 
                                checked={action.isCompleted} 
                                onChange={(e) => toggleAction(e, action.id)}
                                className="w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500 cursor-pointer"
                            />
                            <span className={`flex-1 ${action.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{action.text}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex gap-2">
                    <input 
                        type="text" 
                        value={newActionText}
                        onChange={(e) => setNewActionText(e.target.value)}
                        placeholder="Añadir nueva acción rápida..."
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-rose-500 outline-none bg-white"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => { if(e.key === 'Enter') handleAddAction(e); }}
                    />
                    <button onClick={handleAddAction} className="p-1.5 bg-gray-900 text-white rounded hover:bg-gray-800"><Plus className="w-4 h-4"/></button>
                </div>
            </div>
        )}
    </div>
  );
};

// ----------------------------------------------------------------------
// MAIN APP COMPONENT
// ----------------------------------------------------------------------

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'objectives' | 'actions' | 'evaluation' | 'meetings' | 'documents'>('dashboard');
  
  // Data
  const [objectives, setObjectives] = useState<Objective[]>(() => {
    const saved = localStorage.getItem('ctag_objectives');
    return saved ? JSON.parse(saved) : INITIAL_OBJECTIVES;
  });
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('ctag_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('ctag_documents');
    return saved ? JSON.parse(saved) : [];
  });

  // UI States
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CATEGORIES.forEach(cat => initial[cat] = true);
    return initial;
  });
  const [feedback, setFeedback] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('ctag_objectives', JSON.stringify(objectives));
      localStorage.setItem('ctag_meetings', JSON.stringify(meetings));
      localStorage.setItem('ctag_documents', JSON.stringify(documents));
    } catch (e) {
      console.error("Storage quota exceeded", e);
      setFeedback({msg: "Espacio local lleno. Algunos cambios no se guardaron.", type: 'error'});
    }
  }, [objectives, meetings, documents]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'solojunta' && password === 'wishlist2026') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Credenciales incorrectas');
    }
  };

  const handleUpdateObjective = (updated: Objective) => {
    setObjectives(prev => prev.map(obj => obj.id === updated.id ? updated : obj));
    if (selectedObjective && selectedObjective.id === updated.id) {
      setSelectedObjective(updated);
    }
  };

  const handleUpdateMeeting = (updated: Meeting) => {
    setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleExport = () => {
    try {
        const data = { objectives, meetings, documents };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `plan_estrategico_ctag_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setFeedback({msg: "Archivo generado. Revisa tu carpeta de descargas.", type: 'success'});
    } catch(e) {
        setFeedback({msg: "Error al exportar los datos.", type: 'error'});
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.objectives && Array.isArray(parsed.objectives)) {
            setObjectives(parsed.objectives);
            if (parsed.meetings) setMeetings(parsed.meetings);
            if (parsed.documents) setDocuments(parsed.documents);
            setFeedback({msg: "Datos importados correctamente.", type: 'success'});
        } else {
            setFeedback({msg: "Formato de archivo inválido.", type: 'error'});
        }
      } catch (err) {
        setFeedback({msg: "Error al leer el archivo.", type: 'error'});
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredObjectives = objectives.filter(obj => {
    const matchesSearch = obj.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          obj.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || obj.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getProgress = (obj: Objective) => {
    if (obj.actions.length > 0) {
      const completed = obj.actions.filter(a => a.isCompleted).length;
      return Math.round((completed / obj.actions.length) * 100);
    }
    return obj.progress; 
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className={`${THEME.sidebar} p-8 text-center relative overflow-hidden`}>
             <div className={`w-16 h-16 ${THEME.primary} rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg ring-4 ring-white/10`}>
              <span className="font-bold text-white text-2xl tracking-tighter">AG</span>
            </div>
            <h1 className="text-white text-xl font-bold tracking-wide">Club de Tenis Andrés Gimeno</h1>
            <p className="text-gray-400 text-sm mt-2">Plan Operativo 2026 • Junta Directiva</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e11d48] focus:bg-white transition-all outline-none" placeholder="Usuario" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e11d48] focus:bg-white transition-all outline-none" placeholder="••••••••" />
                </div>
              </div>
              {authError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2 border border-red-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>{authError}
                </div>
              )}
              <button type="submit" className={`w-full ${THEME.primary} ${THEME.primaryHover} text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-rose-500/30`}>
                Acceder <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f5f5f4] text-gray-800 font-sans overflow-hidden">
        {feedback && <FeedbackModal message={feedback.msg} type={feedback.type} onClose={() => setFeedback(null)} />}

      <aside className={`fixed inset-y-0 left-0 z-20 w-64 ${THEME.sidebar} text-white transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 shadow-xl flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-b border-neutral-800">
          <div className={`w-9 h-9 ${THEME.primary} rounded-md flex items-center justify-center shadow-lg shadow-rose-900/50 shrink-0`}>
            <span className="font-bold text-white tracking-tighter">AG</span>
          </div>
          <div>
            <h1 className="font-bold text-xs tracking-tight text-gray-100 leading-tight">Seguimiento de Plan<br/>Operativo 2026 CTAG</h1>
          </div>
        </div>
        
        <nav className="p-4 space-y-2 mt-4 flex-1">
          {['dashboard', 'objectives', 'actions', 'evaluation', 'meetings', 'documents'].map(tab => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab as any); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab ? `${THEME.sidebarActive} text-white shadow-lg shadow-rose-900/20` : 'text-gray-400 hover:bg-neutral-800 hover:text-white'}`}
              >
                {tab === 'dashboard' && <LayoutDashboard className="w-5 h-5" />}
                {tab === 'objectives' && <ListTodo className="w-5 h-5" />}
                {tab === 'actions' && <ClipboardList className="w-5 h-5" />}
                {tab === 'evaluation' && <BarChart2 className="w-5 h-5" />}
                {tab === 'meetings' && <CalendarDays className="w-5 h-5" />}
                {tab === 'documents' && <FileText className="w-5 h-5" />}
                <span className="capitalize">{tab === 'dashboard' ? 'Panel de Control' : tab === 'evaluation' ? 'Matriz Prioridades' : tab === 'meetings' ? 'Reuniones' : tab === 'documents' ? 'Documentación' : tab === 'objectives' ? 'Objetivos' : 'Acciones'}</span>
              </button>
          ))}

          <div className="pt-6 mt-6 border-t border-neutral-800">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase mb-2">Datos</p>
            <button onClick={handleExport} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">
                <Download className="w-4 h-4" /> Exportar Copia
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">
                <Upload className="w-4 h-4" /> Importar Copia
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
          </div>
        </nav>
        
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
          <button onClick={() => setIsAuthenticated(false)} className="w-full text-xs text-gray-400 hover:text-white transition-colors text-center pb-2 flex items-center justify-center gap-2">
             <Lock className="w-3 h-3"/> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className={`h-1.5 w-full ${THEME.primary}`}></div>
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div className={`w-8 h-8 ${THEME.primary} rounded-md flex items-center justify-center`}><span className="font-bold text-white text-xs">AG</span></div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-10 custom-scrollbar">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {activeTab === 'dashboard' ? 'Visión General' : 
                 activeTab === 'objectives' ? 'Listado de Objetivos' : 
                 activeTab === 'actions' ? 'Listado Global de Acciones' :
                 activeTab === 'evaluation' ? 'Matriz de Prioridades' :
                 activeTab === 'meetings' ? 'Gestión de Reuniones' :
                 'Documentación'}
              </h2>
            </div>
            {activeTab === 'objectives' && (
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm w-full focus:ring-2 focus:ring-[#e11d48] outline-none shadow-sm" />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="pl-9 pr-8 py-2.5 rounded-lg border border-gray-300 text-sm w-full appearance-none bg-white focus:ring-2 focus:ring-[#e11d48] outline-none cursor-pointer shadow-sm">
                    <option value="All">Todos los Bloques</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {activeTab === 'dashboard' ? (
            <Dashboard objectives={objectives} />
          ) : activeTab === 'evaluation' ? (
            <EvaluationView objectives={objectives} onUpdateObjective={handleUpdateObjective} />
          ) : activeTab === 'meetings' ? (
            <MeetingsView meetings={meetings} setMeetings={setMeetings} onUpdateMeeting={handleUpdateMeeting} />
          ) : activeTab === 'actions' ? (
            <ActionsView objectives={objectives} onUpdateObjective={handleUpdateObjective} />
          ) : activeTab === 'documents' ? (
             <DocumentsView documents={documents} setDocuments={setDocuments} />
          ) : (
            <div className="space-y-6 animate-fade-in pb-12">
              {filterCategory === 'All' ? CATEGORIES.map(category => {
                const catObjectives = filteredObjectives.filter(o => o.category === category);
                if (catObjectives.length === 0) return null;
                const themeClass = CATEGORY_THEMES[category] || 'bg-gray-50 border-gray-200 text-gray-800';
                const isCollapsed = collapsedCategories[category];

                return (
                  <div key={category} className={`rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${isCollapsed ? 'mb-2' : ''} ${themeClass.split(' ')[1]}`}>
                    <div onClick={() => toggleCategory(category)} className={`${themeClass} px-6 py-4 flex justify-between items-center cursor-pointer select-none transition-colors hover:brightness-95`}>
                      <div className="flex items-center gap-3">
                         <div className={`p-1 rounded-md bg-white/50 border border-white/20 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-90'}`}><ChevronRight className="w-4 h-4" /></div>
                         <h3 className="font-bold uppercase tracking-wide text-sm md:text-base">{category}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold px-3 py-1 bg-white/60 rounded-full shadow-sm backdrop-blur-sm">{catObjectives.length} objetivos</span>
                      </div>
                    </div>
                    {!isCollapsed && (
                        <div className="bg-white divide-y divide-gray-100">
                        {catObjectives.map(obj => (
                            <ObjectiveCard 
                            key={obj.id} 
                            objective={obj} 
                            progress={getProgress(obj)}
                            onClick={() => setSelectedObjective(obj)}
                            onUpdate={handleUpdateObjective}
                            categoryColor={themeClass}
                            />
                        ))}
                        </div>
                    )}
                  </div>
                );
              }) : (
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {filteredObjectives.length > 0 ? filteredObjectives.map(obj => (
                        <ObjectiveCard 
                          key={obj.id} 
                          objective={obj} 
                          progress={getProgress(obj)}
                          onClick={() => setSelectedObjective(obj)} 
                          onUpdate={handleUpdateObjective}
                          categoryColor={CATEGORY_THEMES[obj.category]}
                        />
                      )) : (
                        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                            <Search className="w-12 h-12 text-gray-200 mb-3"/>
                            <p>No se encontraron objetivos para esta búsqueda.</p>
                        </div>
                      )}
                    </div>
                  </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedObjective && (
        <ObjectiveDetail objective={selectedObjective} onClose={() => setSelectedObjective(null)} onUpdate={handleUpdateObjective} />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// MEETINGS VIEW
// ----------------------------------------------------------------------
interface MeetingsViewProps {
  meetings: Meeting[];
  setMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  onUpdateMeeting: (m: Meeting) => void;
}

const MeetingsView: React.FC<MeetingsViewProps> = ({ meetings, setMeetings, onUpdateMeeting }) => {
    const year = 2026;
    const months = Array.from({length: 12}, (_, i) => i);

    const isMeetingDay = (month: number, day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return meetings.find(m => m.date === dateStr);
    };

    const handleDayClick = (monthIndex: number, day: number) => {
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const existing = isMeetingDay(monthIndex, day);
        if (existing) {
            alert(`Ya existe una reunión: ${existing.title}`);
            return;
        }

        const title = prompt(`Añadir reunión para el ${day}/${monthIndex+1}/${year}\nTítulo:`);
        if (!title) return;

        const newMeeting: Meeting = {
            id: Date.now().toString(),
            title,
            date: dateStr,
            startTime: '19:00',
            endTime: '20:30',
            type: 'Other',
            agenda: ''
        };
        setMeetings(prev => [...prev, newMeeting]);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-100 rounded-lg"><CalendarDays className="w-6 h-6 text-rose-600" /></div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Calendario 2026</h3>
                            <p className="text-xs text-gray-500">Haz clic en un día para añadir reunión.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 text-xs">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> SJ</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> JD</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
                    {months.map(monthIndex => {
                        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
                        const firstDay = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
                        
                        return (
                            <div key={monthIndex} className="text-center">
                                <h4 className="text-sm font-bold text-gray-800 uppercase mb-2 border-b border-gray-100 pb-1">{new Date(year, monthIndex, 1).toLocaleString('es-ES', { month: 'long' })}</h4>
                                <div className="grid grid-cols-7 gap-1 text-[10px]">
                                    {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-gray-400 font-medium">{d}</div>)}
                                    {Array.from({length: firstDay}).map((_, i) => <div key={`empty-${i}`} />)}
                                    {Array.from({length: daysInMonth}).map((_, i) => {
                                        const day = i + 1;
                                        const meeting = isMeetingDay(monthIndex, day);
                                        let bgClass = 'text-gray-600 hover:bg-gray-100 cursor-pointer';
                                        if (meeting) {
                                            if (meeting.type === 'SJ') bgClass = 'bg-blue-500 text-white font-bold shadow-sm';
                                            else if (meeting.type === 'JD') bgClass = 'bg-rose-500 text-white font-bold shadow-sm';
                                            else bgClass = 'bg-gray-500 text-white font-bold shadow-sm';
                                        }

                                        return (
                                            <div key={day} onClick={() => handleDayClick(monthIndex, day)} className={`h-6 flex items-center justify-center rounded-full transition-colors ${bgClass}`} title={meeting?.title}>
                                                {day}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" /> Detalles de Reuniones
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {meetings.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((meeting) => (
                        <div key={meeting.id} className={`border rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col ${meeting.type === 'SJ' ? 'bg-blue-50 border-blue-100' : meeting.type === 'JD' ? 'bg-rose-50 border-rose-100' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                    <span className={`text-xs font-bold uppercase tracking-wider ${meeting.type === 'SJ' ? 'text-blue-600' : meeting.type === 'JD' ? 'text-rose-600' : 'text-gray-600'}`}>{new Date(meeting.date).toLocaleDateString('es-ES', { month: 'long' })}</span>
                                    <span className="text-xl font-bold text-gray-900">{new Date(meeting.date).getDate()}</span>
                                </div>
                                <span className="text-[10px] text-gray-500 bg-white/50 px-1.5 py-0.5 rounded block flex items-center justify-end gap-1"><Clock className="w-3 h-3"/> {meeting.startTime}</span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2 min-h-[40px]">{meeting.title}</h4>
                            <textarea value={meeting.agenda} onChange={(e) => onUpdateMeeting({...meeting, agenda: e.target.value})} placeholder="Orden del día..." className="w-full text-xs p-2 rounded border border-gray-200 focus:ring-1 focus:ring-rose-500 outline-none resize-none h-24 bg-white mt-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// DOCUMENTS VIEW
// ----------------------------------------------------------------------
interface DocumentsViewProps {
    documents: Document[];
    setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ documents, setDocuments }) => {
    const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { alert("Archivo > 2MB"); return; }
        const reader = new FileReader();
        reader.onload = (event) => {
            const newDoc: Document = {
                id: Date.now().toString(),
                name: file.name,
                date: new Date().toLocaleDateString(),
                size: (file.size / 1024).toFixed(2) + ' KB',
                type: file.type || 'Desconocido',
                content: event.target?.result as string
            };
            setDocuments(prev => [...prev, newDoc]);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const deleteDoc = (id: string) => {
        if (confirm("¿Borrar documento?")) setDocuments(prev => prev.filter(d => d.id !== id));
    }

    return (
        <div className="space-y-6 animate-fade-in">
             {viewingDoc && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">{viewingDoc.name}</h3>
                            <button onClick={() => setViewingDoc(null)} className="p-2 hover:bg-gray-200 rounded-full"><X className="w-6 h-6"/></button>
                        </div>
                        <div className="flex-1 bg-gray-100 p-4 relative">
                             {viewingDoc.type.includes('image') ? (
                                 <img src={viewingDoc.content} className="max-w-full max-h-full mx-auto object-contain shadow-lg" />
                             ) : viewingDoc.type.includes('pdf') ? (
                                 <iframe src={viewingDoc.content} className="w-full h-full border-none shadow-lg bg-white rounded-lg"></iframe>
                             ) : (
                                 <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                     <FileText className="w-16 h-16 mb-4 opacity-50"/>
                                     <p>Vista previa no disponible para este formato.</p>
                                     <a href={viewingDoc.content} download={viewingDoc.name} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Descargar Archivo</a>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
             )}

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FileText className="w-5 h-5 text-gray-600"/> Repositorio</h3>
                    <div className="relative">
                        <input type="file" id="doc-upload" className="hidden" onChange={handleFileUpload} />
                        <label htmlFor="doc-upload" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"><Upload className="w-4 h-4"/> Subir</label>
                    </div>
                </div>

                {documents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="p-4 font-bold tracking-wide">Nombre</th>
                                    <th className="p-4 font-bold tracking-wide">Fecha</th>
                                    <th className="p-4 font-bold tracking-wide">Tamaño</th>
                                    <th className="p-4 font-bold tracking-wide text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {documents.map(doc => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-700">
                                            <div onClick={() => setViewingDoc(doc)} className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors">
                                                <FileText className="w-4 h-4 text-gray-400"/> {doc.name}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500">{doc.date}</td>
                                        <td className="p-4 text-gray-500">{doc.size}</td>
                                        <td className="p-4 text-right">
                                            <button onClick={() => deleteDoc(doc.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl"><FileText className="w-12 h-12 mx-auto mb-3 opacity-20"/><p>No hay documentos subidos.</p></div>
                )}
             </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// EVALUATION VIEW (MATRIX)
// ----------------------------------------------------------------------
interface EvaluationViewProps { objectives: Objective[]; onUpdateObjective: (obj: Objective) => void; }

const EvaluationView: React.FC<EvaluationViewProps> = ({ objectives, onUpdateObjective }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(CATEGORIES);
  
  const data = objectives.filter(o => selectedCategories.includes(o.category)).flatMap(obj => 
    obj.actions.map((action, index) => ({
      ...action,
      parentId: obj.id, parentTitle: obj.title, parentCategory: obj.category, displayId: `${obj.id}.${index + 1}`,
      x: action.difficulty ?? 5, y: action.impact ?? 5, 
    }))
  );

  const toggleFilter = (cat: string) => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Filter className="w-3 h-3"/> Filtrar por Área</h4>
            <div className="space-y-2">
                {CATEGORIES.map(cat => (
                    <label key={cat} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
                        <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleFilter(cat)} className="rounded text-rose-600 focus:ring-rose-500 border-gray-300"/> <span className="flex-1">{cat}</span>
                    </label>
                ))}
            </div>
            <button onClick={() => setSelectedCategories(CATEGORIES)} className="mt-4 text-[10px] text-blue-600 font-bold hover:underline w-full text-center">Seleccionar Todo</button>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[650px] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div><h3 className="font-bold text-gray-800 flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-rose-500" /> Matriz de Prioridades</h3></div>
            </div>
            <div className="flex-1 relative rounded-lg overflow-hidden flex flex-col border border-gray-100">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-4 bg-white">
                    <div className="bg-[#4ade80] rounded-lg opacity-90 flex items-start justify-start p-4 relative shadow-sm"><span className="text-sm font-bold text-white uppercase tracking-wider">Victorias Rápidas</span></div>
                    <div className="bg-[#facc15] rounded-lg opacity-90 flex items-start justify-end p-4 relative shadow-sm"><span className="text-sm font-bold text-white uppercase tracking-wider text-right">Proyectos Mayores</span></div>
                    <div className="bg-[#2dd4bf] rounded-lg opacity-90 flex items-end justify-start p-4 relative shadow-sm"><span className="text-sm font-bold text-white uppercase tracking-wider">Tareas Menores</span></div>
                    <div className="bg-[#60a5fa] rounded-lg opacity-90 flex items-end justify-end p-4 relative shadow-sm"><span className="text-sm font-bold text-white uppercase tracking-wider text-right">Descartar</span></div>
                </div>
                <div className="absolute inset-0 z-10">
                    <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                        <XAxis type="number" dataKey="x" hide domain={[0, 10]} />
                        <YAxis type="number" dataKey="y" hide domain={[0, 10]} />
                        <Tooltip content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return <div className="bg-white p-3 border shadow-xl rounded-lg max-w-[220px] z-50 text-xs">
                                    <p className="font-bold text-gray-900 mb-1">{d.displayId}</p><p>{d.text}</p>
                                </div>;
                            } return null;
                        }} />
                        <Scatter name="Acciones" data={data}>
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill="white" stroke="#1e293b" strokeWidth={2} className="cursor-pointer hover:opacity-100 opacity-90" r={6}/>)}
                        </Scatter>
                    </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-[650px] flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Configuración de acciones</h3>
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4">
                {objectives.filter(o => selectedCategories.includes(o.category)).map(obj => {
                    if (obj.actions.length === 0) return null;
                    return (
                        <div key={obj.id} className="border-b border-gray-100 pb-3 last:border-0">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{obj.category}</span>
                            <p className="text-[10px] font-bold uppercase text-gray-600 mb-2 truncate" title={obj.title}>{obj.id}. {obj.title}</p>
                            <div className="space-y-2">
                                {obj.actions.map((action, index) => (
                                    <div key={action.id} className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-gray-900">{`${obj.id}.${index+1}`}</span>
                                            <p className="text-[10px] text-gray-700 leading-tight truncate flex-1" title={action.text}>{action.text}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            <div><input type="range" min="0" max="10" step="1" value={action.difficulty || 5} onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                const updatedActions = obj.actions.map(a => a.id === action.id ? {...a, difficulty: val} : a);
                                                onUpdateObjective({...obj, actions: updatedActions});
                                            }} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/></div>
                                            <div><input type="range" min="0" max="10" step="1" value={action.impact || 5} onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                const updatedActions = obj.actions.map(a => a.id === action.id ? {...a, impact: val} : a);
                                                onUpdateObjective({...obj, actions: updatedActions});
                                            }} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"/></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// ACTIONS VIEW (Refactored)
// ----------------------------------------------------------------------
interface ActionsViewProps { objectives: Objective[]; onUpdateObjective: (obj: Objective) => void; }

const ActionsView: React.FC<ActionsViewProps> = ({ objectives, onUpdateObjective }) => {
    // Filter States
    const [filters, setFilters] = useState({ text: '', context: '', resp: '', deadline: '', metrics: '', area: 'All' });
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [newComments, setNewComments] = useState<Record<string, string>>({});

    const handleFilterChange = (field: string, value: string) => setFilters(prev => ({...prev, [field]: value}));

    // Data Preparation (Grouped by Category)
    const groupedActions = React.useMemo(() => {
        const groups: Record<string, any[]> = {};
        objectives.forEach(obj => {
            if (filters.area !== 'All' && obj.category !== filters.area) return;
            
            obj.actions.forEach(act => {
                // Apply Text Filters
                if (filters.text && !act.text.toLowerCase().includes(filters.text.toLowerCase())) return;
                // Add more filters here if needed
                
                if (!groups[obj.category]) groups[obj.category] = [];
                groups[obj.category].push({ ...act, parentId: obj.id, parentTitle: obj.title });
            });
        });
        return groups;
    }, [objectives, filters]);

    const updateAction = (parentId: number, actionId: string, field: keyof ActionItem, value: any) => {
        const obj = objectives.find(o => o.id === parentId);
        if (!obj) return;
        const updated = obj.actions.map(a => a.id === actionId ? {...a, [field]: value} : a);
        onUpdateObjective({...obj, actions: updated});
    };

    const addComment = (parentId: number, actionId: string) => {
        const text = newComments[actionId];
        if(!text?.trim()) return;
        const obj = objectives.find(o => o.id === parentId);
        if (!obj) return;
        const updated = obj.actions.map(a => a.id === actionId ? {
            ...a, comments: [{id: Date.now().toString(), author: 'Usuario', text, timestamp: new Date().toLocaleString()}, ...a.comments]
        } : a);
        onUpdateObjective({...obj, actions: updated});
        setNewComments(prev => ({...prev, [actionId]: ''}));
    };
    
    const deleteAction = (parentId: number, actionId: string) => {
        if(!confirm("¿Borrar acción?")) return;
        const obj = objectives.find(o => o.id === parentId);
        if (!obj) return;
        onUpdateObjective({...obj, actions: obj.actions.filter(a => a.id !== actionId)});
    };

    const OWNER_OPTIONS = ["JD", "Presidente", "Vicepresidente", "Tesorero", "Secretario", "Gerencia", "Área Social", "Área Deportiva", "Área Financiera", "Área RRHH"];

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="p-4 w-12 text-center"></th>
                                <th className="p-4 w-1/3">
                                    <div className="mb-2">Acción</div>
                                    <input type="text" placeholder="Filtrar..." className="w-full p-1 border rounded bg-white font-normal normal-case" value={filters.text} onChange={e => handleFilterChange('text', e.target.value)} />
                                </th>
                                <th className="p-4 w-1/5">
                                    <div className="mb-2">Área</div>
                                    <select className="w-full p-1 border rounded bg-white font-normal normal-case" value={filters.area} onChange={e => handleFilterChange('area', e.target.value)}>
                                        <option value="All">Todas</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </th>
                                <th className="p-4">
                                    <div className="mb-2">Responsable</div>
                                    <input type="text" placeholder="Filtrar..." className="w-full p-1 border rounded bg-white font-normal normal-case" />
                                </th>
                                <th className="p-4">
                                    <div className="mb-2">Límite</div>
                                    <input type="text" placeholder="Filtrar..." className="w-full p-1 border rounded bg-white font-normal normal-case" />
                                </th>
                                <th className="p-4 text-center">Métricas</th>
                                <th className="p-4 text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Object.entries(groupedActions).map(([category, actions]) => (
                                <React.Fragment key={category}>
                                    <tr className="bg-gray-100/50">
                                        <td colSpan={7} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${CATEGORY_THEMES[category]?.split(' ')[2] || ''}`}>{category}</td>
                                    </tr>
                                    {(actions as any[]).map((action: any) => (
                                        <React.Fragment key={action.id}>
                                            <tr className="hover:bg-gray-50/50 group">
                                                <td className="p-4 text-center">
                                                    <input type="checkbox" checked={action.isCompleted} onChange={(e) => updateAction(action.parentId, action.id, 'isCompleted', e.target.checked)} className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"/>
                                                </td>
                                                <td className="p-4">
                                                    <input type="text" value={action.text} onChange={(e) => updateAction(action.parentId, action.id, 'text', e.target.value)} className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-rose-500 focus:ring-0 px-0 py-1 transition-all outline-none font-medium text-gray-800"/>
                                                </td>
                                                <td className="p-4 text-xs text-gray-500">{action.parentTitle}</td>
                                                <td className="p-4">
                                                    <select value={action.owner || ''} onChange={(e) => updateAction(action.parentId, action.id, 'owner', e.target.value)} className="bg-transparent border border-transparent hover:border-gray-200 rounded p-1 text-xs text-gray-600 focus:ring-1 focus:ring-rose-500 cursor-pointer">
                                                        {OWNER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                </td>
                                                <td className="p-4"><input type="date" value={action.deadline || ''} onChange={(e) => updateAction(action.parentId, action.id, 'deadline', e.target.value)} className="bg-transparent border border-transparent hover:border-gray-200 rounded p-1 text-xs text-gray-600 focus:ring-1 focus:ring-rose-500 cursor-pointer"/></td>
                                                <td className="p-4 text-center">
                                                    <div className="flex flex-col gap-1 items-center">
                                                        <div className="flex items-center gap-1"><span className="text-[10px] font-bold text-blue-500 w-4">D</span><input type="number" min="0" max="10" value={action.difficulty || 5} onChange={(e) => updateAction(action.parentId, action.id, 'difficulty', parseInt(e.target.value))} className="w-8 p-0.5 text-center text-xs border border-gray-200 rounded"/></div>
                                                        <div className="flex items-center gap-1"><span className="text-[10px] font-bold text-rose-500 w-4">I</span><input type="number" min="0" max="10" value={action.impact || 5} onChange={(e) => updateAction(action.parentId, action.id, 'impact', parseInt(e.target.value))} className="w-8 p-0.5 text-center text-xs border border-gray-200 rounded"/></div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => setExpandedComments(p => ({...p, [action.id]: !p[action.id]}))} className={`p-2 rounded-full hover:bg-gray-100 relative ${action.comments.length > 0 ? 'text-indigo-600' : 'text-gray-300'}`}>
                                                            <MessageSquare className="w-4 h-4" />{action.comments.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-100 text-indigo-700 rounded-full text-[9px] flex items-center justify-center font-bold">{action.comments.length}</span>}
                                                        </button>
                                                        <button onClick={() => deleteAction(action.parentId, action.id)} className="p-2 text-gray-300 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Expanded Comments */}
                                            {expandedComments[action.id] && (
                                                <tr>
                                                    <td colSpan={7} className="bg-gray-50 p-4 border-b border-gray-200 shadow-inner">
                                                        <div className="max-w-3xl mx-auto">
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Comentarios de seguimiento</h4>
                                                            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                                                                {action.comments.map((c: any) => (
                                                                    <div key={c.id} className="bg-white p-2 rounded border border-gray-100 text-xs">
                                                                        <div className="flex justify-between mb-1"><span className="font-bold text-indigo-900">{c.author}</span><span className="text-gray-400">{c.timestamp}</span></div>
                                                                        <p>{c.text}</p>
                                                                    </div>
                                                                ))}
                                                                {action.comments.length === 0 && <p className="text-xs text-gray-400 italic">No hay comentarios.</p>}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input type="text" placeholder="Escribir comentario..." className="flex-1 p-2 border rounded text-xs" value={newComments[action.id] || ''} onChange={e => setNewComments(p => ({...p, [action.id]: e.target.value}))} onKeyDown={e => e.key === 'Enter' && addComment(action.parentId, action.id)}/>
                                                                <button onClick={() => addComment(action.parentId, action.id)} className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"><Send className="w-3 h-3"/></button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default App;
