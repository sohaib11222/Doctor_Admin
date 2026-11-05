import { Component } from 'react'
import { Link } from 'react-router-dom'

class AdminPageErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  retry = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <i className="fa-solid fa-triangle-exclamation fa-2x text-warning mb-3" aria-hidden="true" />
          <h4>This admin page could not be displayed</h4>
          <p className="text-muted mb-4">The rest of the dashboard is still available. Try loading this page again.</p>
          <div className="d-flex justify-content-center gap-2">
            <button type="button" className="btn btn-primary" onClick={this.retry}>Try again</button>
            <Link className="btn btn-outline-secondary" to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }
}

export default AdminPageErrorBoundary
