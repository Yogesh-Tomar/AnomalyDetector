import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect } from 'react'
import { endpoints } from '../services/api'
import { useSession } from '../services/SessionContext'
import './layout.css'
import logo from '../assets/logo.svg'

export function Layout() {
  // Theme toggle state
  const [dark, setDark] = useState(false)
  // User dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false)
  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Theme toggle logic
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  // Ctrl+K search focus
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Sidebar auto-hide for screens < 900px
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 900) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const navigate = useNavigate();
  const { user } = useSession();
  async function handleLogout() {
    try {
      await endpoints.logout();
    } catch (e) {
      // ignore errors
    }
    localStorage.clear();
    setDropdownOpen(false);
    navigate('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar with section headings and groupings */}
      {sidebarOpen && (
        <aside className="w-64 min-h-screen flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-100">
            <img src={logo} alt="Logo" />
          </div>        
          <div className="sidebar-section-label px-4 mt-4 text-[11px] font-semibold text-gray-400 tracking-[0.08em] uppercase">OVERVIEW</div>
          <nav className="mt-2 flex flex-col gap-1 px-3">
            {/* <NavLink to="/dashboard" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' 
              : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
              {({isActive}) => (
                <>
                  <i className={isActive ? 'fa-solid fa-gauge text-[18px] w-5 text-indigo-500' : 'fa-solid fa-gauge text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                  <span className='sidebar-label'>Dashboard</span>
                </>
              )}
            </NavLink> */}
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' 
              : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
              {({isActive}) => (
                <>
                  <i className={isActive ? 'fa-solid fa-gauge text-[18px] w-5 text-indigo-500' : 'fa-solid fa-gauge text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                  <span className='sidebar-label'>Dashboard</span>
                </>
              )}
            </NavLink>
            <NavLink to="/vHunt" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
                {({isActive}) => (
                  <>
                    <i className={isActive ? 'fa-solid fa-search text-[18px] w-5 text-indigo-500' : 'fa-solid fa-search text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                    <span className='sidebar-label'>Investigations</span>
                  </>
                )}
              </NavLink>
            <NavLink to="/alerts" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
              {({isActive}) => (
                <>
                  <i className={isActive ? "fa-solid fa-bell text-[18px] w-5 text-indigo-500" : "fa-solid fa-bell text-[18px] w-5 text-gray-400"}></i>
                  <span className='sidebar-label'>Alerts</span>
                </>
              )}
            </NavLink>
            <NavLink to="/dumps" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
              {({isActive}) => (
                <>
                  <i className={isActive ? "fa-solid fa-bell text-[18px] w-5 text-indigo-500" : "fa-solid fa-bell text-[18px] w-5 text-gray-400"}></i>
                  <span className='sidebar-label'>Dumps</span>
                </>
              )}
            </NavLink>
          </nav>
          
            <div className="sidebar-section-label px-4 mt-4 text-[11px] font-semibold text-gray-400 tracking-[0.08em] uppercase">DATA</div>
            <nav className="mt-2 flex flex-col gap-1 px-3">
            <NavLink to="/entities" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
              {({isActive}) => (
                <>
                  <i className={isActive ? 'fa-solid fa-layer-group text-[18px] w-5 text-indigo-500' : 'fa-solid fa-layer-group text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                  <span className='sidebar-label'>Entities</span>
                </>
              )}
            </NavLink>
            <NavLink to="/network-graph" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
              {({isActive}) => (
                <>
                  <i className={isActive ? 'fa-solid fa-project-diagram text-[18px] w-5 text-indigo-500' : 'fa-solid fa-project-diagram text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                  <span className='sidebar-label'>Network Graph</span>
                </>
              )}
            </NavLink>
            {/* Admin-only links */}
            {user?.role === 'admin' && (
              <>
              <NavLink to="/settings" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
                {({isActive}) => (
                  <>
                    <i className={isActive ? 'fa-solid fa-gear text-[18px] w-5 text-indigo-500' : 'fa-solid fa-gear text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                    <span className='sidebar-label'>Settings</span>
                  </>
                )}
              </NavLink>
              <NavLink to="/cmdb" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
                {({isActive}) => (
                  <>
                    <i className={isActive ? 'fa-solid fa-database text-[18px] w-5 text-indigo-500' : 'fa-solid fa-database text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                    <span className='sidebar-label'>CMDB</span>
                  </>
                )}
              </NavLink>
              <NavLink to="/network" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
                {({isActive}) => (
                  <>
                    <i className={isActive ? 'fa-solid fa-network-wired text-[18px] w-5 text-indigo-500' : 'fa-solid fa-network-wired text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                    <span className='sidebar-label'>Network Management</span>
                  </>
                )}
              </NavLink>
              <NavLink to="/whitelist-rule-management" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
                {({isActive}) => (
                  <>
                    <i className={isActive ? 'fa-solid fa-ban text-[18px] w-5 text-indigo-500' : 'fa-solid fa-ban text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                    <span className='sidebar-label'>Exclude Rule Manager</span>
                  </>
                )}
              </NavLink>              
                <NavLink to="/groups" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
                  {({isActive}) => (
                    <>
                      <i className={isActive ? 'fa-solid fa-users text-[18px] w-5 text-indigo-500' : 'fa-solid fa-users text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                      <span className='sidebar-label'>Groups</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/configurations" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
                  {({isActive}) => (
                    <>
                      <i className={isActive ? 'fa-solid fa-sliders text-[18px] w-5 text-indigo-500' : 'fa-solid fa-sliders text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                      <span className='sidebar-label'>Configurations</span>
                    </>
                  )}
                </NavLink>
                <NavLink to="/user-management" className={({isActive}) => isActive ? 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors bg-indigo-50 text-indigo-600 font-semibold ring-1 ring-inset ring-indigo-100' : 'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900'}>
                  {({isActive}) => (
                    <>
                      <i className={isActive ? 'fa-solid fa-user-gear text-[18px] w-5 text-indigo-500' : 'fa-solid fa-user-gear text-[18px] w-5 text-gray-400 group-hover:text-gray-500'}></i>
                      <span className='sidebar-label'>User Management</span>
                    </>
                  )}
                </NavLink>
              </>
            )} 
          </nav>         
        </aside>
      )}
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar with search, theme toggle, notifications, user avatar dropdown */}
        <header className="w-full sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur border-b border-gray-200 dark:bg-slate-900/70 dark:border-slate-800">
          {/* Toggle button for sidebar */}
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
            aria-label="Toggle sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="fa-solid fa-bars"></i>
          </button>
          {/* Left: page title */}
          <div className="font-bold text-xl text-blue-900 tracking-tight"></div>
          {/* Center: search bar */}
          <div className="flex-1 flex justify-center">
            {/* <div className="relative w-full max-w-xs">
              <input
                ref={searchRef}
                type="search"
                placeholder="Search or type command..."
                className="w-full pl-10 pr-16 h-10 rounded-2xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center justify-center h-6 px-2 rounded-md border text-[11px] text-gray-500 border-gray-200">Ctrl K</span>
            </div> */}
          </div>
          {/* Right: theme toggle, notifications, user avatar dropdown */}
          <nav className="flex items-center gap-2 ml-4">
            {/* <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
              aria-label="Toggle theme"
              onClick={() => setDark(d => !d)}
            >
              <i className={`fa-solid ${dark ? 'fa-sun' : 'fa-moon'}`}></i>
            </button> */}
            {/* <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50" aria-label="Notifications">
              <i className="fa-solid fa-bell"></i>
            </button> */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 pl-1 pr-2 h-10 rounded-xl border border-gray-200 hover:bg-indigo-50 shadow-sm"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen(open => !open)}
              >
                <div className="h-9 w-9 rounded-full bg-gray-200 text-gray-500 grid place-items-center overflow-hidden border-2 border-gray-300 shadow">
                  <i className="fa-solid fa-user text-xl"></i>
                </div>
                <span className="hidden md:flex flex-col items-start leading-tight ml-1">
                  <span className="text-sm font-semibold text-slate-900">{user?.username || 'User'}</span>
                  <span className="text-xs text-gray-500">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</span>
                </span>
                <span className="ml-1 text-gray-400">
                  <i className="fa-solid fa-chevron-down"></i>
                </span>
              </button>
              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 origin-top-right rounded-xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5 z-50">
                  <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-500 grid place-items-center overflow-hidden border-2 border-gray-300 shadow">
                      <i className="fa-solid fa-user text-xl"></i>
                    </div>
                    <div>
                      <div className="text-base font-semibold text-slate-900">{user?.username || 'User'}</div>
                      <div className="text-xs text-gray-500">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</div>
                    </div>
                  </div>
                  <button className="w-full text-left px-5 py-2 text-sm hover:bg-indigo-50 transition">Profile</button>
                  <button className="w-full text-left px-5 py-2 text-sm hover:bg-indigo-50 transition">Settings</button>
                  <div className="my-1 border-t border-gray-100"></div>
                  <button onClick={handleLogout} className="w-full text-left px-5 py-2 text-sm text-red-600 hover:bg-red-50 transition">Logout</button>
                </div>
              )}
            </div>
          </nav>
        </header>
        <main className="content-ui flex-1 overflow-auto bg-gray-50 xs:p-2 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
