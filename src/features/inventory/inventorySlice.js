import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
    const response = await api.get(`/inventory/${id}`);
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
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const deleteInventory = createAsyncThunk('inventory/deleteInventory', async (id, thunkAPI) => {
  try {
    await api.delete(`/inventory/${id}`);
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
