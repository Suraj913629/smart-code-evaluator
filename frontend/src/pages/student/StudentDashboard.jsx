import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { toast } from 'react-toastify'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAssignments() }, [])

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments')
      setAssignments(res.data.assignments)
    } catch (error) {
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const isDeadlinePassed = (deadline) => new Date() > new Date(deadline)

  const formatDeadline = (deadline) => new Date(deadline).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const getDaysLeft = (deadline) => {
    const diff = new Date(deadline) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return 'Expired'
    if (days === 0) return 'Due today'
    return `${days} day${days > 1 ? 's' : ''} left`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}! 👋</h1>
          <p className="text-gray-500 mt-1">Batch: {user?.batch}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Assignments</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{assignments.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {assignments.filter(a => !isDeadlinePassed(a.deadline)).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Badges Earned</p>
            <p className="text-3xl font-bold text-yellow-500 mt-1">{user?.badges?.length || 0}</p>
          </div>
        </div>
        {user?.badges?.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-8">
            <h2 className="font-semibold text-gray-700 mb-3">Your Badges 🏆</h2>
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge, i) => (
                <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-center space-x-2">
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-yellow-800">{badge.name}</p>
                    <p className="text-xs text-yellow-600">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Assignments</h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
            <p className="text-gray-500">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">No assignments yet for your batch.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => {
              const passed = isDeadlinePassed(assignment.deadline)
              return (
                <div key={assignment._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 text-lg">{assignment.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${passed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {passed ? 'Closed' : 'Open'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-2 line-clamp-2">{assignment.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span>🗓️ Due: {formatDeadline(assignment.deadline)}</span>
                        <span className={`font-medium ${passed ? 'text-red-500' : 'text-green-500'}`}>⏰ {getDaysLeft(assignment.deadline)}</span>
                        <span>💬 {assignment.language}</span>
                        <span>📝 {assignment.testCases?.length} test cases</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/student/submit/${assignment._id}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${passed ? 'bg-gray-100 text-gray-500 pointer-events-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                        {passed ? 'Closed' : 'Submit Code'}
                      </Link>
                      <Link to={`/student/leaderboard/${assignment._id}`}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                        Leaderboard
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard