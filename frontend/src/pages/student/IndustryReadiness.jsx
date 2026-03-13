import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import { toast } from 'react-toastify'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts'

const IndustryReadiness = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/submissions/industry-readiness')
      setData(res.data.industryReadiness)
    } catch (error) {
      toast.error('Failed to load industry readiness')
    } finally {
      setLoading(false)
    }
  }

  const getLevelColor = (level) => {
    const colors = {
      'Industry Ready': 'text-green-600 bg-green-100',
      'Advanced': 'text-blue-600 bg-blue-100',
      'Intermediate': 'text-yellow-600 bg-yellow-100',
      'Developing': 'text-orange-600 bg-orange-100',
      'Beginner': 'text-red-600 bg-red-100'
    }
    return colors[level] || 'text-gray-600 bg-gray-100'
  }

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return '📈'
    if (trend === 'declining') return '📉'
    return '➡️'
  }

  const radarData = data ? [
    { metric: 'Code Quality', value: data.breakdown.codeQuality },
    { metric: 'Problem Solving', value: data.breakdown.problemSolving },
    { metric: 'Consistency', value: data.breakdown.consistency },
  ] : []

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🎯 Industry Readiness Score</h1>

        {data?.totalSubmissions === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-gray-500">Submit some assignments first to see your industry readiness score.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Main Score Card */}
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4 ${getLevelColor(data?.level)}`}>
                {data?.level}
              </div>
              <div className={`text-7xl font-bold mb-2 ${getScoreColor(data?.score)}`}>
                {data?.score}
              </div>
              <p className="text-gray-500 text-lg mb-4">Industry Readiness Score</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>{getTrendIcon(data?.trend)}</span>
                <span className="capitalize">{data?.trend} trend</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm text-center">
                <p className="text-sm text-gray-500">Total Submissions</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">{data?.totalSubmissions}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm text-center">
                <p className="text-sm text-gray-500">Problems Solved</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{data?.correctCount}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm text-center">
                <p className="text-sm text-gray-500">Avg Quality Score</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{data?.avgScore}</p>
              </div>
            </div>

            {/* Radar Chart + Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-semibold text-gray-700 mb-4">Skills Breakdown</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} />
                    <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-semibold text-gray-700 mb-4">Score Breakdown</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Code Quality', value: data?.breakdown.codeQuality, color: 'bg-indigo-500' },
                    { label: 'Problem Solving', value: data?.breakdown.problemSolving, color: 'bg-green-500' },
                    { label: 'Consistency', value: data?.breakdown.consistency, color: 'bg-blue-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* What to improve */}
                <div className="mt-5 p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs font-semibold text-indigo-700 mb-1">💡 To improve your score:</p>
                  {data?.breakdown.codeQuality < 70 && <p className="text-xs text-indigo-600">• Improve code quality by following best practices</p>}
                  {data?.breakdown.problemSolving < 70 && <p className="text-xs text-indigo-600">• Solve more problems correctly to boost problem solving score</p>}
                  {data?.breakdown.consistency < 70 && <p className="text-xs text-indigo-600">• Submit consistently with scores above 60</p>}
                  {data?.score >= 85 && <p className="text-xs text-indigo-600">• You are industry ready! Keep it up! 🎉</p>}
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            {data?.recentSubmissions?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="font-semibold text-gray-700 mb-4">Recent Activity</h2>
                <div className="space-y-2">
                  {data.recentSubmissions.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{sub.title}</p>
                        <p className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium ${sub.status === 'CORRECT' ? 'text-green-600' : 'text-red-600'}`}>{sub.status}</span>
                        <span className="font-bold text-indigo-600">{sub.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default IndustryReadiness