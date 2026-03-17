import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, PlusSquare, User, LogOut, Menu, X, Landmark } from 'lucide-react';
import { useState } from 'react';
import Modal from '../common/Modal';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-200">
                <Landmark className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Campus<span className="text-primary-600">Found</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/lost" className="text-slate-600 hover:text-primary-600 px-3 py-2 font-medium">Lost Items</Link>
            <Link to="/found" className="text-slate-600 hover:text-primary-600 px-3 py-2 font-medium">Found Items</Link>

            {user ? (
              <>
                <Link to="/post" className="btn btn-primary space-x-2">
                  <PlusSquare size={18} />
                  <span>Report Item</span>
                </Link>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <Link to="/profile" className="p-2 text-slate-600 hover:text-primary-600 transition-colors">
                  <User size={20} />
                </Link>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">Sign In</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/lost" className="block px-3 py-2 text-slate-600 font-medium">Lost Items</Link>
            <Link to="/found" className="block px-3 py-2 text-slate-600 font-medium">Found Items</Link>
            {user ? (
              <>
                <Link to="/post" className="block px-3 py-2 text-primary-600 font-semibold">Report Item</Link>
                <Link to="/profile" className="block px-3 py-2 text-slate-600">My Profile</Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="block w-full text-left px-3 py-2 text-red-500"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="block px-3 py-2 text-primary-600 font-semibold">Sign In</Link>
            )}
          </div>
        </div>
      )}

      {/* Logout Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to sign in again to report items or view contact information."
        confirmText="Sign Out"
        cancelText="Cancel"
        type="danger"
      />
    </nav>
  );
};

export default Navbar;
