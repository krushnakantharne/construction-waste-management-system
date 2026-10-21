import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardSummary } from '../features/dashboard/dashboardSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Recycle, Trash2, Box, TrendingUp, AlertCircle, Truck, Package, IndianRupee, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#84cc16'];

export function Dashboard() {
  const dispatch = useDispatch();
  const { summary, loading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardSummary());
  }, [dispatch]);

  if (loading || !summary) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading dashboard: {error}</div>;
  }

  const {
    totalWaste,
    reused,
    recycled,
    disposed,
    recoveryRate,
    totalCost,
    revenue,
    netCost,
    activeProjects,
    pendingRequests,
    scheduledPickups,
    availableMaterials
  } = summary;

  const categoryData = [
    { name: 'Reused', value: reused },
    { name: 'Recycled', value: recycled },
    { name: 'Disposed', value: disposed }
  ].filter(d => d.value > 0);

  const costVsRevenueData = [
    { name: 'Total', cost: totalCost, revenue: revenue }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-500">Monitor your site's waste generation and management metrics.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Box className="w-6 h-6 text-slate-500 mb-2" />
            <p className="text-xs font-medium text-slate-500">Total Waste</p>
            <p className="text-lg font-bold text-slate-800">{totalWaste} T</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Activity className="w-6 h-6 text-primary-500 mb-2" />
            <p className="text-xs font-medium text-slate-500">Reused</p>
            <p className="text-lg font-bold text-primary-700">{reused} T</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Recycle className="w-6 h-6 text-success-500 mb-2" />
            <p className="text-xs font-medium text-slate-500">Recycled</p>
            <p className="text-lg font-bold text-success-700">{recycled} T</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Trash2 className="w-6 h-6 text-warning-500 mb-2" />
            <p className="text-xs font-medium text-slate-500">Disposed</p>
            <p className="text-lg font-bold text-warning-700">{disposed} T</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center bg-primary-50 border-primary-100">
            <TrendingUp className="w-6 h-6 text-primary-600 mb-2" />
            <p className="text-xs font-medium text-primary-600">Recovery Rate</p>
            <p className="text-lg font-bold text-primary-800">{recoveryRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <IndianRupee className="w-6 h-6 text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-500">Net Waste Cost</p>
            <p className="text-lg font-bold text-slate-800">₹{netCost}</p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Active Projects</p>
                  <p className="text-3xl font-bold text-blue-900">{activeProjects < 10 ? `0${activeProjects}` : activeProjects}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Pending Requests</p>
                  <p className="text-3xl font-bold text-amber-900">{pendingRequests < 10 ? `0${pendingRequests}` : pendingRequests}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Scheduled Pickups</p>
                  <p className="text-3xl font-bold text-purple-900">{scheduledPickups < 10 ? `0${scheduledPickups}` : scheduledPickups}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                  <Truck className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-emerald-600 mb-1">Available Materials</p>
                  <p className="text-3xl font-bold text-emerald-900">{availableMaterials < 10 ? `0${availableMaterials}` : availableMaterials}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Waste Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)} Tons`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Cost & Recovery Chart</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costVsRevenueData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value) => `₹${value}`} />
                <Legend />
                <Line type="monotone" dataKey="cost" name="Management Cost" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="revenue" name="Recovery Revenue" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
