import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null
};

export const fetchProjects = createAsyncThunk('projects/fetchProjects', async (_, thunkAPI) => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const fetchProjectById = createAsyncThunk('projects/fetchProjectById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const createProject = createAsyncThunk('projects/createProject', async (projectData, thunkAPI) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const updateProject = createAsyncThunk('projects/updateProject', async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const deleteProject = createAsyncThunk('projects/deleteProject', async (id, thunkAPI) => {
  try {
    await api.delete(`/projects/${id}`);
    return id;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProjects.fulfilled, (state, action) => { state.loading = false; state.projects = action.payload; })
      .addCase(fetchProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(fetchProjectById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProjectById.fulfilled, (state, action) => { state.loading = false; state.selectedProject = action.payload; })
      .addCase(fetchProjectById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(createProject.fulfilled, (state, action) => { state.projects.push(action.payload); })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.projects[index] = action.payload;
        if (state.selectedProject?._id === action.payload._id) state.selectedProject = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
        if (state.selectedProject?._id === action.payload) state.selectedProject = null;
      });
  }
});

export default projectSlice.reducer;
