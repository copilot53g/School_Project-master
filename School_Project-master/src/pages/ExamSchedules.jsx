import React, { useState, useMemo, useEffect } from 'react';
import { useStudents } from '../context/StudentContext';
import { useGroupCategory, DEFAULT_GROUPS } from '../context/GroupContext';

const ExamSchedules = () => {
    const { examSchedules, addExamSchedule, deleteExamSchedule, updateExamSchedule } = useStudents();
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        totalMarks: '',
        classes: [],
        subjects: []
    });
    const [viewTimetableId, setViewTimetableId] = useState(null);
    const [message, setMessage] = useState('');

    // Use fixed DEFAULT_GROUPS list for Applicable Groups dropdown
    const availableClasses = useMemo(() => DEFAULT_GROUPS.slice(), []);

    const getGroupCategory = useGroupCategory();

    // Subject map per major category
    const subjectMap = useMemo(() => ({
        MPC: ['SANS', 'ENG', 'MA', 'MB', 'PHY', 'CHE'],
        BIPC: ['SAN', 'ENG', 'MA', 'MB', 'PHY', 'CH'],
        MEC: ['SAN', 'ENG', 'MA', 'MB', 'ECO', 'COM']
    }), []);

    // Exam name map per major category
    const examNameMap = useMemo(() => ({
        MPC: [
            'WEEKLY TEST',
            'TERM-1',
            'PREFINAL',
            'EAPECT OR CDF',
            'EAPCET',
            'JEE MAINS'
        ],
        BIPC: [
            'WEEKLY TEST',
            'TERM',
            'PREFINAL',
            'EAPCET OR CDF',
            'EAPCET',
            'NEET'
        ],
        MEC: [
            'WEEKLY',
            'TERM-1',
            'PREFINAL',
            'CDF'
        ]
    }), []);

    // Marks map per exam name
    const marksMap = useMemo(() => ({
        'WEEKLY TEST': 20,
        'WEEKLY': 20,
        'TERM-1': 100,
        'TERM': 100,
        'PREFINAL': 100,
        'EAPECT OR CDF': 20,
        'EAPCET': 40,
        'JEE MAINS': 100,
        'NEET': 180,
        'CDF': 20
    }), []);

    // Get subjects for selected groups
    const examSubjects = useMemo(() => {
        const set = new Set();
        (formData.classes || []).forEach(cls => {
            const cat = getGroupCategory ? getGroupCategory(cls) : null;
            if (cat && subjectMap[cat]) subjectMap[cat].forEach(s => set.add(s));
        });
        return Array.from(set);
    }, [formData.classes, getGroupCategory, subjectMap]);

    // Build exam name options (union) based on selected classes
    const examNameOptions = useMemo(() => {
        const set = new Set();
        (formData.classes || []).forEach(cls => {
            const cat = getGroupCategory ? getGroupCategory(cls) : null;
            if (cat && examNameMap[cat]) examNameMap[cat].forEach(v => set.add(v));
        });
        return Array.from(set);
    }, [formData.classes, getGroupCategory, examNameMap]);

    // Auto-generate exam dates (excluding Sundays)
    const generateExamDates = useMemo(() => {
        if (!formData.startDate || !formData.endDate || examSubjects.length === 0) return [];
        
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const dates = [];
        
        let current = new Date(start);
        while (current <= end && dates.length < examSubjects.length) {
            if (current.getDay() !== 0) { // Exclude Sunday (0)
                dates.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }
        
        return dates.slice(0, examSubjects.length).map(d => d.toISOString().split('T')[0]);
    }, [formData.startDate, formData.endDate, examSubjects.length]);

    // Auto-populate subjects with dates
    useEffect(() => {
        if (generateExamDates.length > 0 && examSubjects.length > 0) {
            const newSubjects = examSubjects
                .map((subject, idx) => ({ date: generateExamDates[idx], subject }))
                .filter(s => s.date); // ensure date exists
            setFormData(prev => ({ ...prev, subjects: newSubjects }));
        } else {
            setFormData(prev => ({ ...prev, subjects: [] }));
        }
    }, [generateExamDates, examSubjects]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'endDate' && formData.startDate && value < formData.startDate) {
            alert('End Date cannot be before Start Date');
            return;
        }

        if (name === 'startDate' && formData.endDate && value > formData.endDate) {
            setFormData(prev => ({ ...prev, [name]: value, endDate: '' }));
            return;
        }

        // Auto-populate totalMarks when exam name changes
        if (name === 'name' && value && marksMap[value]) {
            setFormData(prev => ({ ...prev, [name]: value, totalMarks: marksMap[value].toString() }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Custom multi-select UI for groups
    const GroupsMultiSelect = ({ options, value = [], onChange, placeholder = 'Select groups' }) => {
        const [open, setOpen] = useState(false);
        const [filter, setFilter] = useState('');

        const toggle = () => setOpen(o => !o);
        const close = () => setOpen(false);
        const isSelected = (opt) => value.includes(opt);
        const toggleOption = (opt) => {
            const next = isSelected(opt) ? value.filter(v => v !== opt) : [...value, opt];
            onChange(next);
        };
        const selectAll = () => onChange(options.slice());
        const clearAll = () => onChange([]);

        const visible = options.filter(o => o.toLowerCase().includes(filter.toLowerCase()));

        return (
            <div style={{ position: 'relative' }}>
                <button
                    type="button"
                    onClick={toggle}
                    className="form-control"
                    style={{ textAlign: 'left', display: 'flex', gap: '0.5rem', alignItems: 'center', minHeight: '2.3rem' }}
                >
                    <div style={{ flex: 1, display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {value.length === 0 ? <span style={{ color: 'var(--text-secondary)' }}>{placeholder}</span> :
                            value.map(v => (
                                <span key={v} style={{ background: 'var(--bg-accent)', padding: '0.15rem 0.4rem', borderRadius: '999px', fontSize: '0.8rem' }}>
                                    {v}
                                </span>
                            ))
                        }
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{open ? '▴' : '▾'}</div>
                </button>

                {open && (
                    <div
                        onMouseLeave={close}
                        style={{ position: 'absolute', zIndex: 40, top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', boxShadow: '0 6px 18px rgba(0,0,0,0.06)', padding: '0.5rem' }}
                    >
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Search groups..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="form-control"
                                style={{ flex: 1 }}
                            />
                            <button type="button" className="btn" onClick={selectAll} style={{ whiteSpace: 'nowrap' }}>Select all</button>
                            <button type="button" className="btn btn-outline" onClick={clearAll} style={{ whiteSpace: 'nowrap' }}>Clear</button>
                        </div>

                        <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                            {visible.length === 0 ? (
                                <div style={{ color: 'var(--text-secondary)', padding: '0.5rem' }}>No groups found</div>
                            ) : visible.map(opt => (
                                <label key={opt} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.35rem 0.25rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected(opt)}
                                        onChange={() => toggleOption(opt)}
                                    />
                                    <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.classes.length === 0) {
            setMessage('Error: Please select at least one class.');
            return;
        }
        if (!formData.name) {
            setMessage('Error: Please select exam name.');
            return;
        }
        if (!formData.totalMarks) {
            setMessage('Error: Please enter total marks.');
            return;
        }
        if (formData.subjects.length === 0) {
            setMessage('Error: Exam dates not generated. Check date range.');
            return;
        }

        if (editingId) {
            updateExamSchedule(editingId, formData);
            setMessage('Exam Schedule updated successfully!');
            setEditingId(null);
        } else {
            addExamSchedule(formData);
            setMessage('Exam Schedule created successfully!');
        }

        setFormData({
            name: '',
            startDate: '',
            endDate: '',
            totalMarks: '',
            classes: [],
            subjects: []
        });
        setTimeout(() => setMessage(''), 3000);
    };

    const handleEdit = (schedule) => {
        setEditingId(schedule.id);
        setFormData({
            name: schedule.name,
            startDate: schedule.startDate,
            endDate: schedule.endDate,
            totalMarks: schedule.totalMarks || '',
            classes: schedule.classes,
            subjects: schedule.subjects
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            name: '',
            startDate: '',
            endDate: '',
            totalMarks: '',
            classes: [],
            subjects: []
        });
    };

    return (
        <div className="page-container section">
            <div className="container">
                <h1 className="page-title mb-5" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Exam Schedules</h1>

                <div className="grid grid-cols-2" style={{ gap: '2rem' }}>
                    {/* Form Section */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{editingId ? 'Edit Schedule' : 'Create New Schedule'}</h2>
                            {editingId && (
                                <button onClick={handleCancelEdit} className="btn btn-sm btn-outline" style={{ fontSize: '0.8rem' }}>Cancel</button>
                            )}
                        </div>

                        {message && (
                            <div className={`p-3 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                                style={{ padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', backgroundColor: message.includes('Error') ? '#fee2e2' : '#dcfce7', color: message.includes('Error') ? '#b91c1c' : '#15803d' }}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Applicable Groups (required)</label>
                                    <GroupsMultiSelect
                                        options={availableClasses}
                                        value={formData.classes}
                                        onChange={(selected) => setFormData(prev => ({ ...prev, classes: selected, name: '' }))}
                                        placeholder="Select groups..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Exam Name (auto-populated)</label>
                                    {examNameOptions.length > 0 ? (
                                        <select
                                            name="name"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">-- Select Exam Name --</option>
                                            {examNameOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control"
                                            placeholder="Select at least one group first"
                                            disabled
                                        />
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Total Marks (auto-populated)</label>
                                    <input
                                        type="number"
                                        name="totalMarks"
                                        className="form-control"
                                        value={formData.totalMarks}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        className="form-control"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        className="form-control"
                                        value={formData.endDate}
                                        min={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {formData.subjects.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Auto-Generated Exam Timetable</h4>
                                    <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <table className="table" style={{ fontSize: '0.8rem', width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: '0.4rem' }}>Date</th>
                                                    <th style={{ padding: '0.4rem' }}>Day</th>
                                                    <th style={{ padding: '0.4rem' }}>Subject</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.subjects.map((s, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ padding: '0.4rem' }}>{s.date}</td>
                                                        <td style={{ padding: '0.4rem' }}>{new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' })}</td>
                                                        <td style={{ padding: '0.4rem' }}>{s.subject}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary w-100" style={{ width: '100%', marginTop: '1rem' }}>
                                {editingId ? 'Update Schedule' : 'Create Schedule'}
                            </button>
                        </form>
                    </div>

                    {/* List Section */}
                    <div className="card">
                        <h2 className="mb-4" style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Active Schedules</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {examSchedules.length === 0 ? (
                                <p className="text-secondary text-center">No exam schedules found.</p>
                            ) : (
                                examSchedules.map(schedule => (
                                    <div
                                        key={schedule.id}
                                        style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '0.75rem',
                                            padding: '1.25rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)',
                                            border: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                        onClick={() => {
                                            console.log('Open timetable for', schedule.name, 'subjects:', schedule.subjects);
                                            setViewTimetableId(viewTimetableId === schedule.id ? null : schedule.id);
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                            <h3 style={{ fontWeight: 'bold', fontSize: '1.15rem', color: 'white', margin: 0 }}>{schedule.name}</h3>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleEdit(schedule); }}
                                                    style={{
                                                        color: 'white',
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '0.4rem',
                                                        transition: 'all 0.2s ease',
                                                        fontWeight: '500'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                                                    onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteExamSchedule(schedule.id); }}
                                                    style={{
                                                        color: 'white',
                                                        background: 'rgba(255, 59, 48, 0.3)',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '0.4rem',
                                                        transition: 'all 0.2s ease',
                                                        fontWeight: '500'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 59, 48, 0.5)'}
                                                    onMouseLeave={(e) => e.target.style.background = 'rgba(255, 59, 48, 0.3)'}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '0.25rem' }}>
                                            {schedule.startDate} to {schedule.endDate}
                                        </p>
                                        <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '0.75rem' }}>
                                            <strong>Total Marks:</strong> {schedule.totalMarks || 'N/A'}
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                                            {schedule.classes.map(c => (
                                                <span key={c} style={{
                                                    fontSize: '0.7rem',
                                                    background: 'rgba(255, 255, 255, 0.25)',
                                                    color: 'white',
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: '999px',
                                                    fontWeight: '500'
                                                }}>{c}</span>
                                            ))}
                                        </div>

                                        {viewTimetableId === schedule.id && (
                                            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '1rem' }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'white' }}>📅 Exam Timetable</h4>
                                                <div className="table-container" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                                    <table
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            width: '100%',
                                                            margin: 0,
                                                            borderCollapse: 'collapse',
                                                            background: 'black',     // override any white table bg
                                                            color: 'gray'                 // default text color for table cells
                                                        }}
                                                        aria-label={`Timetable for ${schedule.name}`}
                                                    >
                                                        <thead>
                                                            <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                                                                <th style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.95)', textAlign: 'left', fontWeight: '600' }}>Date</th>
                                                                <th style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.95)', textAlign: 'left', fontWeight: '600' }}>Day</th>
                                                                <th style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.95)', textAlign: 'left', fontWeight: '600' }}>Subject</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {schedule.subjects.map((s, i) => (
                                                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                                    <td style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>{s.date}</td>
                                                                    <td style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>{new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' })}</td>
                                                                    <td style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.95)', fontWeight: '600' }}>{s.subject}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamSchedules;
