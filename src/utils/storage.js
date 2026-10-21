import { 
  initialWasteRecords, 
  initialProjects, 
  initialInventory, 
  initialRequests, 
  initialPickups, 
  initialTransactions, 
  initialFeedback 
} from '../data/dummyData';
export { wasteTypes, managementMethods } from '../data/dummyData';

// Generic helper
const createStorageManager = (key, initialData) => ({
  get: () => {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
  },
  add: (item) => {
    const data = JSON.parse(localStorage.getItem(key) || JSON.stringify(initialData));
    const newItem = {
      ...item,
      id: `${key}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    const updatedData = [newItem, ...data];
    localStorage.setItem(key, JSON.stringify(updatedData));
    return updatedData;
  },
  update: (id, updates) => {
    const data = JSON.parse(localStorage.getItem(key) || JSON.stringify(initialData));
    const updatedData = data.map(item => item.id === id ? { ...item, ...updates } : item);
    localStorage.setItem(key, JSON.stringify(updatedData));
    return updatedData;
  },
  delete: (id) => {
    const data = JSON.parse(localStorage.getItem(key) || JSON.stringify(initialData));
    const updatedData = data.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(updatedData));
    return updatedData;
  }
});

// Managers
const wasteManager = createStorageManager('cwms_waste_records', initialWasteRecords);
export const getRecords = wasteManager.get;
export const addRecord = wasteManager.add;
export const updateRecord = wasteManager.update;
export const deleteRecord = wasteManager.delete;

const projectManager = createStorageManager('cwms_projects', initialProjects);
export const getProjects = projectManager.get;
export const addProject = projectManager.add;

const inventoryManager = createStorageManager('cwms_inventory', initialInventory);
export const getInventory = inventoryManager.get;
export const addInventory = inventoryManager.add;
export const updateInventory = inventoryManager.update;

const requestManager = createStorageManager('cwms_requests', initialRequests);
export const getRequests = requestManager.get;
export const addRequest = requestManager.add;
export const updateRequest = requestManager.update;

const pickupManager = createStorageManager('cwms_pickups', initialPickups);
export const getPickups = pickupManager.get;
export const addPickup = pickupManager.add;
export const updatePickup = pickupManager.update;

const transactionManager = createStorageManager('cwms_transactions', initialTransactions);
export const getTransactions = transactionManager.get;
export const addTransaction = transactionManager.add;

const feedbackManager = createStorageManager('cwms_feedback', initialFeedback);
export const getFeedback = feedbackManager.get;
export const addFeedback = feedbackManager.add;
export const updateFeedback = feedbackManager.update;

// Summary metrics logic based on local data
export const getSummaryMetrics = (records) => {
  let totalKg = 0;
  let reusedKg = 0;
  let recycledKg = 0;
  let disposedKg = 0;

  // Convert everything to Tons for the summary (1 Ton = 1000 kg)
  records.forEach(rec => {
    let weightKg = 0;
    if (rec.unit === 'Tons' || rec.unit === 'tons') {
      weightKg = Number(rec.quantity) * 1000;
    } else {
      weightKg = Number(rec.quantity);
    }

    totalKg += weightKg;

    if (rec.method === 'Reuse') reusedKg += weightKg;
    else if (rec.method === 'Recycle') recycledKg += weightKg;
    else if (rec.method === 'Disposal') disposedKg += weightKg;
  });

  return {
    totalTons: (totalKg / 1000).toFixed(1),
    reusedTons: (reusedKg / 1000).toFixed(1),
    recycledTons: (recycledKg / 1000).toFixed(1),
    disposedTons: (disposedKg / 1000).toFixed(1),
    recoveryRate: totalKg > 0 ? (((reusedKg + recycledKg) / totalKg) * 100).toFixed(0) : 0
  };
};
