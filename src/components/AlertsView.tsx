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
      'EmployeeID',
      'EmployeeName',
      'Department',
      'JobRole',
      'AttritionProbability',
      'Status',
      'AssignedTo',
      'PrimaryDriver',
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
    link.download = `Retention_Triggers_Alerts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900">
            Retention Triggers & Alerts Queue
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ITDO Triggers Layer · Automated escalations for employees crossing the 70% departure probability threshold.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Alerts CSV</span>
        </button>
      </div>

      {/* KPI Status Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Open Triggers */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'OPEN' ? 'ALL' : 'OPEN')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'OPEN'
              ? 'bg-rose-50/80 border-rose-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Open Triggers (Needs Action)
            </span>
            <BellRing className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {openCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Immediate HRBP review required
          </div>
        </div>

        {/* Acknowledged */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'ACKNOWLEDGED' ? 'ALL' : 'ACKNOWLEDGED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ACKNOWLEDGED'
              ? 'bg-amber-50/80 border-amber-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Under Review (Acknowledged)
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {ackCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Intervention strategy in formulation
          </div>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'RESOLVED' ? 'ALL' : 'RESOLVED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'RESOLVED'
              ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Resolved Cases
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {resolvedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Proactive retention plan assigned
          </div>
        </div>
      </div>

      {/* Filter and Bulk Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        {/* Multi-select and Bulk Assign */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            {selectedAlertIds.length === filteredAlerts.length && filteredAlerts.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-cyan-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Select All ({selectedAlertIds.length})</span>
          </button>

          {selectedAlertIds.length > 0 && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <select
                value={bulkAssignee}
                onChange={(e) => setBulkAssignee(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
              >
                {settings.hrPartners.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkAssign}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors cursor-pointer shadow-2xs"
              >
                Reassign Selected
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold text-slate-700">Threshold:</span>
            <select
              value={thresholdFilter}
              onChange={(e) => setThresholdFilter(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:outline-none focus:border-cyan-600"
            >
              <option value={70}>&ge; 70% (Critical)</option>
              <option value={60}>&ge; 60%</option>
              <option value={50}>&ge; 50%</option>
              <option value={0}>All Risks</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:outline-none focus:border-cyan-600"
            >
              <option value="ALL">All Departments</option>
              <option value="Research & Development">R&D</option>
              <option value="Sales">Sales</option>
              <option value="Human Resources">HR</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="font-semibold text-slate-700">Partner:</span>
            <select
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-900 focus:outline-none focus:border-cyan-600 max-w-[150px] truncate"
            >
              <option value="ALL">All HRBPs</option>
              {settings.hrPartners.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="w-10 px-4 py-3.5"></th>
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Department & Role</th>
                <th className="px-4 py-3.5">Flight Probability</th>
                <th className="px-4 py-3.5">Primary Root Driver</th>
                <th className="px-4 py-3.5">Assigned HRBP</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500 text-xs">
                    No active triggers match your filter criteria. Your retention queue is up to date.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const isSelected = selectedAlertIds.includes(alert.id);
                  const probPct = Math.round(alert.attritionProbability * 100);

                  return (
                    <tr
                      key={alert.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-cyan-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => toggleSelectOne(alert.id)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{alert.employeeName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{alert.employeeRef}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-slate-800 font-medium">{alert.jobRole}</div>
                        <div className="text-[11px] text-slate-500">{alert.department}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm text-rose-700 tabular-nums">
                            {probPct}%
                          </span>
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 uppercase">
                            HIGH
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-[200px]">
                        <span className="truncate block text-slate-700 text-[11px]" title={alert.topDriver}>
                          {alert.topDriver}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">
                        <span className="truncate block max-w-[150px] font-medium" title={alert.assignedTo}>
                          {alert.assignedTo}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          value={alert.status}
                          onChange={(e) => updateAlertStatus(alert.id, e.target.value as AlertStatus)}
                          className={`font-semibold rounded-lg px-2 py-1 text-xs border cursor-pointer ${
                            alert.status === 'OPEN'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : alert.status === 'ACKNOWLEDGED'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <option value="OPEN">Open</option>
                          <option value="ACKNOWLEDGED">Acknowledged</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() =>
                            setTaskModalData({
                              alertId: alert.id,
                              employeeId: alert.employeeId,
                              employeeRef: alert.employeeRef,
                              employeeName: alert.employeeName,
                              title: `Retention Plan: ${alert.employeeName}`,
                              description: `Follow-up on high flight risk trigger (${probPct}%). Key driver: ${alert.topDriver}.`,
                              priority: 'CRITICAL',
                              assignedTo: alert.assignedTo,
                            })
                          }
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
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
            updateAlertStatus(taskModalData.alertId, 'ACKNOWLEDGED');
            setTaskModalData(null);
          }}
          initialData={taskModalData}
        />
      )}
    </div>
  );
};
