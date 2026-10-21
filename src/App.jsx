import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { AddWaste } from './pages/AddWaste'
import { WasteRecords } from './pages/WasteRecords'
import { WasteManagement } from './pages/WasteManagement'
import { Projects } from './pages/Projects'
import { MaterialInventory } from './pages/MaterialInventory'
import { CustomerRequests } from './pages/CustomerRequests'
import { PickupCollection } from './pages/PickupCollection'
import { CostRevenue } from './pages/CostRevenue'
import { Feedback } from './pages/Feedback'
import { Reports } from './pages/Reports'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="add-waste" element={<ProtectedRoute><AddWaste /></ProtectedRoute>} />
        <Route path="records" element={<ProtectedRoute><WasteRecords /></ProtectedRoute>} />
        <Route path="management" element={<ProtectedRoute><WasteManagement /></ProtectedRoute>} />
        <Route path="inventory" element={<ProtectedRoute><MaterialInventory /></ProtectedRoute>} />
        <Route path="requests" element={<ProtectedRoute><CustomerRequests /></ProtectedRoute>} />
        <Route path="pickups" element={<ProtectedRoute><PickupCollection /></ProtectedRoute>} />
        <Route path="finance" element={<ProtectedRoute><CostRevenue /></ProtectedRoute>} />
        <Route path="feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

export default App

