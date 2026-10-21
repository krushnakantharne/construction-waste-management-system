import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWasteReport, fetchFinancialReport, fetchProjectReport } from '../features/reports/reportSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FileText, Download } from 'lucide-react';

export function Reports() {
  const dispatch = useDispatch();
  const { wasteReport, financialReport, projectReport, loading } = useSelector(state => state.reports);

  useEffect(() => {
    dispatch(fetchWasteReport());
    dispatch(fetchFinancialReport());
    dispatch(fetchProjectReport());
  }, [dispatch]);

  let totalTons = 0, reusedTons = 0, recycledTons = 0, disposedTons = 0;
  if (wasteReport && wasteReport.length > 0) {
    wasteReport.forEach(w => {
      totalTons += w.quantity;
      if (w.treatment === 'Reuse' || w.treatment === 'Reused') reusedTons += w.quantity;
      if (w.treatment === 'Recycle' || w.treatment === 'Recycled') recycledTons += w.quantity;
      if (w.treatment === 'Dispose' || w.treatment === 'Disposed') disposedTons += w.quantity;
    });
  }
  const recoveryRate = totalTons > 0 ? (((reusedTons + recycledTons) / totalTons) * 100).toFixed(1) : 0;

  let totalCost = 0, totalRevenue = 0;
  if (financialReport && financialReport.length > 0) {
    financialReport.forEach(t => {
      if (t.type === 'Expense') totalCost += t.amount;
      if (t.type === 'Income' || t.type === 'Revenue') totalRevenue += t.amount;
    });
  }
  const netCost = totalCost - totalRevenue;
  const estimatedSavings = 0;

  let projectData = [];
  if (projectReport && projectReport.length > 0 && wasteReport && wasteReport.length > 0) {
    projectData = projectReport.map(p => {
      const pRecords = wasteReport.filter(r => (r.project?._id || r.project) === p._id);
      let gen = 0, rec = 0;
      pRecords.forEach(r => {
        gen += r.quantity;
        if (r.treatment === 'Reuse' || r.treatment === 'Recycle' || r.treatment === 'Reused' || r.treatment === 'Recycled') {
          rec += r.quantity;
        }
      });
      return {
        name: p.name,
        Generated: gen,
        Recovered: rec,
        RecoveryRate: gen > 0 ? ((rec / gen) * 100).toFixed(0) : 0
      };
    });
  }

  const handleExportCSV = () => {
    if (!wasteReport || wasteReport.length === 0) {
      alert("No data to export.");
      return;
    }
    
    const headers = ['ID', 'Project', 'Waste Type', 'Quantity', 'Unit', 'Treatment', 'Date', 'Status'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    wasteReport.forEach(r => {
      const row = [
        r._id, 
        `"${r.project?.name || r.project}"`, 
        r.wasteType, 
        r.quantity, 
        r.unit, 
        r.treatment, 
        r.createdAt ? new Date(r.createdAt).toISOString() : '', 
        r.status
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'waste_records_report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
          <p className="text-slate-500">Comprehensive overview of system performance and metrics.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Generate Full Report
          </Button>
        </div>
      </div>

      {loading && <p>Loading reports...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Waste Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Total Generated</span>
                <span className="font-bold text-slate-800">{totalTons} Tons</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Total Reused</span>
                <span className="font-bold text-primary-600">{reusedTons} Tons</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Total Recycled</span>
                <span className="font-bold text-success-600">{recycledTons} Tons</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Total Disposed</span>
                <span className="font-bold text-warning-600">{disposedTons} Tons</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-slate-50 px-3 rounded-lg">
                <span className="font-medium text-slate-700">Overall Recovery Rate</span>
                <span className="font-bold text-slate-900">{recoveryRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Total Management Cost</span>
                <span className="font-bold text-red-600">₹{totalCost}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Recovery Revenue</span>
                <span className="font-bold text-success-600">₹{totalRevenue}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Net Cost</span>
                <span className="font-bold text-slate-800">₹{netCost}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-slate-50 px-3 rounded-lg">
                <span className="font-medium text-slate-700">Estimated Savings (Inventory)</span>
                <span className="font-bold text-primary-600">₹{estimatedSavings}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{fontSize: 12}} />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
              <Tooltip formatter={(value, name) => [name === 'RecoveryRate' ? `${value}%` : `${value.toFixed(2)} Tons`, name]} />
              <Legend verticalAlign="top" height={36}/>
              <Bar yAxisId="left" dataKey="Generated" fill="#3b82f6" name="Generated (Tons)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="Recovered" fill="#8b5cf6" name="Recovered (Tons)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
