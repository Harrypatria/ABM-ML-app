import React, { useState, useMemo } from 'react';
import { X, Search, Filter, UserCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { EmployeeProfile, DepartmentType } from '../types';
import { getEmployees } from '../lib/storage';

interface EmployeePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (employee: EmployeeProfile) => void;
}

export const EmployeePickerModal: React.FC<EmployeePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const employees = getEmployees();
  const [search, setSearch] = useState('');
  const [filterAttrition, setFilterAttrition] = useState<'ALL' | 'Yes' | 'No'>('ALL');
  const [filterDept, setFilterDept] = useState<string>('ALL');

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
        emp.employeeRef.toLowerCase().includes(search.toLowerCase()) ||
        emp.jobRole.toLowerCase().includes(search.toLowerCase());

      const matchesAttrition =
        filterAttrition === 'ALL' ||
        (filterAttrition === 'Yes' && emp.actualAttrition === 'Yes') ||
        (filterAttrition === 'No' && emp.actualAttrition !== 'Yes');

      const matchesDept = filterDept === 'ALL' || emp.department === filterDept;

      return matchesSearch && matchesAttrition && matchesDept;
    });
  }, [employees, search, filterAttrition, filterDept]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-600" />
              <span>Select Employee from Benchmark Cohort</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose an employee from the 1,470-record IBM HR dataset to inspect their profile and test retention levers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID (e.g. EMP-0001), or job role..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
              autoFocus
            />
          </div>

          {/* Attrition Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-medium">Historical Status:</span>
            <button
              onClick={() => setFilterAttrition('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterAttrition === 'ALL'
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              All ({employees.length})
            </button>
            <button
              onClick={() => setFilterAttrition('Yes')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                filterAttrition === 'Yes'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>Departed (237)</span>
            </button>
            <button
              onClick={() => setFilterAttrition('No')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                filterAttrition === 'No'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Retained (1,233)</span>
            </button>
          </div>

          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-cyan-600"
          >
            <option value="ALL">All Departments</option>
            <option value="Research & Development">R&D</option>
            <option value="Sales">Sales</option>
            <option value="Human Resources">HR</option>
          </select>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No employees found matching your search. Try adjusting your query or filters.
            </div>
          ) : (
            filteredEmployees.slice(0, 100).map((emp) => {
              const isDeparted = emp.actualAttrition === 'Yes';
              return (
                <div
                  key={emp.id}
                  onClick={() => {
                    onSelect(emp);
                    onClose();
                  }}
                  className="px-4 py-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-mono text-xs font-bold text-cyan-800 group-hover:border-cyan-400">
                      {emp.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 group-hover:text-cyan-700 transition-colors">
                          {emp.fullName}
                        </span>
                        <span className="text-xs font-mono text-slate-500">{emp.employeeRef}</span>
                        {isDeparted ? (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Departed (Yes)
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Retained (No)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{emp.jobRole}</span>
                        <span>·</span>
                        <span>{emp.department}</span>
                        <span>·</span>
                        <span>Age: {emp.age}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-xs font-mono font-semibold text-slate-900">
                        ${emp.monthlyIncome.toLocaleString()} / mo
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Overtime:{' '}
                        <span className={emp.overTime === 'Yes' ? 'text-rose-700 font-bold' : 'text-slate-600'}>
                          {emp.overTime}
                        </span>
                        {' · '}Tenure: {emp.yearsAtCompany} yrs
                      </div>
                    </div>

                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white group-hover:bg-cyan-600 transition-colors whitespace-nowrap shadow-2xs">
                      Select
                    </button>
                  </div>
                </div>
              );
            })
          )}
          {filteredEmployees.length > 100 && (
            <div className="p-3 text-center text-xs text-slate-500 font-mono">
              Showing top 100 matches of {filteredEmployees.length}. Narrow your search for specific records.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredEmployees.length.toLocaleString()} employee records match criteria</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
