import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, User, LogOut, LogIn } from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice';

export function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 lg:hidden">EcoBuild</h1>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <button className="p-2 text-slate-400 hover:text-slate-600 relative" title="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-700">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role || 'Member'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-danger-600 hover:bg-slate-100 rounded-lg transition-colors ml-1"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <Link 
            to="/login"
            className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

