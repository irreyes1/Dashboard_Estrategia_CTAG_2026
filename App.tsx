
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ListTodo, Menu, Search, Filter, CheckCircle2, Circle, Plus, Send, Calendar, MessageSquare, ChevronDown, ChevronUp, User, Trash2, Lock, ArrowRight, ChevronRight, Minimize2, Maximize2, BarChart2, MousePointer2, Save, Upload, Download } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, CartesianGrid, ReferenceLine, Label } from 'recharts';
import { INITIAL_OBJECTIVES, CATEGORIES, STATUS_COLORS, PRIORITY_COLORS } from './constants';
import { Objective, ActionItem, Comment } from './types';
import { Dashboard } from './components/Dashboard';
import { ObjectiveDetail } from './components/ObjectiveDetail';

// ----------------------------------------------------------------------
// THEME CONFIGURATION (Club de Tenis Andrés Gimeno Identity)
// ----------------------------------------------------------------------
const THEME = {
  primary: 'bg-[#e11d48]', // Corporate Red (Rose-600 approx)
  primaryHover: 'hover:bg-[#be123c]',
  textPrimary: 'text-[#e11d48]',
  sidebar: 'bg-[#171717]', // Neutral Dark (Neutral-900)
  sidebarActive: 'bg-[#e11d48]',
};

// Pastel Color Mapping for Categories (Updated Names)
const CATEGORY_THEMES: Record<string, string> = {
  'Funcionamiento JD': 'bg-sky-50 border-sky-200 text-sky-900',
  'Área Social': 'bg-emerald-50 border-emerald-200 text-emerald-900',
  'Área Deportiva': 'bg-orange-50 border-orange-200 text-orange-900', // Clay court feel
  'Mantenimiento': 'bg-stone-100 border-stone-200 text-stone-700', // Infrastructure feel
  'Área RRHH': 'bg-purple-50 border-purple-200 text-purple-900',
  'Área Financiera': 'bg-yellow-50 border-yellow-200 text-yellow-900',
};

// URL del Logo del 50 Aniversario del Club
const LOGO_URL = "https://www.tenisgimeno.com/wp-content/uploads/2024/02/logo-50-anys-blanc.png";

function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // App State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'objectives' | 'evaluation'>('dashboard');
  
  // Initialize from LocalStorage or Fallback to Constants
  const [objectives, setObjectives] = useState<Objective[]>(() => {
    const saved = localStorage.getItem('ctag_objectives');
    return saved ? JSON.parse(saved) : INITIAL_OBJECTIVES;
  });

  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('ctag_objectives', JSON.stringify(objectives));
  }, [objectives]);

  // Collapse States - Initialize all to TRUE (Collapsed)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CATEGORIES.forEach(cat => initial[cat] = true);
    return initial;
  });

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

  // Export Data
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(objectives, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `plan_estrategico_ctag_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import Data
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setObjectives(parsed);
          alert('Datos importados correctamente.');
        } else {
          alert('Formato de archivo inválido.');
        }
      } catch (err) {
        alert('Error al leer el archivo.');
      }
    };
    reader.readAsText(file);
    // Reset input
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

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className={`${THEME.sidebar} p-8 text-center relative overflow-hidden`}>
             <div className="flex justify-center mb-6">
                <img src={LOGO_URL} alt="Club Tennis Andrés Gimeno" className="h-20 w-auto object-contain" />
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
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e11d48] focus:bg-white transition-all outline-none"
                    placeholder="Usuario"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e11d48] focus:bg-white transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {authError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2 border border-red-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  {authError}
                </div>
              )}

              <button 
                type="submit"
                className={`w-full ${THEME.primary} ${THEME.primaryHover} text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-rose-500/30`}
              >
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
      
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-20 w-64 ${THEME.sidebar} text-white transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 shadow-xl flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-b border-neutral-800">
          <img src={LOGO_URL} alt="CTAG" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="font-bold text-xs tracking-tight text-gray-100 leading-tight">Club de Tennis<br/>Andrés Gimeno</h1>
          </div>
        </div>
        
        <nav className="p-4 space-y-2 mt-4 flex-1">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? `${THEME.sidebarActive} text-white shadow-lg shadow-rose-900/20` : 'text-gray-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Panel de Control</span>
          </button>
          
          <button 
            onClick={() => { setActiveTab('objectives'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'objectives' ? `${THEME.sidebarActive} text-white shadow-lg shadow-rose-900/20` : 'text-gray-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <ListTodo className="w-5 h-5" />
            <span>Objetivos</span>
          </button>

          <button 
            onClick={() => { setActiveTab('evaluation'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'evaluation' ? `${THEME.sidebarActive} text-white shadow-lg shadow-rose-900/20` : 'text-gray-400 hover:bg-neutral-800 hover:text-white'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span>Matriz de Impacto</span>
          </button>

          <div className="pt-6 mt-6 border-t border-neutral-800">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase mb-2">Datos</p>
            <button 
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all"
            >
                <Download className="w-4 h-4" /> Exportar Copia
            </button>
            <button 
                onClick={handleImportClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all"
            >
                <Upload className="w-4 h-4" /> Importar Copia
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
          </div>
        </nav>
        
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="w-full text-xs text-gray-400 hover:text-white transition-colors text-center pb-2 flex items-center justify-center gap-2"
          >
             <Lock className="w-3 h-3"/> Cerrar Sesión
          </button>
          <div className="text-[10px] text-gray-600 text-center pt-2">
            © 2026 Club de Tenis Andrés Gimeno
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Decorative Top Line */}
        <div className={`h-1.5 w-full ${THEME.primary}`}></div>

        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <img src={LOGO_URL} className="h-8 w-auto" alt="Logo"/>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 custom-scrollbar">
          
          {/* Top Bar (Contextual) */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                {activeTab === 'dashboard' ? 'Visión General' : activeTab === 'objectives' ? 'Listado de Objetivos' : 'Matriz de Priorización'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                  {activeTab === 'evaluation' 
                    ? 'Mapa estratégico para la toma de decisiones.' 
                    : 'Seguimiento de bases del plan operativo 2026.'}
              </p>
            </div>

            {activeTab === 'objectives' && (
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm w-full focus:ring-2 focus:ring-[#e11d48] focus:border-transparent outline-none shadow-sm"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="pl-9 pr-8 py-2.5 rounded-lg border border-gray-300 text-sm w-full appearance-none bg-white focus:ring-2 focus:ring-[#e11d48] outline-none cursor-pointer shadow-sm"
                  >
                    <option value="All">Todos los Bloques</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Views */}
          {activeTab === 'dashboard' ? (
            <Dashboard objectives={objectives} />
          ) : activeTab === 'evaluation' ? (
            <EvaluationView objectives={objectives} onUpdateObjective={handleUpdateObjective} />
          ) : (
            <div className="space-y-6 animate-fade-in pb-12">
              {/* Group by Category */}
              {filterCategory === 'All' ? CATEGORIES.map(category => {
                const catObjectives = filteredObjectives.filter(o => o.category === category);
                if (catObjectives.length === 0) return null;
                
                const themeClass = CATEGORY_THEMES[category] || 'bg-gray-50 border-gray-200 text-gray-800';
                const isCollapsed = collapsedCategories[category];

                return (
                  <div key={category} className={`rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${isCollapsed ? 'mb-2' : ''} ${themeClass.split(' ')[1]}`}>
                    {/* Collapsible Category Header */}
                    <div 
                        onClick={() => toggleCategory(category)}
                        className={`${themeClass} px-6 py-4 flex justify-between items-center cursor-pointer select-none transition-colors hover:brightness-95`}
                    >
                      <div className="flex items-center gap-3">
                         <div className={`p-1 rounded-md bg-white/50 border border-white/20 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-90'}`}>
                             <ChevronRight className="w-4 h-4" />
                         </div>
                         <h3 className="font-bold uppercase tracking-wide text-sm md:text-base">{category}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Progress Bar for Category */}
                        <div className="hidden sm:flex items-center gap-2 mr-4">
                            <span className="text-[10px] font-semibold opacity-70">PROGRESO BLOQUE</span>
                            <div className="w-24 h-1.5 bg-black/10 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-current opacity-80" 
                                    style={{ 
                                        width: `${catObjectives.reduce((acc, obj) => acc + getProgress(obj), 0) / catObjectives.length}%` 
                                    }}
                                />
                            </div>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 bg-white/60 rounded-full shadow-sm backdrop-blur-sm">
                            {catObjectives.length} objetivos
                        </span>
                      </div>
                    </div>

                    {/* Category Content */}
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
                 // Filtered View (Single List)
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
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <Search className="w-6 h-6 text-gray-400"/>
                            </div>
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

      {/* Detail Modal */}
      {selectedObjective && (
        <ObjectiveDetail 
          objective={selectedObjective} 
          onClose={() => setSelectedObjective(null)} 
          onUpdate={handleUpdateObjective}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// EVALUATION VIEW COMPONENT (UX ENHANCED)
// ----------------------------------------------------------------------
interface EvaluationViewProps {
  objectives: Objective[];
  onUpdateObjective: (obj: Objective) => void;
}

const EvaluationView: React.FC<EvaluationViewProps> = ({ objectives, onUpdateObjective }) => {
  // UX logic for 4-corner chart
  // X = Cost (Right = High, Left = Low) - Ease (Right = Hard, Left = Easy). 
  // Wait, let's simplify for the "Expert View":
  // We want Top-Left to be "Great" (High Impact, Low Cost/Easy).
  // We want Top-Right to be "Good but Hard" (High Impact, High Cost).
  // We want Bottom-Left to be "Easy filler" (Low Impact, Low Cost).
  // We want Bottom-Right to be "Bad" (Low Impact, High Cost).

  // Calculation:
  // X Axis: (Cost - Ease). 
  //   If Cost is 10 and Ease is 1 (Hard/Expensive) -> X = 9 (Right)
  //   If Cost is 1 and Ease is 10 (Cheap/Easy) -> X = -9 (Left)
  // Y Axis: (Impact - Risk).
  //   If Impact is 10 and Risk is 1 (High Return/Safe) -> Y = 9 (Top)
  //   If Impact is 1 and Risk is 10 (Low Return/Risky) -> Y = -9 (Bottom)

  const data = objectives.map(obj => ({
    ...obj,
    x: (obj.cost || 1) - (obj.ease || 1), 
    y: (obj.impact || 1) - (obj.risk || 1), 
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-xl rounded-lg max-w-[220px] z-50 pointer-events-none">
          <p className="text-xs font-bold text-gray-900 mb-1 leading-tight">{data.title}</p>
          <div className="w-full h-px bg-gray-100 my-1"></div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
            <span className="text-emerald-600 font-medium">Impacto: {data.impact}</span>
            <span className="text-rose-600 font-medium">Riesgo: {data.risk}</span>
            <span className="text-blue-600 font-medium">Facilidad: {data.ease}</span>
            <span className="text-orange-600 font-medium">Coste: {data.cost}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pb-12">
      {/* 4-Corner Quadrant Chart */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[650px] flex flex-col relative overflow-hidden">
         <div className="flex justify-between items-start mb-4">
             <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <MousePointer2 className="w-4 h-4 text-rose-500" />
                    Mapa Estratégico de Priorización
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    Visualización para toma de decisiones rápida. 
                </p>
             </div>
             {/* Legend */}
             <div className="flex gap-2 text-[10px]">
                 <span className="px-2 py-1 bg-green-50 text-green-700 rounded border border-green-100">Prioridad</span>
                 <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100">Estratégico</span>
                 <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-200">Menor</span>
                 <span className="px-2 py-1 bg-red-50 text-red-700 rounded border border-red-100">Descartar</span>
             </div>
         </div>
         
         <div className="flex-1 relative rounded-lg border border-gray-200 overflow-hidden">
            {/* Background Zones (Semantic) */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="bg-gradient-to-br from-green-50 to-transparent opacity-60 border-r border-b border-dashed border-gray-300 flex items-start justify-start p-4">
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider opacity-70">Quick Wins (Joyas)</span>
                </div>
                <div className="bg-gradient-to-bl from-blue-50 to-transparent opacity-60 border-b border-dashed border-gray-300 flex items-start justify-end p-4">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider opacity-70 text-right">Apuestas Estratégicas<br/>(Planificar)</span>
                </div>
                <div className="bg-gradient-to-tr from-gray-100 to-transparent opacity-60 border-r border-dashed border-gray-300 flex items-end justify-start p-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider opacity-70">Tareas Menores</span>
                </div>
                <div className="bg-gradient-to-tl from-red-50 to-transparent opacity-60 flex items-end justify-end p-4">
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider opacity-70">Revisar / Descartar</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="x" hide domain={[-10, 10]} />
                <YAxis type="number" dataKey="y" hide domain={[-10, 10]} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Center Axis Lines */}
                <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={2} />
                <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={2} />
                
                <Scatter name="Objetivos" data={data}>
                    {data.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={
                                entry.x < 0 && entry.y > 0 ? '#16a34a' : // Green
                                entry.x > 0 && entry.y > 0 ? '#2563eb' : // Blue
                                entry.x < 0 && entry.y < 0 ? '#64748b' : // Gray
                                '#dc2626' // Red
                            }
                            stroke="white"
                            strokeWidth={2}
                            className="hover:opacity-80 cursor-pointer shadow-lg"
                        />
                    ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
         </div>
         <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium px-2">
             <span>← Fácil / Barato</span>
             <span>Difícil / Caro →</span>
         </div>
      </div>

      {/* Editor List (Right Panel) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[650px] flex flex-col">
         <h3 className="font-bold text-gray-800 mb-4">Ajuste de Variables</h3>
         <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {objectives.map(obj => (
                <div key={obj.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-rose-200 transition-colors group">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                             ((obj.cost||1)-(obj.ease||1)) < 0 && ((obj.impact||1)-(obj.risk||1)) > 0 ? 'bg-green-500' : 
                             ((obj.cost||1)-(obj.ease||1)) > 0 && ((obj.impact||1)-(obj.risk||1)) > 0 ? 'bg-blue-500' :
                             ((obj.cost||1)-(obj.ease||1)) < 0 && ((obj.impact||1)-(obj.risk||1)) < 0 ? 'bg-gray-500' : 'bg-red-500'
                        }`}></div>
                        <p className="text-xs font-bold text-gray-700 truncate flex-1" title={obj.title}>{obj.id}. {obj.title}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div>
                             <label className="text-[9px] text-emerald-600 font-bold block mb-1">IMPACTO</label>
                             <input 
                                type="range" min="1" max="10" step="1"
                                value={obj.impact}
                                onChange={(e) => onUpdateObjective({...obj, impact: parseInt(e.target.value)})}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                             />
                        </div>
                        <div>
                             <label className="text-[9px] text-rose-600 font-bold block mb-1">RIESGO</label>
                             <input 
                                type="range" min="1" max="10" step="1"
                                value={obj.risk}
                                onChange={(e) => onUpdateObjective({...obj, risk: parseInt(e.target.value)})}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                             />
                        </div>
                        <div>
                             <label className="text-[9px] text-blue-600 font-bold block mb-1">FACILIDAD</label>
                             <input 
                                type="range" min="1" max="10" step="1"
                                value={obj.ease}
                                onChange={(e) => onUpdateObjective({...obj, ease: parseInt(e.target.value)})}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                             />
                        </div>
                        <div>
                             <label className="text-[9px] text-orange-600 font-bold block mb-1">COSTE</label>
                             <input 
                                type="range" min="1" max="10" step="1"
                                value={obj.cost}
                                onChange={(e) => onUpdateObjective({...obj, cost: parseInt(e.target.value)})}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                             />
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

interface ObjectiveCardProps {
  objective: Objective;
  onClick: () => void;
  onUpdate: (obj: Objective) => void;
  progress: number;
  categoryColor?: string;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, onClick, onUpdate, progress, categoryColor }) => {
  const [newAction, setNewAction] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default

  const handleToggleAction = (e: React.MouseEvent, actionId: string) => {
    e.stopPropagation();
    const updatedActions = objective.actions.map(a => 
      a.id === actionId ? { ...a, isCompleted: !a.isCompleted } : a
    );
    onUpdate({ ...objective, actions: updatedActions });
  };

  const handleDeleteAction = (e: React.MouseEvent, actionId: string) => {
    e.stopPropagation();
    const updatedActions = objective.actions.filter(a => a.id !== actionId);
    onUpdate({ ...objective, actions: updatedActions });
  };

  const handleAddAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!newAction.trim()) return;
    const item: ActionItem = {
      id: Date.now().toString(),
      text: newAction,
      isCompleted: false
    };
    onUpdate({ ...objective, actions: [...objective.actions, item] });
    setNewAction('');
  };

  const handleAddComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Usuario',
      text: newComment,
      timestamp: new Date().toLocaleString()
    };
    onUpdate({ ...objective, comments: [...objective.comments, comment] });
    setNewComment('');
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...objective, deadline: e.target.value });
  };
  
  const handleRealDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...objective, realDate: e.target.value });
  };

  const toggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
  }

  // Extract color class for left border accent
  const borderColorClass = categoryColor ? categoryColor.split(' ')[1] : 'border-gray-200';
  const textColorClass = categoryColor ? categoryColor.split(' ')[2] : 'text-gray-600';

  return (
    <div 
      onClick={onClick}
      className={`p-4 hover:bg-gray-50 transition-all cursor-pointer group flex flex-col border-l-4 bg-white ${borderColorClass.replace('border', 'border-l')}`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        
        {/* Toggle Expand Button */}
        <button 
            onClick={toggleExpand}
            className="mt-1 text-gray-400 hover:text-rose-600 transition-colors shrink-0"
            title={isExpanded ? "Recoger objetivo" : "Desplegar objetivo"}
        >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Image Thumbnail */}
        {objective.imageUrl && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                <img src={objective.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-800 text-base sm:text-lg leading-snug line-clamp-2">{objective.id}. {objective.title}</span>
            {objective.comments.length > 0 && !showComments && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="Hay comentarios"></span>
            )}
          </div>
          
          {isExpanded ? (
              <p className="text-sm text-gray-600 mb-2 leading-relaxed">{objective.description}</p>
          ) : (
              <p className="text-xs text-gray-500 mb-1 truncate">{objective.description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-600 font-medium">
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-md">
              <span className={`w-1.5 h-1.5 rounded-full ${objective.priority === 'High' ? 'bg-red-500' : objective.priority === 'Medium' ? 'bg-yellow-500' : 'bg-slate-300'}`}></span>
              {objective.owner}
            </span>
            <span>•</span>
            
            {/* Dual Dates - Editable */}
            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1 bg-white p-1 rounded border border-gray-100 hover:border-gray-300 transition-colors">
                    <span className="text-[9px] uppercase font-bold text-gray-400">Est:</span>
                    <input 
                        type="date"
                        value={objective.deadline}
                        onChange={handleDeadlineChange}
                        className="bg-transparent border-none p-0 h-auto text-[10px] text-gray-600 font-bold focus:ring-0 cursor-pointer hover:text-rose-600 w-20"
                    />
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded border border-gray-100 hover:border-gray-300 transition-colors">
                    <span className="text-[9px] uppercase font-bold text-gray-400">Real:</span>
                    <input 
                        type="date"
                        value={objective.realDate || ''}
                        onChange={handleRealDateChange}
                        className="bg-transparent border-none p-0 h-auto text-[10px] text-gray-600 font-bold focus:ring-0 cursor-pointer hover:text-green-600 w-20"
                        placeholder="--"
                    />
                </div>
            </div>

          </div>
        </div>
        
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
           <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[objective.status]}`}>
            {objective.status === 'In Progress' ? 'En Proceso' : objective.status === 'Pending' ? 'Pendiente' : objective.status === 'Completed' ? 'Completado' : 'Retrasado'}
          </span>
          
          <div className="flex flex-col items-end gap-1 min-w-[60px]">
            <span className="text-xs font-bold text-gray-700">{progress}%</span>
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-rose-500'}`} 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Plan Section - Interactive (Only visible if expanded) */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${textColorClass} opacity-80`}>Plan de Acción</p>
            </div>
            
            {/* Actions List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-3">
            {objective.actions.map(action => (
                <div 
                    key={action.id} 
                    className="flex items-start gap-2.5 group/action p-1.5 hover:bg-gray-50 rounded cursor-pointer relative pr-6 transition-colors"
                    onClick={(e) => handleToggleAction(e, action.id)}
                >
                <div className={`mt-0.5 transition-colors ${action.isCompleted ? 'text-green-500' : 'text-gray-300 group-hover/action:text-rose-400'}`}>
                    {action.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>
                <span className={`text-sm leading-tight transition-colors select-none ${action.isCompleted ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-700'}`}>
                    {action.text}
                </span>
                <button 
                    onClick={(e) => handleDeleteAction(e, action.id)}
                    className="absolute right-0 top-1 text-gray-300 hover:text-red-500 opacity-0 group-hover/action:opacity-100 transition-all p-0.5"
                    title="Eliminar acción"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
                </div>
            ))}
            </div>

            {/* Add Action Input */}
            <div className="flex gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
                <input 
                    type="text" 
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') {
                            e.stopPropagation();
                            handleAddAction(e as any);
                        }
                    }}
                    placeholder="Añadir nueva acción..."
                    className="flex-1 py-1.5 px-3 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-rose-500 focus:bg-white outline-none transition-all placeholder:text-gray-400"
                />
                <button 
                    onClick={handleAddAction}
                    disabled={!newAction.trim()}
                    className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Comments Section - Inline */}
            <div onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-rose-600 transition-colors mb-2 group/comments"
                >
                    <MessageSquare className="w-3 h-3 group-hover/comments:text-rose-500" />
                    {objective.comments.length > 0 ? `${objective.comments.length} Comentarios` : 'Añadir comentario'}
                    {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showComments && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-3 border border-gray-100 animate-fade-in">
                        {/* Comments List */}
                        {objective.comments.length > 0 && (
                            <div className="space-y-3 mb-3 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {objective.comments.map(comment => (
                                    <div key={comment.id} className="bg-white p-2.5 rounded shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-gray-900">{comment.author}</span>
                                            <span className="text-[10px] text-gray-400">{comment.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-gray-700">{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Add Comment Input */}
                        <div className="relative">
                            <input 
                                type="text" 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        e.stopPropagation();
                                        handleAddComment(e as any);
                                    }
                                }}
                                placeholder="Escribe un comentario..."
                                className="w-full py-2 pl-3 pr-10 rounded border border-gray-200 text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                            />
                            <button 
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="absolute right-1 top-1 p-1 text-rose-600 hover:bg-rose-50 rounded disabled:opacity-50"
                            >
                                <Send className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
