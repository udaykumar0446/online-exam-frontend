import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api.js';

export default function Student() {
  const [tab, setTab] = useState('exams');
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const nav = useNavigate();
  useEffect(() => { api('/student/exams').then(setExams); api('/student/results').then(setResults); }, []);
  const done = new Set(results.map((r) => r.examId));

  return (
    <>
      <nav className="tabs">
        <button className={tab === 'exams' ? 'on' : ''} onClick={() => setTab('exams')}>Available exams</button>
        <button className={tab === 'results' ? 'on' : ''} onClick={() => setTab('results')}>My results</button>
      </nav>
      {tab === 'exams' && (exams.length === 0 ? <p className="empty">No exams are open right now. Check back later.</p> :
        exams.map((e) => (
          <section className="panel row between" key={e.id}>
            <div><h3>{e.title}</h3>
              <p className="meta">{e.durationMinutes} min, {e.questions.length} questions, {e.totalMarks} marks</p></div>
            {done.has(e.id) ? <b className="meta">Attempted</b> :
              <button className="primary" onClick={() => confirm(`Start "${e.title}"? The ${e.durationMinutes}-minute timer begins now.`) && nav(`/exam/${e.id}`)}>Start exam</button>}
          </section>)))}
      {tab === 'results' && (results.length === 0 ? <p className="empty">You haven't taken an exam yet.</p> :
        <div className="panel scroll"><table>
          <thead><tr><th>Exam</th><th>Score</th><th>Percentage</th><th>Result</th><th>Date</th></tr></thead>
          <tbody>{results.map((r) => (
            <tr key={r.id}><td>{r.examTitle}</td><td>{r.score}/{r.totalMarks}</td><td>{r.percentage}%</td>
              <td><b className={r.passed ? 'pass' : 'fail'}>{r.passed ? 'Pass' : 'Fail'}</b></td>
              <td>{new Date(r.submittedAt).toLocaleString()}</td></tr>))}</tbody>
        </table></div>)}
    </>
  );
}
