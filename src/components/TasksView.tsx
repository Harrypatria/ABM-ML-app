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

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'TODO', label: 'To Do', color: 'border-slate-700 bg-slate-900/40' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-cyan-500/30 bg-cyan-950/10' },
  { id: 'DONE', label: 'Completed', color: 'border-emerald-500/30 bg-emerald-950/10' },
  { id: 'CANCELLED', label: 'Cancelled', color: 'border-slate-800 bg-slate-950/40' },
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
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'HIGH':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MEDIUM':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'LOW':
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-100">
            Retention Operations Kanban
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ITDO Operations Layer · Driving evidence-based interventions from insight to resolution
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Filter Assignee:</span>
            <select
              value={filterPartner}
              onChange={(e) => setFilterPartner(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
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
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-slate-400 uppercase text-[10px]">Active Backlog</div>
          <div className="text-xl font-bold text-slate-100 mt-0.5 tabular-nums">
            {tasks.filter((t) => t.status === 'TODO').length}
          </div>
        </div>
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-cyan-400 uppercase text-[10px]">In Progress</div>
          <div className="text-xl font-bold text-cyan-400 mt-0.5 tabular-nums">
            {tasks.filter((t) => t.status === 'IN_PROGRESS').length}
          </div>
        </div>
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-emerald-400 uppercase text-[10px]">Interventions Completed</div>
          <div className="text-xl font-bold text-emerald-400 mt-0.5 tabular-nums">
            {tasks.filter((t) => t.status === 'DONE').length}
          </div>
        </div>
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-amber-400 uppercase text-[10px]">Resolution Efficiency</div>
          <div className="text-xl font-bold text-amber-300 mt-0.5 tabular-nums">
            {tasks.length > 0
              ? `${Math.round((tasks.filter((t) => t.status === 'DONE').length / tasks.length) * 100)}%`
              : '0%'}
          </div>
        </div>
      </div>

      {/* 4-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((column) => {
          const colTasks = filteredTasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className={`rounded-2xl border p-4 min-h-[520px] flex flex-col space-y-3 ${column.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  {column.label}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 tabular-nums">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No tasks in {column.label.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-slate-900/95 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-md space-y-3 transition-colors"
                    >
                      {/* Priority and Employee Header */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {task.employeeRef}
                        </span>
                      </div>

                      {/* Title & Employee Name */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 line-clamp-2">
                          {task.title}
                        </h4>
                        <div className="text-[11px] text-cyan-400 font-medium mt-0.5">
                          {task.employeeName}
                        </div>
                      </div>

                      {/* Intervention text */}
                      <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed">
                        <div className="text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
                          Action
                        </div>
                        {task.intervention}
                      </div>

                      {/* Due date & Assignee */}
                      <div className="flex flex-col gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                        <div className="flex items-center gap-1.5 truncate">
                          <User className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{task.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>Due {task.dueDate}</span>
                        </div>
                      </div>

                      {/* Move / Action Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="TODO">Move: To Do</option>
                          <option value="IN_PROGRESS">Move: In Progress</option>
                          <option value="DONE">Move: Completed</option>
                          <option value="CANCELLED">Move: Cancelled</option>
                        </select>

                        <button
                          onClick={() => deleteTask(task.id)}
                          title="Delete Task"
                          className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSave={(saved) => {
            saveTask(saved);
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          initialData={editingTask || undefined}
        />
      )}
    </div>
  );
};
