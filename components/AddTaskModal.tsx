import React, { useState, useRef, useEffect } from 'react';
import type { TaskPriority } from '../types';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (title: string, date: string, priority: TaskPriority) => void;
  defaultDate: Date;
}

const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, defaultDate }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(formatDateToYYYYMMDD(defaultDate));
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDate(formatDateToYYYYMMDD(defaultDate)); // Reset date if modal reopens with new default
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, defaultDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Task title cannot be empty.');
      return;
    }
    onAddTask(title, date, priority);
    setTitle('');
    setPriority('medium');
    onClose();
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-4">
                <ClipboardCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Task</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Title</label>
                <input
                  ref={titleInputRef}
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Review structural analysis report"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="task-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                    <input
                      id="task-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                </div>
                <div>
                  <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                  <select
                    id="task-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 px-8 py-4 flex justify-end space-x-3 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;