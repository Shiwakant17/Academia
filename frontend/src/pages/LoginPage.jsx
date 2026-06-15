import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Helper: extract readable error message from Spring Boot responses
  const extractError = (err, fallback) => {
    const data = err?.response?.data;
    if (!data) return fallback;
    // Spring Boot can return a plain string, or { message: '...' }, or { error: '...' }
    if (typeof data === 'string') return data;
    return data.message || data.error || fallback;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form.username, form.password);
      const token = res.data.token;
      const role = res.data.role || form.role;
      const studentId = res.data.studentId || null;

      // Store user info from the server response (role is authoritative from DB)
      const userData = { username: form.username, role, studentId };
      login(token, userData);
      toast.success(`Welcome back, ${form.username}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(extractError(err, 'Invalid username or password'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      toast.success('Account created! Please log in.');
      setIsRegister(false);
    } catch (err) {
      toast.error(extractError(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background blobs */}
      <div className="auth-bg-gradient purple" />
      <div className="auth-bg-gradient teal" />

      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">🎓</span>
        </div>
        <h1 className="auth-title">Academic Analytics</h1>
        <p className="auth-subtitle">
          {isRegister ? 'Create your account to get started' : 'Sign in to your account'}
        </p>

        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          {!isRegister && (
            <div className="form-group">
              <label className="form-label">I am logging in as</label>
              <select
                id="login-role"
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          <button
            id={isRegister ? 'register-btn' : 'login-btn'}
            type="submit"
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? '⏳ Please wait...' : isRegister ? '🚀 Create Account' : '🔐 Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <a onClick={() => setIsRegister(false)}>Sign in</a>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <a onClick={() => setIsRegister(true)}>Register</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
