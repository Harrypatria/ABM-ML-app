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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <span>Pilih Karyawan dari Data Lampiran (1.470 Data)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih data karyawan aktual dari dataset IBM HR untuk diuji di kalkulator & SHAP waterfall
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, ID (EMP-0001), peran, atau departemen..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>

          {/* Attrition Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">Status Aktual:</span>
            <button
              onClick={() => setFilterAttrition('ALL')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                filterAttrition === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Semua ({employees.length})
            </button>
            <button
              onClick={() => setFilterAttrition('Yes')}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                filterAttrition === 'Yes'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-medium'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <AlertOctagon className="w-3 h-3 text-rose-400" />
              <span>Keluar (237)</span>
            </button>
            <button
              onClick={() => setFilterAttrition('No')}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                filterAttrition === 'No'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Aktif (1.233)</span>
            </button>
          </div>

          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Semua Departemen</option>
            <option value="Research & Development">R&D</option>
            <option value="Sales">Sales</option>
            <option value="Human Resources">HR</option>
          </select>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2">
          {filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ada karyawan yang cocok dengan kriteria pencarian.
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
                  className="px-4 py-3 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-semibold text-cyan-300 group-hover:border-cyan-500/50">
                      {emp.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
                          {emp.fullName}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{emp.employeeRef}</span>
                        {isDeparted ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Historis: Keluar (Yes)
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Historis: Aktif (No)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{emp.jobRole}</span>
                        <span>·</span>
                        <span>{emp.department}</span>
                        <span>·</span>
                        <span>Usia: {emp.age} thn</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-xs font-mono font-medium text-slate-200">
                        ${emp.monthlyIncome.toLocaleString()}/bln
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Lembur:{' '}
                        <span className={emp.overTime === 'Yes' ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                          {emp.overTime}
                        </span>
                        {' · '}Masa Kerja: {emp.yearsAtCompany} thn
                      </div>
                    </div>

                    <button className="px-3 py-1.5 text-xs font-semibold rounded bg-cyan-400 text-slate-950 group-hover:bg-cyan-300 transition-colors whitespace-nowrap">
                      Pilih
                    </button>
                  </div>
                </div>
              );
            })
          )}
          {filteredEmployees.length > 100 && (
            <div className="p-3 text-center text-xs text-slate-400 font-mono">
              Menampilkan 100 dari {filteredEmployees.length} karyawan. Gunakan pencarian untuk menyaring lebih spesifik.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Total {filteredEmployees.length} data karyawan ditemukan</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-slate-400 hover:text-slate-200 border border-slate-800 rounded hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
