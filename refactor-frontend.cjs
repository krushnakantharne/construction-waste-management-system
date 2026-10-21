const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');

const files = {
  'Projects.jsx': `import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject } from '../features/projects/projectSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPin, Calendar, User, Activity, Plus } from 'lucide-react';

export function Projects() {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector(state => state.projects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', location: '', type: 'Residential', startDate: '', expectedCompletion: '', manager: '', status: 'Active', progress: 0
  });

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createProject({ ...formData, progress: Number(formData.progress) }));
    setIsModalOpen(false);
    setFormData({ name: '', location: '', type: 'Residential', startDate: '', expectedCompletion: '', manager: '', status: 'Active', progress: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
          <p className="text-slate-500">Manage your construction sites and track their waste recovery.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      {loading && <p>Loading projects...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Card key={project._id || project.id} className="flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800">{project.name}</h3>
                <span className={\`px-2.5 py-1 rounded-full text-xs font-medium \${
                  project.status === 'Active' ? 'bg-success-100 text-success-700' :
                  project.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                  'bg-warning-100 text-warning-700'
                }\`}>
                  {project.status}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" /> {project.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Activity className="w-4 h-4 text-slate-400" /> {project.type || project.projectType}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4 text-slate-400" /> {project.manager || project.projectManager}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">Progress</span>
                  <span className="font-medium text-primary-600">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: \`\${project.progress || 0}%\` }}></div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" className="w-full">View Project</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && projects.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No projects found. Add a project to get started.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add New Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Project Name *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Location *</label>
                  <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Type *</label>
                  <select required name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Infrastructure</option>
                    <option>Industrial</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Start Date *</label>
                  <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Expected Completion *</label>
                  <input required type="date" name="expectedCompletion" value={formData.expectedCompletion} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Manager *</label>
                  <input required type="text" name="manager" value={formData.manager} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Status *</label>
                  <select required name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option>Planning</option>
                    <option>Active</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Progress (%)</label>
                <input type="number" min="0" max="100" name="progress" value={formData.progress} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Project</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`
};

Object.keys(files).forEach(file => {
  fs.writeFileSync(path.join(srcDir, file), files[file]);
});

console.log('Frontend pages refactored.');
