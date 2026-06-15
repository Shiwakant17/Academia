import { useState, useEffect } from 'react';
import { plansApi, coursesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MyPlanPage() {
  const { user } = useAuth();
  const [plans, setPlans]         = useState([]);
  const [courses, setCourses]     = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);

  const studentId = user?.studentId;

  const [form, setForm] = useState({
    studentId: studentId || '',
    courseId: '',
    semesterNo: '',
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      if (studentId) {
        const [plansRes, credRes] = await Promise.all([
          plansApi.getStudentPlan(studentId, user.username),
          plansApi.getTotalCredits(studentId),
        ]);
        setPlans(plansRes.data || []);
        setTotalCredits(credRes.data || 0);
      }
    } catch {
      // If no studentId is stored, show instructions
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await coursesApi.getAll();
        setCourses(res.data || []);
      } catch {}
    };
    fetchCourses();
    fetchPlans();
  }, []);

  // Keep form studentId in sync if user context loads after render
  useEffect(() => {
    if (studentId) {
      setForm((prev) => ({ ...prev, studentId }));
    }
  }, [studentId]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await plansApi.addCourseToSemester(
        parseInt(form.studentId),
        parseInt(form.courseId),
        parseInt(form.semesterNo)
      );
      toast.success('Course added to semester plan!');
      setShowModal(false);
      // Re-fetch with the studentId used
      const [plansRes, credRes] = await Promise.all([
        plansApi.getStudentPlan(parseInt(form.studentId), user.username),
        plansApi.getTotalCredits(parseInt(form.studentId)),
      ]);
      setPlans(plansRes.data || []);
      setTotalCredits(credRes.data || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add course to plan');
    } finally {
      setSaving(false);
    }
  };


  // Group plans by semester
  const bySemester = plans.reduce((acc, plan) => {
    const sem = plan.semesterNo;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(plan);
    return acc;
  }, {});

  const semesterList = Object.keys(bySemester).sort((a, b) => a - b);

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">🗓️ My Semester Plan</h1>
          <p className="page-subtitle">
            Plan and track courses across your semesters
          </p>
        </div>
        <button
          id="add-to-plan-btn"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          ＋ Add to Plan
        </button>
      </div>

      {/* Credits Summary */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon purple">🎯</div>
          <div>
            <div className="stat-value">{totalCredits}</div>
            <div className="stat-label">Total Credits Planned</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal">📋</div>
          <div>
            <div className="stat-value">{plans.length}</div>
            <div className="stat-label">Courses Planned</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🗓️</div>
          <div>
            <div className="stat-value">{semesterList.length}</div>
            <div className="stat-label">Semesters Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚠️</div>
          <div>
            <div className="stat-value">{Math.max(0, 24 * semesterList.length - totalCredits)}</div>
            <div className="stat-label">Credits Remaining</div>
          </div>
        </div>
      </div>

      {/* Semester grid */}
      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /></div>
      ) : plans.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No semester plan yet</div>
            <div className="empty-desc">
              Click &ldquo;Add to Plan&rdquo; to start building your semester schedule.
              You'll need your Student ID.
            </div>
          </div>
        </div>
      ) : (
        <div className="semester-grid">
          {semesterList.map((sem) => {
            const semPlans = bySemester[sem];
            const semCredits = semPlans.reduce(
              (s, p) => s + (p.course?.credits || 0), 0
            );
            const pct = Math.min(100, Math.round((semCredits / 24) * 100));

            return (
              <div key={sem} className="semester-card">
                <div className="semester-card-header">
                  <div className="semester-number">Semester {sem}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div className="semester-credits">{semCredits} / 24 credits</div>
                    {/* Credit bar */}
                    <div
                      style={{
                        width: 80, height: 4,
                        background: 'var(--border)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`, height: '100%',
                          background: semCredits > 20
                            ? 'var(--red)'
                            : 'linear-gradient(90deg, var(--accent), var(--teal))',
                          borderRadius: 2,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="semester-courses">
                  {semPlans.map((plan) => (
                    <div key={plan.planId} className="semester-course-chip">
                      <div>
                        <div className="semester-course-name">
                          {plan.course?.courseName || `Course ${plan.course?.courseId}`}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {plan.course?.courseCode}
                        </div>
                      </div>
                      <div className="semester-course-credits">
                        {plan.course?.credits} cr
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add to Plan Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🗓️ Add Course to Semester</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Student ID *</label>
                <input
                  id="plan-studentId"
                  name="studentId"
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="Enter your Student ID"
                  value={form.studentId}
                  onChange={handleChange}
                  required
                  readOnly={!!studentId}
                  style={studentId ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  {studentId
                    ? '✅ Auto-filled from your account'
                    : 'Your numeric student ID from the database'}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Course *</label>
                <select
                  id="plan-courseId"
                  name="courseId"
                  className="form-select"
                  value={form.courseId}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Choose a course —</option>
                  {courses.map((c) => (
                    <option key={c.courseId} value={c.courseId}>
                      {c.courseName} ({c.courseCode}) – {c.credits} cr
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Semester Number *</label>
                <input
                  id="plan-semesterNo"
                  name="semesterNo"
                  type="number"
                  min="1" max="10"
                  className="form-input"
                  placeholder="e.g. 3"
                  value={form.semesterNo}
                  onChange={handleChange}
                  required
                />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  Max 24 credits per semester
                </div>
              </div>

              <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  id="save-plan-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? '⏳ Adding…' : '✅ Add to Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
