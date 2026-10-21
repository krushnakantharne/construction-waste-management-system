import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInventory } from '../features/inventory/inventorySlice';
import { createRequest } from '../features/requests/requestSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Package, Calendar, IndianRupee, MapPin, Search, Filter, X } from 'lucide-react';

export function MaterialInventory() {
  const dispatch = useDispatch();
  const { inventoryItems: inventory, loading, error } = useSelector(state => state.inventory);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewItem, setViewItem] = useState(null);
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

  const filteredInventory = (inventory || []).filter(item => {
    const matName = item.materialName || item.material || '';
    const projName = item.project?.name || item.sourceProject || '';
    return matName.toLowerCase().includes(searchTerm.toLowerCase()) || projName.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</Button>
        </div>
      </div>

      {loading && <p className="text-slate-500 text-sm">Loading inventory...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredInventory.map(item => (
          <Card key={item._id || item.id} className="flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="p-6 pb-0 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800">{item.materialName || item.material}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.status === 'Available' ? 'bg-success-100 text-success-700' :
                    item.status === 'Reserved' ? 'bg-warning-100 text-warning-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
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
                <Button variant="secondary" className="flex-1" onClick={() => setViewItem(item)}>View</Button>
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

        {!loading && filteredInventory.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No materials currently available.</p>
          </div>
        )}
      </div>

      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewItem.materialName || viewItem.material}</h3>
                <p className="text-sm text-slate-500">{viewItem.materialType}</p>
              </div>
              <button onClick={() => setViewItem(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400 text-xs mb-1">Quantity</p><p className="font-medium text-slate-700">{viewItem.quantity} {viewItem.unit}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Status</p><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${viewItem.status === 'Available' ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'}`}>{viewItem.status}</span></div>
                <div><p className="text-slate-400 text-xs mb-1">Condition</p><p className="font-medium text-slate-700">{viewItem.condition || 'N/A'}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Estimated Value</p><p className="font-medium text-slate-700">₹{viewItem.estimatedValue || 0}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Source Project</p><p className="font-medium text-slate-700">{viewItem.project?.name || viewItem.sourceProject || 'N/A'}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Added On</p><p className="font-medium text-slate-700">{new Date(viewItem.createdAt).toLocaleDateString()}</p></div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => setViewItem(null)}>Close</Button>
                {viewItem.status === 'Available' && <Button onClick={() => { setViewItem(null); handleCreateRequest(viewItem); }}>Request Material</Button>}
              </div>
            </div>
          </div>
        </div>
      )}

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
}