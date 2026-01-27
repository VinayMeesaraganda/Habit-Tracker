/**
 * TaskContext - Context for managing to-do list tasks
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Task } from '../types';
import { useHabits } from './HabitContext';

interface TaskContextType {
    tasks: Task[];
    loading: boolean;
    addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
    const { user } = useHabits();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch tasks
    const fetchTasks = useCallback(async () => {
        if (!user) {
            setTasks([]);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Add task
    const addTask = async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                ...task,
                user_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        setTasks(prev => [data, ...prev]);
    };

    // Update task
    const updateTask = async (id: string, updates: Partial<Task>) => {
        const { error } = await supabase
            .from('tasks')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    // Delete task
    const deleteTask = async (id: string) => {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    // Toggle task completion
    const toggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const completed_at = task.completed_at ? null : new Date().toISOString();
        await updateTask(id, { completed_at });
    };

    const value: TaskContextType = useMemo(() => ({
        tasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        refreshTasks: fetchTasks,
    }), [tasks, loading, fetchTasks]);

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
