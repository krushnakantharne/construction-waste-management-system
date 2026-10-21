import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchWasteById = createAsyncThunk('waste/fetchWasteById', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/waste/${id}`);
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
    const response = await api.put(`/waste/${id}`, data);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const deleteWaste = createAsyncThunk('waste/deleteWaste', async (id, thunkAPI) => {
  try {
    await api.delete(`/waste/${id}`);
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
