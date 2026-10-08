import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from './api.js';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function ExamRoom() {
  const { id } = useParams(); const nav = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [left, setLeft] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const sent = useRef(false);
  const ans = useRef(answers); ans.current = answers;

  useEffect(() => {
    api(`/student/exams/${id}`).then((e) => { setExam(e); setLeft(e.durationMinutes * 60); }).catch((x) => setErr(x.message));
  }, [id]);

  async function submit() {
    if (sent.current) return; sent.current = true;
    try { setResult(await api(`/student/exams/${id}/submit`, 'POST', { answers: ans.current })); }
    catch (x) { sent.current = false; setErr(x.message); }
  }

  useEffect(() => {
    if (left === null || result) return;
    if (left <= 0) { submit(); return; }          // time expired: auto-submit and evaluate
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, result]);

  if (err) return <><p className="error" role="alert">{err}</p><button className="ghost" onClick={() => nav('/student')}>Back to exams</button></>;
  if (!exam) return <p className="empty">Loading exam…</p>;

  if (result) return (
    <section className="panel result">
      <h2>{result.examTitle}</h2>
      <p className={'verdict ' + (result.passed ? 'pass' : 'fail')}>{result.passed ? 'You passed' : 'You did not pass'}</p>
      <p className="score">{result.score} <span>out of {result.totalMarks}</span></p>
      <p className="meta">{result.percentage}%, pass mark {exam.passPercentage}%</p>
      <button className="primary" onClick={() => nav('/student')}>Back to my exams</button>
    </section>
  );

  const answered = Object.keys(answers).length;
  return (
    <>
      <div className="examhead">
        <div><h2>{exam.title}</h2><p className="meta">{answered} of {exam.questions.length} answered</p></div>
        <div className={'timer' + (left < 60 ? ' low' : '')} role="timer" aria-live="off">{fmt(left)}</div>
      </div>
      {exam.questions.map((q, i) => (
        <fieldset className="panel q" key={q.id}>
          <legend>Question {i + 1} <em>({q.marks} mark{q.marks > 1 ? 's' : ''})</em></legend>
          <p>{q.text}</p>
          {['A', 'B', 'C', 'D'].map((l) => (
            <label className={'opt' + (answers[q.id] === l ? ' picked' : '')} key={l}>
              <input type="radio" name={'q' + q.id} checked={answers[q.id] === l} onChange={() => setAnswers({ ...answers, [q.id]: l })} />
              <span className="bubble">{l}</span>{q['option' + l]}
            </label>))}
        </fieldset>))}
      <button className="primary big" onClick={() => (answered === exam.questions.length || confirm(`${exam.questions.length - answered} question(s) unanswered. Submit anyway?`)) && submit()}>
        Submit exam
      </button>
    </>
  );
}
