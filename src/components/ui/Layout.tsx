import { BookOpen, Layers3, Plus, Search, Settings2 } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'

const NAV_LINKS = [
  { to: '/', label: 'Library', icon: BookOpen, end: true },
  { to: '/tier-board', label: 'Tier Board', icon: Layers3 },
  { to: '/discover', label: 'Discover', icon: Search },
  { to: '/settings', label: 'Settings', icon: Settings2 },
]

export function Layout() {
  const links = (mobile = false) => NAV_LINKS.map((link) => {
    const Icon = link.icon
    return (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}${mobile ? ' mobile' : ''}`}
      >
        <Icon aria-hidden="true" />
        <span>{link.label}</span>
      </NavLink>
    )
  })

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="wordmark" to="/" aria-label="Book Tracker home">
          <span className="wordmark-icon"><BookOpen aria-hidden="true" /></span>
          <span>Book Tracker</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">{links()}</nav>
        <Link className="button button-primary add-book-top" to="/search">
          <Plus aria-hidden="true" /> Add book
        </Link>
      </header>
      <main className="page-shell">
        <Outlet />
      </main>
      <nav className="mobile-nav" aria-label="Main navigation">{links(true)}</nav>
    </div>
  )
}
