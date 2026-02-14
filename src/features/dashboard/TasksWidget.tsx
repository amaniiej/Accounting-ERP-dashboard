import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
}

const TasksWidget: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [today] = useState(new Date());

  useEffect(() => {
    const loadTasks = () => {
      const saved = localStorage.getItem('agrospace_tasks');
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse tasks", e);
        }
      }
    };

    loadTasks();

    // Écouter les changements pour la synchronisation en temps réel
    window.addEventListener('storage', loadTasks);
    // Intervalle pour rafraîchir si on est dans le même onglet
    const interval = setInterval(loadTasks, 2000);

    return () => {
      window.removeEventListener('storage', loadTasks);
      clearInterval(interval);
    };
  }, []);

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const todaysTasks = tasks.filter(task => {
    const check = new Date(today.toISOString().split('T')[0]);
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    return check >= start && check <= end;
  });

  const getTaskStyles = (count: number) => {
    if (count > 10) return { padding: 'p-1.5', gap: 'gap-1.5', title: 'text-xs', desc: 'hidden' };
    if (count > 6) return { padding: 'p-2', gap: 'gap-2', title: 'text-xs', desc: 'text-[10px] line-clamp-1' };
    if (count > 4) return { padding: 'p-3', gap: 'gap-2.5', title: 'text-sm', desc: 'text-xs' };
    return { padding: 'p-4', gap: 'gap-3', title: 'text-sm', desc: 'text-xs' };
  };

  const styles = getTaskStyles(todaysTasks.length);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 p-6 shadow-lg mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-black text-slate-800">
          Tasks for {today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>
        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          {todaysTasks.length} Tasks
        </span>
      </div>
      
      <div className={`grid ${todaysTasks.length > 6 ? 'gap-1.5' : 'gap-3'}`}>
        {todaysTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <CalendarIcon size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm italic">No tasks scheduled for today.</p>
          </div>
        ) : (
          todaysTasks.map(task => (
            <div key={task.id} className={`flex items-center justify-between ${styles.padding} bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all`}>
              <div className={`flex items-center ${styles.gap}`}>
                <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <div>
                  <p className={`font-bold ${styles.title} ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {task.title}
                  </p>
                  <p className={`${styles.desc} text-slate-500`}>{task.description}</p>
                </div>
              </div>
              <div className={`flex items-center ${styles.gap}`}>
                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                 </span>
                 {task.status === 'completed' && <CheckCircle size={16} className="text-emerald-500" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksWidget;