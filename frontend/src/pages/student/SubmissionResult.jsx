import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

const SubmissionResult = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">View your results in submission history.</p>
          <button onClick={() => navigate('/student/submissions')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Go to My Submissions
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubmissionResult