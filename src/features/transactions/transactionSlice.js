import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  } catch (error) { return thunkAPI.rejectWithValue(error.response.data.message || error.message); }
});

export const deleteTransaction = createAsyncThunk('transactions/deleteTransaction', async (id, thunkAPI) => {
  try {
    await api.delete(`/transactions/${id}`);
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
