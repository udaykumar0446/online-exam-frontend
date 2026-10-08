import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, session } from './api.js';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setErr('');
    try {
      const d = await api(`/auth/${mode}`, 'POST', f);
      session.set(d);
      nav(d.role === 'ADMIN' ? '/admin' : '/student');
    } catch (x) { setErr(x.message); }
  }

  return (
    <div className="auth">
      <section className="auth-side">
        <h1>Sit the exam.<br />Skip the paper.</h1>
        <p>Timed multiple-choice exams, marked the moment you submit.</p>
      </section>
      <form className="auth-card" onSubmit={submit}>
        <h2>{mode === 'login' ? 'Log in' : 'Create student account'}</h2>
        {mode === 'register' && <label>Full name<input required value={f.name} onChange={set('name')} /></label>}
        <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
        <label>Password<input type="password" required minLength={6} value={f.password} onChange={set('password')} /></label>
        {err && <p className="error" role="alert">{err}</p>}
        <button className="primary">{mode === 'login' ? 'Log in' : 'Create account'}</button>
        <p className="switch">
          {mode === 'login' ? 'New student?' : 'Already registered?'}{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setErr(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
            {mode === 'login' ? 'Create an account' : 'Log in'}
          </a>
        </p>
        <p className="hint">Admin demo: admin@exam.com / admin123</p>
      </form>
    </div>
  );
}
