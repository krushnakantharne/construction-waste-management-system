import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
