/**
 * TasksScreen - Simple to-do list screen
 */

import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types';
import { Plus, Check, Trash2, Calendar, Loader, Pencil, X } from 'lucide-react'; // Added Pencil and X icons
import { format, isToday, isPast, parseISO } from 'date-fns';
import { DatePickerModal } from '../components/DatePickerModal';

const PRIORITY_COLORS = {
    0: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Normal' },
    1: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'High' },
    2: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent' },
};

export const TasksScreen: React.FC = () => {
    const { tasks, loading, addTask, toggleTask, deleteTask, updateTask } = useTasks();
    const [editingTask, setEditingTask] = useState<Task | null>(null); // New state for editing
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [newTaskPriority, setNewTaskPriority] = useState<0 | 1 | 2>(0);
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Separate completed and pending tasks
    const pendingTasks = tasks.filter(t => !t.completed_at);
    const completedTasks = tasks.filter(t => t.completed_at);

    const handleTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        setIsSubmitting(true);
        try {
            if (editingTask) {
                // Update existing task
                await updateTask(editingTask.id, {
                    title: newTaskTitle.trim(),
                    priority: newTaskPriority,
                    due_date: newTaskDueDate || undefined,
                });
                setEditingTask(null);
            } else {
                // Add new task
                await addTask({
                    title: newTaskTitle.trim(),
                    priority: newTaskPriority,
                    due_date: newTaskDueDate || undefined,
                });
            }
            // Reset form
            setNewTaskTitle('');
            setNewTaskPriority(0);
            setNewTaskDueDate('');
            setShowAddForm(false);
        } catch (error) {
            console.error('Error saving task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEditing = (task: Task) => {
        setEditingTask(task);
        setNewTaskTitle(task.title);
        setNewTaskPriority(task.priority);
        setNewTaskDueDate(task.due_date ? task.due_date.split('T')[0] : ''); // Format ISO to YYYY-MM-DD
        setShowAddForm(true);
    };

    const cancelEditing = () => {
        setEditingTask(null);
        setNewTaskTitle('');
        setNewTaskPriority(0);
        setNewTaskDueDate('');
        setShowAddForm(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this task?')) {
            await deleteTask(id);
        }
    };

    const getDueDateStatus = (dueDate?: string) => {
        if (!dueDate) return null;
        const date = parseISO(dueDate);
        if (isToday(date)) return { color: 'text-blue-600', label: 'Today' };
        if (isPast(date)) return { color: 'text-red-600', label: 'Overdue' };
        return { color: 'text-gray-500', label: format(date, 'MMM d') };
    };

    const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
        const priorityStyle = PRIORITY_COLORS[task.priority];
        const dueDateStatus = getDueDateStatus(task.due_date);
        const isCompleted = !!task.completed_at;

        return (
            <div
                className={`
                    relative bg-white rounded-xl p-4 shadow-sm border transition-all
                    ${isCompleted ? 'opacity-60' : 'border-gray-100'}
                `}
            >
                <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                        onClick={() => toggleTask(task.id)}
                        className={`
                            flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                            ${isCompleted
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 hover:border-orange-400'}
                        `}
                    >
                        {isCompleted && <Check className="w-4 h-4 text-white" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className={`font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {/* Priority Badge */}
                            {task.priority > 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}>
                                    {priorityStyle.label}
                                </span>
                            )}
                            {/* Due Date */}
                            {dueDateStatus && (
                                <span className={`text-xs flex items-center gap-1 ${dueDateStatus.color}`}>
                                    <Calendar className="w-3 h-3" />
                                    {dueDateStatus.label}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        {!isCompleted && (
                            <button
                                onClick={() => startEditing(task)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                        {/* Delete Button */}
                        <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFF8E7]">
                <Loader className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 px-4 bg-[#FFF8E7]">
            {/* Header */}
            <div className="pt-8 pb-6 flex items-center justify-between safe-area-top">
                <div>
                    <h1 className="text-3xl font-extra-bold text-[#1F1F1F] tracking-tight mb-1">
                        Tasks
                    </h1>
                    <p className="text-[#6B6B6B] font-medium">
                        {pendingTasks.length} pending
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (showAddForm) {
                            cancelEditing();
                        } else {
                            setShowAddForm(true);
                        }
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 ${showAddForm ? 'bg-gray-200' : ''
                        }`}
                    style={!showAddForm ? {
                        background: 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)',
                    } : {}}
                >
                    {showAddForm ? <X className="w-6 h-6 text-gray-600" /> : <Plus className="w-6 h-6 text-white" />}
                </button>
            </div>

            {/* Add Task Form */}
            {showAddForm && (
                <form onSubmit={handleTaskSubmit} className="mb-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-sm font-bold text-gray-700">
                            {editingTask ? 'Edit Task' : 'New Task'}
                        </h3>
                        {editingTask && (
                            <button type="button" onClick={cancelEditing} className="text-xs text-gray-400 hover:text-gray-600">
                                Cancel
                            </button>
                        )}
                    </div>
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-orange-300"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        {/* Priority Selector */}
                        <div className="flex-1 flex gap-1">
                            {([0, 1, 2] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setNewTaskPriority(p)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${newTaskPriority === p
                                        ? 'bg-orange-500 text-white'
                                        : `${PRIORITY_COLORS[p].bg} ${PRIORITY_COLORS[p].text}`
                                        }`}
                                >
                                    {PRIORITY_COLORS[p].label}
                                </button>
                            ))}
                        </div>
                        {/* Due Date with Placeholder */}
                        <div className="relative">
                            {newTaskDueDate ? (
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowDatePicker(true)}
                                        className="relative pl-9 pr-8 py-2 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-200 flex items-center min-w-[140px]"
                                    >
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                                        {format(parseISO(newTaskDueDate), 'MMM d, yyyy')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewTaskDueDate('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowDatePicker(true)}
                                    className="relative pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-200 flex items-center min-w-[140px] hover:bg-gray-100 transition-colors"
                                >
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    Due Date
                                </button>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!newTaskTitle.trim() || isSubmitting}
                        className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)',
                        }}
                    >
                        {isSubmitting ? 'Saving...' : (editingTask ? 'Update Task' : 'Add Task')}
                    </button>
                </form>
            )}

            <DatePickerModal
                isOpen={showDatePicker}
                selectedDate={newTaskDueDate ? parseISO(newTaskDueDate) : new Date()}
                onDateSelect={(date) => setNewTaskDueDate(format(date, 'yyyy-MM-dd'))}
                onClose={() => setShowDatePicker(false)}
            />

            {/* Empty State */}
            {tasks.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">All caught up!</h3>
                    <p className="text-gray-500">Tap + to add a new task</p>
                </div>
            )}

            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
                <div className="space-y-3 mb-6">
                    {pendingTasks.map(task => (
                        <TaskItem key={task.id} task={task} />
                    ))}
                </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <>
                    <div className="flex items-center gap-2 mb-3 mt-6">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs font-semibold text-gray-400 uppercase">
                            Completed ({completedTasks.length})
                        </span>
                        <div className="h-px flex-1 bg-gray-200" />
                    </div>
                    <div className="space-y-3">
                        {completedTasks.map(task => (
                            <TaskItem key={task.id} task={task} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
