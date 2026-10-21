import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
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
    const response = await api.put(`/feedback/${id}/status`, { status });
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
