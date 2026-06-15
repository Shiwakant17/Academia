import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { coursesApi, plansApi } from '../services/api';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [totalCredits, setTotalCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await coursesApi.getAll();
        setCourses(res.data || []);

        // For students, try to fetch total credits
        if (!isAdmin && user?.studentId) {
          const credRes = await plansApi.getTotalCredits(user.studentId);
          setTotalCredits(credRes.data);
        }
      } catch (_) {
        // silently ignore – backend may not be running
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, user]);

  const initials = user?.username?.slice(0, 2).toUpperCase() || '??';

  // Group courses by semester
  const bySemester = courses.reduce((acc, c) => {
    const sem = c.semester || 'N/A';
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(c);
    return acc;
  }, {});

  const levelColors = {
    UG: 'badge-purple',
    PG: 'badge-teal',
    PhD: 'badge-orange',
  };

  return (
    <div>
      {/* Hero Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(124,109,240,0.12) 0%, rgba(45,212,191,0.07) 100%)',
          border: '1px solid rgba(124,109,240,0.25)',
          marginBottom: '32px',
          padding: '36px',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 64, height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--teal))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800, color: 'white', flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="page-subtitle">
              {isAdmin
                ? 'You have admin access. Manage courses, view plans and add semantic content.'
                : 'Plan your semester, explore courses, and find relevant subjects with AI search.'}
            </p>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              background: isAdmin ? 'rgba(251,146,60,0.15)' : 'rgba(124,109,240,0.15)',
              border: `1px solid ${isAdmin ? 'rgba(251,146,60,0.3)' : 'rgba(124,109,240,0.3)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '10px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              Role
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: isAdmin ? 'var(--orange)' : 'var(--accent-light)' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">📚</div>
          <div>
            <div className="stat-value">{loading ? '–' : courses.length}</div>
            <div className="stat-label">Total Courses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">🗓️</div>
          <div>
            <div className="stat-value">{loading ? '–' : Object.keys(bySemester).length}</div>
            <div className="stat-label">Semesters</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-value">
              {loading ? '–' : courses.reduce((s, c) => s + (c.credits || 0), 0)}
            </div>
            <div className="stat-label">Total Credits</div>
          </div>
        </div>

        {!isAdmin && (
          <div className="stat-card">
            <div className="stat-icon orange">🎯</div>
            <div>
              <div className="stat-value">{totalCredits ?? '–'}</div>
              <div className="stat-label">Credits Planned</div>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="stat-card">
            <div className="stat-icon orange">🔑</div>
            <div>
              <div className="stat-value" style={{ fontSize: 18 }}>Admin</div>
              <div className="stat-label">Full Access</div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Courses Preview */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 Recent Courses</div>
          <span className="badge badge-purple">{courses.length} total</span>
        </div>

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No courses yet</div>
            <div className="empty-desc">
              {isAdmin ? 'Go to Courses and add the first course.' : 'No courses available yet.'}
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Code</th>
                  <th>Credits</th>
                  <th>Semester</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {courses.slice(0, 8).map((c) => (
                  <tr key={c.courseId}>
                    <td><strong>{c.courseName}</strong></td>
                    <td>
                      <span className="badge badge-gray">{c.courseCode}</span>
                    </td>
                    <td>
                      <span className="badge badge-teal">{c.credits} cr</span>
                    </td>
                    <td>Sem {c.semester}</td>
                    <td>
                      <span className={`badge ${levelColors[c.level] || 'badge-gray'}`}>
                        {c.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
