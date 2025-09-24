

import React, { useState, useMemo } from 'react';
import type { Document, Task, CalendarEvent, TaskPriority } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { SortAscendingIcon } from './icons/SortAscendingIcon';
import { SortDescendingIcon } from './icons/SortDescendingIcon';
import AddTaskModal from './AddTaskModal';
import { XIcon } from './icons/XIcon';

const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const priorityDotStyles: { [key in TaskPriority]: string } = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-green-500',
};

const EventPill: React.FC<{ event: CalendarEvent; onClick?: (e: React.MouseEvent) => void }> = ({ event, onClick }) => {
    const typeStyles = {
        deadline: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200',
        upload: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        task: event.isCompleted ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 line-through' : 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200',
        holiday: 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-md truncate block w-full text-left flex items-center";
    const clickableClasses = onClick ? "hover:opacity-80 cursor-pointer" : "cursor-default";

    return (
        <div 
            title={event.title}
            onClick={onClick}
            className={`${baseClasses} ${typeStyles[event.type]} ${clickableClasses}`}
        >
            {event.type === 'task' && event.priority && (
                <span className={`w-2 h-2 rounded-full mr-1.5 flex-shrink-0 ${priorityDotStyles[event.priority]}`}></span>
            )}
            <span className="truncate">{event.title}</span>
        </div>
    );
};

const priorityStyles: { [key in TaskPriority]: { bg: string; text: string } } = {
    low: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
    medium: { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-800 dark:text-amber-200' },
    high: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
};

const TaskPanel: React.FC<{
    selectedDate: Date;
    tasks: Task[];
    onAddTask: (title: string, date: string, priority: TaskPriority) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
    onClose: () => void;
}> = ({ selectedDate, tasks, onAddTask, onToggleTask, onDeleteTask, onClose }) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        onAddTask(newTaskTitle, formatDateToYYYYMMDD(selectedDate), newTaskPriority);
        setNewTaskTitle('');
        setNewTaskPriority('medium');
    };

    const sortedTasks = useMemo(() => {
        const priorityOrder: Record<TaskPriority, number> = { high: 2, medium: 1, low: 0 };
        return [...tasks].sort((a, b) => {
            const priorityA = priorityOrder[a.priority];
            const priorityB = priorityOrder[b.priority];
            if (sortOrder === 'asc') {
                return priorityA - priorityB;
            }
            return priorityB - priorityA;
        });
    }, [tasks, sortOrder]);
    
    return (
        <div className="w-full md:w-96 flex-shrink-0 bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 flex flex-col h-full">
            <div className="flex justify-between items-center border-b dark:border-gray-700 pb-4">
                 <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">
                        Tasks for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <button 
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} 
                        className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        title={sortOrder === 'desc' ? 'Sort by priority (low to high)' : 'Sort by priority (high to low)'}
                        aria-label="Sort tasks by priority"
                    >
                        {sortOrder === 'desc' ? <SortDescendingIcon className="w-5 h-5" /> : <SortAscendingIcon className="w-5 h-5" />}
                    </button>
                </div>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close task panel">
                  <XIcon className="w-6 h-6" />
                </button>
            </div>
             <form onSubmit={handleAddTask} className="py-4 border-b dark:border-gray-700 space-y-3">
                 <input 
                    type="text"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                />
                <div className="flex items-center space-x-2">
                    <select
                        value={newTaskPriority}
                        onChange={e => setNewTaskPriority(e.target.value as TaskPriority)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                    <button type="submit" className="p-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 flex-shrink-0">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </div>
            </form>
            <div className="flex-grow space-y-3 overflow-y-auto pr-2 pt-4">
                {sortedTasks.length > 0 ? sortedTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                        <label className="flex items-center space-x-3 flex-grow cursor-pointer min-w-0">
                            <input 
                                type="checkbox" 
                                checked={task.isCompleted} 
                                onChange={() => onToggleTask(task.id)}
                                className="form-checkbox h-5 w-5 rounded text-blue-600 bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 flex-shrink-0"
                            />
                            <span className={`flex-grow truncate ${task.isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>{task.title}</span>
                        </label>
                        <div className="flex items-center flex-shrink-0">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${priorityStyles[task.priority].bg} ${priorityStyles[task.priority].text}`}>
                                {task.priority}
                            </span>
                            <button onClick={() => onDeleteTask(task.id)} className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <ClipboardCheckIcon className="w-12 h-12 mx-auto mb-2"/>
                        <p>No tasks for this day.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const getWeekStartDate = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

// --- View Components ---

const MonthView: React.FC<{ currentDate: Date; eventsByDate: Map<string, CalendarEvent[]>; onDayClick: (date: Date) => void; onViewDocument: (docId: string) => void; }> = ({ currentDate, eventsByDate, onDayClick, onViewDocument }) => {
    const cells = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0=Mon, 6=Sun
        const totalDays = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        const gridCells = [];
        for (let i = 0; i < firstDayOfWeek; i++) {
            gridCells.push(<div key={`empty-${i}`} className="border-r border-b dark:border-gray-700"></div>);
        }

        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDateToYYYYMMDD(date);
            const isToday = date.toDateString() === today.toDateString();
            const events = eventsByDate.get(dateStr) || [];

            gridCells.push(
                <div key={day} className="border-r border-b dark:border-gray-700 p-2 min-h-[80px] md:min-h-[120px] flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group relative" onClick={() => onDayClick(date)}>
                    <div className="flex justify-between items-start w-full">
                        <span className={`font-semibold text-sm ${isToday ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : 'w-7 h-7 flex items-center justify-center'}`}>{day}</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDayClick(date); }} 
                            className="p-1 rounded-full text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label={`Add task for ${date.toLocaleDateString()}`}
                            title={`Add task for ${date.toLocaleDateString()}`}
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="mt-1 space-y-1 overflow-hidden">
                        {events.slice(0, 2).map(event => (
                            <EventPill key={event.id} event={event} onClick={event.documentId ? (e) => { e.stopPropagation(); onViewDocument(event.documentId!); } : undefined} />
                        ))}
                         {events.length > 2 && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">+{events.length - 2} more</div>}
                    </div>
                </div>
            );
        }
        return gridCells;
    }, [currentDate, eventsByDate, onDayClick, onViewDocument]);

    return (
        <>
            <div className="grid grid-cols-7 text-center font-semibold text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day} className="py-2">{day.substring(0,1)}</div>)}
            </div>
            <div className="grid grid-cols-7">{cells}</div>
        </>
    );
};

const WeekView: React.FC<{ currentDate: Date; eventsByDate: Map<string, CalendarEvent[]>; onDayClick: (date: Date) => void; onViewDocument: (docId: string) => void; }> = ({ currentDate, eventsByDate, onDayClick, onViewDocument }) => {
    const weekDays = useMemo(() => {
        const start = getWeekStartDate(currentDate);
        return Array.from({ length: 7 }).map((_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }, [currentDate]);

    const today = new Date();

    return (
        <div className="grid grid-cols-7 flex-grow">
            {weekDays.map(date => {
                const dateStr = formatDateToYYYYMMDD(date);
                const events = eventsByDate.get(dateStr) || [];
                const isToday = date.toDateString() === today.toDateString();
                return (
                    <div key={dateStr} className="border-r dark:border-gray-700 flex flex-col">
                        <div onClick={() => onDayClick(date)} className={`p-2 text-center border-b dark:border-gray-700 cursor-pointer ${isToday ? 'bg-blue-50 dark:bg-blue-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} group relative`}>
                            <div className="absolute top-2 right-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDayClick(date); }} 
                                    className="p-1 rounded-full text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label={`Add task for ${date.toLocaleDateString()}`}
                                    title={`Add task for ${date.toLocaleDateString()}`}
                                >
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{date.toLocaleDateString('default', { weekday: 'short' })}</p>
                            <p className={`text-2xl font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>{date.getDate()}</p>
                        </div>
                        <div className="p-2 space-y-2 flex-grow overflow-y-auto">
                            {events.map(event => (
                                <EventPill key={event.id} event={event} onClick={event.documentId ? () => onViewDocument(event.documentId!) : undefined} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const DayView: React.FC<{ currentDate: Date; eventsByDate: Map<string, CalendarEvent[]>; onDayClick: (date: Date) => void; onViewDocument: (docId: string) => void; }> = ({ currentDate, eventsByDate, onDayClick, onViewDocument }) => {
    const dateStr = formatDateToYYYYMMDD(currentDate);
    const events = eventsByDate.get(dateStr) || [];

    return (
        <div className="p-4 border-t dark:border-gray-700 h-full overflow-y-auto">
            <button onClick={() => onDayClick(currentDate)} className="text-blue-600 dark:text-blue-400 hover:underline mb-4 text-sm font-semibold">Manage Tasks for this Day</button>
            {events.length > 0 ? (
                <div className="space-y-3">
                    {events.map(event => (
                        <div key={event.id} className="flex items-start space-x-3">
                             <div className="w-16 text-right text-xs pt-1.5 font-semibold text-gray-500 dark:text-gray-400">
                                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </div>
                            <EventPill event={event} onClick={event.documentId ? () => onViewDocument(event.documentId!) : undefined} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 pt-16">
                    <p>No events scheduled for this day.</p>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

interface CalendarViewProps {
  documents: Document[];
  tasks: Task[];
  holidays: { date: string, name: string }[];
  onAddTask: (title: string, date: string, priority: TaskPriority) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onViewDocument: (docId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ documents, tasks, holidays, onAddTask, onToggleTask, onDeleteTask, onViewDocument }) => {
    type ViewMode = 'month' | 'week' | 'day';
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

    const eventsByDate = useMemo(() => {
        const allEvents: CalendarEvent[] = [
            ...documents.flatMap(doc => [
                { id: doc.id, date: doc.uploadDate.split('T')[0], title: doc.name, type: 'upload' as const, documentId: doc.id },
                ...(doc.reminderDate ? [{ id: `${doc.id}-deadline`, date: doc.reminderDate, title: doc.name, type: 'deadline' as const, documentId: doc.id }] : [])
            ]),
            ...tasks.map(task => ({ id: task.id, date: task.date, title: task.title, type: 'task' as const, isCompleted: task.isCompleted, priority: task.priority })),
            ...holidays.map(holiday => ({ id: holiday.name, date: holiday.date, title: holiday.name, type: 'holiday' as const }))
        ];

        return allEvents.reduce((acc, event) => {
            const list = acc.get(event.date) || [];
            list.push(event);
            acc.set(event.date, list);
            return acc;
        }, new Map<string, CalendarEvent[]>());
    }, [documents, tasks, holidays]);
    
    const handleNavigate = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (viewMode === 'month') {
                newDate.setDate(1);
                newDate.setMonth(newDate.getMonth() + offset);
            } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() + (offset * 7));
            } else {
                newDate.setDate(newDate.getDate() + offset);
            }
            return newDate;
        });
    };
    
    const goToToday = () => setCurrentDate(new Date());

    const getHeaderText = () => {
        if (viewMode === 'month') return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (viewMode === 'week') {
            const start = getWeekStartDate(currentDate);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            if (start.getFullYear() !== end.getFullYear()) return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
            if (start.getMonth() !== end.getMonth()) return `${start.toLocaleString('default', { month: 'short', day: 'numeric' })} - ${end.toLocaleString('default', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
            return `${start.toLocaleString('default', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
        }
        return currentDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 h-full">
            <div className={`flex-grow bg-white dark:bg-gray-900 rounded-lg shadow-md flex-col ${selectedDate ? 'hidden md:flex' : 'flex'}`}>
                <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b dark:border-gray-700 gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleNavigate(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-6 h-6"/></button>
                        <button onClick={() => handleNavigate(1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ChevronRightIcon className="w-6 h-6"/></button>
                        <button onClick={goToToday} className="px-4 py-2 text-sm font-semibold border dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">Today</button>
                        <button
                            onClick={() => setIsAddTaskModalOpen(true)}
                            className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition text-sm font-semibold"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add Task
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-center order-first md:order-none">{getHeaderText()}</h2>
                    <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        {(['month', 'week', 'day'] as const).map(mode => (
                            <button key={mode} onClick={() => setViewMode(mode)} className={`px-3 py-1 rounded-md transition-colors text-sm font-semibold capitalize ${viewMode === mode ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-400'}`}>
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-grow flex flex-col">
                    {viewMode === 'month' && <MonthView currentDate={currentDate} eventsByDate={eventsByDate} onDayClick={handleDayClick} onViewDocument={onViewDocument} />}
                    {viewMode === 'week' && <WeekView currentDate={currentDate} eventsByDate={eventsByDate} onDayClick={handleDayClick} onViewDocument={onViewDocument} />}
                    {viewMode === 'day' && <DayView currentDate={currentDate} eventsByDate={eventsByDate} onDayClick={handleDayClick} onViewDocument={onViewDocument} />}
                </div>

            </div>
            {selectedDate && (
                <TaskPanel 
                    selectedDate={selectedDate}
                    tasks={tasks.filter(t => t.date === formatDateToYYYYMMDD(selectedDate))}
                    onAddTask={onAddTask}
                    onToggleTask={onToggleTask}
                    onDeleteTask={onDeleteTask}
                    onClose={() => setSelectedDate(null)}
                />
            )}
            {isAddTaskModalOpen && (
                <AddTaskModal
                    isOpen={isAddTaskModalOpen}
                    onClose={() => setIsAddTaskModalOpen(false)}
                    onAddTask={onAddTask}
                    defaultDate={currentDate}
                />
            )}
        </div>
    );
};