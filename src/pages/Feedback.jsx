import React, { useState, useEffect } from 'react';
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
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
        >
          <Star 
            className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
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
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      fb.status === 'Resolved' ? 'bg-success-100 text-success-700' :
                      fb.status === 'Reviewed' ? 'bg-primary-100 text-primary-700' :
                      'bg-warning-100 text-warning-700'
                    }`}>
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
}