import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
    const response = await api.get(`/requests/${id}`);
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
    const response = await api.put(`/requests/${id}/status`, { status, inventoryId });
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
