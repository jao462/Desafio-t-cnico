import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Users, Layers, FileText, BarChart3, Plus, Search, Pencil, Trash2, X, GraduationCap, Activity, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const resources = {
  courses: { label: 'Courses', icon: BookOpen, fields: [{ key: 'code', label: 'Unique code', required: true }, { key: 'title', label: 'Title', required: true }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'user_id', label: 'Created by', type: 'user', required: true }] },
  modules: { label: 'Modules', icon: Layers, fields: [{ key: 'course_id', label: 'Course', type: 'course', required: true }, { key: 'title', label: 'Title', required: true }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'user_id', label: 'Created by', type: 'user', required: true }] },
  contents: { label: 'Lessons', icon: FileText, fields: [{ key: 'module_id', label: 'Module', type: 'module', required: true }, { key: 'title', label: 'Title', required: true }, { key: 'content', label: 'Content', type: 'textarea', required: true }] },
  users: { label: 'Users', icon: Users, fields: [{ key: 'name', label: 'Name', required: true }, { key: 'email', label: 'Email', type: 'email', required: true }, { key: 'status', label: 'Status', type: 'status', required: true }] }
};
const reports = [
  { key: 'users-courses', label: 'Users by courses', description: 'Which users have created the most courses?' },
  { key: 'courses-content-count', label: 'Courses by lessons', description: 'Which courses contain the most lessons?' },
  { key: 'courses-summary', label: 'Course overview', description: 'Module and lesson totals for every course.' },
  { key: 'contents-with-course', label: 'Lessons catalog', description: 'Every lesson with its course and module.' },
  { key: 'content-2-viewers', label: 'Lesson viewers', description: 'Users who watched a selected lesson.' }
];

export default function App() {
  const [section, setSection] = useState('overview');
  const [data, setData] = useState({ users: [], courses: [], modules: [], contents: [] });
  const [report, setReport] = useState('users-courses');
  const [reportData, setReportData] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [watchedContent, setWatchedContent] = useState('');

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || `Request failed (${response.status})`); }
    return response.status === 204 ? null : response.json();
  }
  async function loadAll() {
    try {
      const entries = await Promise.all(Object.keys(resources).map(async (key) => [key, await request(`/${key}`)]));
      setData(Object.fromEntries(entries));
    } catch (error) { setMessage(error.message); }
  }
  useEffect(() => { loadAll(); }, []);
  async function loadReport(key = report) {
    try { const suffix = key === 'content-2-viewers' && watchedContent ? `?contentId=${watchedContent}` : ''; setReportData(await request(`/reports/${key}${suffix}`)); }
    catch (error) { setMessage(error.message); }
  }
  useEffect(() => { if (section === 'reports') loadReport(report); }, [section, report]);

  const allCount = data.users.length + data.courses.length + data.modules.length + data.contents.length;
  const filtered = useMemo(() => {
    const rows = data[section] || [];
    const term = search.toLowerCase();
    return rows.filter((row) => Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(term)));
  }, [data, section, search]);
  function openCreate() { setForm(section === 'users' ? { status: 'active' } : {}); setModal({ type: 'create', resource: section }); }
  function openEdit(row) { const copy = { ...row }; delete copy.id; delete copy.created_at; delete copy.updated_at; setForm(copy); setModal({ type: 'edit', resource: section, id: row.id }); }
  async function save(event) {
    event.preventDefault(); setBusy(true);
    try {
      const path = `/${modal.resource}${modal.id ? `/${modal.id}` : ''}`;
      await request(path, { method: modal.id ? 'PUT' : 'POST', body: JSON.stringify(form) });
      setModal(null); setMessage('Record saved successfully.'); await loadAll();
      if (section === 'reports') loadReport();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function remove(row) {
    if (!window.confirm('Delete this record? Related records may also be deleted.')) return;
    try { await request(`/${section}/${row.id}`, { method: 'DELETE' }); setMessage('Record deleted.'); await loadAll(); }
    catch (error) { setMessage(error.message); }
  }
  async function markWatched() {
    const userId = form.progressUser;
    if (!userId || !watchedContent) { setMessage('Select a user and a lesson first.'); return; }
    try { await request('/progress', { method: 'POST', body: JSON.stringify({ user_id: userId, content_id: watchedContent }) }); setMessage('Lesson marked as watched.'); }
    catch (error) { setMessage(error.message); }
  }
  const nav = [{ key: 'overview', label: 'Overview', icon: BarChart3 }, ...Object.entries(resources).map(([key, value]) => ({ key, label: value.label, icon: value.icon })), { key: 'reports', label: 'Reports', icon: Activity }];
  const title = nav.find((item) => item.key === section)?.label || 'Overview';
  const columns = section === 'users' ? ['name', 'email', 'status'] : section === 'courses' ? ['code', 'title', 'description', 'user_id'] : section === 'modules' ? ['title', 'course_id', 'description', 'user_id'] : ['title', 'module_id', 'content'];
  const lookup = (key, value) => data[key]?.find((item) => item.id === value)?.title || data[key]?.find((item) => item.id === value)?.name || value || '—';

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark"><GraduationCap size={23}/></div><div><strong>CourseFlow</strong><span>LEARNING MANAGER</span></div></div><div className="workspace-label">WORKSPACE</div><nav>{nav.map((item) => <button key={item.key} className={`nav-item ${section === item.key ? 'active' : ''}`} onClick={() => { setSection(item.key); setSearch(''); }}><item.icon size={18}/><span>{item.label}</span>{item.key === 'reports' && <span className="nav-dot"/>}</button>)}</nav><div className="sidebar-bottom"><div className="avatar">CF</div><div><strong>Administrator</strong><span>Course workspace</span></div></div></aside>
    <main className="main-area"><header className="topbar"><div><span className="eyebrow">COURSE MANAGEMENT</span><h1>{title}</h1></div><div className="top-actions"><span className="system-status"><i/> System ready</span><button className="icon-button" onClick={loadAll} title="Refresh"><RefreshCw size={17}/></button></div></header>
      {message && <div className="toast" onClick={() => setMessage('')}>{message}<button><X size={15}/></button></div>}
      {section === 'overview' && <><section className="welcome"><div><span className="eyebrow light">YOUR LEARNING WORKSPACE</span><h2>Everything in one place.</h2><p>Manage your courses, organize lessons and keep track of learning progress.</p></div><div className="welcome-icon"><GraduationCap size={62}/></div></section><section className="stat-grid">{[{ key: 'courses', label: 'Total courses', icon: BookOpen, color: 'blue' }, { key: 'modules', label: 'Total modules', icon: Layers, color: 'purple' }, { key: 'contents', label: 'Total lessons', icon: FileText, color: 'orange' }, { key: 'users', label: 'Registered users', icon: Users, color: 'green' }].map((item) => <button className="stat-card" key={item.key} onClick={() => setSection(item.key)}><div className={`stat-icon ${item.color}`}><item.icon size={20}/></div><span>{item.label}</span><strong>{data[item.key].length}</strong><small>View records <span>↗</span></small></button>)}</section><section className="panel overview-panel"><div className="panel-heading"><div><h3>Recently added courses</h3><p>Your course catalog at a glance</p></div><button className="text-button" onClick={() => setSection('courses')}>View all courses ↗</button></div><div className="course-list">{data.courses.slice(0, 4).map((course, index) => <div className="course-row" key={course.id}><div className={`course-symbol symbol-${index % 4}`}><BookOpen size={19}/></div><div className="course-info"><strong>{course.title}</strong><span>{course.code}</span></div><span className="course-owner">{lookup('users', course.user_id)}</span><span className="pill">Course</span></div>)}{!data.courses.length && <p className="empty">No courses yet. Add your first course.</p>}</div></section></>}
      {resources[section] && <section className="panel table-panel"><div className="panel-heading"><div><h3>{resources[section].label} directory</h3><p>Manage and organize your {resources[section].label.toLowerCase()}.</p></div><button className="primary-button" onClick={openCreate}><Plus size={17}/> Add {section === 'contents' ? 'lesson' : section.slice(0, -1)}</button></div><div className="table-tools"><div className="search-box"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${resources[section].label.toLowerCase()}...`}/></div><span>{filtered.length} records</span></div><div className="table-wrap"><table><thead><tr>{columns.map((column) => <th key={column}>{column.replace('_id', '').replace('_', ' ')}</th>)}<th className="actions-head">Actions</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column}>{column === 'user_id' ? lookup('users', row[column]) : column === 'course_id' ? lookup('courses', row[column]) : column === 'module_id' ? lookup('modules', row[column]) : column === 'status' ? <span className={`status ${row[column]}`}>{row[column]}</span> : <span className="cell-text">{String(row[column] ?? '—')}</span>}</td>)}<td><div className="row-actions"><button onClick={() => openEdit(row)} title="Edit"><Pencil size={15}/></button><button onClick={() => remove(row)} title="Delete"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>{!filtered.length && <div className="empty">No records found.</div>}</div></section>}
      {section === 'reports' && <section className="panel reports-panel"><div className="panel-heading"><div><h3>Data insights</h3><p>SQL-powered reports from your course database.</p></div></div><div className="report-tabs">{reports.map((item) => <button key={item.key} className={report === item.key ? 'selected' : ''} onClick={() => setReport(item.key)}>{item.label}</button>)}</div><div className="report-description"><div><h3>{reports.find((item) => item.key === report)?.label}</h3><p>{reports.find((item) => item.key === report)?.description}</p></div>{report === 'content-2-viewers' && <div className="report-filter"><select value={watchedContent} onChange={(event) => setWatchedContent(event.target.value)}><option value="">Choose a lesson</option>{data.contents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select><button className="secondary-button" onClick={() => loadReport(report)}>Apply</button></div>}</div><ReportTable rows={reportData} report={report}/></section>}
    </main>
    {modal && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModal(null)}><form className="modal" onSubmit={save}><div className="modal-heading"><div><span className="eyebrow">RECORD MANAGEMENT</span><h2>{modal.id ? 'Edit record' : 'Create record'}</h2></div><button type="button" className="icon-button" onClick={() => setModal(null)}><X size={18}/></button></div><div className="form-grid">{resources[modal.resource].fields.map((field) => <label className={field.type === 'textarea' ? 'full-field' : ''} key={field.key}>{field.label}{field.type === 'textarea' ? <textarea required={field.required} value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}/> : field.type === 'user' || field.type === 'course' || field.type === 'module' ? <select required={field.required} value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}><option value="">Select {field.label.toLowerCase()}</option>{(field.type === 'user' ? data.users : field.type === 'course' ? data.courses : data.modules).map((item) => <option key={item.id} value={item.id}>{item.name || item.title}</option>)}</select> : field.type === 'status' ? <select value={form[field.key] || 'active'} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select> : <input type={field.type || 'text'} required={field.required} value={form[field.key] || ''} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}/>}</label>)}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? 'Saving...' : 'Save record'}</button></div></form></div>}
  </div>;
}

function ReportTable({ rows, report }) {
  if (!rows.length) return <div className="empty report-empty">No report data available.</div>;
  const keys = Object.keys(rows[0]);
  return <div className="table-wrap report-table"><table><thead><tr>{keys.map((key) => <th key={key}>{key.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || index}>{keys.map((key) => <td key={key}>{key === 'watched_at' ? new Date(row[key]).toLocaleString() : String(row[key] ?? '—')}</td>)}</tr>)}</tbody></table></div>;
}
