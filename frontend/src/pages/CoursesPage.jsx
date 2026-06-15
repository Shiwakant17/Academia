import { useState, useEffect } from 'react';
import { coursesApi, semanticApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const emptyForm = {
  courseCode: '',
  courseName: '',
  credits: '',
  semester: '',
  level: 'UG',
  description: '',
};

const levelColors = {
  UG: 'badge-purple',
  PG: 'badge-teal',
  PhD: 'badge-orange',
};

export default function CoursesPage() {
  const { isAdmin, user } = useAuth();
  const [courses, setCourses]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);

  // Delete confirmation state
  const [confirmDelete, setConfirmDelete] = useState(null); // holds course object to delete
  const [deleting, setDeleting] = useState(false);


  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await coursesApi.getAll();
      setCourses(res.data || []);
    } catch {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const openAdd = () => {
    setEditCourse(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditCourse(course);
    setForm({
      courseCode:  course.courseCode || '',
      courseName:  course.courseName || '',
      credits:     course.credits || '',
      semester:    course.semester || '',
      level:       course.level || 'UG',
      description: course.description || '',
    });
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      credits:  parseInt(form.credits),
      semester: parseInt(form.semester),
    };
    try {
      if (editCourse) {
        await coursesApi.update(editCourse.courseId, payload);
        toast.success('Course updated!');
      } else {
        // Add via ADMIN route
        const res = await coursesApi.add(payload, user.username);
        toast.success('Course added!');

        // Also sync to semantic search
        try {
          await semanticApi.addCourse({
            course_id: res.data.courseId,
            course_name: payload.courseName,
            description: payload.description,
          });
        } catch { /* semantic sync is best-effort */ }
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  // Helper: extract readable error message from Spring Boot responses
  const extractError = (err, fallback) => {
    const data = err?.response?.data;
    if (!data) return fallback;
    if (typeof data === 'string') return data;
    return data.message || data.error || fallback;
  };

  const confirmAndDelete = (course) => {
    setConfirmDelete(course); // open the confirm modal
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await coursesApi.delete(confirmDelete.courseId, user.username);
      toast.success(`"${confirmDelete.courseName}" deleted successfully!`);
      setConfirmDelete(null);
      fetchCourses();
    } catch (err) {
      toast.error(extractError(err, 'Delete failed'));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = courses.filter((c) => {
    const q = filter.toLowerCase();
    return (
      (c.courseName || '').toLowerCase().includes(q) ||
      (c.courseCode || '').toLowerCase().includes(q) ||
      (c.level || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">📚 Courses</h1>
          <p className="page-subtitle">
            {isAdmin ? 'Manage all academic courses' : 'Browse available courses'}
          </p>
        </div>
        {isAdmin && (
          <button id="add-course-btn" className="btn btn-primary" onClick={openAdd}>
            ＋ Add Course
          </button>
        )}
      </div>

      {/* Search / Filter */}
      <div className="search-wrapper">
        <span className="search-icon">🔎</span>
        <input
          id="course-filter-input"
          className="search-input"
          placeholder="Filter by name, code, or level…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Stats row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon purple">📚</div>
          <div>
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">Courses</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal">🎓</div>
          <div>
            <div className="stat-value">{courses.filter(c => c.level === 'UG').length}</div>
            <div className="stat-label">Undergraduate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🏛️</div>
          <div>
            <div className="stat-value">{courses.filter(c => c.level === 'PG').length}</div>
            <div className="stat-label">Postgraduate</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚡</div>
          <div>
            <div className="stat-value">{courses.reduce((s,c)=>s+(c.credits||0),0)}</div>
            <div className="stat-label">Total Credits</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No courses found</div>
            <div className="empty-desc">
              {isAdmin ? 'Add your first course using the button above.' : 'No courses match your search.'}
            </div>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Code</th>
                  <th>Credits</th>
                  <th>Semester</th>
                  <th>Level</th>
                  <th>Description</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.courseId}>
                    <td><strong>{c.courseName}</strong></td>
                    <td><span className="badge badge-gray">{c.courseCode}</span></td>
                    <td><span className="badge badge-teal">{c.credits} cr</span></td>
                    <td>Sem {c.semester}</td>
                    <td>
                      <span className={`badge ${levelColors[c.level] || 'badge-gray'}`}>
                        {c.level}
                      </span>
                    </td>
                    <td
                      style={{
                        maxWidth: 240,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'var(--text-muted)',
                      }}
                      title={c.description}
                    >
                      {c.description}
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="flex gap-2">
                          <button
                            id={`edit-course-${c.courseId}`}
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEdit(c)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            id={`delete-course-${c.courseId}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => confirmAndDelete(c)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editCourse ? '✏️ Edit Course' : '➕ Add New Course'}
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Course Name *</label>
                  <input
                    id="form-courseName"
                    name="courseName"
                    className="form-input"
                    placeholder="e.g. Machine Learning"
                    value={form.courseName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course Code *</label>
                  <input
                    id="form-courseCode"
                    name="courseCode"
                    className="form-input"
                    placeholder="e.g. CS401"
                    value={form.courseCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Credits *</label>
                  <input
                    id="form-credits"
                    name="credits"
                    type="number"
                    min="1" max="10"
                    className="form-input"
                    placeholder="e.g. 4"
                    value={form.credits}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester *</label>
                  <input
                    id="form-semester"
                    name="semester"
                    type="number"
                    min="1" max="10"
                    className="form-input"
                    placeholder="e.g. 3"
                    value={form.semester}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Level</label>
                <select
                  id="form-level"
                  name="level"
                  className="form-select"
                  value={form.level}
                  onChange={handleChange}
                >
                  <option value="UG">UG – Undergraduate</option>
                  <option value="PG">PG – Postgraduate</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  id="form-description"
                  name="description"
                  className="form-textarea"
                  placeholder="Brief description of the course…"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
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
                  id="save-course-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? '⏳ Saving…' : editCourse ? '💾 Update' : '➕ Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">🗑️ Delete Course</div>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>

            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Are you sure you want to delete
              </p>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>
                &ldquo;{confirmDelete.courseName}&rdquo;
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3" style={{ justifyContent: 'flex-end' }}>
              <button
                id="cancel-delete-btn"
                className="btn btn-secondary"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
                style={{ minWidth: 120, justifyContent: 'center' }}
              >
                {deleting ? '⏳ Deleting…' : '🗑️ Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
