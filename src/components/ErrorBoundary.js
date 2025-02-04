import * as React from 'react';
import PropTypes from 'prop-types';
import { analytics } from '@/constants';

// app state
import Context from '@/context';

// catch any React component issues and log to GA
class ErrorBoundary extends React.Component {
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

  render() {
    const { children } = this.props;

    return children;
  }
}

ErrorBoundary.contextType = Context;

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
