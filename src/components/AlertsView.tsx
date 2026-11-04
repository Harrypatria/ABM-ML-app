import React, { useState, useMemo } from 'react';
import {
  BellRing,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  Download,
  Filter,
  CheckSquare,
  Square,
  ClipboardList,
} from 'lucide-react';
import { AlertItem, AlertStatus, DepartmentType } from '../types';
import { getAlerts, updateAlertStatus, bulkAssignAlerts, getSettings } from '../lib/storage';
import { TaskModal } from './TaskModal';

export const AlertsView: React.FC = () => {
  const alerts = getAlerts();
  const settings = getSettings();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [partnerFilter, setPartnerFilter] = useState<string>('ALL');
  const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState<string>(settings.hrPartners[0] || '');
  const [taskModalData, setTaskModalData] = useState<any>(null);
  const [thresholdFilter, setThresholdFilter] = useState<number>(70);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      const matchDept = deptFilter === 'ALL' || a.department === deptFilter;
      const matchPartner = partnerFilter === 'ALL' || a.assignedTo === partnerFilter;
      const matchThreshold = a.attritionProbability * 100 >= thresholdFilter;
      return matchStatus && matchDept && matchPartner && matchThreshold;
    });
  }, [alerts, statusFilter, deptFilter, partnerFilter, thresholdFilter]);

  // Counts for status tabs
  const openCount = alerts.filter((a) => a.status === 'OPEN').length;
  const ackCount = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  const toggleSelectAll = () => {
    if (selectedAlertIds.length === filteredAlerts.length) {
      setSelectedAlertIds([]);
    } else {
      setSelectedAlertIds(filteredAlerts.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedAlertIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = () => {
    if (selectedAlertIds.length === 0 || !bulkAssignee) return;
    bulkAssignAlerts(selectedAlertIds, bulkAssignee);
    setSelectedAlertIds([]);
  };

  const handleExportCSV = () => {
    const headers = [
      'AlertID',
      'EmployeeRef',
      'EmployeeName',
      'Department',
      'JobRole',
      'AttritionProbability',
      'Status',
      'AssignedTo',
      'TopDriver',
      'CreatedAt',
    ].join(',');

    const rows = filteredAlerts.map((a) =>
      [
        a.id,
        a.employeeRef,
        `"${a.employeeName}"`,
        `"${a.department}"`,
        `"${a.jobRole}"`,
        (a.attritionProbability * 100).toFixed(1) + '%',
        a.status,
        `"${a.assignedTo}"`,
        `"${a.topDriver.replace(/"/g, '""')}"`,
        a.createdAt,
      ].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Attrition_Alerts_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-100">
            Alerts & Retention Triggers
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ITDO Triggers Layer · Automated event detection at threshold boundary for HR Business Partners
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Alerts</span>
          </button>
        </div>
      </div>

      {/* Threshold and Status Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Tab 1: All */}
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-xl border text-left transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 border-cyan-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">All Triggers</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1 tabular-nums">{alerts.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total recorded flight triggers</div>
        </button>

        {/* Status Tab 2: Open */}
        <button
          onClick={() => setStatusFilter('OPEN')}
          className={`p-4 rounded-xl border text-left transition-colors ${
            statusFilter === 'OPEN'
              ? 'bg-rose-950/20 border-rose-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="text-xs text-rose-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <BellRing className="w-3.5 h-3.5" />
            <span>Unacknowledged</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">{openCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Requires immediate HR intervention</div>
        </button>

        {/* Status Tab 3: Acknowledged */}
        <button
          onClick={() => setStatusFilter('ACKNOWLEDGED')}
          className={`p-4 rounded-xl border text-left transition-colors ${
            statusFilter === 'ACKNOWLEDGED'
              ? 'bg-amber-950/20 border-amber-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="text-xs text-amber-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Acknowledged</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">{ackCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">HRBP reviewing case context</div>
        </button>

        {/* Status Tab 4: Resolved */}
        <button
          onClick={() => setStatusFilter('RESOLVED')}
          className={`p-4 rounded-xl border text-left transition-colors ${
            statusFilter === 'RESOLVED'
              ? 'bg-emerald-950/20 border-emerald-500/50'
              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
          }`}
        >
          <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Resolved</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">{resolvedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Intervention active / resolved</div>
        </button>
      </div>

      {/* Threshold Slider and Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Threshold Slider */}
          <div className="flex items-center gap-4 min-w-[280px]">
            <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
              Threshold Cutoff:
            </span>
            <input
              type="range"
              min="40"
              max="90"
              step="5"
              value={thresholdFilter}
              onChange={(e) => setThresholdFilter(Number(e.target.value))}
              className="w-36 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
              &gt;{thresholdFilter}%
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Dept:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Departments</option>
                <option value="Research & Development">Research & Development</option>
                <option value="Sales">Sales</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assignee:</span>
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 max-w-[200px] truncate"
              >
                <option value="ALL">All Partners</option>
                {settings.hrPartners.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Action Controls if items selected */}
        {selectedAlertIds.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
            <div className="text-cyan-300 font-medium">
              <span className="font-mono font-bold">{selectedAlertIds.length}</span> alerts selected
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Reassign to:</span>
              <select
                value={bulkAssignee}
                onChange={(e) => setBulkAssignee(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
              >
                {settings.hrPartners.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkAssign}
                className="px-3 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded transition-colors whitespace-nowrap"
              >
                Apply Reassignment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-200">
                    {selectedAlertIds.length === filteredAlerts.length && filteredAlerts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Department & Role</th>
                <th className="px-4 py-3.5">Probability</th>
                <th className="px-4 py-3.5">Key Trigger Driver</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Assigned HR Partner</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No alerts match the chosen threshold ({thresholdFilter}%) and filters.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const probPct = Math.round(alert.attritionProbability * 100);
                  const isSelected = selectedAlertIds.includes(alert.id);

                  return (
                    <tr
                      key={alert.id}
                      className={`hover:bg-slate-850/60 transition-colors ${
                        isSelected ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => toggleSelectOne(alert.id)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Employee Ref & Name */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-100">{alert.employeeName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{alert.employeeRef}</div>
                      </td>

                      {/* Department & Role */}
                      <td className="px-4 py-3.5">
                        <div className="text-slate-300 font-medium">{alert.jobRole}</div>
                        <div className="text-[11px] text-slate-400">{alert.department}</div>
                      </td>

                      {/* Probability */}
                      <td className="px-4 py-3.5 font-mono">
                        <span className="text-rose-400 font-bold text-sm tabular-nums">
                          {probPct}%
                        </span>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                          Threshold &gt;{Math.round(alert.threshold * 100)}%
                        </div>
                      </td>

                      {/* Top Driver & Notes */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="text-slate-200 font-medium truncate" title={alert.topDriver}>
                          {alert.topDriver}
                        </div>
                        {alert.notes && (
                          <div className="text-[11px] text-slate-400 truncate mt-0.5 italic">
                            "{alert.notes}"
                          </div>
                        )}
                      </td>

                      {/* Status Selector */}
                      <td className="px-4 py-3.5">
                        <select
                          value={alert.status}
                          onChange={(e) => updateAlertStatus(alert.id, e.target.value as AlertStatus)}
                          className={`text-[11px] font-semibold uppercase px-2 py-1 rounded border bg-slate-950 cursor-pointer ${
                            alert.status === 'OPEN'
                              ? 'text-rose-400 border-rose-500/40'
                              : alert.status === 'ACKNOWLEDGED'
                              ? 'text-amber-400 border-amber-500/40'
                              : 'text-emerald-400 border-emerald-500/40'
                          }`}
                        >
                          <option value="OPEN">Open</option>
                          <option value="ACKNOWLEDGED">Acknowledged</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                      </td>

                      {/* Assignee */}
                      <td className="px-4 py-3.5 text-slate-300 text-[11px] truncate max-w-[160px]">
                        {alert.assignedTo || 'Unassigned'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setTaskModalData({
                              alertId: alert.id,
                              employeeId: alert.employeeId,
                              employeeRef: alert.employeeRef,
                              employeeName: alert.employeeName,
                              title: `Retention Task: ${alert.employeeName}`,
                              intervention: alert.topDriver,
                              priority: 'CRITICAL',
                              assignedTo: alert.assignedTo,
                            });
                          }}
                          className="flex items-center gap-1 ml-auto px-2.5 py-1 text-[11px] font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Create Task</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Creation Modal */}
      {taskModalData && (
        <TaskModal
          isOpen={true}
          onClose={() => setTaskModalData(null)}
          onSave={() => {
            updateAlertStatus(taskModalData.alertId, 'ACKNOWLEDGED', 'Operational task assigned.');
            setTaskModalData(null);
          }}
          initialData={taskModalData}
        />
      )}
    </div>
  );
};
