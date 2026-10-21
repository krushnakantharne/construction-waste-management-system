import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Info, Menu, X, Leaf, Briefcase, Package, Truck, IndianRupee, MessageSquare, FileText, ClipboardList } from 'lucide-react';
import { cn } from '../../utils/formatting';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: Briefcase },
  { name: 'Add Waste', path: '/add-waste', icon: PlusCircle },
  { name: 'Waste Records', path: '/records', icon: History },
  { name: 'Waste Management', path: '/management', icon: Info },
  { name: 'Material Inventory', path: '/inventory', icon: Package },
  { name: 'Customer Requests', path: '/requests', icon: ClipboardList },
  { name: 'Pickup & Collection', path: '/pickups', icon: Truck },
  { name: 'Cost & Revenue', path: '/finance', icon: IndianRupee },
  { name: 'Feedback', path: '/feedback', icon: MessageSquare },
  { name: 'Reports', path: '/reports', icon: FileText },
];

export function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-primary-700 font-bold text-lg">
            <Leaf className="w-6 h-6 text-primary-600" />
            <span>EcoBuild</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary-50 text-primary-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-5 h-5", "text-current")} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 font-medium">CWMS Prototype</p>
            <p className="text-xs text-slate-400 mt-1">Review 1 Demonstration</p>
          </div>
        </div>
      </aside>
    </>
  );
}
