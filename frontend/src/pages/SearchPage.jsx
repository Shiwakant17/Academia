import { useState } from 'react';
import { semanticApi } from '../services/api';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await semanticApi.search(query.trim());
      setResults(res.data?.results || []);
      if ((res.data?.results || []).length === 0) {
        toast('No semantic matches found', { icon: '🔍' });
      }
    } catch (err) {
      toast.error('Semantic search service unavailable');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'var(--green)';
    if (score >= 0.5) return 'var(--teal)';
    return 'var(--text-muted)';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return '🔥 High Match';
    if (score >= 0.5) return '✅ Good Match';
    return '📌 Partial Match';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔍 Semantic Course Search</h1>
        <p className="page-subtitle">
          Search courses by meaning, not just keywords — powered by AI embeddings
        </p>
      </div>

      {/* Search Form */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(124,109,240,0.08), rgba(45,212,191,0.04))',
          border: '1px solid rgba(124,109,240,0.2)',
          marginBottom: 32,
        }}
      >
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span
                style={{
                  position: 'absolute', left: 16, top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 20, pointerEvents: 'none',
                }}
              >
                🔍
              </span>
              <input
                id="semantic-search-input"
                type="text"
                className="form-input"
                style={{ paddingLeft: 48, fontSize: 16, padding: '14px 14px 14px 48px' }}
                placeholder='Try "beginner programming", "machine learning basics", "data analysis"…'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <button
              id="semantic-search-btn"
              type="submit"
              className="btn btn-teal"
              style={{ minWidth: 120, justifyContent: 'center' }}
              disabled={loading || !query.trim()}
            >
              {loading ? '⏳ Searching…' : '🚀 Search'}
            </button>
          </div>
        </form>

        {/* Query hints */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            'beginner programming',
            'neural networks',
            'database management',
            'algorithms',
            'software engineering',
          ].map((hint) => (
            <button
              key={hint}
              className="btn btn-secondary btn-sm"
              style={{ borderRadius: 20, fontSize: 12 }}
              onClick={() => setQuery(hint)}
              type="button"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="spinner-wrapper"><div className="spinner" /></div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🤷</div>
          <div className="empty-title">No results found</div>
          <div className="empty-desc">
            Try a different query. Make sure courses are indexed in the semantic service.
          </div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <div className="card-header" style={{ marginBottom: 16 }}>
            <div className="card-title">
              Results for &ldquo;{query}&rdquo;
            </div>
            <span className="badge badge-purple">{results.length} matches</span>
          </div>

          {results.map((r, idx) => (
            <div key={r.course_id || idx} className="search-result-item">
              <div className="search-result-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 32, height: 32,
                      borderRadius: '50%',
                      background: 'var(--accent-glow)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 13, color: 'var(--accent-light)',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div className="search-result-name">{r.course_name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      fontSize: 12, fontWeight: 700,
                      color: getScoreColor(r.score),
                    }}
                  >
                    {getScoreLabel(r.score)}
                  </span>
                  <div
                    className="score-badge"
                    style={{ color: getScoreColor(r.score), borderColor: getScoreColor(r.score) + '40', background: getScoreColor(r.score) + '15' }}
                  >
                    {(r.score * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="search-result-desc">{r.description}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <span className="badge badge-gray">ID: {r.course_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searched && !loading && (
        <div className="empty-state" style={{ opacity: 0.7 }}>
          <div className="empty-icon">🧠</div>
          <div className="empty-title">AI-Powered Semantic Search</div>
          <div className="empty-desc">
            Type any description or concept above and we'll find the most semantically
            relevant courses using vector embeddings.
          </div>
        </div>
      )}
    </div>
  );
}
