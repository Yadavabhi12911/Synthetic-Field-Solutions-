import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  ArrowLeft, 
  Filter,
  Activity,
  PieChart,
  Target,
  Clock,
  Star,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAnalyticsData } from '../api';

interface AnalyticsData {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  activeTurfs: number;
  completedBookings: number;
  pendingBookings: number;
  canceledBookings: number;
  monthlyRevenue: { month: string; revenue: number }[];
  bookingTrends: { date: string; bookings: number }[];
  topTurfs: { name: string; bookings: number; revenue: number }[];
  userGrowth: { month: string; users: number }[];
}

const AdminAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const [isDummyData, setIsDummyData] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeFilter]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Calling getAnalyticsData API...');
      const response = await getAnalyticsData();
      console.log('Analytics API Response:', response);
      
      if (response.statusCode === 200 && response.data) {
        setAnalyticsData(response.data);
        setIsDummyData(false);
      } else {
        throw new Error(response.message || 'Failed to load analytics data');
      }
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      // If API fails, show dummy data for demonstration
      console.log('Showing dummy data due to API error');
      setAnalyticsData(generateDummyData());
      setIsDummyData(true);
      setError(null); // Don't show error since we have dummy data
    } finally {
      setLoading(false);
    }
  };

  const generateDummyData = (): AnalyticsData => {
      const now = new Date();
    const currentMonth = now.getMonth();
    
    // Generate realistic monthly revenue with seasonal variations
    const monthlyRevenue = [
      { month: 'Jan', revenue: 28000 + Math.floor(Math.random() * 8000) },
      { month: 'Feb', revenue: 25000 + Math.floor(Math.random() * 6000) },
      { month: 'Mar', revenue: 32000 + Math.floor(Math.random() * 10000) },
      { month: 'Apr', revenue: 38000 + Math.floor(Math.random() * 12000) },
      { month: 'May', revenue: 42000 + Math.floor(Math.random() * 15000) },
      { month: 'Jun', revenue: 48000 + Math.floor(Math.random() * 18000) },
      { month: 'Jul', revenue: 52000 + Math.floor(Math.random() * 20000) },
      { month: 'Aug', revenue: 49000 + Math.floor(Math.random() * 18000) },
      { month: 'Sep', revenue: 45000 + Math.floor(Math.random() * 15000) },
      { month: 'Oct', revenue: 41000 + Math.floor(Math.random() * 12000) },
      { month: 'Nov', revenue: 36000 + Math.floor(Math.random() * 10000) },
      { month: 'Dec', revenue: 32000 + Math.floor(Math.random() * 8000) }
    ];

    // Generate realistic booking trends for the last 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const bookingTrends = days.map((day, index) => ({
      date: day,
      bookings: 15 + Math.floor(Math.random() * 25) + (index === 5 ? 10 : 0) // Saturday gets more bookings
    }));

    // Generate realistic top fields with varied performance
    const turfNames = [
      'Premium Football Field',
      'Cricket Stadium',
      'Multi-Sport Arena',
      'Tennis Court Complex',
      'Basketball Court',
      'Indoor Sports Center',
      'Athletics Track',
      'Swimming Pool Complex'
    ];
    
    const topTurfs = turfNames.slice(0, 5).map((name, index) => ({
      name,
      bookings: 20 - (index * 2) + Math.floor(Math.random() * 8),
      revenue: (20 - (index * 2) + Math.floor(Math.random() * 8)) * 600 + Math.floor(Math.random() * 1000)
    }));

    // Generate realistic user growth with steady increase
    const userGrowth = [
      { month: 'Jan', users: 89 + Math.floor(Math.random() * 20) },
      { month: 'Feb', users: 112 + Math.floor(Math.random() * 25) },
      { month: 'Mar', users: 134 + Math.floor(Math.random() * 30) },
      { month: 'Apr', users: 156 + Math.floor(Math.random() * 35) },
      { month: 'May', users: 178 + Math.floor(Math.random() * 40) },
      { month: 'Jun', users: 201 + Math.floor(Math.random() * 45) },
      { month: 'Jul', users: 223 + Math.floor(Math.random() * 50) },
      { month: 'Aug', users: 245 + Math.floor(Math.random() * 55) },
      { month: 'Sep', users: 267 + Math.floor(Math.random() * 60) },
      { month: 'Oct', users: 289 + Math.floor(Math.random() * 65) },
      { month: 'Nov', users: 311 + Math.floor(Math.random() * 70) },
      { month: 'Dec', users: 1247 + Math.floor(Math.random() * 100) }
    ];

    // Calculate total revenue from monthly data
    const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
    
    // Calculate total bookings from trends
    const totalBookings = bookingTrends.reduce((sum, day) => sum + day.bookings, 0);
    
    // Calculate booking statuses with realistic ratios
    const completedBookings = Math.floor(totalBookings * 0.75);
    const pendingBookings = Math.floor(totalBookings * 0.20);
    const canceledBookings = totalBookings - completedBookings - pendingBookings;
    
    return {
      totalUsers: userGrowth[userGrowth.length - 1].users,
      totalBookings,
        totalRevenue,
      averageRating: 4.2 + (Math.random() * 0.8), // Random rating between 4.2 and 5.0
      activeTurfs: 6 + Math.floor(Math.random() * 4), // Random between 6-9 active turfs
        completedBookings,
        pendingBookings,
        canceledBookings,
        monthlyRevenue,
        bookingTrends,
        topTurfs,
        userGrowth
      };
  };

  const refreshData = async () => {
    setRefreshing(true);
    if (isDummyData) {
      // Generate fresh dummy data
      setAnalyticsData(generateDummyData());
    } else {
      // Try to load real data
      await loadAnalyticsData();
    }
    setRefreshing(false);
  };

  const toggleDummyData = () => {
    if (isDummyData) {
      // Try to load real data
      loadAnalyticsData();
    } else {
      // Show dummy data
      setAnalyticsData(generateDummyData());
      setIsDummyData(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-teal-500/20 text-teal-400';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400';
      case 'canceled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={loadAnalyticsData}
            className="px-4 py-2 bg-teal-400 hover:bg-teal-500 rounded-lg text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen pt-16 px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
          <p className="text-gray-300">Analytics data is not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4 mt-10 pt-2">
            <div className="flex items-center space-x-4">
            <div className='flex flex-col gap-2 '>
              <div className='flex gap-4'>
                  <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Analytics <span className="text-teal-400">Dashboard</span>
              </h1>
              </div>
              <p className="text-gray-300 text-base sm:text-lg">Comprehensive insights into your synthetic field booking business</p>
            </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={toggleDummyData}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                title={isDummyData ? "Switch to Real Data" : "Show Sample Data"}
              >
                <Star className={`w-5 h-5 text-white ${isDummyData ? 'text-yellow-400' : ''}`} />
              </button>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 bg-zinc-700 border border-gray-600 rounded-xl text-white focus:border-teal-400 focus:outline-none"
              >
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          </div>
          
          
          {/* Dummy Data Indicator */}
          {isDummyData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl"
            >
              <div className="flex items-center space-x-2 text-yellow-300">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Sample Data Mode</span>
                <span className="text-xs opacity-75">• Showing demonstration data • Click the star button to try loading real data • Use refresh button for new sample data</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: 'Total Revenue', 
              value: `₹${analyticsData.totalRevenue.toLocaleString()}`, 
              icon: DollarSign, 
              color: 'from-teal-400 to-teal-600',
              change: '+12.5%'
            },
            { 
              label: 'Total Bookings', 
              value: analyticsData.totalBookings.toString(), 
              icon: Calendar, 
              color: 'from-blue-500 to-purple-600',
              change: '+8.2%'
            },
            { 
              label: 'Total Users', 
              value: analyticsData.totalUsers.toString(), 
              icon: Users, 
              color: 'from-purple-500 to-pink-600',
              change: '+15.3%'
            },
            { 
              label: 'Average Rating', 
              value: `${analyticsData.averageRating}/5`, 
              icon: Star, 
              color: 'from-yellow-500 to-orange-600',
              change: '+2.1%'
            }
          ].map((metric, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-teal-400 font-medium">{metric.change}</div>
                  <div className="text-xs text-gray-400">vs last period</div>
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-gray-300 text-sm">{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Analytics Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Booking Status */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <PieChart className="w-5 h-5 text-teal-400 mr-2" />
              Booking Status
            </h3>
            <div className="space-y-4">
              {[
                { status: 'Completed', count: analyticsData.completedBookings, color: 'bg-teal-400' },
                { status: 'Pending', count: analyticsData.pendingBookings, color: 'bg-blue-500' },
                { status: 'Canceled', count: analyticsData.canceledBookings, color: 'bg-red-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-gray-300">{item.status}</span>
                  </div>
                  <span className="text-white font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Turfs */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="w-5 h-5 text-blue-400 mr-2" />
              Top Fields
            </h3>
            <div className="space-y-4">
              {analyticsData.topTurfs.length > 0 ? (
                analyticsData.topTurfs.map((turf, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium truncate">{turf.name}</div>
                    <div className="text-sm text-gray-400">{turf.bookings} bookings</div>
                  </div>
                  <div className="text-right">
                    <div className="text-teal-400 font-semibold">₹{turf.revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">revenue</div>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-4">No turf data available</div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 text-purple-400 mr-2" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-teal-400" />
                  <span className="text-gray-300">Active Fields</span>
                </div>
                <span className="text-white font-semibold">{analyticsData.activeTurfs}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Conversion Rate</span>
                </div>
                <span className="text-white font-semibold">
                  {analyticsData.totalBookings > 0 
                    ? Math.round((analyticsData.completedBookings / analyticsData.totalBookings) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Avg. Rating</span>
                </div>
                <span className="text-white font-semibold">{analyticsData.averageRating}/5</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Monthly Revenue Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 text-teal-400 mr-2" />
              Monthly Revenue
            </h3>
            <div className="h-64 relative">
              {analyticsData.monthlyRevenue.length > 0 ? (
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Clean gradients */}
                  <defs>
                    <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Clean grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={40 + i * 32}
                      x2="400"
                      y2={40 + i * 32}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Y-axis labels */}
                  {(() => {
                    const maxRevenue = Math.max(...analyticsData.monthlyRevenue.map(r => r.revenue));
                    return [0, 1, 2, 3, 4].map((i) => {
                      const value = Math.round((maxRevenue * (4 - i)) / 4);
                      return (
                        <text
                          key={i}
                          x="8"
                          y={45 + i * 32}
                          className="text-xs fill-gray-400"
                          style={{ fontSize: '10px' }}
                        >
                          ₹{(value / 1000).toFixed(0)}k
                        </text>
                      );
                    });
                  })()}
                  
                  {/* Data points and line */}
                  {(() => {
                const maxRevenue = Math.max(...analyticsData.monthlyRevenue.map(r => r.revenue));
                    const points = analyticsData.monthlyRevenue.map((item, index) => {
                      const x = (index / (analyticsData.monthlyRevenue.length - 1)) * 360 + 20;
                      const y = 200 - ((item.revenue / maxRevenue) * 160) - 20;
                      return `${x},${y}`;
                    }).join(' ');
                    
                    const areaPoints = analyticsData.monthlyRevenue.map((item, index) => {
                      const x = (index / (analyticsData.monthlyRevenue.length - 1)) * 360 + 20;
                      const y = 200 - ((item.revenue / maxRevenue) * 160) - 20;
                      return `${x},${y}`;
                    }).join(' ');
                    
                    return (
                      <>
                        {/* Clean area fill */}
                        <path
                          d={`M ${areaPoints} L ${analyticsData.monthlyRevenue[analyticsData.monthlyRevenue.length - 1].revenue > 0 ? 
                            (360 + 20) : 20},200 L 20,200 Z`}
                          fill="url(#revenueGradient)"
                        />
                        {/* Clean line */}
                        <polyline
                          points={points}
                          fill="none"
                          stroke="#2dd4bf"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Clean data points */}
                        {analyticsData.monthlyRevenue.map((item, index) => {
                          const x = (index / (analyticsData.monthlyRevenue.length - 1)) * 360 + 20;
                          const y = 200 - ((item.revenue / maxRevenue) * 160) - 20;
                          return (
                            <g key={index}>
                              <circle
                                cx={x}
                                cy={y}
                                r="3"
                                fill="#2dd4bf"
                                className="hover:r-4 transition-all duration-200 cursor-pointer"
                                onMouseEnter={(e) => {
                                  const tooltip = document.createElement('div');
                                  tooltip.className = 'absolute bg-black/90 text-white px-2 py-1 rounded text-xs pointer-events-none';
                                  tooltip.innerHTML = `
                                    <div class="font-medium text-teal-400">${item.month}</div>
                                    <div class="text-white">₹${item.revenue.toLocaleString()}</div>
                                  `;
                                  tooltip.style.left = `${e.clientX + 10}px`;
                                  tooltip.style.top = `${e.clientY - 30}px`;
                                  tooltip.style.zIndex = '1000';
                                  document.body.appendChild(tooltip);
                                  e.currentTarget.setAttribute('data-tooltip', 'true');
                                }}
                                onMouseLeave={(e) => {
                                  const tooltip = document.querySelector('[data-tooltip="true"]');
                                  if (tooltip) {
                                    document.body.removeChild(tooltip);
                                    e.currentTarget.removeAttribute('data-tooltip');
                                  }
                                }}
                              />
                              {/* Value label */}
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                className="text-xs fill-teal-400 font-medium"
                                style={{ fontSize: '10px' }}
                              >
                                ₹{(item.revenue / 1000).toFixed(0)}k
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                  
                  {/* X-axis labels */}
                  {analyticsData.monthlyRevenue.map((item, index) => {
                    const x = (index / (analyticsData.monthlyRevenue.length - 1)) * 360 + 20;
                return (
                      <text
                        key={index}
                        x={x}
                        y="195"
                        textAnchor="middle"
                        className="text-xs fill-gray-400"
                        style={{ fontSize: '10px' }}
                      >
                        {item.month}
                      </text>
                    );
                  })}
                </svg>
              ) : (
                <div className="text-gray-400 text-center py-4 w-full">No revenue data available</div>
              )}
            </div>
          </div>

          {/* Booking Trends Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-blue-400 mr-2" />
              Booking Trends (Last 7 Days)
            </h3>
            <div className="h-64 relative">
              {analyticsData.bookingTrends.length > 0 ? (
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Clean gradients */}
                  <defs>
                    <linearGradient id="bookingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Clean grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={40 + i * 32}
                      x2="400"
                      y2={40 + i * 32}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Y-axis labels */}
                  {(() => {
                    const maxBookings = Math.max(...analyticsData.bookingTrends.map(b => b.bookings));
                    return [0, 1, 2, 3, 4].map((i) => {
                      const value = Math.round((maxBookings * (4 - i)) / 4);
                      return (
                        <text
                          key={i}
                          x="8"
                          y={45 + i * 32}
                          className="text-xs fill-gray-400"
                          style={{ fontSize: '10px' }}
                        >
                          {value}
                        </text>
                      );
                    });
                  })()}
                  
                  {/* Data points and line */}
                  {(() => {
                const maxBookings = Math.max(...analyticsData.bookingTrends.map(b => b.bookings));
                    const points = analyticsData.bookingTrends.map((item, index) => {
                      const x = (index / (analyticsData.bookingTrends.length - 1)) * 360 + 20;
                      const y = 200 - ((item.bookings / maxBookings) * 160) - 20;
                      return `${x},${y}`;
                    }).join(' ');
                    
                    const areaPoints = analyticsData.bookingTrends.map((item, index) => {
                      const x = (index / (analyticsData.bookingTrends.length - 1)) * 360 + 20;
                      const y = 200 - ((item.bookings / maxBookings) * 160) - 20;
                      return `${x},${y}`;
                    }).join(' ');
                    
                    return (
                      <>
                        {/* Clean area fill */}
                        <path
                          d={`M ${areaPoints} L ${analyticsData.bookingTrends[analyticsData.bookingTrends.length - 1].bookings > 0 ? 
                            (360 + 20) : 20},200 L 20,200 Z`}
                          fill="url(#bookingGradient)"
                        />
                        {/* Clean line */}
                        <polyline
                          points={points}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Clean data points */}
                        {analyticsData.bookingTrends.map((item, index) => {
                          const x = (index / (analyticsData.bookingTrends.length - 1)) * 360 + 20;
                          const y = 200 - ((item.bookings / maxBookings) * 160) - 20;
                          return (
                            <g key={index}>
                              <circle
                                cx={x}
                                cy={y}
                                r="3"
                                fill="#3b82f6"
                                className="hover:r-4 transition-all duration-200 cursor-pointer"
                                onMouseEnter={(e) => {
                                  const tooltip = document.createElement('div');
                                  tooltip.className = 'absolute bg-black/90 text-white px-2 py-1 rounded text-xs pointer-events-none';
                                  tooltip.innerHTML = `
                                    <div class="font-medium text-blue-400">${item.date}</div>
                                    <div class="text-white">${item.bookings} bookings</div>
                                  `;
                                  tooltip.style.left = `${e.clientX + 10}px`;
                                  tooltip.style.top = `${e.clientY - 30}px`;
                                  tooltip.style.zIndex = '1000';
                                  document.body.appendChild(tooltip);
                                  e.currentTarget.setAttribute('data-tooltip', 'true');
                                }}
                                onMouseLeave={(e) => {
                                  const tooltip = document.querySelector('[data-tooltip="true"]');
                                  if (tooltip) {
                                    document.body.removeChild(tooltip);
                                    e.currentTarget.removeAttribute('data-tooltip');
                                  }
                                }}
                              />
                              {/* Value label */}
                              <text
                                x={x}
                                y={y - 10}
                                textAnchor="middle"
                                className="text-xs fill-blue-400 font-medium"
                                style={{ fontSize: '10px' }}
                              >
                                {item.bookings}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                  
                  {/* X-axis labels */}
                  {analyticsData.bookingTrends.map((item, index) => {
                    const x = (index / (analyticsData.bookingTrends.length - 1)) * 360 + 20;
                return (
                      <text
                        key={index}
                        x={x}
                        y="195"
                        textAnchor="middle"
                        className="text-xs fill-gray-400"
                        style={{ fontSize: '10px' }}
                      >
                        {item.date}
                      </text>
                    );
                  })}
                </svg>
              ) : (
                <div className="text-gray-400 text-center py-4 w-full">No booking trends data available</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 text-purple-400 mr-2" />
            User Growth
          </h3>
          <div className="h-64 relative">
            {analyticsData.userGrowth.length > 0 ? (
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Clean gradients */}
                <defs>
                  <linearGradient id="userGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                
                {/* Clean grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={40 + i * 32}
                    x2="400"
                    y2={40 + i * 32}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Y-axis labels */}
                {(() => {
                  const maxUsers = Math.max(...analyticsData.userGrowth.map(u => u.users));
                  return [0, 1, 2, 3, 4].map((i) => {
                    const value = Math.round((maxUsers * (4 - i)) / 4);
                    return (
                      <text
                        key={i}
                        x="8"
                        y={45 + i * 32}
                        className="text-xs fill-gray-400"
                        style={{ fontSize: '10px' }}
                      >
                        {value > 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                      </text>
                    );
                  });
                })()}
                
                {/* Data points and line */}
                {(() => {
              const maxUsers = Math.max(...analyticsData.userGrowth.map(u => u.users));
                  const points = analyticsData.userGrowth.map((item, index) => {
                    const x = (index / (analyticsData.userGrowth.length - 1)) * 360 + 20;
                    const y = 200 - ((item.users / maxUsers) * 160) - 20;
                    return `${x},${y}`;
                  }).join(' ');
                  
                  const areaPoints = analyticsData.userGrowth.map((item, index) => {
                    const x = (index / (analyticsData.userGrowth.length - 1)) * 360 + 20;
                    const y = 200 - ((item.users / maxUsers) * 160) - 20;
                    return `${x},${y}`;
                  }).join(' ');
                  
                  return (
                    <>
                      {/* Clean area fill */}
                      <path
                        d={`M ${areaPoints} L ${analyticsData.userGrowth[analyticsData.userGrowth.length - 1].users > 0 ? 
                          (360 + 20) : 20},200 L 20,200 Z`}
                        fill="url(#userGradient)"
                      />
                      {/* Clean line */}
                      <polyline
                        points={points}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Clean data points */}
                      {analyticsData.userGrowth.map((item, index) => {
                        const x = (index / (analyticsData.userGrowth.length - 1)) * 360 + 20;
                        const y = 200 - ((item.users / maxUsers) * 160) - 20;
                        return (
                          <g key={index}>
                            <circle
                              cx={x}
                              cy={y}
                              r="3"
                              fill="#a855f7"
                              className="hover:r-4 transition-all duration-200 cursor-pointer"
                              onMouseEnter={(e) => {
                                const tooltip = document.createElement('div');
                                tooltip.className = 'absolute bg-black/90 text-white px-2 py-1 rounded text-xs pointer-events-none';
                                tooltip.innerHTML = `
                                  <div class="font-medium text-purple-400">${item.month}</div>
                                  <div class="text-white">${item.users} users</div>
                                `;
                                tooltip.style.left = `${e.clientX + 10}px`;
                                tooltip.style.top = `${e.clientY - 30}px`;
                                tooltip.style.zIndex = '1000';
                                document.body.appendChild(tooltip);
                                e.currentTarget.setAttribute('data-tooltip', 'true');
                              }}
                              onMouseLeave={(e) => {
                                const tooltip = document.querySelector('[data-tooltip="true"]');
                                if (tooltip) {
                                  document.body.removeChild(tooltip);
                                  e.currentTarget.removeAttribute('data-tooltip');
                                }
                              }}
                            />
                            {/* Value label */}
                            <text
                              x={x}
                              y={y - 10}
                              textAnchor="middle"
                              className="text-xs fill-purple-400 font-medium"
                              style={{ fontSize: '10px' }}
                            >
                              {item.users > 1000 ? `${(item.users / 1000).toFixed(0)}k` : item.users}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
                
                {/* X-axis labels */}
                {analyticsData.userGrowth.map((item, index) => {
                  const x = (index / (analyticsData.userGrowth.length - 1)) * 360 + 20;
              return (
                    <text
                      key={index}
                      x={x}
                      y="195"
                      textAnchor="middle"
                      className="text-xs fill-gray-400"
                      style={{ fontSize: '10px' }}
                    >
                      {item.month}
                    </text>
                  );
                })}
              </svg>
            ) : (
              <div className="text-gray-400 text-center py-4 w-full">No user growth data available</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 
