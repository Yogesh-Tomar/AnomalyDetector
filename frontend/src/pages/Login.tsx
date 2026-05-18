import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { endpoints } from '../services/api'
import { useSession } from '../services/SessionContext'
import logo from '../assets/logo.svg'
import { useMicrosoftAuth } from '../services/MicrosoftAuth';

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [msLoading, setMsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { setSession } = useSession()
  const { loginWithMicrosoft, error: msError } = useMicrosoftAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Username and password required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await endpoints.login(username, password)
      // Expect: { token: string, user: { username, role, email } }
      const token = res.data.token || res.data?.token || res.data;
      const user = res.data.user || res.data?.user;
      if (token && user) {
        // Normalize role to lowercase for route protection
        setSession({ username: user.username, role: (user.role || '').toLowerCase(), email: user.email }, token)
        navigate('/')
      } else {
        setError('No token or user info received from server')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-100">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/90 shadow-2xl rounded-2xl px-8 py-10 flex flex-col items-center border border-gray-100">
          <img src={logo} alt="Anomaly Detector" className="h-14 mb-4 " />
          <h1 className="text-2xl font-extrabold text-blue-900 mb-2 tracking-tight">Threat/Anomaly Dashboard</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>
          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
               placeholder="Username" required 
               className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Password" 
                  required 
                  className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/4 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <button type="submit" className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow transition-all flex items-center justify-center gap-2" disabled={loading}>
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Divider */}
            <div className="flex items-center w-full my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-3 text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Microsoft Login Button */}
            <button 
              onClick={async () => {
                setMsLoading(true);
                try {
                  await loginWithMicrosoft();
                  // Check if login was successful and navigate
                  const token = localStorage.getItem('jwt');
                  if (token) {
                    navigate('/dashboard');
                  }
                } finally {
                  setMsLoading(false);
                }
              }}
              disabled={msLoading || loading}
              className="w-full h-11 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-base shadow-md border border-gray-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {msLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                  </svg>
                  Microsoft Login
                </>
              )}
            </button>

            {msError && <p className="text-red-600 text-sm mt-4">{msError}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}