import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          React + TypeScript + Tailwind
        </h1>
        
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200 transform hover:scale-105"
        >
          count is {count}
        </button>

        <p className="mt-6 text-gray-600">
          Edit <code className="bg-gray-100 px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </div>
  )
}

export default App
