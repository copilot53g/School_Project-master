import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-hero">
      <div className="login-hero-bg" aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="login-viewport">
          <div className="brand-area">
            <div className="brand-badge" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0" stopColor="#0F4C81" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <rect width="24" height="24" rx="6" fill="url(#g)"></rect>
                <text x="12" y="16" textAnchor="middle" fontFamily="Poppins, Inter" fontWeight="700" fontSize="11" fill="#fff">7V</text>
              </svg>
            </div>
            <div>
              <h1 className="brand-title">7Veda Management</h1>
              <p className="brand-sub">Smart attendance · Clean reports · Faster workflows</p>
            </div>
          </div>

          <div className="card login-card">
            <h2 style={{ marginBottom: 6, fontSize: '1.125rem' }}>Welcome back</h2>
            <p className="small-muted" style={{ marginBottom: 16 }}>Sign in to continue to the admin dashboard.</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  placeholder="Enter username"
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" aria-label="Sign in">
                Sign in
              </button>
            </form>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <small className="small-muted">Need help? Contact IT</small>
              <small className="small-muted">© {new Date().getFullYear()} 7Veda</small>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: var(--bg-aux, linear-gradient(180deg,#f7fbff,#f4f8fb));
        }

        .login-hero-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
          background-image:
            radial-gradient(800px 300px at 10% 10%, rgba(6,182,212,0.06), transparent 12%),
            radial-gradient(600px 260px at 90% 85%, rgba(15,76,129,0.04), transparent 12%);
          mix-blend-mode: overlay;
          opacity: 0.95;
          filter: saturate(1.05) blur(12px);
        }

        /* CHANGED: place brand on top (full width) and login card centered below */
        .login-viewport {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          max-width: 920px;
          margin: 3.5rem auto;
          padding: 0 1rem;
          position: relative;
          z-index: 2;
        }

        @media (max-width: 980px) {
          .login-viewport { margin: 2.5rem auto; gap: 1rem; }
        }

        .brand-area {
          width: 100%;
          display:flex;
          gap: 1rem;
          align-items: center;
          padding: 1.5rem 1.25rem;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.96));
          box-shadow: 0 22px 48px rgba(2,6,23,0.06);
          border: 1px solid var(--border, rgba(10,18,38,0.06));
        }

        .brand-badge { flex: 0 0 auto; }
        .brand-title { font-family: var(--display-font, 'Poppins'); font-size:1.45rem; margin:0; color:var(--foreground); }
        .brand-sub { margin:0; color:var(--muted-foreground); font-size:0.95rem; }

        /* center card and constrain width */
        .login-card {
          width: 100%;
          max-width: 560px;
          padding: 2rem;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(250,250,255,0.98));
          box-shadow: 0 26px 60px rgba(2,6,23,0.08);
          border: 1px solid var(--border, rgba(10,18,38,0.06));
        }

        .error-message {
          background-color: rgba(244,63,94,0.08);
          color: #b91c1c;
          padding: 0.6rem 0.9rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-weight:600;
        }

        .btn-block { width:100%; padding: 0.85rem; font-size: 1rem; border-radius: 10px; }

        /* adjust inputs and labels to match project styles */
        .form-label { font-weight:700; color:var(--foreground); margin-bottom: 0.5rem; display:block; }
        .form-control { background: var(--card-alt, rgba(255,255,255,0.86)); border-radius: 10px; border:1px solid var(--border); padding:0.8rem; }

        /* subtle focus ring */
        .form-control:focus { box-shadow: 0 8px 26px rgba(6,182,212,0.06), 0 0 0 6px var(--ring, rgba(6,182,212,0.12)); outline:none; transform:translateY(-1px); }

      `}</style>
    </div>
  );
};

export default Login;
