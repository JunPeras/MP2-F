import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { FontSizeProvider } from './context/FontSizeContext'
import { ThemeProvider } from './context/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <FontSizeProvider>
        <App />
      </FontSizeProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
