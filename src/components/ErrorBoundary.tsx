import { Component, type ReactNode } from 'react'
import { Navbar } from './Layout'

function ErrorScreen({ title, message, backTo }: { title: string; message: string; backTo: string }) {
  return (
    <div>
      <Navbar title={title} showBack backTo={backTo} />
      <div className="page">
        <div className="alert alert-error" style={{ marginBottom: '12px' }}>
          <strong>Failed to load page</strong>
          <div style={{ fontSize: '0.8rem', marginTop: '4px', wordBreak: 'break-all' }}>{message}</div>
        </div>
        <div className="alert alert-info" style={{ fontSize: '0.85rem' }}>
          The local database may be out of date. Log in as <strong>Admin</strong> and use
          the <strong>Reset Local Database</strong> button in the Supervisor menu, then try again.
        </div>
      </div>
    </div>
  )
}

interface Props {
  children: ReactNode
  title?: string
  backTo?: string
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorScreen
          title={this.props.title ?? 'Error'}
          message={this.state.error.message}
          backTo={this.props.backTo ?? '/'}
        />
      )
    }
    return this.props.children
  }
}
