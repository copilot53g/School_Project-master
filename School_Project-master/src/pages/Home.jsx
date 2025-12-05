import React from 'react';
import { Link } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { students } = useStudents();
  const { userRole } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container text-center">
          <div>
            <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="app-mark">
              <rect width="100" height="100" rx="18" fill="url(#gv)" opacity="0.12"/>
              <path d="M30 70 L46 32 L62 70" stroke="url(#gv)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M58 36 L74 36" stroke="url(#gv)" strokeWidth="6" strokeLinecap="round"/>
            </svg>
          </div>

          {/* --- REPLACED: unique wordmark (SVG + text) --- */}
          <h1 className="hero-title animate-fade-in">
            <span className="brand-wordmark" title="7Veda Management">
              <svg className="brand-mono" width="64" height="64" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
                <defs>
                  <linearGradient id="brandGrad" x1="0" x2="1">
                    <stop offset="0" stopColor="#60a5fa"/>
                    <stop offset="1" stopColor="#7c3aed"/>
                  </linearGradient>
                </defs>

                <rect rx="22" width="120" height="120" fill="url(#brandGrad)" opacity="0.10"/>
                <g transform="translate(10,10)" stroke="url(#brandGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M18 80 L40 22 L62 80" />
                  <path d="M62 34 L86 34" strokeWidth="7"/>
                </g>

                {/* subtle numeric '7' integrated */}
                <path d="M82 36 L98 36 L88 54" stroke="url(#brandGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95"/>
              </svg>

              <span className="brand-text">
                <span className="brand-name">7Veda</span>
                <span className="brand-sub">Management</span>
              </span>
            </span>
          </h1>
        </div>
        <div className="hero-bg-glow"></div>
      </section>

      {/* Dashboard Grid */}
      <section className="section dashboard-section">
        <div className="container">
          <h2 className="section-title text-center mb-5">Management Portal</h2>

          <div className="grid grid-cols-3">
            {/* Student List Card */}
            <Link to="/students" className="card dashboard-card">
              <div className="card-icon">👥</div>
              <h3>Student List</h3>
              <p>
                {userRole === 'admin'
                  ? 'Manage student records, add new admissions, and view class lists.'
                  : 'View student records and class lists.'}
              </p>
              <div className="card-stat">
                <span className="stat-value">{students.length}</span>
                <span className="stat-label">Total Students</span>
              </div>
            </Link>

            {/* Attendance Card */}
            <Link to="/attendance" className="card dashboard-card">
              <div className="card-icon">📅</div>
              <h3>Attendance</h3>
              <p>Mark daily attendance, track absenteeism, and manage intimation records.</p>
              <div className="card-action">Mark Now &rarr;</div>
            </Link>

            {/* Marks Card */}
            <Link to="/marks" className="card dashboard-card">
              <div className="card-icon">📊</div>
              <h3>Marks & Results</h3>
              <p>Update subject-wise marks, import results, and track academic performance.</p>
              <div className="card-action">Update Marks &rarr;</div>
            </Link>

            {/* Outpass Card */}
            <Link to="/outpass" className="card dashboard-card">
              <div className="card-icon">🚪</div>
              <h3>Outpass System</h3>
              <p>Issue and track student outpasses for campus exit permissions.</p>
              <div className="card-action">Issue Outpass &rarr;</div>
            </Link>

            {/* Overview Card */}
            <Link to="/overview" className="card dashboard-card">
              <div className="card-icon">👤</div>
              <h3>Student Overview</h3>
              <p>Comprehensive 360° view of individual student performance and history.</p>
              <div className="card-action">View Profile &rarr;</div>
            </Link>

            {/* Contact/Support Card */}
            <Link to="/contact" className="card dashboard-card support-card">
              <div className="card-icon">📞</div>
              <h3>School Support</h3>
              <p>Need help? Contact administration or technical support.</p>
              <div className="contact-mini">
                <small>+1 234 567 8900</small>
                <small>support@7vedamanagement.edu</small>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        :root{
          --bg-primary: #071028;
          --bg-accent: linear-gradient(135deg,#0ea5e9 0%, #7c3aed 100%);
          --glass-bg: rgba(255,255,255,0.04);
          --glass-border: rgba(255,255,255,0.06);
          --glass-shadow: 0 8px 30px rgba(2,6,23,0.6);
          --card-gradient: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          --primary-color: #60a5fa;
          --accent-color: #7c3aed;
          --text-primary: #e6eef8;
          --text-secondary: #9fb6d6;
          --glass-radius: 14px;
        }

        * { box-sizing: border-box; }
        html,body,#root { height:100%; margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; color:var(--text-primary); background: radial-gradient(1200px 600px at 10% 10%, rgba(124,58,237,0.08), transparent), radial-gradient(1000px 500px at 90% 90%, rgba(14,165,233,0.06), transparent), var(--bg-primary); -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }

        .container { max-width:1140px; margin:0 auto; padding:0 20px; }

        .hero-section {
          position: relative;
          padding: 5.5rem 0 3.5rem;
          overflow: hidden;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }

        .hero-bg-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(600px 250px at 10% 20%, rgba(124,58,237,0.08), transparent 20%),
            radial-gradient(500px 200px at 90% 80%, rgba(14,165,233,0.06), transparent 25%);
          z-index: 0;
        }

        .school-badge {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width:96px;
          height:96px;
          border-radius:22px;
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015));
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 8px 30px rgba(2,6,23,0.6), 0 2px 6px rgba(124,58,237,0.08);
          font-size:2.5rem;
          margin-bottom:1rem;
          z-index:1;
        }

        .hero-title {
          font-size: clamp(2rem, 4vw, 3.2rem);
          margin:0;
          line-height:1.02;
          letter-spacing:-0.02em;
          background: linear-gradient(90deg, #ffffff 0%, #c7e6ff 35%, #9fb6ff 60%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight:800;
          z-index:1;
        }

        .hero-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          margin: .4rem 0 1.6rem;
          max-width:760px;
          z-index:1;
        }

        .label {
          display:inline-block;
          padding:6px 12px;
          border-radius:999px;
          background: rgba(96,165,250,0.08);
          color:var(--primary-color);
          font-weight:600;
          font-size:0.85rem;
        }

        .section-title {
          font-size:1.6rem;
          font-weight:700;
          color:var(--text-primary);
          margin-bottom:1.25rem;
          text-align:center;
        }

        .grid {
          display:grid;
          gap:18px;
          grid-template-columns: repeat(3, 1fr);
        }

        .card {
          background: var(--card-gradient);
          border-radius: var(--glass-radius);
          padding:20px;
          min-height:160px;
          display:flex;
          flex-direction:column;
          gap:8px;
          border:1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          transition: transform .22s cubic-bezier(.2,.9,.3,1), box-shadow .22s;
          overflow:hidden;
          position:relative;
        }

        .dashboard-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 50px rgba(2,6,23,0.7), 0 4px 20px rgba(96,165,250,0.06);
        }

        .card::after {
          content:'';
          position:absolute;
          right:-30%;
          top:-40%;
          width:220px;
          height:220px;
          background: radial-gradient(circle at 30% 20%, rgba(124,58,237,0.06), transparent 30%);
          transform: rotate(20deg);
          pointer-events:none;
        }

        .card .card-icon {
          width:64px;
          height:64px;
          border-radius:12px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:1.9rem;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.03);
          color:var(--primary-color);
          box-shadow: 0 6px 20px rgba(2,6,23,0.45);
        }

        .dashboard-card h3 { margin:0; font-size:1.15rem; color: #eaf4ff; }
        .dashboard-card p { margin:0; color:var(--text-secondary); font-size:0.95rem; }

        .card-stat {
          margin-top:12px;
          align-self:flex-start;
          display:flex;
          flex-direction:column;
          padding:10px 14px;
          background: linear-gradient(90deg, rgba(96,165,250,0.06), rgba(124,58,237,0.03));
          border-radius:10px;
          border:1px solid rgba(255,255,255,0.03);
        }

        .stat-value { font-size:1.25rem; font-weight:800; color:var(--text-primary); }
        .stat-label { font-size:0.75rem; color:var(--text-secondary); }

        .card-action { color:var(--accent-color); font-weight:700; margin-top:auto; transition: transform .18s; }
        .dashboard-card:hover .card-action { transform: translateX(6px); }

        .support-card { background: linear-gradient(180deg, rgba(124,58,237,0.02), rgba(14,165,233,0.01)); }

        .contact-mini small { color:var(--text-secondary); display:block; }

        /* Brand wordmark styles */
        .app-mark { display:block; }
        .brand-wordmark {
          display:inline-flex;
          align-items:center;
          gap:12px;
          padding:8px 12px;
          border-radius:14px;
          background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.04);
          box-shadow: 0 10px 30px rgba(2,6,23,0.45);
        }

        .brand-mono { flex:0 0 auto; width:56px; height:56px; }
        .brand-text { display:flex; flex-direction:column; line-height:1; }

        .brand-name {
          font-weight:900;
          font-size:1.5rem;
          letter-spacing:-0.02em;
          background: linear-gradient(90deg, #ffffff 0%, #c7e6ff 40%, #9fb6ff 80%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .brand-sub {
          font-size:0.9rem;
          font-weight:700;
          color: var(--text-secondary);
          margin-top:2px;
          transform: translateY(2px);
        }

        /* small refinement for hero-title to keep layout */
        .hero-title { display:flex; justify-content:center; align-items:center; gap:14px; font-weight:800; }

        /* responsive shrink */
        @media (max-width:640px){
          .brand-wordmark { gap:8px; padding:6px 8px; }
          .brand-name { font-size:1.05rem; }
          .brand-mono { width:44px; height:44px; }
        }
      `}</style>
    </div>
  );
};

export default Home;
