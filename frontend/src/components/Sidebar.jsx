import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const adminNav = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/courses', icon: '📚', label: 'Courses' },
  { to: '/search', icon: '🔍', label: 'Semantic Search' },
];

const studentNav = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/courses', icon: '📚', label: 'Browse Courses' },
  { to: '/my-plan', icon: '🗓️', label: 'My Semester Plan' },
  { to: '/search', icon: '🔍', label: 'Semantic Search' },
];

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = isAdmin ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">Academic Analytics</div>
        <div className="logo-sub">Smart Course Planning</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Navigation</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            ⬡
          </button>
        </div>
      </div>
    </aside>
  );
}
