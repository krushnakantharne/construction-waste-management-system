import React, { useState, useEffect } from 'react';
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    pickup.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-primary-50 text-primary-600'
                  }`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{pickup.vehicleNumber}</h3>
                    <p className="text-xs text-slate-500">{pickup.driver || pickup.driverName}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  pickup.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                  pickup.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  pickup.status === 'Collected' ? 'bg-success-100 text-success-700' :
                  pickup.status === 'Out for Pickup' ? 'bg-blue-100 text-blue-700' :
                  'bg-warning-100 text-warning-700'
                }`}>
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
}