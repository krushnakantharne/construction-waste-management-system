import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, updateRequestStatus } from '../features/requests/requestSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Package, Calendar, User, Phone, CheckCircle, XCircle, X } from 'lucide-react';

export function CustomerRequests() {
  const dispatch = useDispatch();
  const { requests, loading, error } = useSelector(state => state.requests);
  const [viewRequest, setViewRequest] = useState(null);

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
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    req.status === 'Approved' ? 'bg-success-100 text-success-700' :
                    req.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                    req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    req.status === 'Processing' ? 'bg-primary-100 text-primary-700' :
                    'bg-warning-100 text-warning-700'
                  }`}>
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
                  <Button variant="secondary" className="w-full flex justify-center items-center gap-2" onClick={() => setViewRequest(req)}>
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

      {viewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{viewRequest.customer?.name || viewRequest.customerName || 'Request Details'}</h3>
                <p className="text-sm text-slate-500">ID: {viewRequest._id || viewRequest.id}</p>
              </div>
              <button onClick={() => setViewRequest(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400 text-xs mb-1">Contact Person</p><p className="font-medium text-slate-700">{viewRequest.contactPerson || 'N/A'}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Phone</p><p className="font-medium text-slate-700">{viewRequest.phone || 'N/A'}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Material</p><p className="font-medium text-slate-700">{viewRequest.material}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Quantity</p><p className="font-medium text-slate-700">{viewRequest.quantity}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Required Date</p><p className="font-medium text-slate-700">{viewRequest.requiredDate ? new Date(viewRequest.requiredDate).toLocaleDateString() : 'N/A'}</p></div>
                <div><p className="text-slate-400 text-xs mb-1">Status</p><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${viewRequest.status === 'Approved' ? 'bg-success-100 text-success-700' : viewRequest.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-warning-100 text-warning-700'}`}>{viewRequest.status}</span></div>
                {viewRequest.purpose && <div className="col-span-2"><p className="text-slate-400 text-xs mb-1">Purpose</p><p className="font-medium text-slate-700">{viewRequest.purpose}</p></div>}
              </div>
              <div className="pt-4 flex justify-end border-t border-slate-100">
                <Button variant="secondary" onClick={() => setViewRequest(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}