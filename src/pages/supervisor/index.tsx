import { Routes, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Navbar } from '../../components/Layout'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import MNCHSummary   from './MNCHSummary'
import CaseSummary   from './CaseSummary'
import DrugStock     from './DrugStock'
import HealthWorkers from './HealthWorkers'
import Townships     from './Townships'
import SystemPage    from './SystemPage'

function SupervisorMenu() {
  const menuItems = [
    { icon: '🤰', label: 'MNCH\nSummary',    path: '/supervisor/mnch' },
    { icon: '🩺', label: 'Case\nSummary',    path: '/supervisor/cases' },
    { icon: '💊', label: 'Drug\nStock',       path: '/supervisor/drugs' },
    { icon: '👥', label: 'Health\nWorkers',  path: '/supervisor/hw' },
    { icon: '🗺️', label: 'Townships',        path: '/supervisor/townships' },
    { icon: '⚙️', label: 'System',           path: '/supervisor/system' },
  ]

  return (
    <div>
      <Navbar title="VRS – Supervisor" />
      <div className="page">
        <p className="section-title">Reports</p>
        <div className="menu-grid">
          {menuItems.map(item => (
            <Link key={item.path + item.label} to={item.path} className="menu-item">
              <span className="icon">{item.icon}</span>
              <span className="label" style={{ whiteSpace: 'pre-line' }}>{item.label}</span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}

export default function SupervisorHome() {
  return (
    <Routes>
      <Route index    element={<SupervisorMenu />} />
      <Route path="mnch"      element={<ErrorBoundary title="MNCH Summary"   backTo="/supervisor"><MNCHSummary   /></ErrorBoundary>} />
      <Route path="cases"     element={<ErrorBoundary title="Case Summary"   backTo="/supervisor"><CaseSummary   /></ErrorBoundary>} />
      <Route path="drugs"     element={<ErrorBoundary title="Drug Stock"     backTo="/supervisor"><DrugStock     /></ErrorBoundary>} />
      <Route path="hw"        element={<ErrorBoundary title="Health Workers" backTo="/supervisor"><HealthWorkers /></ErrorBoundary>} />
      <Route path="townships" element={<ErrorBoundary title="Townships"      backTo="/supervisor"><Townships     /></ErrorBoundary>} />
      <Route path="system"    element={<ErrorBoundary title="System"         backTo="/supervisor"><SystemPage    /></ErrorBoundary>} />
    </Routes>
  )
}
