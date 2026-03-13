import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import { toast } from 'react-toastify'

const Leaderboard = () => {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchLeaderboard() }, [assignmentId])

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get(`/submissions/leaderboard/${assignmentId}`)
      setLeaderboard(res.data.leaderboard)
    } catch (error) {
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h1>
        </div>
        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div></div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-gray-500">No submissions yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, i) => (
              <div key={i} className={`bg-white rounded-xl p-5 shadow-sm flex items-center gap-4 ${i < 3 ? 'border-2 border-yellow-200' : ''}`}>
                <div className="text-2xl w-8 text-center">{medals[i] || `#${i + 1}`}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{entry.student?.name}</p>
                  <p className="text-xs text-gray-400">{entry.student?.batch}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600 text-xl">{entry.score}</p>
                  <p className="text-xs text-gray-400">Quality Score</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${entry.grade === 'A' ? 'text-green-600' : entry.grade === 'B' ? 'text-blue-600' : 'text-yellow-600'}`}>{entry.grade}</p>
                  <p className={`text-xs ${entry.status === 'CORRECT' ? 'text-green-500' : 'text-red-500'}`}>{entry.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard