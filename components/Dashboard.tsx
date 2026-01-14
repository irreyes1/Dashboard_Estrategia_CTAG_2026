
import React, { useMemo } from 'react';
import { Objective } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, AreaChart, Area } from 'recharts';
import { Target, CheckCircle2, AlertCircle, Clock, CheckSquare, List, TrendingUp, Zap } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface DashboardProps {
  objectives: Objective[];
}

export const Dashboard: React.FC<DashboardProps> = ({ objectives }) => {
  // Action Items Stats
  const actionStats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let inProgress = 0; 
    
    const pendingList: { actionText: string; objTitle: string; objCategory: string; objPriority: string }[] = [];

    objectives.forEach(obj => {
      obj.actions.forEach(act => {
        total++;
        if (act.isCompleted) {
          completed++;
        } else {
            if (obj.status === 'In Progress') {
                inProgress++;
            }
            pendingList.push({
                actionText: act.text,
                objTitle: obj.title,
                objCategory: obj.category,
                objPriority: obj.priority
            });
        }
      });
    });

    const purePending = total - completed - inProgress;

    // Sort pending by priority (High first)
    pendingList.sort((a, b) => {
      const pMap: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return pMap[b.objPriority] - pMap[a.objPriority];
    });

    return { 
      total, 
      completed, 
      inProgress,
      pending: purePending,
      pendingList 
    };
  }, [objectives]);

  // Chart Data: Actions Status
  const pieData = [
    { name: 'Completadas', value: actionStats.completed, color: '#22c55e' }, // Green
    { name: 'En Curso (Obj)', value: actionStats.inProgress, color: '#3b82f6' }, // Blue
    { name: 'Pendientes', value: actionStats.pending, color: '#94a3b8' }, // Gray
  ];

  // Chart Data: Actions by Category
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

  // Chart Data: REAL Monthly Evolution 2026 based on Actions
  const monthlyData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const currentMonthIndex = now.getMonth(); 
    const visibleMonths = months.slice(0, currentMonthIndex + 1);

    const data = visibleMonths.map((m, index) => {
        let count = 0;
        objectives.forEach(obj => {
            obj.actions.forEach(act => {
                if (act.isCompleted) {
                    count++; 
                }
            });
        });
        return { name: m, Acciones: count };
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* ADDED: Objectives Count */}
        <StatCard title="Objetivos" value={objectives.length} icon={Target} color="bg-rose-600" />
        
        <StatCard title="Acciones" value={actionStats.total} icon={Zap} color="bg-gray-700" />
        <StatCard title="En Progreso" value={actionStats.inProgress} icon={Clock} color="bg-blue-500" subtext="Según obj." />
        <StatCard title="Completadas" value={actionStats.completed} icon={CheckCircle2} color="bg-green-500" />
        <StatCard title="Pendientes" value={actionStats.pending} icon={AlertCircle} color="bg-orange-400" />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Acciones</h3>
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
                 Evolución de Acciones
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
                    <Area type="monotone" dataKey="Acciones" stroke="#e11d48" fill="#ffe4e6" />
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
             Desglose por Área
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
             Prioridad en Pendientes
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
