import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface NavbarProps {
  title: string
  showBack?: boolean
  backTo?: string
}

export function Navbar({ title, showBack, backTo }: NavbarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleBack = () => {
    if (backTo) navigate(backTo)
    else navigate(-1)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar">
      {showBack && (
        <button className="navbar-back" onClick={handleBack} aria-label="Back">
          ←
        </button>
      )}
      <span className="navbar-title">{title}</span>
      {user && (
        <button className="navbar-action" onClick={handleLogout} title={`${user.username} (${user.levelDesp})`}>
          Logout
        </button>
      )}
    </nav>
  )
}
