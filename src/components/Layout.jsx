import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  FiActivity, FiLogOut, FiMenu, FiHome, 
  FiPieChart, FiWatch, FiHeart, FiTrendingUp 
} from 'react-icons/fi';

import maleAvatar from '../assets/img/male.png';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [photoURL, setPhotoURL] = useState(maleAvatar);

  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  // Re-check current user photoURL periodically (every 3s)
  useEffect(() => {
    const interval = setInterval(() => {
      const user = auth.currentUser;
      if (user?.photoURL && user.photoURL !== photoURL) {
        setPhotoURL(user.photoURL);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [auth, photoURL]);

  // Set on initial auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setPhotoURL(user?.photoURL || maleAvatar);
    });
    return unsubscribe;
  }, [auth]);

  const handleContentClick = () => {
    if (sidebarOpen) setSidebarOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("google_fit_tokens");
    setShowLogoutConfirm(false);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background font-poppins text-white">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 sidebar-gradient border-r border-white/10 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50`}>
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-8">
            <FiActivity className="text-primary text-2xl" />
            <span className="text-xl font-semibold gradient-text">NutriSync</span>
          </div>
          <nav className="space-y-4">
            <Link to="/home" className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors ${isActive('/home') ? 'bg-white/10' : ''}`}>
              <FiHome className="text-primary" />
              <span>Overview</span>
            </Link>
            <Link to="/analytics" className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors ${isActive('/analytics') ? 'bg-white/10' : ''}`}>
              <FiPieChart className="text-primary" />
              <span>Analytics</span>
            </Link>
            <Link to="/health-stats" className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors ${isActive('/health-stats') ? 'bg-white/10' : ''}`}>
              <FiHeart className="text-primary" />
              <span>Health Stats</span>
            </Link>
            <Link to="/progress" className={`flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors ${isActive('/progress') ? 'bg-white/10' : ''}`}>
              <FiTrendingUp className="text-primary" />
              <span>Progress</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Top Navbar */}
      <nav className="fixed top-0 right-0 left-0 bg-background/80 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:text-primary transition-colors"
            >
              <FiMenu size={24} />
            </button>
            <div className="hidden md:flex space-x-8 ml-12">
              <Link to="/home" className={`font-medium text-lg transition-colors ${isActive('/home') ? 'text-primary' : 'text-white/70 hover:text-white'}`}>Home</Link>
              <Link to="/dashboard" className={`font-medium text-lg transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-white/70 hover:text-white'}`}>BMI Dashboard</Link>
              <Link to="/food" className={`font-medium text-lg transition-colors ${isActive('/food') ? 'text-primary' : 'text-white/70 hover:text-white'}`}>Food</Link>
              <Link to="/connect" className={`font-medium text-lg transition-colors flex items-center space-x-2 ${isActive('/connect') ? 'text-primary' : 'text-white/70 hover:text-white'}`}>
                <FiWatch />
                <span>Connect Watch</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowLogoutConfirm(true)} className="text-white/70 hover:text-white transition-colors">
              <FiLogOut size={20} />
            </button>
            <img 
              src={photoURL}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-primary cursor-pointer object-cover"
              onClick={() => navigate('/profile')}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden mt-4">
          <button onClick={() => setMobileMenu(!mobileMenu)} className="w-full text-left py-2 text-white/70 hover:text-white">
            <FiMenu className="inline mr-2" /> Menu
          </button>
          {mobileMenu && (
            <div className="mt-2 space-y-2">
              <Link to="/home" className={`block w-full text-left py-2 ${isActive('/home') ? 'text-primary' : 'text-white/70'}`}>Home</Link>
              <Link to="/dashboard" className={`block w-full text-left py-2 ${isActive('/dashboard') ? 'text-primary' : 'text-white/70'}`}>Dashboard</Link>
              <Link to="/food" className={`block w-full text-left py-2 ${isActive('/food') ? 'text-primary' : 'text-white/70'}`}>Food</Link>
              <Link to="/connect" className={`block w-full text-left py-2 ${isActive('/connect') ? 'text-primary' : 'text-white/70'}`}><FiWatch className="inline mr-2" /> Connect Watch</Link>
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#1e1e1e] rounded-lg p-6 w-full max-w-sm shadow-lg text-white">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="text-sm mb-6 text-white/80">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 rounded-md text-sm bg-white/10 hover:bg-white/20 transition">Cancel</button>
              <button onClick={handleLogout} className="px-4 py-2 rounded-md text-sm bg-primary hover:bg-primary/80 transition">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`pt-24 md:pt-20 p-4 md:p-8 transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-0'}`} onClick={handleContentClick}>
        {children}
      </div>
    </div>
  );
}
