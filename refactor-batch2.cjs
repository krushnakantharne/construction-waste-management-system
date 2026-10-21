const fs = require('fs');
const path = require('path');

const writeComponent = (name, content) => {
  fs.writeFileSync(path.join(__dirname, 'src', 'pages', name), content);
};

writeComponent('CostRevenue.jsx', `import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions, createTransaction } from '../features/transactions/transactionSlice';
import { fetchDashboardSummary } from '../features/dashboard/dashboardSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { TrendingUp, TrendingDown, IndianRupee, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Button } from '../components/ui/Button';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#a855f7'];

export function CostRevenue() {
  const dispatch = useDispatch();
  const { transactions, loading, error } = useSelector(state => state.transactions);
  const { summary } = useSelector(state => state.dashboard);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    project: '',
    type: 'Expense',
    category: 'Transportation',
    amount: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchTransactions());
    if (!summary) dispatch(fetchDashboardSummary());
  }, [dispatch, summary]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createTransaction({ ...formData, amount: Number(formData.amount) }));
    setIsModalOpen(false);
    setFormData({ date: new Date().toISOString().split('T')[0], project: '', type: 'Expense', category: 'Transportation', amount: '', description: '' });
  };

  let totalCost = 0;
  let totalRevenue = 0;
  transactions.forEach(t => {
    if (t.type === 'Expense') totalCost += Number(t.amount);
    if (t.type === 'Revenue' || t.type === 'Income') totalRevenue += Number(t.amount);
  });
  const netCost = totalCost - totalRevenue;
  const estimatedSavings = summary ? summary.availableMaterials * 10 : 0; // Using available materials as a placeholder for savings

  const costBreakdown = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += Number(curr.amount);
      } else {
        acc.push({ name: curr.category || 'Other', value: Number(curr.amount) });
      }
      return acc;
    }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cost & Revenue</h2>
          <p className="text-slate-500">Track waste management expenses and material recovery revenue.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Add Transaction</Button>
      </div>

      {loading && <p>Loading transactions...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Management Cost</p>
              <p className="text-2xl font-bold text-slate-800">₹{totalCost}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success-50 flex items-center justify-center text-success-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Recovery Revenue</p>
              <p className="text-2xl font-bold text-slate-800">₹{totalRevenue}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Net Cost</p>
              <p className="text-2xl font-bold text-slate-800">₹{netCost}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Estimated Savings</p>
              <p className="text-2xl font-bold text-slate-800">₹{estimatedSavings}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => \`₹\${value}\`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Project</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id || t.id} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">{t.date ? new Date(t.date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={\`px-2.5 py-1 rounded-full text-xs font-medium \${(t.type === 'Revenue' || t.type === 'Income') ? 'bg-success-100 text-success-700' : 'bg-red-100 text-red-700'}\`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{t.category || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">₹{t.amount}</td>
                    <td className="px-6 py-4 text-slate-500">{t.project?.name || t.project || 'N/A'}</td>
                  </tr>
                ))}
                {!loading && transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-500">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add Transaction</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option>Expense</option>
                    <option>Income</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Amount (₹) *</label>
                  <input required type="number" min="0" name="amount" value={formData.amount} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Date *</label>
                  <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Category *</label>
                  <input required type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Transportation" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Project</label>
                <input type="text" name="project" value={formData.project} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}`);

writeComponent('Feedback.jsx', `import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedback, createFeedback, updateFeedbackStatus } from '../features/feedback/feedbackSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Star, MessageSquare, User, Calendar, CheckCircle } from 'lucide-react';

const StarRating = ({ rating, setRating, readOnly = false }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && setRating(star)}
          className={\`\${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}\`}
        >
          <Star 
            className={\`w-6 h-6 \${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}\`} 
          />
        </button>
      ))}
    </div>
  );
};

export function Feedback() {
  const dispatch = useDispatch();
  const { feedbackItems: feedbacks, loading, error } = useSelector(state => state.feedback);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', role: 'Contractor', feedbackType: 'General Feedback', rating: 0, project: '', message: ''
  });

  useEffect(() => {
    dispatch(fetchFeedback());
  }, [dispatch]);

  const handleUpdateStatus = (id, newStatus) => {
    dispatch(updateFeedbackStatus({ id, status: newStatus }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      alert("Please provide a rating.");
      return;
    }
    dispatch(createFeedback(formData));
    alert("Thank you! Your feedback has been submitted successfully.");
    setShowForm(false);
    setFormData({ name: '', role: 'Contractor', feedbackType: 'General Feedback', rating: 0, project: '', message: '' });
  };

  let average = 0, positive = 0, pending = 0;
  if (feedbacks.length > 0) {
    average = (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1);
    positive = ((feedbacks.filter(f => f.rating >= 4).length / feedbacks.length) * 100).toFixed(0);
    pending = feedbacks.filter(f => f.status === 'Pending').length;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Feedback & Experience</h2>
          <p className="text-slate-500">Collect and review feedback from stakeholders.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'View Feedback' : 'Submit Feedback'}
        </Button>
      </div>

      {loading && <p>Loading feedback...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!showForm ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">Average Rating</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-3xl font-bold text-slate-800">{average}</p>
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Feedback</p>
                <p className="text-3xl font-bold text-slate-800">{feedbacks.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">Positive Feedback</p>
                <p className="text-3xl font-bold text-success-600">{positive}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-slate-500 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-warning-600">{pending}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map(fb => (
              <Card key={fb._id || fb.id} className="flex flex-col">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <StarRating rating={fb.rating} readOnly={true} />
                    <span className={\`px-2.5 py-1 rounded-full text-xs font-medium \${
                      fb.status === 'Resolved' ? 'bg-success-100 text-success-700' :
                      fb.status === 'Reviewed' ? 'bg-primary-100 text-primary-700' :
                      'bg-warning-100 text-warning-700'
                    }\`}>
                      {fb.status}
                    </span>
                  </div>
                  
                  <p className="text-slate-700 italic flex-1 mb-4">"{fb.message}"</p>
                  
                  <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-800 font-bold">
                      <User className="w-4 h-4 text-slate-400" /> {fb.name || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-600">{fb.role}</span> • {fb.feedbackType || fb.type}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3 h-3" /> {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : (fb.date ? new Date(fb.date).toLocaleDateString() : 'N/A')}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {fb.status === 'Pending' && (
                      <Button onClick={() => handleUpdateStatus(fb._id || fb.id, 'Reviewed')} className="flex-1 w-full text-xs bg-primary-600 hover:bg-primary-700">Mark Reviewed</Button>
                    )}
                    {(fb.status === 'Pending' || fb.status === 'Reviewed') && (
                      <Button onClick={() => handleUpdateStatus(fb._id || fb.id, 'Resolved')} className="flex-1 w-full text-xs bg-success-600 hover:bg-success-700">Mark Resolved</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {!loading && feedbacks.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
                <p className="text-slate-500">No feedback submitted yet.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary-500" /> We Value Your Feedback
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Name *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Role *</label>
                  <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option>Construction Site Manager</option>
                    <option>Contractor</option>
                    <option>Customer</option>
                    <option>Recycler</option>
                    <option>Project Engineer</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Feedback Type *</label>
                  <select required name="feedbackType" value={formData.feedbackType} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option>General Feedback</option>
                    <option>Service Feedback</option>
                    <option>Material Quality</option>
                    <option>Pickup / Collection</option>
                    <option>Customer Request</option>
                    <option>Waste Management</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Project (Optional)</label>
                  <input type="text" name="project" value={formData.project} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Site A" />
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center">
                <label className="text-sm font-bold text-slate-800">Rate your experience</label>
                <StarRating rating={formData.rating} setRating={(r) => setFormData(prev => ({ ...prev, rating: r }))} />
                <p className="text-xs text-slate-500 font-medium mt-1">Your Rating: {formData.rating}/5</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Message *</label>
                <textarea required name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Tell us about your experience..."></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Submit Feedback</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}`);

writeComponent('Reports.jsx', `import React, { useEffect } from 'react';
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
        \`"\${r.project?.name || r.project}"\`, 
        r.wasteType, 
        r.quantity, 
        r.unit, 
        r.treatment, 
        r.createdAt ? new Date(r.createdAt).toISOString() : '', 
        r.status
      ];
      csvRows.push(row.join(','));
    });

    const csvData = csvRows.join('\\n');
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
              <Tooltip formatter={(value, name) => [name === 'RecoveryRate' ? \`\${value}%\` : \`\${value.toFixed(2)} Tons\`, name]} />
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
`);

console.log('Batch 2 refactored');
