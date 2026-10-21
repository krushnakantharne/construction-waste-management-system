const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const dirs = [
  'app',
  'services',
  'features/auth',
  'features/projects',
  'features/waste',
  'features/inventory',
  'features/requests',
  'features/pickups',
  'features/transactions',
  'features/feedback',
  'features/dashboard',
  'features/reports'
];

dirs.forEach(dir => {
    fs.mkdirSync(path.join(srcDir, dir), { recursive: true });
});

const files = {
    'services/api.js': `import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
`,
    'app/store.js': `import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import projectReducer from '../features/projects/projectSlice';
import wasteReducer from '../features/waste/wasteSlice';
import inventoryReducer from '../features/inventory/inventorySlice';
import requestReducer from '../features/requests/requestSlice';
import pickupReducer from '../features/pickups/pickupSlice';
import transactionReducer from '../features/transactions/transactionSlice';
import feedbackReducer from '../features/feedback/feedbackSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import reportReducer from '../features/reports/reportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    waste: wasteReducer,
    inventory: inventoryReducer,
    requests: requestReducer,
    pickups: pickupReducer,
    transactions: transactionReducer,
    feedback: feedbackReducer,
    dashboard: dashboardReducer,
    reports: reportReducer
  },
});

export default store;
`,
    'features/auth/authSlice.js': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

const initialState = {
  user: user ? user : null,
  token: token ? token : null,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('user', JSON.stringify(response.data));
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message); }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (userData, thunkAPI) => {
  try {
    const response = await api.post('/auth/login', userData);
    localStorage.setItem('user', JSON.stringify(response.data));
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message); }
});

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async (_, thunkAPI) => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(getCurrentUser.pending, (state) => { state.loading = true; })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;
`,
    'features/projects/projectSlice.js': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
    const response = await api.get(\`/projects/\${id}\`);
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
    const response = await api.put(\`/projects/\${id}\`, data);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const deleteProject = createAsyncThunk('projects/deleteProject', async (id, thunkAPI) => {
  try {
    await api.delete(\`/projects/\${id}\`);
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
`,
    'features/waste/wasteSlice.js': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  wasteRecords: [],
  selectedWaste: null,
  loading: false,
  error: null,
  pagination: {}
};

export const fetchWaste = createAsyncThunk('waste/fetchWaste', async (params, thunkAPI) => {
  try {
    const response = await api.get('/waste', { params });
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const fetchWasteById = createAsyncThunk('waste/fetchWasteById', async (id, thunkAPI) => {
  try {
    const response = await api.get(\`/waste/\${id}\`);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const createWaste = createAsyncThunk('waste/createWaste', async (wasteData, thunkAPI) => {
  try {
    const response = await api.post('/waste', wasteData);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const updateWaste = createAsyncThunk('waste/updateWaste', async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put(\`/waste/\${id}\`, data);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const deleteWaste = createAsyncThunk('waste/deleteWaste', async (id, thunkAPI) => {
  try {
    await api.delete(\`/waste/\${id}\`);
    return id;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

const wasteSlice = createSlice({
  name: 'waste',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWaste.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWaste.fulfilled, (state, action) => {
        state.loading = false;
        state.wasteRecords = action.payload.waste || action.payload; // accommodate pagination object
        state.pagination = action.payload;
      })
      .addCase(fetchWaste.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(fetchWasteById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWasteById.fulfilled, (state, action) => { state.loading = false; state.selectedWaste = action.payload; })
      .addCase(fetchWasteById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(createWaste.fulfilled, (state, action) => { state.wasteRecords.unshift(action.payload); })
      .addCase(updateWaste.fulfilled, (state, action) => {
        const index = state.wasteRecords.findIndex(w => w._id === action.payload._id);
        if (index !== -1) state.wasteRecords[index] = action.payload;
      })
      .addCase(deleteWaste.fulfilled, (state, action) => {
        state.wasteRecords = state.wasteRecords.filter(w => w._id !== action.payload);
      });
  }
});

export default wasteSlice.reducer;
`,
    'features/inventory/inventorySlice.js': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  inventoryItems: [],
  selectedInventory: null,
  loading: false,
  error: null
};

export const fetchInventory = createAsyncThunk('inventory/fetchInventory', async (_, thunkAPI) => {
  try {
    const response = await api.get('/inventory');
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const fetchInventoryById = createAsyncThunk('inventory/fetchInventoryById', async (id, thunkAPI) => {
  try {
    const response = await api.get(\`/inventory/\${id}\`);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const createInventory = createAsyncThunk('inventory/createInventory', async (inventoryData, thunkAPI) => {
  try {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const updateInventory = createAsyncThunk('inventory/updateInventory', async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put(\`/inventory/\${id}\`, data);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const deleteInventory = createAsyncThunk('inventory/deleteInventory', async (id, thunkAPI) => {
  try {
    await api.delete(\`/inventory/\${id}\`);
    return id;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInventory.fulfilled, (state, action) => { state.loading = false; state.inventoryItems = action.payload; })
      .addCase(fetchInventory.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(fetchInventoryById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInventoryById.fulfilled, (state, action) => { state.loading = false; state.selectedInventory = action.payload; })
      .addCase(fetchInventoryById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(createInventory.fulfilled, (state, action) => { state.inventoryItems.push(action.payload); })
      .addCase(updateInventory.fulfilled, (state, action) => {
        const index = state.inventoryItems.findIndex(i => i._id === action.payload._id);
        if (index !== -1) state.inventoryItems[index] = action.payload;
      })
      .addCase(deleteInventory.fulfilled, (state, action) => {
        state.inventoryItems = state.inventoryItems.filter(i => i._id !== action.payload);
      });
  }
});

export default inventorySlice.reducer;
`,
    'features/requests/requestSlice.js': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  requests: [],
  selectedRequest: null,
  loading: false,
  error: null
};

export const fetchRequests = createAsyncThunk('requests/fetchRequests', async (params, thunkAPI) => {
  try {
    const response = await api.get('/requests', { params });
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const fetchRequestById = createAsyncThunk('requests/fetchRequestById', async (id, thunkAPI) => {
  try {
    const response = await api.get(\`/requests/\${id}\`);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const createRequest = createAsyncThunk('requests/createRequest', async (requestData, thunkAPI) => {
  try {
    const response = await api.post('/requests', requestData);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const updateRequestStatus = createAsyncThunk('requests/updateRequestStatus', async ({ id, status, inventoryId }, thunkAPI) => {
  try {
    const response = await api.put(\`/requests/\${id}/status\`, { status, inventoryId });
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRequests.fulfilled, (state, action) => { state.loading = false; state.requests = action.payload; })
      .addCase(fetchRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(fetchRequestById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchRequestById.fulfilled, (state, action) => { state.loading = false; state.selectedRequest = action.payload; })
      .addCase(fetchRequestById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(createRequest.fulfilled, (state, action) => { state.requests.push(action.payload); })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const index = state.requests.findIndex(r => r._id === action.payload._id);
        if (index !== -1) state.requests[index] = action.payload;
        if (state.selectedRequest?._id === action.payload._id) state.selectedRequest = action.payload;
      });
  }
});

export default requestSlice.reducer;
`,
    'features/pickups/pickupSlice.js': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  pickups: [],
  selectedPickup: null,
  loading: false,
  error: null
};

export const fetchPickups = createAsyncThunk('pickups/fetchPickups', async (_, thunkAPI) => {
  try {
    const response = await api.get('/pickups');
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const fetchPickupById = createAsyncThunk('pickups/fetchPickupById', async (id, thunkAPI) => {
  try {
    const response = await api.get(\`/pickups/\${id}\`);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const createPickup = createAsyncThunk('pickups/createPickup', async (pickupData, thunkAPI) => {
  try {
    const response = await api.post('/pickups', pickupData);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const updatePickupStatus = createAsyncThunk('pickups/updatePickupStatus', async ({ id, status }, thunkAPI) => {
  try {
    const response = await api.put(\`/pickups/\${id}/status\`, { status });
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

const pickupSlice = createSlice({
  name: 'pickups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPickups.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPickups.fulfilled, (state, action) => { state.loading = false; state.pickups = action.payload; })
      .addCase(fetchPickups.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(fetchPickupById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPickupById.fulfilled, (state, action) => { state.loading = false; state.selectedPickup = action.payload; })
      .addCase(fetchPickupById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(createPickup.fulfilled, (state, action) => { state.pickups.push(action.payload); })
      .addCase(updatePickupStatus.fulfilled, (state, action) => {
        const index = state.pickups.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.pickups[index] = action.payload;
        if (state.selectedPickup?._id === action.payload._id) state.selectedPickup = action.payload;
      });
  }
});

export default pickupSlice.reducer;
`,
    'features/transactions/transactionSlice.js': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  transactions: [],
  loading: false,
  error: null
};

export const fetchTransactions = createAsyncThunk('transactions/fetchTransactions', async (_, thunkAPI) => {
  try {
    const response = await api.get('/transactions');
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const createTransaction = createAsyncThunk('transactions/createTransaction', async (transactionData, thunkAPI) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const updateTransaction = createAsyncThunk('transactions/updateTransaction', async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put(\`/transactions/\${id}\`, data);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const deleteTransaction = createAsyncThunk('transactions/deleteTransaction', async (id, thunkAPI) => {
  try {
    await api.delete(\`/transactions/\${id}\`);
    return id;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTransactions.fulfilled, (state, action) => { state.loading = false; state.transactions = action.payload; })
      .addCase(fetchTransactions.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(createTransaction.fulfilled, (state, action) => { state.transactions.push(action.payload); })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(t => t._id === action.payload._id);
        if (index !== -1) state.transactions[index] = action.payload;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(t => t._id !== action.payload);
      });
  }
});

export default transactionSlice.reducer;
`,
    'features/feedback/feedbackSlice.js': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  feedbackItems: [],
  loading: false,
  error: null
};

export const fetchFeedback = createAsyncThunk('feedback/fetchFeedback', async (params, thunkAPI) => {
  try {
    const response = await api.get('/feedback', { params });
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const createFeedback = createAsyncThunk('feedback/createFeedback', async (feedbackData, thunkAPI) => {
  try {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const updateFeedbackStatus = createAsyncThunk('feedback/updateFeedbackStatus', async ({ id, status }, thunkAPI) => {
  try {
    const response = await api.put(\`/feedback/\${id}/status\`, { status });
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedback.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFeedback.fulfilled, (state, action) => { state.loading = false; state.feedbackItems = action.payload; })
      .addCase(fetchFeedback.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(createFeedback.fulfilled, (state, action) => { state.feedbackItems.push(action.payload); })
      .addCase(updateFeedbackStatus.fulfilled, (state, action) => {
        const index = state.feedbackItems.findIndex(f => f._id === action.payload._id);
        if (index !== -1) state.feedbackItems[index] = action.payload;
      });
  }
});

export default feedbackSlice.reducer;
`,
    'features/dashboard/dashboardSlice.js': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  summary: null,
  loading: false,
  error: null
};

export const fetchDashboardSummary = createAsyncThunk('dashboard/fetchDashboardSummary', async (_, thunkAPI) => {
  try {
    const response = await api.get('/dashboard/summary');
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => { state.loading = false; state.summary = action.payload; })
      .addCase(fetchDashboardSummary.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export default dashboardSlice.reducer;
`,
    'features/reports/reportSlice.js': `import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  wasteReport: [],
  financialReport: [],
  inventoryReport: [],
  projectReport: [],
  loading: false,
  error: null
};

export const fetchWasteReport = createAsyncThunk('reports/fetchWasteReport', async (_, thunkAPI) => {
  try {
    const response = await api.get('/reports/waste');
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const fetchFinancialReport = createAsyncThunk('reports/fetchFinancialReport', async (_, thunkAPI) => {
  try {
    const response = await api.get('/reports/financial');
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const fetchInventoryReport = createAsyncThunk('reports/fetchInventoryReport', async (_, thunkAPI) => {
  try {
    const response = await api.get('/reports/inventory');
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const fetchProjectReport = createAsyncThunk('reports/fetchProjectReport', async (_, thunkAPI) => {
  try {
    const response = await api.get('/reports/projects');
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWasteReport.pending, (state) => { state.loading = true; })
      .addCase(fetchWasteReport.fulfilled, (state, action) => { state.loading = false; state.wasteReport = action.payload; })
      .addCase(fetchWasteReport.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(fetchFinancialReport.pending, (state) => { state.loading = true; })
      .addCase(fetchFinancialReport.fulfilled, (state, action) => { state.loading = false; state.financialReport = action.payload; })
      
      .addCase(fetchInventoryReport.pending, (state) => { state.loading = true; })
      .addCase(fetchInventoryReport.fulfilled, (state, action) => { state.loading = false; state.inventoryReport = action.payload; })
      
      .addCase(fetchProjectReport.pending, (state) => { state.loading = true; })
      .addCase(fetchProjectReport.fulfilled, (state, action) => { state.loading = false; state.projectReport = action.payload; });
  }
});

export default reportSlice.reducer;
`
};

Object.keys(files).forEach(file => {
    fs.writeFileSync(path.join(srcDir, file), files[file]);
});

console.log('Frontend Redux store and slices created successfully.');
