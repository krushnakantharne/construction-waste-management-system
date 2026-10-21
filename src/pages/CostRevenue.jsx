import React, { useState, useEffect } from 'react';
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `₹${value}`} />
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${(t.type === 'Revenue' || t.type === 'Income') ? 'bg-success-100 text-success-700' : 'bg-red-100 text-red-700'}`}>
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
}