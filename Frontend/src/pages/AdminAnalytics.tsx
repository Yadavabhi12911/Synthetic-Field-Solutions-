import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Filter,
  Activity,
  PieChart,
  Target,
  Clock,
  Star,
  RefreshCw
} from 'lucide-react';
import { getAnalyticsData } from '../api';
import { Page, PageHeader } from '../components/layout/Page';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageSkeleton } from '../components/ui/Skeleton';
import { StatCard } from '../components/ui/StatCard';

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

  useEffect(() => {
    loadAnalyticsData();
  }, [timeFilter]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAnalyticsData();
      
      if (response.statusCode === 200 && response.data) {
        setAnalyticsData(response.data);
      } else {
        throw new Error(response.message || 'Failed to load analytics data');
      }
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setAnalyticsData(null);
      setError(err?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-teal-500/20 text-teal-400';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400';
      case 'canceled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <Page>
        <Card className="border-danger/30">
          <CardBody className="py-12 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-danger" />
            <h3 className="mb-2 type-heading">Could not load analytics</h3>
            <p className="mb-4 text-muted">{error}</p>
            <Button type="button" onClick={loadAnalyticsData}>Try again</Button>
          </CardBody>
        </Card>
      </Page>
    );
  }

  if (!analyticsData) {
    return (
      <Page>
        <Card>
          <CardBody className="py-12 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted" />
            <h3 className="mb-2 type-heading">No data available</h3>
            <p className="text-muted">Analytics data is not available yet.</p>
          </CardBody>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        title="Analytics"
        description="Insights into bookings, revenue, and field performance."
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            >
              <option value="month">This month</option>
              <option value="year">This year</option>
            </select>
          </div>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total revenue', value: `₹${analyticsData.totalRevenue.toLocaleString()}`, icon: DollarSign },
          { label: 'Total bookings', value: analyticsData.totalBookings.toString(), icon: Calendar },
          { label: 'Total users', value: analyticsData.totalUsers.toString(), icon: Users },
          { label: 'Average rating', value: `${analyticsData.averageRating}/5`, icon: Star },
        ].map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
          />
        ))}
      </div>

        {/* Analytics Sections */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Booking Status */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="mb-4 flex items-center type-heading">
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
                  <span className="text-foreground font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Turfs */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="mb-4 flex items-center type-heading">
              <Target className="w-5 h-5 text-blue-400 mr-2" />
              Top Fields
            </h3>
            <div className="space-y-4">
              {analyticsData.topTurfs.length > 0 ? (
                analyticsData.topTurfs.map((turf, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-foreground font-medium truncate">{turf.name}</div>
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
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="mb-4 flex items-center type-heading">
              <Activity className="w-5 h-5 text-purple-400 mr-2" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-teal-400" />
                  <span className="text-gray-300">Active Fields</span>
                </div>
                <span className="text-foreground font-semibold">{analyticsData.activeTurfs}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Conversion Rate</span>
                </div>
                <span className="text-foreground font-semibold">
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
                <span className="text-foreground font-semibold">{analyticsData.averageRating}/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Monthly Revenue Chart */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="mb-4 flex items-center type-heading">
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
                                  tooltip.className = 'absolute bg-black/90 text-foreground px-2 py-1 rounded text-xs pointer-events-none';
                                  tooltip.innerHTML = `
                                    <div class="font-medium text-teal-400">${item.month}</div>
                                    <div class="text-foreground">₹${item.revenue.toLocaleString()}</div>
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
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="mb-4 flex items-center type-heading">
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
                                  tooltip.className = 'absolute bg-black/90 text-foreground px-2 py-1 rounded text-xs pointer-events-none';
                                  tooltip.innerHTML = `
                                    <div class="font-medium text-blue-400">${item.date}</div>
                                    <div class="text-foreground">${item.bookings} bookings</div>
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
        </div>

        {/* User Growth Chart */}
        <div
          className="bg-surface border border-border rounded-lg p-6"
        >
          <h3 className="type-heading mb-4 flex items-center">
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
                                tooltip.className = 'absolute bg-black/90 text-foreground px-2 py-1 rounded text-xs pointer-events-none';
                                tooltip.innerHTML = `
                                  <div class="font-medium text-purple-400">${item.month}</div>
                                  <div class="text-foreground">${item.users} users</div>
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
        </div>
    </Page>
  );
};

export default AdminAnalytics; 
