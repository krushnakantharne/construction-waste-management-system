const fs = require('fs');
const path = require('path');

const writeComponent = (name, content) => {
  fs.writeFileSync(path.join(__dirname, 'src', 'pages', name), content);
};

writeComponent('MaterialInventory.jsx', `import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory } from '../features/inventory/inventorySlice';
import { createRequest } from '../features/requests/requestSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Package, Calendar, IndianRupee, MapPin, Search, Filter } from 'lucide-react';

export function MaterialInventory() {
  const dispatch = useDispatch();
  const { inventoryItems: inventory, loading, error } = useSelector(state => state.inventory);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    contactPerson: '',
    phone: '',
    quantity: '',
    requiredDate: '',
    purpose: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const handleCreateRequest = (material) => {
    setSelectedMaterial(material);
    setFormData(prev => ({ ...prev, quantity: material.quantity }));
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createRequest({
      ...formData,
      material: selectedMaterial.materialName || selectedMaterial.material,
      sourceProject: selectedMaterial.project?._id || selectedMaterial.sourceProject,
      inventory: selectedMaterial._id,
      estimatedValue: (selectedMaterial.estimatedValue / selectedMaterial.quantity) * formData.quantity,
      status: 'Pending'
    }));
    alert("Request created successfully!");
    setIsModalOpen(false);
    setFormData({ customerName: '', contactPerson: '', phone: '', quantity: '', requiredDate: '', purpose: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Material Inventory</h2>
        <p className="text-slate-500">View and request available recovered materials.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search materials..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</Button>
        </div>
      </div>

      {loading && <p>Loading inventory...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {inventory.map(item => (
          <Card key={item._id || item.id} className="flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="p-6 pb-0 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800">{item.materialName || item.material}</h3>
                  <span className={\`px-2.5 py-1 rounded-full text-xs font-medium \${
                    item.status === 'Available' ? 'bg-success-100 text-success-700' :
                    item.status === 'Reserved' ? 'bg-warning-100 text-warning-700' :
                    'bg-slate-100 text-slate-700'
                  }\`}>
                    {item.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Package className="w-4 h-4 text-slate-400" /> 
                    <span className="font-medium text-slate-800">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="w-4 h-4 flex items-center justify-center text-slate-400 bg-slate-100 rounded-full text-[10px]">C</span>
                    {item.condition || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <IndianRupee className="w-4 h-4 text-slate-400" /> 
                    Est. Value: ₹{item.estimatedValue}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" /> 
                    <span className="truncate">{item.project?.name || item.sourceProject || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" /> 
                    {new Date(item.createdAt || item.recoveryDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                <Button variant="secondary" className="flex-1">View</Button>
                <Button 
                  className="flex-1" 
                  disabled={item.status !== 'Available'}
                  onClick={() => handleCreateRequest(item)}
                >
                  Request
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && inventory.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No materials currently available.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Create Material Request</h3>
                <p className="text-sm text-slate-500">{selectedMaterial?.materialName || selectedMaterial?.material}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Company / Customer Name *</label>
                <input required type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Contact Person *</label>
                  <input required type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Phone *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Quantity ({selectedMaterial?.unit}) *</label>
                  <input required type="number" max={selectedMaterial?.quantity} min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Required Date *</label>
                  <input required type="date" name="requiredDate" value={formData.requiredDate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Purpose *</label>
                <input required type="text" name="purpose" value={formData.purpose} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}`);

writeComponent('CustomerRequests.jsx', `import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, updateRequestStatus } from '../features/requests/requestSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Package, Calendar, User, Phone, CheckCircle, XCircle } from 'lucide-react';

export function CustomerRequests() {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector(state => state.requests);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const handleUpdateStatus = (id, newStatus, inventoryId) => {
    dispatch(updateRequestStatus({ id, status: newStatus, inventoryId }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Customer Requests</h2>
        <p className="text-slate-500">Manage material requests from customers and recyclers.</p>
      </div>

      {loading && <p>Loading requests...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-4">
        {requests.map(req => (
          <Card key={req._id || req.id}>
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-1 space-y-4 w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{req.customer?.name || req.customerName || 'Customer'}</h3>
                    <p className="text-sm text-slate-500">ID: {req._id || req.id}</p>
                  </div>
                  <span className={\`px-2.5 py-1 rounded-full text-xs font-medium \${
                    req.status === 'Approved' ? 'bg-success-100 text-success-700' :
                    req.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                    req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    req.status === 'Processing' ? 'bg-primary-100 text-primary-700' :
                    'bg-warning-100 text-warning-700'
                  }\`}>
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-4 h-4 text-slate-400" /> 
                    <div>
                      <p className="text-xs text-slate-400">Contact</p>
                      <p className="font-medium text-slate-700">{req.contactPerson || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" /> 
                    <div>
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="font-medium text-slate-700">{req.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Package className="w-4 h-4 text-slate-400" /> 
                    <div>
                      <p className="text-xs text-slate-400">Material</p>
                      <p className="font-medium text-slate-700">{req.quantity} x {req.material}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" /> 
                    <div>
                      <p className="text-xs text-slate-400">Required Date</p>
                      <p className="font-medium text-slate-700">{req.requiredDate ? new Date(req.requiredDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-row md:flex-col gap-2 shrink-0">
                {req.status === 'Pending' && (
                  <>
                    <Button onClick={() => handleUpdateStatus(req._id || req.id, 'Approved', req.inventory)} className="flex-1 md:w-full bg-success-600 hover:bg-success-700 flex justify-center items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </Button>
                    <Button onClick={() => handleUpdateStatus(req._id || req.id, 'Rejected')} variant="secondary" className="flex-1 md:w-full text-red-600 hover:text-red-700 flex justify-center items-center gap-2">
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </>
                )}
                {req.status === 'Approved' && (
                  <Button onClick={() => handleUpdateStatus(req._id || req.id, 'Processing')} className="w-full flex justify-center items-center gap-2">
                    Mark Processing
                  </Button>
                )}
                {req.status === 'Processing' && (
                  <Button onClick={() => handleUpdateStatus(req._id || req.id, 'Completed')} className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-900">
                    Mark Completed
                  </Button>
                )}
                <Button variant="secondary" className="w-full flex justify-center items-center gap-2">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && requests.length === 0 && (
          <div className="py-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No customer requests yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}`);

writeComponent('PickupCollection.jsx', `import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPickups, createPickup, updatePickupStatus } from '../features/pickups/pickupSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Truck, MapPin, Calendar, User, Package, Plus } from 'lucide-react';

export function PickupCollection() {
  const dispatch = useDispatch();
  const { pickups, loading, error } = useSelector(state => state.pickups);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '', material: '', quantity: '', pickupDate: '', pickupLocation: '', vehicleNumber: '', driver: '', status: 'Scheduled'
  });

  useEffect(() => {
    dispatch(fetchPickups());
  }, [dispatch]);

  const handleUpdateStatus = (id, newStatus) => {
    dispatch(updatePickupStatus({ id, status: newStatus }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createPickup(formData));
    setIsModalOpen(false);
    setFormData({
      customer: '', material: '', quantity: '', pickupDate: '', pickupLocation: '', vehicleNumber: '', driver: '', status: 'Scheduled'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pickup & Collection</h2>
          <p className="text-slate-500">Manage vehicle schedules for waste and recovered materials.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Pickup
        </Button>
      </div>

      {loading && <p>Loading pickups...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pickups.map(pickup => (
          <Card key={pickup._id || pickup.id} className="flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center \${
                    pickup.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-primary-50 text-primary-600'
                  }\`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{pickup.vehicleNumber}</h3>
                    <p className="text-xs text-slate-500">{pickup.driver || pickup.driverName}</p>
                  </div>
                </div>
                <span className={\`px-2.5 py-1 rounded-full text-xs font-medium \${
                  pickup.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                  pickup.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  pickup.status === 'Collected' ? 'bg-success-100 text-success-700' :
                  pickup.status === 'Out for Pickup' ? 'bg-blue-100 text-blue-700' :
                  'bg-warning-100 text-warning-700'
                }\`}>
                  {pickup.status}
                </span>
              </div>

              <div className="space-y-3 flex-1 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-slate-400" /> {pickup.customer?.name || pickup.customer || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Package className="w-4 h-4 text-slate-400" /> {pickup.quantity} x {pickup.material}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" /> {pickup.pickupLocation || pickup.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" /> {pickup.pickupDate ? new Date(pickup.pickupDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2">
                {pickup.status === 'Scheduled' && (
                  <Button onClick={() => handleUpdateStatus(pickup._id || pickup.id, 'Out for Pickup')} className="col-span-2">Mark Out for Pickup</Button>
                )}
                {pickup.status === 'Out for Pickup' && (
                  <Button onClick={() => handleUpdateStatus(pickup._id || pickup.id, 'Collected')} className="col-span-2">Mark Collected</Button>
                )}
                {pickup.status === 'Collected' && (
                  <Button onClick={() => handleUpdateStatus(pickup._id || pickup.id, 'Completed')} className="col-span-2 bg-slate-800 hover:bg-slate-900">Mark Completed</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && pickups.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No pickup schedules available.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Schedule Pickup</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Customer *</label>
                  <input required type="text" name="customer" value={formData.customer} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Material *</label>
                  <input required type="text" name="material" value={formData.material} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Quantity *</label>
                  <input required type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Pickup Date *</label>
                  <input required type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Pickup Location *</label>
                <input required type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Vehicle Number *</label>
                  <input required type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Driver Name *</label>
                  <input required type="text" name="driver" value={formData.driver} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}`);

console.log('Batch 1 refactored');
