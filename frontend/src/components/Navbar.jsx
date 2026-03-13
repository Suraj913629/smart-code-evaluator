import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">💻</span>
            <span className="font-bold text-lg">CodeEval</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {user?.role === 'student' && (
              <>
                <Link to="/student" className="hover:text-indigo-200 transition">Dashboard</Link>
                <Link to="/student/submissions" className="hover:text-indigo-200 transition">My Submissions</Link>
                <Link to="/student/industry-readiness" className="hover:text-indigo-200 transition">Industry Readiness</Link>
                <Link to="/student/peer-reviews" className="hover:text-indigo-200 transition">Peer Reviews</Link>
              </>
            )}
            {(user?.role === 'faculty' || user?.role === 'admin') && (
              <>
                <Link to="/faculty" className="hover:text-indigo-200 transition">Dashboard</Link>
                <Link to="/faculty/create-assignment" className="hover:text-indigo-200 transition">Create Assignment</Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-indigo-200 capitalize">{user?.role} {user?.batch ? `· ${user.batch}` : ''}</p>
            </div>
            <button onClick={handleLogout} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-sm font-medium transition">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar