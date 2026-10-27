// seedDemoData.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

if (process.env.NODE_ENV !== 'development') {
  console.log('Seed script runs only in development mode');
  process.exit(0);
}

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

// Models
const User = require('./models/User');
const Project = require('./models/Project');
const Inventory = require('./models/Inventory');
const Request = require('./models/Request');
const Invoice = require('./models/Invoice');
const Payment = require('./models/Payment');
const Feedback = require('./models/Feedback');
const Waste = require('./models/Waste');
const Transaction = require('./models/Transaction');
const Pickup = require('./models/Pickup');

// Demo accounts – passwords will be hashed by User pre‑save hook
const demoUsers = [
  { name: 'Admin Demo', email: 'admin_demo@example.com', password: 'Password123!', role: 'admin' },
  { name: 'SiteMgr Demo', email: 'sitemgr_demo@example.com', password: 'Password123!', role: 'siteManager' },
  { name: 'Customer Demo', email: 'customer_demo@example.com', password: 'Password123!', role: 'customer' },
  { name: 'Recycler Demo', email: 'recycler_demo@example.com', password: 'Password123!', role: 'recycler' }
];

const createDemo = async () => {
  await connectDB();

  // Users – upsert by email
  const users = await Promise.all(demoUsers.map(async u => {
    const existing = await User.findOne({ email: u.email });
    if (existing) return existing;
    const newUser = new User(u);
    await newUser.save();
    return newUser;
  }));

  const admin = users.find(u => u.role === 'admin');
  const siteMgr = users.find(u => u.role === 'siteManager');
  const customer = users.find(u => u.role === 'customer');
  const recycler = users.find(u => u.role === 'recycler');

  // Projects
  const proj1 = await Project.findOneAndUpdate(
    { name: 'Demo Project Alpha' },
    { name: 'Demo Project Alpha', location: 'Site A', projectType: 'Residential', createdBy: admin._id, progress: 65 },
    { upsert: true, returnDocument: 'after' }
  );
  const proj2 = await Project.findOneAndUpdate(
    { name: 'Demo Project Beta' },
    { name: 'Demo Project Beta', location: 'Site B', projectType: 'Commercial', createdBy: siteMgr._id, progress: 40 },
    { upsert: true, returnDocument: 'after' }
  );

  // Inventory – reserve quantity & valuation
  const inv1 = await Inventory.findOneAndUpdate(
    { materialName: 'Concrete', project: proj1._id },
    { materialName: 'Concrete', materialType: 'Raw', quantity: 1000, reservedQuantity: 200, unit: 'kg', estimatedValue: 75, project: proj1._id, createdBy: admin._id },
    { upsert: true, returnDocument: 'after' }
  );
  const inv2 = await Inventory.findOneAndUpdate(
    { materialName: 'Steel Rebar', project: proj2._id },
    { materialName: 'Steel Rebar', materialType: 'Reinforcement', quantity: 500, reservedQuantity: 150, unit: 'kg', estimatedValue: 2.5, project: proj2._id, createdBy: siteMgr._id },
    { upsert: true, returnDocument: 'after' }
  );

  // Requests – various statuses
  const req1 = await Request.findOneAndUpdate(
    { customer: customer._id, material: 'Concrete' },
    { customer: customer._id, material: 'Concrete', quantity: 200, unit: 'kg', status: 'Pending', project: proj1._id, inventory: inv1._id },
    { upsert: true, returnDocument: 'after' }
  );
  const req2 = await Request.findOneAndUpdate(
    { customer: customer._id, material: 'Steel Rebar' },
    { customer: customer._id, material: 'Steel Rebar', quantity: 100, unit: 'kg', status: 'Pending', project: proj2._id, inventory: inv2._id },
    { upsert: true, returnDocument: 'after' }
  );

  // Invoices – unique invoiceNumber
  const invc1 = await Invoice.findOneAndUpdate(
    { invoiceNumber: 'INV-1001' },
    { invoiceNumber: 'INV-1001', request: req1._id, customer: customer._id, amount: 5000 },
    { upsert: true, returnDocument: 'after' }
  );
  const invc2 = await Invoice.findOneAndUpdate(
    { invoiceNumber: 'INV-1002' },
    { invoiceNumber: 'INV-1002', request: req2._id, customer: customer._id, amount: 3000 },
    { upsert: true, returnDocument: 'after' }
  );

  // Payments
  await Payment.findOneAndUpdate(
    { invoice: invc1._id },
    { invoice: invc1._id, amount: invc1.amount, method: 'Bank Transfer' },
    { upsert: true, returnDocument: 'after' }
  );

  // Feedback
  await Feedback.findOneAndUpdate(
    { user: customer._id, project: proj1._id },
    { user: customer._id, name: customer.name, role: 'customer', feedbackType: 'General', rating: 5, project: proj1._id, message: 'Great service!' },
    { upsert: true, returnDocument: 'after' }
  );

  // Waste – demo waste records (kg unit)
  // Waste records – varied treatments, same unit (kg)
  // Project Alpha
  await Waste.findOneAndUpdate(
    { project: proj1._id, wasteType: 'Concrete Waste' },
    { project: proj1._id, wasteType: 'Concrete Waste', quantity: 150, unit: 'kg', treatment: 'Reuse', status: 'Pending', createdBy: admin._id },
    { upsert: true, returnDocument: 'after' }
  );
  await Waste.findOneAndUpdate(
    { project: proj1._id, wasteType: 'Wood Waste' },
    { project: proj1._id, wasteType: 'Wood Waste', quantity: 100, unit: 'kg', treatment: 'Recycle', status: 'Pending', createdBy: admin._id },
    { upsert: true, returnDocument: 'after' }
  );
  await Waste.findOneAndUpdate(
    { project: proj1._id, wasteType: 'Glass Waste' },
    { project: proj1._id, wasteType: 'Glass Waste', quantity: 50, unit: 'kg', treatment: 'Dispose', status: 'Pending', createdBy: admin._id },
    { upsert: true, returnDocument: 'after' }
  );
  await Waste.findOneAndUpdate(
    { project: proj1._id, wasteType: 'Asphalt Waste' },
    { project: proj1._id, wasteType: 'Asphalt Waste', quantity: 40, unit: 'kg', treatment: 'Recycle', status: 'Pending', createdBy: admin._id },
    { upsert: true, returnDocument: 'after' }
  );
  await Waste.findOneAndUpdate(
    { project: proj1._id, wasteType: 'Excavated Soil' },
    { project: proj1._id, wasteType: 'Excavated Soil', quantity: 200, unit: 'kg', treatment: 'Reuse', status: 'Pending', createdBy: admin._id },
    { upsert: true, returnDocument: 'after' }
  );
  // Project Beta
  await Waste.findOneAndUpdate(
    { project: proj2._id, wasteType: 'Steel Waste' },
    { project: proj2._id, wasteType: 'Steel Waste', quantity: 80, unit: 'kg', treatment: 'Recycle', status: 'Pending', createdBy: siteMgr._id },
    { upsert: true, returnDocument: 'after' }
  );
  await Waste.findOneAndUpdate(
    { project: proj2._id, wasteType: 'Plastic Waste' },
    { project: proj2._id, wasteType: 'Plastic Waste', quantity: 60, unit: 'kg', treatment: 'Reuse', status: 'Pending', createdBy: siteMgr._id },
    { upsert: true, returnDocument: 'after' }
  );
  await Waste.findOneAndUpdate(
    { project: proj2._id, wasteType: 'Hazardous Waste' },
    { project: proj2._id, wasteType: 'Hazardous Waste', quantity: 30, unit: 'kg', treatment: 'Dispose', status: 'Pending', createdBy: siteMgr._id },
    { upsert: true, returnDocument: 'after' }
  );
  await Waste.findOneAndUpdate(
    { project: proj2._id, wasteType: 'Copper Waste' },
    { project: proj2._id, wasteType: 'Copper Waste', quantity: 20, unit: 'kg', treatment: 'Reuse', status: 'Pending', createdBy: siteMgr._id },
    { upsert: true, returnDocument: 'after' }
  );
  await Waste.findOneAndUpdate(
    { project: proj2._id, wasteType: 'Insulation Waste' },
    { project: proj2._id, wasteType: 'Insulation Waste', quantity: 70, unit: 'kg', treatment: 'Dispose', status: 'Pending', createdBy: siteMgr._id },
    { upsert: true, returnDocument: 'after' }
  );
  await Waste.findOneAndUpdate(
    { project: proj2._id, wasteType: 'Concrete Debris' },
    { project: proj2._id, wasteType: 'Concrete Debris', quantity: 90, unit: 'kg', treatment: 'Recycle', status: 'Pending', createdBy: siteMgr._id },
    { upsert: true, returnDocument: 'after' }
  );

  // Transactions – income from invoices, expense for pickup
  await Transaction.findOneAndUpdate(
    { project: proj1._id, type: 'Income', description: 'Invoice INV-1001' },
    { project: proj1._id, type: 'Income', category: 'Invoice', amount: invc1.amount, description: 'Invoice INV-1001' },
    { upsert: true, returnDocument: 'after' }
  );
  await Transaction.findOneAndUpdate(
    { project: proj2._id, type: 'Income', description: 'Invoice INV-1002' },
    { project: proj2._id, type: 'Income', category: 'Invoice', amount: invc2.amount, description: 'Invoice INV-1002' },
    { upsert: true, returnDocument: 'after' }
  );

  // Pickups – linked to requests
  await Pickup.findOneAndUpdate(
    { request: req1._id },
    { request: req1._id, customer: customer._id, material: 'Concrete', quantity: 200, pickupLocation: 'Site A', pickupDate: new Date(), vehicleNumber: 'VA-123', driver: 'John Doe', status: 'Scheduled' },
    { upsert: true, returnDocument: 'after' }
  );
  await Pickup.findOneAndUpdate(
    { request: req2._id },
    { request: req2._id, customer: customer._id, material: 'Steel Rebar', quantity: 100, pickupLocation: 'Site B', pickupDate: new Date(), vehicleNumber: 'VB-456', driver: 'Jane Smith', status: 'Scheduled' },
    { upsert: true, returnDocument: 'after' }
  );

  // Verification counts
  const counts = {
    Users: await User.countDocuments({ email: { $in: demoUsers.map(u => u.email) } }),
    Projects: await Project.countDocuments({ name: { $in: ['Demo Project Alpha', 'Demo Project Beta'] } }),
    Inventory: await Inventory.countDocuments({ project: { $in: [proj1._id, proj2._id] } }),
    Requests: await Request.countDocuments({ customer: customer._id }),
    Invoices: await Invoice.countDocuments({ invoiceNumber: { $in: ['INV-1001', 'INV-1002'] } }),
    Payments: await Payment.countDocuments({ invoice: { $in: [invc1._id, invc2._id] } }),
    Feedback: await Feedback.countDocuments({ user: customer._id }),
    Waste: await Waste.countDocuments({ project: { $in: [proj1._id, proj2._id] } }),
    Transactions: await Transaction.countDocuments({ project: { $in: [proj1._id, proj2._id] } }),
    Pickups: await Pickup.countDocuments({ customer: customer._id })
  };

  console.log('Demo seeding counts:', counts);

  // Simple integrity check – any count zero means failure
  const anyZero = Object.values(counts).some(v => v === 0);
  if (anyZero) {
    console.error('Seeding verification failed, some collections empty');
    process.exit(1);
  }

  console.log('Demo data seeded successfully');
  process.exit(0);
};

createDemo().catch(err => { console.error('Seed error:', err); process.exit(1); });
