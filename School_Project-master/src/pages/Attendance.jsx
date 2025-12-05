import React, { useState, useEffect, useMemo } from 'react';
import { useStudents } from '../context/StudentContext';

const SESSION_META = {
  morning: { key: 'morning', label: 'Morning (09:00 - 13:00)', start: '09:00', end: '13:00', disableAfter: '13:30' },
  afternoon: { key: 'afternoon', label: 'Afternoon (13:30 - 17:30)', start: '13:30', end: '17:30' }
};

const STORAGE_KEY_SESSIONS = 'sri_sudha_attendance_sessions_v1';
const STORAGE_KEY_REPORTS = 'sri_sudha_attendance_reports_v1';

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

const Attendance = () => {
  const { students } = useStudents();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterClass, setFilterClass] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', ''
  const [popup, setPopup] = useState(null); // { message: '', color: '' }

  // --- CHANGED: compute select-enabled flags and auto-switch session when afternoon starts ---
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 20000);
    return () => clearInterval(id);
  }, []);

  // precise windows
  const morningWindow = {
    start: timeToMinutes(SESSION_META.morning.start),
    end: timeToMinutes(SESSION_META.morning.end),
    disableAfter: timeToMinutes(SESSION_META.morning.disableAfter)
  };
  const afternoonWindow = {
    start: timeToMinutes(SESSION_META.afternoon.start),
    end: timeToMinutes(SESSION_META.afternoon.end)
  };

  // whether attendance entry is currently allowed for each session
  const morningActive = currentMinutes >= morningWindow.start && currentMinutes <= morningWindow.end; // 09:00-13:00
  const afternoonActive = currentMinutes >= afternoonWindow.start && currentMinutes <= afternoonWindow.end; // 13:30-17:30

  // option-level disable rules:
  // - morning option should be enabled only during 09:00-13:00 (morningActive)
  // - once current time reaches 13:30 (disableAfter) morning option must be disabled
  // - afternoon option enabled only from 13:30 onwards (afternoonActive)
  const morningOptionDisabled = !morningActive || currentMinutes >= morningWindow.disableAfter;
  const afternoonOptionDisabled = !afternoonActive;

  // default/active session selection (auto-switch when afternoon becomes available)
  const defaultSession = morningActive ? 'morning' : (afternoonActive ? 'afternoon' : 'morning');
  const [session, setSession] = useState(defaultSession);

  // auto-switch session on time changes: when 13:30 arrives, force afternoon and disable morning
  useEffect(() => {
    if (currentMinutes >= afternoonWindow.start && session !== 'afternoon') {
      setSession('afternoon');
    } else if (morningActive && !afternoonActive && session !== 'morning') {
      setSession('morning');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMinutes, morningActive, afternoonActive]);

  // local session attendance state: { [date]: { [sessionKey]: { [admissionNo]: record } } }
  const [attendanceSessions, setAttendanceSessions] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // reports store: { [date]: { [session]: report } }
  const [reports, setReports] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REPORTS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(attendanceSessions));
  }, [attendanceSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  }, [reports]);

  // Helpers to read/write session attendance
  const getSessionAttendance = (date, sess) => {
    return (attendanceSessions[date] && attendanceSessions[date][sess]) ? attendanceSessions[date][sess] : {};
  };

  const setSessionAttendanceRecord = (date, sess, admissionNo, record) => {
    setAttendanceSessions(prev => {
      const next = { ...prev };
      if (!next[date]) next[date] = {};
      if (!next[date][sess]) next[date][sess] = {};
      next[date][sess] = { ...next[date][sess], [admissionNo]: record };
      return next;
    });
  };

  // Only allow selecting today's date in UI as before
  const today = new Date().toISOString().split('T')[0];

  // filtered students
  const filteredStudents = useMemo(() => students.filter(s => !filterClass || s.group === filterClass), [students, filterClass]);

  // Get unique groups excluding legacy codes
  const classes = useMemo(() => {
    const legacy = new Set(['MPC', 'BIPC', 'MEC']);
    return Array.from(new Set(students.map(s => s.group).filter(Boolean)))
      .filter(g => !legacy.has(String(g).trim().toUpperCase()))
      .sort((a, b) => a.toString().localeCompare(b.toString(), undefined, { numeric: true, sensitivity: 'base' }));
  }, [students]);

  // when attendance changed for one student
  const handleAttendanceChange = (admissionNo, field, value) => {
    // Prevent edits to morning session after cutoff (13:30)
    if (session === 'morning' && currentMinutes >= morningWindow.disableAfter) return;

    setSaveStatus('saving');
    const currentRecord = getSessionAttendance(selectedDate, session)[admissionNo] || {
      present: true,
      intimation: false,
      intimatedBy: '',
      reason: '',
      locked: false
    };

    let newRecord = { ...currentRecord, [field]: value };

    // If marking present/absent -> finalize (lock) the record
    if (field === 'present') {
      // Lock immediately only when marking Present.
      // When marking Absent keep record unlocked so intimation/details can be entered.
      newRecord.locked = value === true;
      if (value === true) {
        newRecord.intimation = false;
        newRecord.intimatedBy = '';
        newRecord.reason = '';
        setPopup({ message: 'Marked Present', color: '#15803d' });
      } else {
        setPopup({ message: 'Marked Absent', color: '#b91c1c' });
      }
      setTimeout(() => setPopup(null), 1500);
    }

    setSessionAttendanceRecord(selectedDate, session, admissionNo, newRecord);

    // simulate save delay
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 1600);
    }, 350);
  };

  // check if all filtered students have attendance for selected date/session
  useEffect(() => {
    const sessAtt = getSessionAttendance(selectedDate, session);
    const allMarked = filteredStudents.length > 0 && filteredStudents.every(s => sessAtt[s.admissionNo] !== undefined);
    if (allMarked) {
      // auto-generate report if not already generated
      setReports(prev => {
        const prevDate = prev[selectedDate] || {};
        if (prevDate[session]) return prev; // already generated
        const report = generateReportForSession(selectedDate, session, sessAtt, filteredStudents);
        const next = { ...prev, [selectedDate]: { ...(prev[selectedDate] || {}), [session]: report } };
        // store next (effect will persist)
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceSessions, selectedDate, session, filteredStudents.length]);

  function generateReportForSession(date, sess, sessAtt = null, studentsList = null) {
    const attendanceMap = sessAtt || getSessionAttendance(date, sess);
    const list = studentsList || students;
    const groups = {};
    list.forEach(s => {
      const rec = attendanceMap[s.admissionNo];
      const present = rec ? !!rec.present : false;
      const g = s.group || 'Ungrouped';
      if (!groups[g]) groups[g] = { presentCount: 0, absentCount: 0, students: [] };
      if (present) groups[g].presentCount += 1;
      else groups[g].absentCount += 1;
      groups[g].students.push({
        admissionNo: s.admissionNo,
        name: `${s.firstName} ${s.lastName}`.trim(),
        present,
        intimatedBy: rec?.intimatedBy || '',
        reason: rec?.reason || ''
      });
    });
    return {
      date,
      session: sess,
      generatedAt: new Date().toISOString(),
      summary: Object.keys(groups).sort().map(g => ({ group: g, ...groups[g] }))
    };
  }

  // UI: allow viewing saved reports by date/session
  const availableReportDates = useMemo(() => Object.keys(reports).sort((a,b)=>b.localeCompare(a)), [reports]);
  const [reportViewDate, setReportViewDate] = useState(selectedDate);
  const [reportViewSession, setReportViewSession] = useState(session);

  useEffect(() => {
    setReportViewDate(selectedDate);
    setReportViewSession(session);
  }, [selectedDate, session]);

  const activeReport = reports[reportViewDate] && reports[reportViewDate][reportViewSession] ? reports[reportViewDate][reportViewSession] : null;

  return (
    <div className="page-container section">
      {popup && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: popup.color,
          color: 'white',
          padding: '0.75rem 1.25rem',
          borderRadius: '0.5rem',
          zIndex: 2000,
          boxShadow: '0 6px 18px rgba(2,6,23,0.35)',
          fontWeight: '700',
          animation: 'slideDown 0.28s ease-out'
        }}>
          {popup.message}
        </div>
      )}

      <div className="container">
        <div className="flex justify-between items-center mb-5" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0 }}>Daily Attendance</h1>
          {saveStatus === 'saved' && (
            <span style={{ background: '#dcfce7', color: '#065f46', padding: '0.45rem 0.9rem', borderRadius: '999px', fontWeight: '700', boxShadow: '0 6px 16px rgba(2,6,23,0.06)' }}>
              ✓ Saved
            </span>
          )}
        </div>

        <div className="card mb-4" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ minWidth: 220 }}>
              <label className="form-label">Select Date</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                min={today}
                max={today}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedDate(val === today ? val : today);
                }}
                style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)' }}
              />
            </div>

            <div style={{ minWidth: 220 }}>
              <label className="form-label">Session</label>
              <select
                className="form-control"
                value={session}
                onChange={(e) => {
                  const chosen = e.target.value;
                  // Prevent choosing morning once it's disabled (>=13:30)
                  if (chosen === 'morning' && morningOptionDisabled) return;
                  // Prevent choosing afternoon if it's not yet active
                  if (chosen === 'afternoon' && afternoonOptionDisabled) return;
                  setSession(chosen);
                }}
                style={{ padding: '8px 10px', borderRadius: 10 }}
              >
                <option value="morning" disabled={morningOptionDisabled}>Morning (09:00 - 13:00)</option>
                <option value="afternoon" disabled={afternoonOptionDisabled}>Afternoon (13:30 - 17:30)</option>
              </select>
              <div style={{ fontSize: '0.8rem', color: '#9aa5b1', marginTop: 6 }}>
                {morningActive ? 'Morning session active (09:00 - 13:00)' : (afternoonActive ? 'Afternoon session active (13:30 - 17:30)' : 'Outside active session times')}
              </div>
            </div>

            <div style={{ minWidth: 220 }}>
              <label className="form-label">Filter by Group</label>
              <select
                className="form-control"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: 10 }}
              >
                <option value="">All Groups</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card table-container" style={{ padding: 0 }}>
          <table className="table" style={{ fontSize: '0.875rem', width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(10,20,38,0.02)' }}>
              <tr>
                <th style={{ padding: '0.75rem 0.9rem', textAlign: 'left' }}>Admission No</th>
                <th style={{ padding: '0.75rem 0.9rem', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '0.75rem 0.9rem', textAlign: 'left' }}>Group</th>
                <th style={{ padding: '0.75rem 0.9rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem 0.9rem', textAlign: 'left' }}>Intimation Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const sessMap = getSessionAttendance(selectedDate, session);
                const record = sessMap[student.admissionNo] || { present: true, intimation: false, intimatedBy: '', reason: '' };

                return (
                  <tr key={student.admissionNo} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '0.6rem 0.9rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.18rem 0.5rem', borderRadius: 8, background: 'rgba(10,100,200,0.06)', color: '#064e3b' }}>{student.admissionNo}</span>
                    </td>
                    <td style={{ padding: '0.6rem 0.9rem' }}>{student.firstName} {student.lastName}</td>
                    <td style={{ padding: '0.6rem 0.9rem' }}>{student.group}</td>
                    <td style={{ padding: '0.6rem 0.9rem' }}>
                      {(() => {
                        // disable editing after locked OR time cutoff
                        const sessMap = getSessionAttendance(selectedDate, session);
                        const currentRec = sessMap[student.admissionNo] || {};
                        const locked = !!currentRec.locked;
                        const editingDisabled = (session === 'morning' && currentMinutes >= morningWindow.disableAfter) || locked;
                        const disabledStyleBase = { opacity: editingDisabled ? 0.55 : 1, cursor: editingDisabled ? 'not-allowed' : 'pointer' };
                        return (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                              onClick={() => { if (!editingDisabled) handleAttendanceChange(student.admissionNo, 'present', true); }}
                              disabled={editingDisabled}
                              title={locked ? 'Finalized' : (editingDisabled ? 'Disabled now' : 'Mark Present')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 10,
                                border: 'none',
                                ...disabledStyleBase,
                                background: (currentRec.present || (!currentRec.present && !locked)) ? 'linear-gradient(90deg,#10b981,#06b6d4)' : 'transparent',
                                color: (currentRec.present || (!currentRec.present && !locked)) ? '#fff' : '#0f172a',
                                boxShadow: (!editingDisabled && currentRec.present) ? '0 8px 20px rgba(16,185,129,0.12)' : 'inset 0 0 0 1px rgba(15,23,42,0.06)',
                                fontWeight: 700,
                                minWidth: 88
                              }}
                            >
                              Present
                            </button>

                            <button
                              onClick={() => { if (!editingDisabled) handleAttendanceChange(student.admissionNo, 'present', false); }}
                              disabled={editingDisabled}
                              title={locked ? 'Finalized' : (editingDisabled ? 'Disabled now' : 'Mark Absent')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 10,
                                border: 'none',
                                ...disabledStyleBase,
                                background: (!currentRec.present && locked) ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'transparent',
                                color: (!currentRec.present && locked) ? '#fff' : '#7f1d1d',
                                boxShadow: (!editingDisabled && !currentRec.present) ? '0 8px 20px rgba(239,68,68,0.12)' : 'inset 0 0 0 1px rgba(127,29,29,0.06)',
                                fontWeight: 700,
                                minWidth: 88
                              }}
                            >
                              Absent
                            </button>

                            {/* show lock icon when finalized */}
                            {locked && (
                              <span title="Attendance finalized" style={{ marginLeft: 6, color: '#6b7280', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                🔒 Final
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '0.6rem 0.9rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: record.present ? 'not-allowed' : 'pointer', opacity: record.present ? 0.6 : 1 }}>
                          <input
                            type="checkbox"
                            checked={record.intimation}
                            onChange={(e) => handleAttendanceChange(student.admissionNo, 'intimation', e.target.checked)}
                            disabled={record.present || record.locked}
                            style={{ width: 16, height: 16, cursor: (record.present || record.locked) ? 'not-allowed' : 'pointer' }}
                          />
                          <span style={{ fontSize: '0.9rem' }}>Intimation Received</span>
                        </label>

                        {record.intimation && (
                          <div style={{ marginTop: 6, padding: 8, borderRadius: 10, background: 'rgba(2,6,23,0.02)', minWidth: 220, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <select
                              value={record.intimatedBy || ''}
                              onChange={(e) => handleAttendanceChange(student.admissionNo, 'intimatedBy', e.target.value)}
                              disabled={record.present || record.locked}
                              style={{ padding: '6px 8px', borderRadius: 8 }}
                            >
                              <option value="">-- Intimated By --</option>
                              <option value="Mother">Mother</option>
                              <option value="Father">Father</option>
                              <option value="Guardian">Guardian</option>
                              <option value="Relative">Relative</option>
                              <option value="Self">Self</option>
                              <option value="Other">Other</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Reason for absence..."
                              value={record.reason || ''}
                              onChange={(e) => handleAttendanceChange(student.admissionNo, 'reason', e.target.value)}
                              disabled={record.present || record.locked}
                              style={{ padding: '6px 8px', borderRadius: 8 }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr><td colSpan="5" className="text-center" style={{ padding: '0.9rem' }}>No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Reports viewer */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontWeight: 700 }}>Attendance Reports</label>
            <select value={reportViewDate} onChange={(e) => setReportViewDate(e.target.value)} style={{ padding: '6px 8px', borderRadius: 8 }}>
              <option value={selectedDate}>Today ({selectedDate})</option>
              {availableReportDates.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select value={reportViewSession} onChange={(e) => setReportViewSession(e.target.value)} style={{ padding: '6px 8px', borderRadius: 8 }}>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
            </select>

            <button onClick={() => {
              // regenerate view report from session attendance if exists and not yet saved
              const sessAtt = getSessionAttendance(reportViewDate, reportViewSession);
              if (Object.keys(sessAtt).length > 0) {
                const rep = generateReportForSession(reportViewDate, reportViewSession, sessAtt, students.filter(s => !filterClass || s.group === filterClass));
                setReports(prev => ({ ...prev, [reportViewDate]: { ...(prev[reportViewDate] || {}), [reportViewSession]: rep } }));
              }
            }} style={{ padding: '6px 8px', borderRadius: 8, background: 'linear-gradient(90deg,#60a5fa,#7c3aed)', color: '#fff', border: 'none', fontWeight: 700 }}>
              Generate/View
            </button>
          </div>

          <div className="card" style={{ padding: 12 }}>
            {activeReport ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1rem', fontWeight: 900 }}>{activeReport.date} — {activeReport.session}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{new Date(activeReport.generatedAt).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => {
                      const blob = new Blob([JSON.stringify(activeReport, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `attendance_report_${activeReport.date}_${activeReport.session}.json`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    }} style={{ padding: '8px 12px', borderRadius: 10, background: 'linear-gradient(90deg,#06b6d4,#7c3aed)', color: 'white', border: 'none', fontWeight: 800 }}>
                      Download JSON
                    </button>
                  </div>
                </div>

                {activeReport.summary.map(groupRec => (
                  <div key={groupRec.group} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: 12, background: 'linear-gradient(90deg, rgba(96,165,250,0.06), rgba(124,58,237,0.03))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 900 }}>{groupRec.group}</div>
                      <div style={{ color: '#374151' }}>{groupRec.presentCount} present • {groupRec.absentCount} absent</div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', background: 'rgba(0,0,0,0.02)' }}>
                          <th style={{ padding: '8px 12px', width: 120 }}>Admission</th>
                          <th style={{ padding: '8px 12px' }}>Name</th>
                          <th style={{ padding: '8px 12px', width: 120 }}>Status</th>
                          <th style={{ padding: '8px 12px' }}>Intimation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupRec.students.map(st => (
                          <tr key={st.admissionNo} style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                            <td style={{ padding: '8px 12px' }}><strong>{st.admissionNo}</strong></td>
                            <td style={{ padding: '8px 12px' }}>{st.name}</td>
                            <td style={{ padding: '8px 12px' }}>{st.present ? <span style={{ color: '#065f46', fontWeight: 800 }}>Present</span> : <span style={{ color: '#7f1d1d', fontWeight: 800 }}>Absent</span>}</td>
                            <td style={{ padding: '8px 12px', color: '#6b7280' }}>{!st.present && st.intimatedBy ? `${st.intimatedBy}${st.reason ? ` — ${st.reason}` : ''}` : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#6b7280' }}>No report available for selected date/session.</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
            from { transform: translate(-50%, -12px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }

        /* small enhancement for nicer report table */
        .card table th { font-weight: 700; color: #374151; }
        .card table td { color: #0f172a; }
      `}</style>
    </div>
  );
};

export default Attendance;
