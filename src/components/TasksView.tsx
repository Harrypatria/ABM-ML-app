import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Calendar,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Clock,
} from 'lucide-react';
import { TaskItem, TaskStatus, TaskPriority } from '../types';
import { getTasks, updateTaskStatus, deleteTask, saveTask, getSettings } from '../lib/storage';
import { TaskModal } from './TaskModal';

const COLUMNS: { id: TaskStatus; label: string; headerColor: string; bgClass: string }[] = [
  { id: 'TODO', label: 'To Do', headerColor: 'text-slate-800', bgClass: 'bg-slate-100/60 border-slate-200' },
  { id: 'IN_PROGRESS', label: 'In Progress', headerColor: 'text-cyan-800', bgClass: 'bg-cyan-50/50 border-cyan-200' },
  { id: 'DONE', label: 'Completed', headerColor: 'text-emerald-800', bgClass: 'bg-emerald-50/50 border-emerald-200' },
  { id: 'CANCELLED', label: 'Archived', headerColor: 'text-slate-500', bgClass: 'bg-slate-100/40 border-slate-200' },
];

export const TasksView: React.FC = () => {
  const tasks = getTasks();
  const settings = getSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [filterPartner, setFilterPartner] = useState<string>('ALL');

  const filteredTasks = tasks.filter(
    (t) => filterPartner === 'ALL' || t.assignedTo === filterPartner
  );

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-rose-800 bg-rose-50 border-rose-200 font-bold';
      case 'HIGH':
        return 'text-amber-800 bg-amber-50 border-amber-200 font-bold';
      case 'MEDIUM':
        return 'text-cyan-800 bg-cyan-50 border-cyan-200';
      case 'LOW':
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">
            Retention Action Board
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ITDO Operations Layer · Execute evidence-based interventions from flight triggers to resolution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Assignee:</span>
            <select
              value={filterPartner}
              onChange={(e) => setFilterPartner(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
            >
              <option value="ALL">All HR Partners</option>
              {settings.hrPartners.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-4 flex flex-col min-h-[480px] shadow-2xs ${col.bgClass}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.headerColor}`}>
                  {col.label}
                </span>
                <span className="w-5 h-5 rounded-full bg-white text-slate-700 flex items-center justify-center font-mono text-[11px] font-bold border border-slate-200 shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No tasks in this lane
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                    >
                      {/* Priority & Delete */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-slate-300 hover:text-rose-600 transition-colors p-1 rounded cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title & Employee */}
                      <div>
                        <h4
                          onClick={() => {
                            setEditingTask(task);
                            setIsModalOpen(true);
                          }}
                          className="text-xs font-bold text-slate-900 hover:text-cyan-700 transition-colors cursor-pointer line-clamp-2"
                        >
                          {task.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-medium text-slate-700">{task.employeeName}</span>
                          <span className="font-mono text-slate-400">({task.employeeRef})</span>
                        </div>
                      </div>

                      {/* Intervention summary */}
                      <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                        {task.intervention}
                      </p>

                      {/* Due Date & Assignee */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{task.dueDate}</span>
                        </div>
                        <span className="truncate max-w-[110px] font-medium text-slate-700" title={task.assignedTo}>
                          {task.assignedTo.split(' ')[0]}
                        </span>
                      </div>

                      {/* Quick Status Shift Buttons */}
                      <div className="flex items-center justify-between pt-1 gap-1">
                        {col.id !== 'TODO' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'TODO')}
                            className="text-[10px] text-slate-500 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            ← To Do
                          </button>
                        )}
                        {col.id !== 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="text-[10px] text-cyan-700 hover:text-cyan-900 font-semibold px-1.5 py-0.5 rounded hover:bg-cyan-50 cursor-pointer"
                          >
                            In Progress →
                          </button>
                        )}
                        {col.id !== 'DONE' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'DONE')}
                            className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold px-1.5 py-0.5 rounded hover:bg-emerald-50 cursor-pointer"
                          >
                            Complete ✓
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal for Create / Edit */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={(task) => {
          saveTask(task);
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        initialData={editingTask || undefined}
      />
    </div>
  );
};
