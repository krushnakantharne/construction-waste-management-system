import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
