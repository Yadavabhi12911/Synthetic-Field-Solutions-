import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Shield, LogOut, Zap, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 w-full z-50 flex justify-center"
    >
      <div className="w-4/5 max-w-6xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl mt-4 mx-4 shadow-2xl">
        <div className="flex justify-between items-center h-16 px-8">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300"
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">Sfs</span>
                <span className="text-xs text-teal-400 font-medium tracking-wider">TURF SYSTEM</span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {userType !== 'admin' && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  to="/turfs" 
                  className="text-gray-300 hover:text-white transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/5 font-medium text-sm"
                >
                  Browse Fields
                </Link>
              </motion.div>
            )}
            
            {user ? (
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to={userType === 'admin' ? '/admin/dashboard' : '/dashboard'}
                    className="text-gray-300 hover:text-white transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/5 font-medium text-sm"
                  >
                    Dashboard
                  </Link>
                </motion.div>
                
                {userType === 'user' && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      to="/bookings"
                      className="text-gray-300 hover:text-white transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/5 font-medium text-sm"
                    >
                      My Bookings
                    </Link>
                  </motion.div>
                )}

                {/* Profile Section */}
                <div className="relative">
                  <motion.div 
                    className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 rounded-xl px-3 py-2 transition-all duration-300 group border border-transparent hover:border-white/10"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center group-hover:from-teal-500 group-hover:to-teal-700 transition-all duration-300 shadow-lg group-hover:shadow-teal-500/25 overflow-hidden">
                      {user?.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt={user.fullName || user.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : userType === 'admin' ? (
                        <Shield className="w-4 h-4 text-white" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-white text-sm group-hover:text-teal-200 transition-colors font-medium">
                      {user.userName}
                    </span>
                    <ChevronDown 
                      className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} 
                    />
                  </motion.div>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="py-2">
                          <button
                            onClick={() => {
                              if (userType === 'user') {
                                navigate('/preferences?tab=profile');
                              } else if (userType === 'admin') {
                                navigate('/admin/settings?tab=profile');
                              }
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 text-sm font-medium"
                          >
                            {userType === 'admin' ? 'Admin Settings' : 'Profile Settings'}
                          </button>
                          <div className="border-t border-white/10 my-1"></div>
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium flex items-center space-x-2"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/5 font-medium text-sm"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white px-6 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-teal-500/25 font-medium text-sm"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all duration-300"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden w-4/5 max-w-md bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl mt-2 mx-4 shadow-2xl"
          >
            <div className="px-6 pt-4 pb-6 space-y-1">
              {userType !== 'admin' && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/turfs"
                    className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Browse Fields
                  </Link>
                </motion.div>
              )}
              
              {user ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={userType === 'admin' ? '/admin/dashboard' : '/dashboard'}
                      className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 text-sm font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                  
                  {userType === 'user' && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to="/bookings"
                        className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 text-sm font-medium"
                        onClick={() => setIsOpen(false)}
                      >
                        My Bookings
                      </Link>
                    </motion.div>
                  )}
                  
                  <div className="border-t border-white/10 my-2"></div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-sm font-medium flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 text-sm font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to="/register"
                      className="block px-4 py-3 text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-xl transition-all duration-200 text-sm font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;