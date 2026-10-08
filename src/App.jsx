import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { session } from './api.js';
import Auth from './Auth.jsx';
import Admin from './Admin.jsx';
import Student from './Student.jsx';
import ExamRoom from './ExamRoom.jsx';

function Guard({ role, children }) {
  const s = session.get();
  if (!s) return <Navigate to="/" replace />;
  if (s.role !== role) return <Navigate to={s.role === 'ADMIN' ? '/admin' : '/student'} replace />;
  return children;
}

export function Shell({ children }) {
  const s = session.get(); const nav = useNavigate();
  return (
    <>
      <header className="top">
        <Link to="/" className="brand">ExamHall</Link>
        {s && <div className="who"><span>{s.name}</span>
          <button className="ghost" onClick={() => { session.clear(); nav('/'); }}>Log out</button></div>}
      </header>
      <main className="wrap">{children}</main>
    </>
  );
}

export default function App() {
  const s = session.get();
  return (
    <Routes>
      <Route path="/" element={s ? <Navigate to={s.role === 'ADMIN' ? '/admin' : '/student'} replace /> : <Auth />} />
      <Route path="/admin" element={<Guard role="ADMIN"><Shell><Admin /></Shell></Guard>} />
      <Route path="/student" element={<Guard role="STUDENT"><Shell><Student /></Shell></Guard>} />
      <Route path="/exam/:id" element={<Guard role="STUDENT"><Shell><ExamRoom /></Shell></Guard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
