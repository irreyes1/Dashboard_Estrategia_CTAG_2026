
import React, { useMemo } from 'react';
import { Objective } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, AreaChart, Area } from 'recharts';
import { Target, CheckCircle2, AlertCircle, Clock, CheckSquare, List, TrendingUp } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface DashboardProps {
  objectives: Objective[];
}

export const Dashboard: React.FC<DashboardProps> = ({ objectives }) => {
  // Objective Stats
  const stats = useMemo(() => {
    const total = objectives.length;
    const completed = objectives.filter(o => o.status === 'Completed').length;
    const delayed = objectives.filter(o => o.status === 'Delayed').length;
    const inProgress = objectives.filter(o => o.status === 'In Progress').length;
    
    return { total, completed, delayed, inProgress };
  }, [objectives]);

  // Action Items Stats
  const actionStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    const pendingList: { actionText: string; objTitle: string; objCategory: string; objPriority: string }[] = [];

    objectives.forEach(obj => {
      obj.actions.forEach(act => {
        total++;
        if (act.isCompleted) {
          completed++;
        } else {
          pendingList.push({
            actionText: act.text,
            objTitle: obj.title,
            objCategory: obj.category,
            objPriority: obj.priority
          });
        }
      });
    });

    // Sort pending by priority (High first)
    pendingList.sort((a, b) => {
      const pMap: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return pMap[b.objPriority] - pMap[a.objPriority];
    });

    return { 
      total, 
      completed, 
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
      pendingList 
    };
  }, [objectives]);

  // Chart Data: Objectives Status
  const pieData = [
    { name: 'Completado', value: stats.completed, color: '#22c55e' },
    { name: 'En Proceso', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Pendiente', value: stats.total - stats.completed - stats.inProgress - stats.delayed, color: '#94a3b8' },
    { name: 'Retrasado', value: stats.delayed, color: '#ef4444' },
  ];

  // Chart Data: Actions by Category - Fixed to show ALL categories
  const actionsByCatData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catObjs = objectives.filter(o => o.category === cat);
      let done = 0;
      let pending = 0;
      
      catObjs.forEach(o => {
        done += o.actions.filter(a => a.isCompleted).length;
        pending += o.actions.filter(a => !a.isCompleted).length;
      });
      
      return {
        name: cat,
        Completadas: done,
        Pendientes: pending,
        total: done + pending
      };
    });
  }, [objectives]);

  // Chart Data: REAL Monthly Evolution 2026 (Strictly up to current date)
  const monthlyData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const currentMonthIndex = now.getMonth(); // 0-11
    
    // We only want to generate data points up to the current month
    const visibleMonths = months.slice(0, currentMonthIndex + 1);

    const data = visibleMonths.map((m, index) => {
        // Count cumulative completions up to the end of this month
        // We assume year is 2026 or earlier (e.g. late 2025 completions count for Jan start baseline if we wanted, 
        // but let's stick to simple logic: count how many objectives are completed where realDate <= Month End)
        
        const count = objectives.filter(o => {
            if (o.status !== 'Completed') return false;
            
            // Use realDate if present, otherwise ignore for safety (or use modification date if we had it)
            // If realDate is empty but status is Completed, we assume it's done. 
            // However, to place it on a timeline, we need a date. 
            // Fallback: If no realDate, assume it was done recently or default to Jan? 
            // Let's use realDate. If no realDate, we can't plot it accurately in time.
            if (!o.realDate) return false; 

            const d = new Date(o.realDate);
            // Check if date is in this year (2026) and month <= index
            // Or if it was completed in previous years, it contributes to the baseline of Jan.
            
            // Logic: Cumulative sum. Is the completion date before the end of 'index' month?
            // Month index 0 (Jan) -> Date must be <= Jan 31st 2026.
            // Simplified: Month of date <= index (assuming 2026)
            
            if (d.getFullYear() < 2026) return true; // Completed before 2026 counts for all 2026 months
            if (d.getFullYear() > 2026) return false;

            return d.getMonth() <= index;
        }).length;

        return { name: m, Objetivos: count };
    });

    return data;
  }, [objectives]);


  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Objetivos Totales" value={stats.total} icon={Target} color="bg-rose-500" />
        <StatCard title="En Progreso" value={stats.inProgress} icon={Clock} color="bg-blue-500" />
        <StatCard title="Completados" value={stats.completed} icon={CheckCircle2} color="bg-green-500" />
        <StatCard title="Atención Requerida" value={stats.delayed} icon={AlertCircle} color="bg-red-500" />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Objetivos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Evolution Chart (Real) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                 <TrendingUp className="w-5 h-5 text-rose-500"/>
                 Evolución Real 2026
             </h3>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                    data={monthlyData}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                    >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                    <XAxis dataKey="name" tick={{fontSize: 10}} />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Area type="monotone" dataKey="Objetivos" stroke="#e11d48" fill="#ffe4e6" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
             <p className="text-center text-xs text-gray-400 mt-2">Cumplimiento acumulado a fecha actual</p>
        </div>
      </div>

      {/* Action Plans Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Actions Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
             <CheckSquare className="w-5 h-5 text-indigo-500"/>
             Estado de Acciones por Bloque
           </h3>
           <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionsByCatData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                <YAxis />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="Completadas" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} barSize={40} />
                <Bar dataKey="Pendientes" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>

        {/* Pending Actions List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[420px]">
           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
             <List className="w-5 h-5 text-indigo-500"/>
             Acciones Pendientes
           </h3>
           <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
             {actionStats.pendingList.length > 0 ? (
                 actionStats.pendingList.map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-100 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {item.objCategory}
                            </span>
                             {item.objPriority === 'High' && (
                                <span className="w-2 h-2 rounded-full bg-red-500" title="Prioridad Alta"></span>
                             )}
                        </div>
                        <p className="text-xs text-gray-500 mb-1 line-clamp-1 font-medium">{item.objTitle}</p>
                        <div className="flex items-start gap-2">
                             <div className="mt-1 min-w-[12px] h-[12px] border-2 border-gray-300 rounded-sm"></div>
                             <p className="text-sm text-gray-700">{item.actionText}</p>
                        </div>
                    </div>
                 ))
             ) : (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                     <CheckCircle2 className="w-8 h-8 mb-2 opacity-50"/>
                     <p>¡Todo al día!</p>
                     <p className="text-xs">No hay acciones pendientes.</p>
                 </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};
