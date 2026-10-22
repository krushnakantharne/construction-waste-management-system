import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  fetchMovements,
  clearMutationError,
  clearMovements,
} from '../features/inventory/inventorySlice';
import { createRequest } from '../features/requests/requestSlice';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Package, Calendar, IndianRupee, MapPin, Search, Plus, Pencil,
  Trash2, X, History, AlertTriangle, TrendingUp, TrendingDown,
  ArrowUpDown, CheckCircle,
} from 'lucide-react';

// ── Role helpers ───────────────────────────────────────────────────────────────
const STAFF_ROLES = ['admin', 'siteManager', 'recycler'];
const isStaff = (role) => STAFF_ROLES.includes(role);
const canWrite = (role) => ['admin', 'siteManager'].includes(role);
const canDelete = (role) => role === 'admin';

// ── Constants ─────────────────────────────────────────────────────────────────
const MATERIAL_TYPES = ['Metal', 'Wood', 'Masonry', 'Concrete', 'Plastic', 'Glass', 'Aggregate', 'Other'];
const CONDITION_OPTIONS = ['Excellent', 'Good', 'Fair', 'Poor'];
const STATUS_OPTIONS = ['Available', 'Reserved', 'Sold', 'Used'];

const EMPTY_FORM = {
  materialName: '', materialType: 'Metal', quantity: '', unit: 'kg',
  estimatedValue: '', condition: '', status: 'Available', project: '', notes: '',
};

// ── Movement type display helpers ─────────────────────────────────────────────
const MOVEMENT_META = {
  addition:    { label: 'Added',     color: 'text-emerald-700 bg-emerald-50',  icon: TrendingUp,    sign: '+' },
  adjustment:  { label: 'Adjusted',  color: 'text-blue-700 bg-blue-50',        icon: ArrowUpDown,   sign: '±' },
  reservation: { label: 'Reserved',  color: 'text-amber-700 bg-amber-50',      icon: TrendingDown,  sign: '−' },
  release:     { label: 'Released',  color: 'text-emerald-700 bg-emerald-50',  icon: TrendingUp,    sign: '+' },
  consumption: { label: 'Consumed',  color: 'text-red-700 bg-red-50',          icon: TrendingDown,  sign: '−' },
  deletion:    { label: 'Deleted',   color: 'text-slate-700 bg-slate-100',     icon: Trash2,        sign: '−' },
};

function MovementBadge({ type }) {
  const meta = MOVEMENT_META[type] || { label: type, color: 'text-slate-600 bg-slate-100' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
      {meta.label}
    </span>
  );
}

// ── Inventory form (shared by Add and Edit) ───────────────────────────────────
function InventoryForm({ initial = EMPTY_FORM, onSave, onCancel, loading, error, title }) {
  const [form, setForm] = useState(initial);
  const [validationErr, setValidationErr] = useState('');

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setValidationErr('');
  };

  const submit = (e) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    if (!qty || qty <= 0) { setValidationErr('Quantity must be a positive number.'); return; }
    const val = form.estimatedValue !== '' ? Number(form.estimatedValue) : undefined;
    if (val !== undefined && val < 0) { setValidationErr('Estimated value must be ≥ 0.'); return; }
    onSave({ ...form, quantity: qty, estimatedValue: val });
  };

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 bg-white';
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

  return (
    <form onSubmit={submit} className="p-6 space-y-4">
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>

      {(validationErr || error) && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {validationErr || error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Material Name *</label>
          <input required name="materialName" value={form.materialName} onChange={handle} className={inputCls} placeholder="e.g. Steel Rebar" />
        </div>
        <div>
          <label className={labelCls}>Material Type *</label>
          <select required name="materialType" value={form.materialType} onChange={handle} className={inputCls}>
            {MATERIAL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Condition</label>
          <select name="condition" value={form.condition} onChange={handle} className={inputCls}>
            <option value="">— Select —</option>
            {CONDITION_OPTIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Quantity *</label>
          <input
            required type="number" name="quantity" value={form.quantity}
            onChange={handle} min="0.001" step="any"
            className={inputCls} placeholder="e.g. 100"
          />
        </div>
        <div>
          <label className={labelCls}>Unit *</label>
          <input required name="unit" value={form.unit} onChange={handle} className={inputCls} placeholder="e.g. kg, pcs, m²" />
        </div>
        <div>
          <label className={labelCls}>Estimated Value (₹)</label>
          <input
            type="number" name="estimatedValue" value={form.estimatedValue}
            onChange={handle} min="0" step="any"
            className={inputCls} placeholder="0"
          />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select name="status" value={form.status} onChange={handle} className={inputCls}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

// ── Movement history panel ────────────────────────────────────────────────────
function MovementsPanel({ item, movements, loading, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-800">Stock Movement History</h3>
            <p className="text-xs text-slate-500 mt-0.5">{item.materialName} — {item.quantity} {item.unit}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && <p className="text-sm text-slate-500 py-4 text-center">Loading movements…</p>}
          {!loading && movements.length === 0 && (
            <p className="text-sm text-slate-400 py-6 text-center">No movements recorded yet.</p>
          )}
          {!loading && movements.length > 0 && (
            <div className="space-y-2">
              {movements.map((m) => {
                const meta = MOVEMENT_META[m.movementType] || {};
                const Icon = meta.icon || ArrowUpDown;
                const deltaAbs = Math.abs(m.quantityDelta);
                const sign = m.quantityDelta > 0 ? '+' : '−';
                return (
                  <div key={m._id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className={`p-1.5 rounded-md ${meta.color || 'bg-slate-100'}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <MovementBadge type={m.movementType} />
                        <span className="font-semibold text-slate-700 text-sm">
                          {sign}{deltaAbs} {item.unit}
                        </span>
                        {m.quantityAfter != null && (
                          <span className="text-xs text-slate-400">→ stock: {m.quantityAfter}</span>
                        )}
                      </div>
                      {m.notes && <p className="text-xs text-slate-500 mt-0.5 truncate">{m.notes}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>{new Date(m.createdAt).toLocaleString()}</span>
                        {m.performedBy?.name && <span>by {m.performedBy.name}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Customer request form modal ───────────────────────────────────────────────
function RequestModal({ item, onClose }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    customerName: '', contactPerson: '', phone: '',
    quantity: '', requiredDate: '', purpose: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const avail = item.quantity - (item.reservedQuantity || 0);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    dispatch(createRequest({
      ...form,
      quantity: Number(form.quantity),
      material: item.materialName,
      sourceProject: item.project?._id,
      inventory: item._id,
      estimatedValue: item.estimatedValue
        ? (item.estimatedValue / item.quantity) * Number(form.quantity)
        : undefined,
    }));
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-sm w-full">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 mb-1">Request Submitted</h3>
        <p className="text-sm text-slate-500 mb-6">Your material request has been sent for review.</p>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500';
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-800">Request Material</h3>
            <p className="text-xs text-slate-500 mt-0.5">{item.materialName} — {avail} {item.unit} available</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <div>
            <label className={labelCls}>Company / Customer Name *</label>
            <input required name="customerName" value={form.customerName} onChange={handle} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Contact Person *</label>
              <input required name="contactPerson" value={form.contactPerson} onChange={handle} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone *</label>
              <input required type="tel" name="phone" value={form.phone} onChange={handle} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Quantity ({item.unit}) *</label>
              <input
                required type="number" name="quantity" value={form.quantity}
                onChange={handle} min="1" max={avail} step="any"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Required Date *</label>
              <input required type="date" name="requiredDate" value={form.requiredDate} onChange={handle} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Purpose *</label>
            <input required name="purpose" value={form.purpose} onChange={handle} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handle} rows={2} className={`${inputCls} resize-none`} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirmation dialog ─────────────────────────────────────────────────
function DeleteConfirm({ item, onConfirm, onCancel, error }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Delete Inventory Item</h3>
        <p className="text-sm text-slate-500 mb-2">
          This will permanently remove <strong>{item.materialName}</strong> ({item.quantity} {item.unit}).
        </p>
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
        <div className="flex gap-3 justify-center mt-4">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}

// ── Inventory card ─────────────────────────────────────────────────────────────
function InventoryCard({ item, role, onEdit, onDelete, onHistory, onRequest }) {
  const avail = item.quantity - (item.reservedQuantity || 0);
  const costPerUnit = item.estimatedValue && item.quantity
    ? (item.estimatedValue / item.quantity).toFixed(2)
    : null;

  const statusColors = {
    Available: 'bg-emerald-100 text-emerald-700',
    Reserved:  'bg-amber-100 text-amber-700',
    Sold:      'bg-slate-100 text-slate-600',
    Used:      'bg-blue-100 text-blue-700',
  };

  return (
    <Card className="flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="p-5 flex-1">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-800 truncate">{item.materialName}</h3>
              <p className="text-xs text-slate-400">{item.materialType}</p>
            </div>
            <span className={`ml-2 shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-slate-100 text-slate-600'}`}>
              {item.status}
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Quantity breakdown */}
            <div className="flex items-center gap-2 text-xs">
              <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-600">
                <span className="font-semibold text-slate-800">{item.quantity} {item.unit}</span>
                {' '}total
              </span>
            </div>
            {isStaff(role) && (item.reservedQuantity || 0) > 0 && (
              <div className="flex items-center gap-2 text-xs text-amber-600">
                <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">↑</span>
                <span>{item.reservedQuantity} {item.unit} reserved · {Math.max(0, avail)} free</span>
              </div>
            )}

            {/* Estimated value */}
            {item.estimatedValue != null && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ₹{item.estimatedValue.toLocaleString()}
                {costPerUnit && <span className="text-slate-400">(₹{costPerUnit}/{item.unit})</span>}
              </div>
            )}

            {/* Condition */}
            {item.condition && (
              <div className="text-xs text-slate-500">
                Condition: <span className="text-slate-700">{item.condition}</span>
              </div>
            )}

            {/* Project */}
            {item.project?.name && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.project.name}</span>
              </div>
            )}

            {/* Created by */}
            {isStaff(role) && item.createdBy?.name && (
              <div className="text-xs text-slate-400">Added by {item.createdBy.name}</div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50">
          {isStaff(role) ? (
            <div className="flex gap-1.5">
              <Button
                variant="ghost" size="sm" className="flex-1 gap-1"
                onClick={() => onHistory(item)}
                title="Movement history"
              >
                <History className="w-3.5 h-3.5" />
              </Button>
              {canWrite(role) && (
                <Button
                  variant="ghost" size="sm" className="flex-1 gap-1"
                  onClick={() => onEdit(item)}
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
              {canDelete(role) && (
                <Button
                  variant="ghost" size="sm" className="flex-1 gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(item)}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="secondary" size="sm" className="flex-1"
                onClick={() => onHistory(item)}
              >
                View
              </Button>
              <Button
                size="sm" className="flex-1"
                disabled={item.status !== 'Available' || avail <= 0}
                onClick={() => onRequest(item)}
              >
                Request
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function MaterialInventory() {
  const dispatch = useDispatch();
  const { inventoryItems: inventory, movements, movementsLoading, loading, error, mutationError } = useSelector(s => s.inventory);
  const { user } = useSelector(s => s.auth);
  const role = user?.role || 'customer';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // modal states
  const [addOpen, setAddOpen]           = useState(false);
  const [editItem, setEditItem]         = useState(null);
  const [deleteItem, setDeleteItem]     = useState(null);
  const [historyItem, setHistoryItem]   = useState(null);
  const [requestItem, setRequestItem]   = useState(null);
  const [deleteError, setDeleteError]   = useState('');

  useEffect(() => { dispatch(fetchInventory()); }, [dispatch]);

  const openHistory = useCallback((item) => {
    setHistoryItem(item);
    dispatch(fetchMovements(item._id));
  }, [dispatch]);

  const closeHistory = () => {
    setHistoryItem(null);
    dispatch(clearMovements());
  };

  const handleAdd = async (data) => {
    const result = await dispatch(createInventory(data));
    if (!result.error) setAddOpen(false);
  };

  const handleEdit = async (data) => {
    const result = await dispatch(updateInventory({ id: editItem._id, data }));
    if (!result.error) setEditItem(null);
  };

  const handleDelete = async () => {
    setDeleteError('');
    const result = await dispatch(deleteInventory(deleteItem._id));
    if (result.error) {
      setDeleteError(result.payload || 'Delete failed');
    } else {
      setDeleteItem(null);
    }
  };

  const filtered = (inventory || []).filter(item => {
    const name = (item.materialName || '').toLowerCase();
    const type = (item.materialType || '').toLowerCase();
    const proj = (item.project?.name || '').toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || type.includes(search.toLowerCase()) || proj.includes(search.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Material Inventory</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isStaff(role) ? 'Manage recovered materials and track stock movements.' : 'Browse and request available materials.'}
          </p>
        </div>
        {canWrite(role) && (
          <Button onClick={() => { dispatch(clearMutationError()); setAddOpen(true); }} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Add Inventory
          </Button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Search materials…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* ── Summary bar (staff) ── */}
      {isStaff(role) && !loading && inventory.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Items', value: inventory.length, color: 'text-slate-700' },
            { label: 'Available', value: inventory.filter(i => i.status === 'Available').length, color: 'text-emerald-700' },
            { label: 'Reserved', value: inventory.filter(i => (i.reservedQuantity || 0) > 0).length, color: 'text-amber-700' },
            { label: 'Total Value', value: `₹${inventory.reduce((sum, i) => sum + (i.estimatedValue || 0), 0).toLocaleString()}`, color: 'text-blue-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-xs text-slate-400">{label}</p>
              <p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Loading / error ── */}
      {loading && <p className="text-sm text-slate-500 py-2">Loading inventory…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(item => (
          <InventoryCard
            key={item._id}
            item={item}
            role={role}
            onEdit={(i) => { dispatch(clearMutationError()); setEditItem(i); }}
            onDelete={(i) => { setDeleteError(''); setDeleteItem(i); }}
            onHistory={openHistory}
            onRequest={setRequestItem}
          />
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No materials found.</p>
            {canWrite(role) && (
              <Button variant="ghost" size="sm" className="mt-3 gap-1" onClick={() => setAddOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Add first item
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ── Add modal ── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              onClick={() => setAddOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <InventoryForm
              title="Add Inventory Item"
              loading={loading}
              error={mutationError}
              onSave={handleAdd}
              onCancel={() => setAddOpen(false)}
            />
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <InventoryForm
              title={`Edit: ${editItem.materialName}`}
              initial={{
                materialName:  editItem.materialName || '',
                materialType:  editItem.materialType || 'Metal',
                quantity:      editItem.quantity ?? '',
                unit:          editItem.unit || 'kg',
                estimatedValue: editItem.estimatedValue ?? '',
                condition:     editItem.condition || '',
                status:        editItem.status || 'Available',
              }}
              loading={loading}
              error={mutationError}
              onSave={handleEdit}
              onCancel={() => setEditItem(null)}
            />
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteItem && (
        <DeleteConfirm
          item={deleteItem}
          error={deleteError}
          onConfirm={handleDelete}
          onCancel={() => { setDeleteItem(null); setDeleteError(''); }}
        />
      )}

      {/* ── Movement history ── */}
      {historyItem && (
        <MovementsPanel
          item={historyItem}
          movements={movements}
          loading={movementsLoading}
          onClose={closeHistory}
        />
      )}

      {/* ── Customer request modal ── */}
      {requestItem && (
        <RequestModal item={requestItem} onClose={() => setRequestItem(null)} />
      )}
    </div>
  );
}