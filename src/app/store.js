import { configureStore } from '@reduxjs/toolkit';
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
