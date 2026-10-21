import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { wasteTypes, managementMethods } from '../utils/storage';
import { createWaste } from '../features/waste/wasteSlice';
import { fetchProjects } from '../features/projects/projectSlice';
import { CheckCircle2, Info, AlertCircle, Loader2 } from 'lucide-react';

export function AddWaste() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { projects } = useSelector((state) => state.projects);

  const [formData, setFormData] = useState({
    project: '',
    wasteType: wasteTypes[0] || 'Concrete',
    quantity: '',
    unit: 'kg',
    activity: '',
    date: new Date().toISOString().split('T')[0],
    method: managementMethods[0] || 'Reuse',
    location: '',
    notes: ''
  });

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projects && projects.length > 0 && !formData.project) {
      setFormData(prev => ({ ...prev, project: projects[0]._id || projects[0].name }));
    }
  }, [projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const resultAction = await dispatch(createWaste(formData));
      if (createWaste.fulfilled.match(resultAction)) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/records');
        }, 1500);
      } else {
        setSubmitError(resultAction.payload || 'Failed to create waste record');
      }
    } catch (err) {
      setSubmitError(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const getRecommendation = (type) => {
    switch(type) {
      case 'Concrete': return 'Recommended: Reuse as aggregate or send for recycling.';
      case 'Steel/Metal': return 'Recommended: Send to an authorized metal recycler.';
      case 'Bricks': return 'Recommended: Reuse if condition is suitable.';
      case 'Wood': return 'Recommended: Reuse where suitable or recycle.';
      case 'Plastic': return 'Recommended: Segregate and send for recycling.';
      case 'Soil': return 'Recommended: Reuse for filling/landscaping where suitable.';
      case 'Mixed Construction Waste': return 'Recommended: Segregate before treatment.';
      default: return 'Recommended: Check local guidelines for proper handling.';
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-success-100 text-success-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Record Added to Database!</h2>
        <p className="text-slate-500 mb-6">The waste entry has been saved to MongoDB.</p>
        <p className="text-sm text-slate-400">Redirecting to waste records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Add Waste Record</h2>
        <p className="text-slate-500">Record new construction waste for backend tracking and management.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {submitError && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Construction Project *</label>
                {projects && projects.length > 0 ? (
                  <select 
                    required
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    {projects.map(p => (
                      <option key={p._id || p.id || p.name} value={p._id || p.name}>{p.name}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    required
                    type="text" 
                    name="project"
                    value={formData.project}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. Site A"
                  />
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Date *</label>
                <input 
                  required
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Waste Type & Recommendation */}
              <div className="space-y-2 md:col-span-2 border border-blue-100 bg-blue-50/50 p-4 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Waste Type *</label>
                    <select 
                      required
                      name="wasteType"
                      value={formData.wasteType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                    >
                      {wasteTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-start gap-2 text-primary-700 bg-primary-50 p-3 rounded-lg border border-primary-100">
                      <Info className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium">{getRecommendation(formData.wasteType)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Construction Activity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Construction Activity *</label>
                <input 
                  required
                  type="text" 
                  name="activity"
                  value={formData.activity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. Demolition, Excavation"
                />
              </div>

              {/* Quantity & Unit */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Quantity *</label>
                <div className="flex gap-2">
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    min="0"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="0.00"
                  />
                  <select 
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-24 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    <option value="kg">kg</option>
                    <option value="Tons">Tons</option>
                  </select>
                </div>
              </div>

              {/* Management Method */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Management Method *</label>
                <select 
                  required
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  {managementMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Location</label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Site Area / Block"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Additional Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Any specific details about the waste..."
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
                ) : (
                  'Save Record'
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
