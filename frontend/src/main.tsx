import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'
import { SessionProvider } from './services/SessionContext'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  import.meta.env.DEV ? (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  ) : (
    <React.StrictMode>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </React.StrictMode>
  )
)
