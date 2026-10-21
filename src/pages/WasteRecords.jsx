import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { wasteTypes, managementMethods } from '../utils/storage';
import { formatDate } from '../utils/formatting';
import { fetchWaste, deleteWaste } from '../features/waste/wasteSlice';
import { fetchProjects } from '../features/projects/projectSlice';
import { Search, Trash2, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';

export function WasteRecords() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { wasteRecords, loading, error } = useSelector(state => state.waste);
  const { projects } = useSelector(state => state.projects);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterProject, setFilterProject] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Load waste records and projects on mount
  useEffect(() => {
    dispatch(fetchWaste());
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this waste record?')) {
      setDeletingId(id);
      try {
        await dispatch(deleteWaste(id)).unwrap();
      } catch (err) {
        alert(`Failed to delete record: ${err}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Backend may return array or { waste: [...] }
  const recordsList = Array.isArray(wasteRecords) ? wasteRecords : (wasteRecords?.waste || []);

  const safeDate = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const filteredRecords = recordsList.filter(record => {
  const projName = typeof record.project === 'object' ? record.project?.name : (record.project || '');
  const wType = record.wasteType || '';
  const recId = record._id || record.id || '';
  const method = record.treatment || record.method || '';
  const status = record.status || 'Pending';
  const recDate = safeDate(record.generatedDate ?? record.date);
  const matchesSearch =
    String(projName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(wType).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(recId).toLowerCase().includes(searchTerm.toLowerCase());
  const matchesType = filterType === 'All' || wType === filterType;
  const matchesMethod = filterMethod === 'All' || method === filterMethod;
  const matchesProject = filterProject === 'All' || projName === filterProject;
  const matchesStatus = filterStatus === 'All' || status === filterStatus;
  const matchesDate = !filterDate || recDate === filterDate;
  return matchesSearch && matchesType && matchesMethod && matchesProject && matchesStatus && matchesDate;
});

  return (<ErrorBoundary>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Waste Records</h2>
          <p className="text-slate-500">Manage and view all construction waste entries stored in MongoDB.</p>
        </div>
        <Button onClick={() => navigate('/add-waste')}>Add New Record</Button>
      </div>

      <Card>
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by ID, project or waste type..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Project Filter */}
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
            >
              <option value="All">All Projects</option>
              {(Array.isArray(projects) ? projects : []).map(p => (
                <option key={p._id || p.id || p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
            {/* Waste Type Filter */}
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              {wasteTypes.map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
            {/* Treatment Method Filter */}
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value)}
            >
              <option value="All">All Treatments</option>
              {managementMethods.map(m => (<option key={m} value={m}>{m}</option>))}
            </select>
            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processed">Processed</option>
              <option value="Disposed">Disposed</option>
              <option value="Recycled">Recycled</option>
            </select>
            {/* Date Filter */}
            <input
              type="date"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-danger-50 border-b border-danger-200 text-danger-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Failed to load waste records: {error}</span>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex items-center gap-2 text-primary-600 font-medium">
                <Loader2 className="w-6 h-6 animate-spin" /> Loading waste records...
              </div>
            </div>
          )}
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Project & Date</th>
                <th className="px-6 py-4 font-medium">Waste Details</th>
                <th className="px-6 py-4 font-medium">Activity</th>
                <th className="px-6 py-4 font-medium">Treatment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(filteredRecords) ? filteredRecords : []).map(record => {
                const projName = typeof record.project === 'object' ? record.project?.name : (record.project || 'General Site');
                const method = record.treatment || record.method || 'Reuse';
                const recDate = record.generatedDate || record.date;
                const recId = record._id || record.id;
                const activity = record.constructionActivity || record.activity || '-';
                return (
  <tr key={recId} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
    <td className="px-6 py-4">
      <p className="font-medium text-slate-900">{projName}</p>
      <p className="text-xs text-slate-500 mt-1">{recDate ? formatDate(recDate) : 'N/A'}</p>
    </td>
    <td className="px-6 py-4">
      <p className="font-medium text-slate-800">{record.wasteType}</p>
      <p className="text-sm text-slate-600 mt-1">{record.quantity} {record.unit}</p>
    </td>
    <td className="px-6 py-4 text-slate-600">{activity}</td>
    <td className="px-6 py-4">
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
        method === 'Reuse' || method === 'Reused' ? 'bg-primary-50 text-primary-700 border-primary-200' : ''
      } ${
        method === 'Recycle' || method === 'Recycled' ? 'bg-success-50 text-success-700 border-success-200' : ''
      } ${
        method === 'Disposal' || method === 'Dispose' || method === 'Disposed' ? 'bg-warning-50 text-warning-700 border-warning-200' : ''
      }`}
      >{method}</span>
    </td>
    <td className="px-6 py-4">
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        record.status === 'Processed' || record.status === 'Recycled' ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-700'
      }`}>{record.status || 'Pending'}</span>
    </td>
    <td className="px-6 py-4 text-right">
      <button onClick={() => handleDelete(recId)} disabled={deletingId === recId}
        className="text-slate-400 hover:text-danger-500 transition-colors p-2 rounded-lg hover:bg-danger-50 disabled:opacity-50"
        title="Delete Record">
        {deletingId === recId ? (<Loader2 className="w-4 h-4 animate-spin text-danger-500" />) : (<Trash2 className="w-4 h-4" />)}
      </button>
    </td>
  </tr>
);
              })}
              {!loading && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <p className="text-slate-500 mb-2">No waste records found matching your filters.</p>
                    <Button variant="ghost" onClick={() => {
                      setSearchTerm(''); setFilterType('All'); setFilterMethod('All'); setFilterProject('All'); setFilterStatus('All'); setFilterDate('');
                    }}>Clear Filters</Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between text-sm text-slate-500">
          <div>Showing {filteredRecords.length} records</div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled className="px-2"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="secondary" size="sm" disabled className="px-2"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
   </ErrorBoundary>
  );
}
