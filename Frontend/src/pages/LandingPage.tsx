import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, Shield, Clock, MapPin, Star, Zap, Target, Trophy, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const { user, userType } = useAuth();
  const isLoggedIn = user && (userType === 'user' || userType === 'admin');

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/30 to-zinc-900/30"></div>
        
        {/* 3D Background Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-teal-400/30 rounded-full"
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 100 - 50, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 mt-20"
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 bg-clip-text text-transparent block mb-4">
                Elite Sports
              </span>
              <span className="text-white block">
                Synthetic Field Solutions
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-normal mt-20 mb-20 p-1">
              Experience premium sports facilities with cutting-edge technology. 
              <span className="block mt-2 p-1 text-teal-300 font-medium">
                Book instantly, play professionally, dominate your game.
              </span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 mt-20 p-4"
          >
            <Link to="/turfs">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl"
              >
                Explore Elite Fields
              </motion.button>
            </Link>
            
            {!isLoggedIn && (
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                >
                  Join the League
                </motion.button>
              </Link>
            )}

            {isLoggedIn && (
              <Link to={userType === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                >
                  Go to Dashboard
                </motion.button>
              </Link>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: '500+', label: 'Premium Fields' },
              { number: '10K+', label: 'Elite Athletes' },
              { number: '50+', label: 'Cities Covered' },
              { number: '24/7', label: 'Pro Support' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-zinc-800/50 backdrop-blur-lg rounded-2xl border border-teal-400/20"
              >
                <div className="text-2xl sm:text-3xl font-bold text-teal-400 mb-2">{stat.number}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Why Choose <span className="text-teal-400">Synthetic Field Solutions</span>?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of sports facility management with our advanced platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Smart Booking',
                description: 'AI-powered scheduling with real-time availability and instant confirmations',
                color: 'from-teal-400 to-teal-600'
              },
              {
                icon: Users,
                title: 'Elite Community',
                description: 'Connect with professional athletes and build your sports network',
                color: 'from-teal-500 to-teal-700'
              },
              {
                icon: Shield,
                title: 'Secure & Reliable',
                description: 'Enterprise-grade security with 99.9% uptime guarantee',
                color: 'from-teal-600 to-teal-800'
              },
              {
                icon: Clock,
                title: '24/7 Operations',
                description: 'Round-the-clock facility access with automated management',
                color: 'from-teal-700 to-teal-900'
              },
              {
                icon: MapPin,
                title: 'Smart Location',
                description: 'GPS-powered facility finder with traffic-optimized routing',
                color: 'from-teal-800 to-teal-950'
              },
              {
                icon: Star,
                title: 'Premium Quality',
                description: 'Only certified facilities with professional-grade equipment',
                color: 'from-teal-900 to-teal-950'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className="bg-zinc-800/50 backdrop-blur-lg rounded-2xl p-8 border border-teal-400/20 hover:border-teal-400/50 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-zinc-800/80 to-zinc-900/50 backdrop-blur-lg rounded-3xl p-12 border border-teal-400/30"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center"
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Elevate Your Game?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8">
              Join thousands of elite athletes who have already discovered the ultimate sports experience
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isLoggedIn ? (
                <>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl"
                    >
                      Start Your Journey
                    </motion.button>
                  </Link>
                  
                  <Link to="/admin/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                    >
                      List Your Facility
                    </motion.button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={userType === 'admin' ? '/admin/dashboard' : '/dashboard'}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-500 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl"
                    >
                      Go to Dashboard
                    </motion.button>
                  </Link>
                  
                  {userType === 'user' && (
                    <Link to="/turfs">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                      >
                        Book a Turf
                      </motion.button>
                    </Link>
                  )}
                  
                  {userType === 'admin' && (
                    <Link to="/admin/turfs">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
                      >
                        Manage Turfs
                      </motion.button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;