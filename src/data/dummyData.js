export const initialWasteRecords = [
  {
    id: 'rec_1',
    project: "Residential Building - Site A",
    wasteType: "Concrete",
    quantity: 500,
    unit: "kg",
    activity: "Demolition",
    method: "Recycle",
    date: "2026-09-01",
    location: "Site A",
    status: "Processed"
  },
  {
    id: 'rec_2',
    project: "Commercial Complex - Site B",
    wasteType: "Steel/Metal",
    quantity: 1200,
    unit: "kg",
    activity: "Structural Works",
    method: "Recycle",
    date: "2026-09-03",
    location: "Site B",
    status: "Pending"
  },
  {
    id: 'rec_3',
    project: "Residential Building - Site A",
    wasteType: "Wood",
    quantity: 350,
    unit: "kg",
    activity: "Formwork",
    method: "Reuse",
    date: "2026-09-05",
    location: "Site A",
    status: "Processed"
  },
  {
    id: 'rec_4',
    project: "Highway Extension",
    wasteType: "Soil",
    quantity: 4.5,
    unit: "Tons",
    activity: "Excavation",
    method: "Reuse",
    date: "2026-09-06",
    location: "Sector 4",
    status: "Processed"
  },
  {
    id: 'rec_5',
    project: "Commercial Complex - Site B",
    wasteType: "Mixed Construction Waste",
    quantity: 2.1,
    unit: "Tons",
    activity: "Finishing",
    method: "Disposal",
    date: "2026-09-08",
    location: "Site B",
    status: "Pending"
  }
];

export const initialProjects = [
  {
    id: 'proj_1',
    name: 'Green Valley Residential Project',
    location: 'Chhatrapati Sambhajinagar',
    type: 'Residential',
    startDate: '2026-01-10',
    expectedCompletion: '2027-12-30',
    manager: 'Rahul Sharma',
    progress: 68,
    status: 'Active'
  },
  {
    id: 'proj_2',
    name: 'City Commercial Complex',
    location: 'Pune',
    type: 'Commercial',
    startDate: '2025-06-15',
    expectedCompletion: '2026-11-20',
    manager: 'Priya Desai',
    progress: 42,
    status: 'Active'
  },
  {
    id: 'proj_3',
    name: 'Highway Expansion Project',
    location: 'Maharashtra',
    type: 'Infrastructure',
    startDate: '2026-03-01',
    expectedCompletion: '2028-05-15',
    manager: 'Vikram Singh',
    progress: 54,
    status: 'Active'
  }
];

export const initialInventory = [
  {
    id: 'inv_1',
    material: 'Reusable Bricks',
    category: 'Bricks',
    quantity: 2500,
    unit: 'units',
    condition: 'Good',
    estimatedValue: 10000,
    sourceProject: 'Green Valley Residential Project',
    recoveryDate: '2026-10-01',
    status: 'Available'
  },
  {
    id: 'inv_2',
    material: 'Steel Scrap',
    category: 'Steel/Metal',
    quantity: 850,
    unit: 'kg',
    condition: 'Recyclable',
    estimatedValue: 38000,
    sourceProject: 'City Commercial Complex',
    recoveryDate: '2026-10-02',
    status: 'Available'
  },
  {
    id: 'inv_3',
    material: 'Recovered Wood',
    category: 'Wood',
    quantity: 420,
    unit: 'kg',
    condition: 'Good',
    estimatedValue: 12000,
    sourceProject: 'Green Valley Residential Project',
    recoveryDate: '2026-10-03',
    status: 'Available'
  },
  {
    id: 'inv_4',
    material: 'Crushed Concrete',
    category: 'Concrete',
    quantity: 3.2,
    unit: 'Tons',
    condition: 'Processed',
    estimatedValue: 8500,
    sourceProject: 'Highway Expansion Project',
    recoveryDate: '2026-10-05',
    status: 'Available'
  }
];

export const initialRequests = [
  {
    id: 'req_1',
    customerName: 'ABC Builders',
    contactPerson: 'Amit Patel',
    phone: '9876543210',
    material: 'Reusable Bricks',
    quantity: 1000,
    requiredDate: '2026-10-15',
    purpose: 'Boundary Wall Construction',
    sourceProject: 'Green Valley Residential Project',
    estimatedValue: 4000,
    status: 'Pending'
  },
  {
    id: 'req_2',
    customerName: 'Green Recyclers Pvt. Ltd.',
    contactPerson: 'Suresh Kumar',
    phone: '9988776655',
    material: 'Steel Scrap',
    quantity: 500,
    requiredDate: '2026-10-12',
    purpose: 'Recycling',
    sourceProject: 'City Commercial Complex',
    estimatedValue: 22000,
    status: 'Approved'
  },
  {
    id: 'req_3',
    customerName: 'XYZ Contractors',
    contactPerson: 'Rajesh Verma',
    phone: '9123456789',
    material: 'Crushed Concrete',
    quantity: 2,
    requiredDate: '2026-10-08',
    purpose: 'Road Base',
    sourceProject: 'Highway Expansion Project',
    estimatedValue: 5300,
    status: 'Completed'
  }
];

export const initialPickups = [
  {
    id: 'pick_1',
    customer: 'Green Recyclers Pvt. Ltd.',
    material: 'Steel Scrap',
    quantity: 500,
    date: '2026-10-12',
    location: 'City Commercial Complex',
    vehicleNumber: 'MH 12 AB 1234',
    driverName: 'Ramesh',
    driverContact: '9876512345',
    status: 'Scheduled'
  },
  {
    id: 'pick_2',
    customer: 'XYZ Contractors',
    material: 'Crushed Concrete',
    quantity: 2,
    date: '2026-10-08',
    location: 'Highway Expansion Project',
    vehicleNumber: 'MH 14 CD 5678',
    driverName: 'Sanjay',
    driverContact: '9988771122',
    status: 'Completed'
  }
];

export const initialTransactions = [
  {
    id: 'txn_1',
    date: '2026-10-01',
    project: 'Green Valley Residential Project',
    type: 'Expense',
    category: 'Transportation',
    amount: 1500,
    description: 'Transport of concrete waste'
  },
  {
    id: 'txn_2',
    date: '2026-10-03',
    project: 'City Commercial Complex',
    type: 'Expense',
    category: 'Processing',
    amount: 3200,
    description: 'Steel scrap sorting and processing'
  },
  {
    id: 'txn_3',
    date: '2026-10-08',
    project: 'Highway Expansion Project',
    type: 'Revenue',
    category: 'Recyclable material sales',
    amount: 5300,
    description: 'Sale of crushed concrete'
  }
];

export const initialFeedback = [
  {
    id: 'fb_1',
    name: 'Rahul Sharma',
    role: 'Contractor',
    type: 'Service Feedback',
    rating: 5,
    project: 'City Commercial Complex',
    message: 'Pickup scheduling was simple and the material request process was very useful.',
    date: '2026-10-04',
    status: 'Reviewed'
  },
  {
    id: 'fb_2',
    name: 'Green Recyclers',
    role: 'Recycler',
    type: 'Material Quality',
    rating: 4,
    project: 'Green Valley Residential Project',
    message: 'Good inventory information. More material details would be helpful.',
    date: '2026-10-06',
    status: 'Pending'
  }
];

export const wasteTypes = [
  "Concrete",
  "Bricks",
  "Cement/Mortar",
  "Steel/Metal",
  "Wood",
  "Glass",
  "Plastic",
  "Soil",
  "Tiles",
  "Mixed Construction Waste"
];

export const managementMethods = [
  "Reuse",
  "Recycle",
  "Disposal"
];
