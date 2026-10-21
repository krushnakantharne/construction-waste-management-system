import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
    const response = await api.get(`/pickups/${id}`);
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
    const response = await api.put(`/pickups/${id}/status`, { status });
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
