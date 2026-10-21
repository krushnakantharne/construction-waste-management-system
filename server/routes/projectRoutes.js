const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// B9: All authenticated users can read projects.
router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin', 'siteManager'), createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('admin', 'siteManager'), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

module.exports = router;
