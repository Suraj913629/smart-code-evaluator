import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../services/api'
import { toast } from 'react-toastify'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const GRADE_COLORS = { A: '#22c55e', B: '#3b82f6', C: '#eab308', D: '#f97316', F: '#ef4444' }

const AssignmentAnalytics = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAnalytics() }, [id])

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/assignments/${id}/analytics`)
      setAnalytics(res.data.analytics)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
    </div>
  )

  const gradeData = analytics ? Object.entries(analytics.gradeDistribution).map(([grade, count]) => ({ grade, count })) : []
  const pieData = gradeData.filter(d => d.count > 0).map(d => ({ name: d.grade, value: d.count }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800">Assignment Analytics</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Submissions', value: analytics?.totalSubmissions, color: 'text-indigo-600' },
            { label: 'Average Score', value: analytics?.avgScore, color: 'text-blue-600' },
            { label: 'Correct', value: analytics?.correctCount, color: 'text-green-600' },
            { label: 'Incorrect', value: analytics?.incorrectCount, color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm text-center">
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? 0}</p>
            </div>
          ))}
        </div>
        {analytics?.totalSubmissions > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-700 mb-4">Grade Distribution</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="grade" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {gradeData.map((entry) => <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="font-semibold text-gray-700 mb-4">Grade Breakdown</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={GRADE_COLORS[entry.name]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {analytics?.topPerformers?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">🏆 Top Performers</h2>
            <div className="space-y-3">
              {analytics.topPerformers.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{['🥇','🥈','🥉'][i] || `#${i+1}`}</span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${p.status === 'CORRECT' ? 'text-green-600' : 'text-red-600'}`}>{p.status}</span>
                    <span className="font-bold text-indigo-600">{p.score}</span>
                    <span className="font-bold">{p.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {analytics?.totalSubmissions === 0 && (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-gray-500">No submissions yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignmentAnalytics