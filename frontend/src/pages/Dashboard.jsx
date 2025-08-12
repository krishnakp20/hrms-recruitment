import { useState, useEffect } from 'react'
import { Users, UserPlus, Briefcase, FileText, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await dashboardAPI.getStats()
        setStats(statsResponse.data)
        
        // Fetch recent activities
        const activitiesResponse = await dashboardAPI.getRecentActivities()
        setRecentActivities(activitiesResponse.data)
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
        
        // Fallback to default data if API fails
        setStats([
          {
            name: 'Total Employees',
            value: '0',
            change: '+0%',
            changeType: 'positive',
            icon: Users,
          },
          {
            name: 'Active Candidates',
            value: '0',
            change: '+0%',
            changeType: 'positive',
            icon: UserPlus,
          },
          {
            name: 'Open Positions',
            value: '0',
            change: '+0%',
            changeType: 'positive',
            icon: Briefcase,
          },
          {
            name: 'Applications',
            value: '0',
            change: '+0%',
            changeType: 'positive',
            icon: FileText,
          },
        ])
        
        setRecentActivities([
          {
            id: 1,
            type: 'info',
            message: 'Welcome to HRMS Recruitment System',
            time: 'Just now',
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your HRMS dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent activities</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/jobs" className="w-full btn-primary block text-center">
              Post New Job
            </Link>
            <Link to="/candidates" className="w-full btn-secondary block text-center">
              Add Candidate
            </Link>
{/*             <Link to="/" className="w-full btn-secondary block text-center"> */}
{/*               Schedule Interview */}
{/*             </Link> */}
{/*             <Link to="/" className="w-full btn-secondary block text-center"> */}
{/*               Generate Report */}
{/*             </Link> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 