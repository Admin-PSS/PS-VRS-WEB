import { Routes, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Navbar } from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import ClientList from './ClientList'
import ClientForm from './ClientForm'
import ANCForm from './ANCForm'
import DeliveryForm from './DeliveryForm'
import PNCForm from './PNCForm'
import NBCForm from './NBCForm'
import ReferralForm from './ReferralForm'
import VHWForm from './VHWForm'

function FieldMenu() {
  const { user } = useAuth()

  const menuItems = [
    { icon: '👩', label: 'Client\nRegister', path: '/field/clients' },
    { icon: '🤰', label: 'ANC\nVisit',       path: '/field/anc' },
    { icon: '🏥', label: 'Delivery',          path: '/field/delivery' },
    { icon: '🩺', label: 'PNC Visit',         path: '/field/pnc' },
    { icon: '👶', label: 'Newborn\nCare',     path: '/field/nbc' },
    { icon: '🚑', label: 'Referral',          path: '/field/referral' },
    { icon: '📋', label: 'Patient\nRegister', path: '/field/vhw' },
  ]

  return (
    <div>
      <Navbar title="VRS – Field" />
      <div className="page">
        <p className="section-title">Hello, {user?.username}</p>
        <div className="menu-grid">
          {menuItems.map(item => (
            <Link key={item.path} to={item.path} className="menu-item">
              <span className="icon">{item.icon}</span>
              <span className="label" style={{ whiteSpace: 'pre-line' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FieldHome() {
  return (
    <Routes>
      <Route index element={<FieldMenu />} />
      <Route path="clients"     element={<ErrorBoundary title="Client Register" backTo="/field"><ClientList /></ErrorBoundary>} />
      <Route path="clients/new" element={<ErrorBoundary title="New Client"       backTo="/field/clients"><ClientForm /></ErrorBoundary>} />
      <Route path="anc"         element={<ErrorBoundary title="ANC Visit"        backTo="/field"><ANCForm /></ErrorBoundary>} />
      <Route path="delivery"    element={<ErrorBoundary title="Delivery"         backTo="/field"><DeliveryForm /></ErrorBoundary>} />
      <Route path="pnc"         element={<ErrorBoundary title="PNC Visit"        backTo="/field"><PNCForm /></ErrorBoundary>} />
      <Route path="nbc"         element={<ErrorBoundary title="Newborn Care"     backTo="/field"><NBCForm /></ErrorBoundary>} />
      <Route path="referral"    element={<ErrorBoundary title="Referral"         backTo="/field"><ReferralForm /></ErrorBoundary>} />
      <Route path="vhw"         element={<ErrorBoundary title="Patient Register" backTo="/field"><VHWForm /></ErrorBoundary>} />
    </Routes>
  )
}
