import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Intro() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedNetwork, setSelectedNetwork] = useState(null)

  const networks = [
    { name: 'MTN', color: 'bg-yellow-500', icon: '📱' },
    { name: 'ATigo', color: 'bg-blue-500', icon: '😊' },
    { name: 'Telecel', color: 'bg-red-500', icon: '🚀' },
    { name: 'Checkers', color: 'bg-green-500', icon: '✓' },
  ]

  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Banner */}
      <div className="bg-yellow-400 text-gray-900 rounded-lg shadow-lg p-8 mx-4 mt-4 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mema wo adwo, {user?.displayName || 'User'}!</h1>
            <p className="text-lg">Good Evening! Welcome to Datamart</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-gray-900 text-white px-4 py-2 rounded-full font-semibold hover:bg-gray-800 transition">
              Where Resellers Meet
            </button>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2">
            💳 Deposit Now
          </button>
          <button onClick={() => navigate('/orders')} className="bg-gray-800 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2">
            📦 Orders
          </button>
          <button className="bg-gray-800 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2">
            📊 Transactions
          </button>
          <button className="bg-gray-800 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2">
            📦 Bulk
          </button>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-800 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2">
            🏪 Agent Store
          </button>
        </div>
      </div>

      {/* System Status Card */}
      <div className="mx-4 mb-6">
        <div className="bg-gray-800 text-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h2 className="text-xl font-bold">System Online <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold ml-2">24/7</span></h2>
              <p className="text-gray-400 text-sm ml-4">⏰ 07:11:02 PM</p>
            </div>
            <div className="flex gap-4">
              <span className="text-yellow-400 font-semibold hover:underline cursor-pointer">⚡ Instant</span>
              <span className="text-yellow-400 font-semibold hover:underline cursor-pointer">🔒 Secure</span>
              <span className="text-yellow-400 font-semibold hover:underline cursor-pointer">🌐 Always Open</span>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mx-4 mb-6">
        <div className="bg-gray-800 text-yellow-400 rounded-lg p-6 shadow-lg flex justify-between items-center hover:bg-gray-700 transition cursor-pointer">
          <h2 className="text-lg font-bold">🦶 I Need Help</h2>
          <span className="text-2xl">›</span>
        </div>
      </div>

      {/* Place New Order Section */}
      <div className="mx-4 mb-8">
        <div className="border-t-4 border-yellow-400 pt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Place New Order</h2>

          {/* Network Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {networks.map((network) => (
              <div
                key={network.name}
                onClick={() => handleNetworkSelect(network)}
                className={`${network.color} rounded-lg p-8 cursor-pointer hover:shadow-lg transition transform hover:scale-105 flex flex-col items-center justify-center gap-4`}
              >
                <div className="text-5xl">{network.icon}</div>
                <span className="font-bold text-center text-sm">{network.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
