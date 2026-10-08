import { useEffect, useState } from 'react';
import { api } from './api.js';

const blankQ = { text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', marks: 1 };

export default function Admin() {
  const [tab, setTab] = useState('exams');
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(null);
  const [ex, setEx] = useState({ title: '', durationMinutes: 30, passPercentage: 40 });
  const [q, setQ] = useState(blankQ);
  const [err, setErr] = useState('');

  const load = () => { api('/admin/exams').then(setExams); api('/admin/results').then(setResults); };
  useEffect(load, []);
  const run = async (fn) => { setErr(''); try { await fn(); load(); } catch (x) { setErr(x.message); } };

  const createExam = (e) => { e.preventDefault(); run(async () => {
    await api('/admin/exams', 'POST', { ...ex, durationMinutes: +ex.durationMinutes, passPercentage: +ex.passPercentage });
    setEx({ title: '', durationMinutes: 30, passPercentage: 40 }); }); };
  const addQ = (e, id) => { e.preventDefault(); run(async () => {
    await api(`/admin/exams/${id}/questions`, 'POST', { ...q, marks: +q.marks }); setQ(blankQ); }); };
  const sq = (k) => (e) => setQ({ ...q, [k]: e.target.value });

  return (
    <>
      <nav className="tabs">
        <button className={tab === 'exams' ? 'on' : ''} onClick={() => setTab('exams')}>Exams</button>
        <button className={tab === 'results' ? 'on' : ''} onClick={() => setTab('results')}>Student results</button>
      </nav>
      {err && <p className="error" role="alert">{err}</p>}

      {tab === 'exams' && <>
        <form className="panel row" onSubmit={createExam}>
          <label className="grow">Exam title<input required value={ex.title} onChange={(e) => setEx({ ...ex, title: e.target.value })} /></label>
          <label>Duration (min)<input type="number" min="1" required value={ex.durationMinutes} onChange={(e) => setEx({ ...ex, durationMinutes: e.target.value })} /></label>
          <label>Pass mark (%)<input type="number" min="1" max="100" required value={ex.passPercentage} onChange={(e) => setEx({ ...ex, passPercentage: e.target.value })} /></label>
          <button className="primary">Create exam</button>
        </form>

        {exams.length === 0 && <p className="empty">No exams yet. Create one above, then add questions to it.</p>}
        {exams.map((e) => (
          <section className="panel" key={e.id}>
            <div className="row between">
              <div><h3>{e.title}</h3>
                <p className="meta">{e.durationMinutes} min, {e.questions.length} questions, {e.totalMarks} marks, pass at {e.passPercentage}%</p></div>
              <div className="row">
                <button className="ghost" onClick={() => setOpen(open === e.id ? null : e.id)}>{open === e.id ? 'Close' : 'Edit questions'}</button>
                <button className="danger" onClick={() => confirm('Delete this exam and its questions?') && run(() => api(`/admin/exams/${e.id}`, 'DELETE'))}>Delete</button>
              </div>
            </div>
            {open === e.id && <>
              <ol className="qlist">
                {e.questions.map((x) => (
                  <li key={x.id}><span>{x.text} <em>({x.marks} mark{x.marks > 1 ? 's' : ''})</em></span>
                    <button className="ghost" onClick={() => run(() => api(`/admin/exams/${e.id}/questions/${x.id}`, 'DELETE'))}>Remove</button></li>
                ))}
              </ol>
              <form className="qform" onSubmit={(ev) => addQ(ev, e.id)}>
                <label>Question<textarea required value={q.text} onChange={sq('text')} /></label>
                {['A', 'B', 'C', 'D'].map((l) => (
                  <label key={l}>Option {l}<input required value={q['option' + l]} onChange={sq('option' + l)} /></label>
                ))}
                <div className="row">
                  <label>Correct answer<select value={q.correctOption} onChange={sq('correctOption')}>
                    {['A', 'B', 'C', 'D'].map((l) => <option key={l}>{l}</option>)}</select></label>
                  <label>Marks<input type="number" min="1" value={q.marks} onChange={sq('marks')} /></label>
                  <button className="primary">Add question</button>
                </div>
              </form>
            </>}
          </section>
        ))}
      </>}

      {tab === 'results' && (results.length === 0 ? <p className="empty">No student has submitted an exam yet.</p> :
        <div className="panel scroll"><table>
          <thead><tr><th>Student</th><th>Exam</th><th>Score</th><th>Percentage</th><th>Result</th><th>Submitted</th></tr></thead>
          <tbody>{results.map((r) => (
            <tr key={r.id}><td>{r.studentName}</td><td>{r.examTitle}</td><td>{r.score}/{r.totalMarks}</td><td>{r.percentage}%</td>
              <td><b className={r.passed ? 'pass' : 'fail'}>{r.passed ? 'Pass' : 'Fail'}</b></td>
              <td>{new Date(r.submittedAt).toLocaleString()}</td></tr>))}</tbody>
        </table></div>)}
    </>
  );
}
