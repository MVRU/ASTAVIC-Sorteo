import PropTypes from 'prop-types';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';

const AdminView = ({
  isAdmin,
  onLogin,
  onLogout,
  loginError,
  raffles,
  subscribersCount,
  onCreateRaffle,
}) => {
  if (!isAdmin) {
    return <AdminLogin onLogin={onLogin} error={loginError} />;
  }

  return (
    <AdminDashboard
      onLogout={onLogout}
      onCreateRaffle={onCreateRaffle}
      raffles={raffles}
      subscribersCount={subscribersCount}
    />
  );
};

AdminView.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  loginError: PropTypes.bool,
  raffles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      finished: PropTypes.bool,
    })
  ).isRequired,
  subscribersCount: PropTypes.number.isRequired,
  onCreateRaffle: PropTypes.func.isRequired,
};

AdminView.defaultProps = {
  loginError: false,
};

export default AdminView;
