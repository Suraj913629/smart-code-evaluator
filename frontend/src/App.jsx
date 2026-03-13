import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import StudentDashboard from './pages/student/StudentDashboard'
import SubmitAssignment from './pages/student/SubmitAssignment'
import MySubmissions from './pages/student/MySubmissions'
import SubmissionResult from './pages/student/SubmissionResult'
import Leaderboard from './pages/student/Leaderboard'
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import CreateAssignment from './pages/faculty/CreateAssignment'
import AssignmentAnalytics from './pages/faculty/AssignmentAnalytics'
import ViewSubmissions from './pages/faculty/ViewSubmissions'
import IndustryReadiness from './pages/student/IndustryReadiness'
import PeerReviews from './pages/student/PeerReviews'

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'student' ? '/student' : '/faculty'} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'student' ? '/student' : '/faculty'} />} />
      <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/submit/:assignmentId" element={<ProtectedRoute roles={['student']}><SubmitAssignment /></ProtectedRoute>} />
      <Route path="/student/submissions" element={<ProtectedRoute roles={['student']}><MySubmissions /></ProtectedRoute>} />
      <Route path="/student/result/:submissionId" element={<ProtectedRoute roles={['student']}><SubmissionResult /></ProtectedRoute>} />
      <Route path="/student/leaderboard/:assignmentId" element={<ProtectedRoute roles={['student']}><Leaderboard /></ProtectedRoute>} />
      <Route path="/faculty" element={<ProtectedRoute roles={['faculty', 'admin']}><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/create-assignment" element={<ProtectedRoute roles={['faculty', 'admin']}><CreateAssignment /></ProtectedRoute>} />
      <Route path="/faculty/assignment/:id/analytics" element={<ProtectedRoute roles={['faculty', 'admin']}><AssignmentAnalytics /></ProtectedRoute>} />
      <Route path="/faculty/assignment/:id/submissions" element={<ProtectedRoute roles={['faculty', 'admin']}><ViewSubmissions /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={user ? (user.role === 'student' ? '/student' : '/faculty') : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/student/industry-readiness" element={<ProtectedRoute roles={['student']}><IndustryReadiness /></ProtectedRoute>} />
      <Route path="/student/peer-reviews" element={<ProtectedRoute roles={['student']}><PeerReviews /></ProtectedRoute>} />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App