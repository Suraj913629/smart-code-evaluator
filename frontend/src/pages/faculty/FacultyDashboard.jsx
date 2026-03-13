import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import { toast } from 'react-toastify'

const FacultyDashboard = () => {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return
    try {
      await api.delete(`/assignments/${id}`)
      setAssignments(prev => prev.filter(a => a._id !== id))
      toast.success('Assignment deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Faculty Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage assignments and view student performance</p>
          </div>
          <Link to="/faculty/create-assignment" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition">
            + Create Assignment
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Assignments</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{assignments.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{assignments.filter(a => new Date() < new Date(a.deadline)).length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Closed</p>
            <p className="text-3xl font-bold text-gray-500 mt-1">{assignments.filter(a => new Date() >= new Date(a.deadline)).length}</p>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Assignments</h2>
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div></div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-gray-500 mb-4">No assignments yet.</p>
            <Link to="/faculty/create-assignment" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Create your first assignment</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map(a => {
              const isActive = new Date() < new Date(a.deadline)
              return (
                <div key={a._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{a.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {isActive ? 'Active' : 'Closed'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1 mb-2">{a.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span>📚 Batch: {a.batch}</span>
                        <span>💬 {a.language}</span>
                        <span>🗓️ Due: {new Date(a.deadline).toLocaleDateString()}</span>
                        <span>📝 {a.testCases?.length} test cases</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Link to={`/faculty/assignment/${a._id}/submissions`} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition">Submissions</Link>
                      <Link to={`/faculty/assignment/${a._id}/analytics`} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition">Analytics</Link>
                      <button onClick={() => handleDelete(a._id)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition">Delete</button>
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

export default FacultyDashboard