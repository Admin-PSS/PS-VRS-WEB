import { Navbar } from '../../components/Layout'

export default function ClinicHome() {
  const menuItems = [
    { icon: '👩', label: 'Client Records', path: '/field/clients' },
    { icon: '💊', label: 'Drug Stock', path: '#' },
    { icon: '📊', label: 'Monthly Report', path: '#' },
    { icon: '🚑', label: 'Referrals', path: '#' },
  ]

  return (
    <div>
      <Navbar title="VRS – Clinic" />
      <div className="page">
        <p className="section-title">Clinic / RHC View</p>
        <div className="menu-grid">
          {menuItems.map(item => (
            <a key={item.label} href={item.path} className="menu-item">
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
