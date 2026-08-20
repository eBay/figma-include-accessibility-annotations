import * as React from 'react';
import PropTypes from 'prop-types';
import { analytics } from '@/constants';

// icons
import { SvgWarning } from '@/icons';

// app state
import Context from '@/context';

// styles
import './styles.scss';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      hasError: false,
      retryKey: 0
    };

    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error, hasError: true };
  }

  componentDidCatch(error) {
    const { isProd, sessionId, currentUser } = this.context;

    analytics.logEvent({
      name: 'error_boundary_error',
      pageTitle: error,
      sessionId,
      currentUser,
      isProd
    });
  }

  handleRetry() {
    const { hasDashboard, updateState } = this.context;

    if (hasDashboard) {
      updateState('showDashboard', true);
      updateState('showPageChange', false);
      updateState('showSettings', false);
    }

    this.setState((prevState) => ({
      error: null,
      hasError: false,
      retryKey: prevState.retryKey + 1
    }));
  }

  render() {
    const { children } = this.props;
    const { error, hasError, retryKey } = this.state;
    const { hasDashboard, isDevMode, isProd } = this.context;

    if (hasError) {
      const showErrorDetails = !isProd || isDevMode;
      const retryLabel = hasDashboard ? 'Return to dashboard' : 'Try again';

      return (
        <main className="error-boundary" id="main" tabIndex="-1">
          <div className="error-boundary-content h-100 w-100 flex-center">
            <SvgWarning size={24} />

            <p className="error-boundary-message" role="alert">
              Something went wrong. You can go back and try again.
            </p>

            {showErrorDetails && error?.message && (
              <p className="error-boundary-details">{error.message}</p>
            )}

            <button
              aria-label={retryLabel}
              className="btn primary error-boundary-retry"
              onClick={this.handleRetry}
              type="button"
            >
              {retryLabel}
            </button>
          </div>
        </main>
      );
    }

    return <React.Fragment key={retryKey}>{children}</React.Fragment>;
  }
}

ErrorBoundary.contextType = Context;

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
