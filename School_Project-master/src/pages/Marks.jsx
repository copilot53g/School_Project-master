import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useStudents } from '../context/StudentContext';
import { useGroups } from '../context/GroupContext';

const Marks = () => {
  const { students, updateMarks, importMarksFromArray, attendance, examSchedules } = useStudents();
  const groups = useGroups();
  const [activeTab, setActiveTab] = useState('single');

  // Single Entry State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [marks, setMarks] = useState('');
  const [status, setStatus] = useState('Pass');
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState('');

  // Import State
  const [importData, setImportData] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [selectedExamInfo, setSelectedExamInfo] = useState(null);

  const filteredStudents = selectedClass
    ? students.filter(s => s.group === selectedClass)
    : students;

  const classes = React.useMemo(() => {
    const allClasses = (groups || []).slice().sort();
    if (selectedSchedule) {
      const schedule = examSchedules.find(s => s.id === selectedSchedule);
      if (schedule && schedule.classes && schedule.classes.length > 0) {
        return allClasses.filter(c => schedule.classes.includes(c));
      }
    }
    return allClasses;
  }, [groups, selectedSchedule, examSchedules]);

  React.useEffect(() => {
    if (selectedClass && !classes.includes(selectedClass)) {
      setSelectedClass('');
      setSelectedStudent('');
    }
  }, [classes, selectedClass]);

  const isAbsent = selectedStudent && attendance[examDate] && attendance[examDate][selectedStudent]?.present === false;

  React.useEffect(() => {
    if (examDate) {
      setSelectedMonth(examDate.slice(0, 7));
    }
  }, [examDate]);

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent || !subject) {
      setMessage('Please select student and subject');
      return;
    }

    if (isAbsent) {
      setMessage('Cannot enter marks: Student is marked absent on this date.');
      return;
    }

    updateMarks(selectedStudent, selectedMonth, subject, {
      marks: Number(marks),
      status,
      remarks,
      date: examDate
    });

    setMessage('Marks updated successfully!');
    setTimeout(() => setMessage(''), 3000);

    setMarks('');
    setRemarks('');
  };

  const _handleImport = () => {
    try {
      const parsed = JSON.parse(importData);
      if (!Array.isArray(parsed)) throw new Error('Data must be an array');
      importMarksFromArray(parsed, selectedMonth);
      setMessage(`Successfully imported ${parsed.length} records.`);
      setImportData('');
    } catch (err) {
      setMessage('Error importing data: ' + err.message);
    }
  };

 const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!selectedSchedule) {
    setMessage('Error: Please select an exam schedule first.');
    return;
  }

  const selectedExamSchedule = examSchedules.find(s => s.id === selectedSchedule);
  if (!selectedExamSchedule) {
    setMessage('Error: Invalid exam schedule selected.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      if (data.length === 0) throw new Error('Excel file is empty');

      const firstRow = data[0];
      const allKeys = Object.keys(firstRow);

      const getKey = (key) => allKeys.find(k => k.toLowerCase().includes(key.toLowerCase()));
      const snoKey = getKey('s.no') || getKey('sno') || getKey('serial');
      const nameKey = getKey('name') || getKey('student');

      // Filter out metadata columns
      const excludePatterns = ['group', 'exam', 'class', 'subject', 'marks', 'status', 'remarks', 'date', 'total'];
      const subjectKeys = allKeys.filter(k => 
        k !== snoKey && 
        k !== nameKey &&
        !excludePatterns.some(pattern => k.toLowerCase().includes(pattern))
      );

      const formattedData = data.map(row => {
        const sno = row[snoKey];
        const name = row[nameKey];

        let admissionNo = null;
        let studentGroup = null;
        if (name && selectedExamSchedule.classes.length > 0) {
          const cleanName = String(name).trim().toLowerCase();

          let found = students.find(s =>
            selectedExamSchedule.classes.includes(s.group) &&
            (`${s.firstName} ${s.lastName}`).toLowerCase() === cleanName
          );

          if (!found) {
            const nameParts = cleanName.split(/\s+/).filter(p => p.length > 0);
            found = students.find(s =>
              selectedExamSchedule.classes.includes(s.group) &&
              (
                s.firstName.toLowerCase().includes(nameParts[0]) ||
                s.lastName.toLowerCase().includes(nameParts[0]) ||
                (nameParts.length > 1 && (
                  (s.firstName.toLowerCase().includes(nameParts[0]) && s.lastName.toLowerCase().includes(nameParts[1])) ||
                  (s.firstName.toLowerCase().includes(nameParts[1]) && s.lastName.toLowerCase().includes(nameParts[0]))
                ))
              )
            );
          }

          if (found) {
            admissionNo = found.admissionNo;
            studentGroup = found.group;
          }
        }

        if (!admissionNo) {
          console.warn(`⚠️ Student not found for: "${name}"`);
          return null;
        }

        const marksData = {};
        subjectKeys.forEach(key => {
          const marksVal = row[key];
          // Only add if value is a number and not NaN
          if (marksVal !== undefined && marksVal !== null && marksVal !== '' && !isNaN(marksVal)) {
            marksData[key] = Number(marksVal);
          }
        });

        return {
          admissionNo,
          sno,
          name,
          group: studentGroup,
          marksData,
          examName: selectedExamSchedule.name,
          subjects: selectedExamSchedule.subjects,
          examScheduleId: selectedSchedule
        };
      }).filter(item => item !== null && item.admissionNo && Object.keys(item.marksData).length > 0);

      if (formattedData.length === 0) {
        throw new Error('❌ No valid data found. Please ensure student names match database.');
      }

      const unmatchedCount = data.length - formattedData.length;
      let warningMsg = '';
      if (unmatchedCount > 0) {
        warningMsg = ` (⚠️ ${unmatchedCount} student(s) not found)`;
      }

      // Filter subjectKeys to only include those with actual numeric data
      const validSubjectKeys = subjectKeys.filter(key =>
        formattedData.some(record => record.marksData[key] !== undefined)
      );

      setPreviewData(formattedData);
      setSelectedExamInfo({
        examName: selectedExamSchedule.name,
        totalMarks: selectedExamSchedule.totalMarks,
        subjects: selectedExamSchedule.subjects,
        classes: selectedExamSchedule.classes,
        subjectColumns: validSubjectKeys
      });

      setMessage(`✅ Preview: ${formattedData.length} students ready to import${warningMsg}`);
      e.target.value = '';
    } catch (err) {
      setMessage('Error parsing Excel file: ' + err.message);
      setPreviewData([]);
      setSelectedExamInfo(null);
    }
  };
  reader.readAsBinaryString(file);
};

 const handleConfirmImport = () => {
  if (previewData.length === 0) return;

  previewData.forEach(record => {
    const examDate = selectedExamInfo?.subjects?.[0]?.date || new Date().toISOString().split('T')[0];

    Object.entries(record.marksData).forEach(([subjectName, marksValue]) => {
      // Try exact match first
      let matchedSubject = selectedExamInfo?.subjects?.find(s =>
        s.subject.toLowerCase() === subjectName.toLowerCase()
      );

      // If no exact match, try partial/fuzzy match
      if (!matchedSubject) {
        matchedSubject = selectedExamInfo?.subjects?.find(s =>
          s.subject.toLowerCase().includes(subjectName.toLowerCase()) ||
          subjectName.toLowerCase().includes(s.subject.toLowerCase())
        );
      }

      // If still no match, just use the subject name as-is
      if (!matchedSubject) {
        matchedSubject = { subject: subjectName, date: examDate };
      }

      console.log(`Saving: ${record.name} - ${matchedSubject.subject}: ${marksValue} marks`);

      updateMarks(record.admissionNo, selectedMonth, matchedSubject.subject, {
        marks: marksValue,
        status: marksValue >= 35 ? 'Pass' : 'Fail',
        remarks: `${record.examName}`,
        date: matchedSubject.date || examDate,
        totalMarks: selectedExamInfo.totalMarks
      });
    });
  });

  setMessage(`✅ Successfully imported ${previewData.length} students with all subjects!`);
  setPreviewData([]);
  setSelectedExamInfo(null);
  setTimeout(() => setMessage(''), 4000);
};
  const availableSubjects = React.useMemo(() => {
    if (selectedSchedule) {
      return [];
    }

    const groupMap = {
      MPC: ['SANS', 'ENG', 'MA', 'MB', 'PHY', 'CHE'],
      BIPC: ['SAN', 'ENG', 'MA', 'MB', 'PHY', 'CH'],
      MEC: ['SAN', 'ENG', 'MA', 'MB', 'ECO', 'COM']
    };

    let group = selectedClass;
    if (!group && selectedStudent) {
      const student = students.find(s => s.admissionNo === selectedStudent);
      group = student?.group;
    }

    const key = (group || '').toString().toUpperCase();

    if (key.includes('MPC')) return groupMap.MPC;
    if (key.includes('BIPC')) return groupMap.BIPC;
    if (key.includes('MEC')) return groupMap.MEC;

    return ['Mathematics', 'Science', 'Social Studies', 'English', 'Telugu', 'Hindi'];
  }, [selectedSchedule, selectedClass, selectedStudent, students]);

  return (
    <div className="page-container section">
      <div className="container">
        <h1 className="page-title mb-5" style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Marks Management</h1>

        <div className="card mb-5">
          <div className="flex gap-4 mb-4" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              className={`btn ${activeTab === 'single' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('single')}
            >
              Single Entry
            </button>
            <button
              className={`btn ${activeTab === 'import' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('import')}
            >
              Bulk Import
            </button>
          </div>

          {message && (
            <div className={`p-3 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
              style={{ padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', backgroundColor: message.includes('Error') ? '#fee2e2' : '#dcfce7', color: message.includes('Error') ? '#b91c1c' : '#15803d' }}>
              {message}
            </div>
          )}

          {activeTab === 'single' ? (
            <form onSubmit={handleSingleSubmit}>
              <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>

                <div className="form-group">
                  <label className="form-label">Exam Schedule (Optional)</label>
                  <select
                    className="form-control"
                    value={selectedSchedule}
                    onChange={(e) => {
                      setSelectedSchedule(e.target.value);
                      setSubject('');
                    }}
                  >
                    <option value="">-- Manual Entry --</option>
                    {examSchedules.map(sch => (
                      <option key={sch.id} value={sch.id}>{sch.name}</option>
                    ))}
                  </select>
                </div>

                {!selectedSchedule && (
                  <div className="form-group">
                    <label className="form-label">Exam Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Select Class</label>
                  <select
                    className="form-control"
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedStudent('');
                    }}
                  >
                    <option value="">{selectedSchedule ? "-- Select Scheduled Class --" : "-- All Classes --"}</option>
                    {classes.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Student</label>
                  <select
                    className="form-control"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    required
                  >
                    <option value="">-- Select Student --</option>
                    {filteredStudents.map(s => (
                      <option key={s.admissionNo} value={s.admissionNo}>
                        {s.firstName} {s.lastName} ({s.group})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-control"
                    value={subject}
                    onChange={(e) => {
                      const newSubject = e.target.value;
                      setSubject(newSubject);

                      if (selectedSchedule) {
                        const schedule = examSchedules.find(s => s.id === selectedSchedule);
                        const subjectSch = schedule?.subjects.find(s => s.subject === newSubject);
                        if (subjectSch) {
                          setExamDate(subjectSch.date);
                        }
                      }
                    }}
                    required
                  >
                    <option value="">-- Select Subject --</option>
                    {selectedSchedule ? (
                      examSchedules.find(s => s.id === selectedSchedule)?.subjects.map((s, i) => (
                        <option key={i} value={s.subject}>{s.subject} ({s.date})</option>
                      ))
                    ) : (
                      availableSubjects.map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Marks Obtained</label>
                  <input
                    type="number"
                    className="form-control"
                    value={marks}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMarks(val);
                      if (val !== '' && !isAbsent) {
                        setStatus(Number(val) >= 35 ? 'Pass' : 'Fail');
                      }
                    }}
                    disabled={isAbsent}
                    placeholder={isAbsent ? "Student Absent" : ""}
                    style={isAbsent ? { backgroundColor: '#fee2e2', cursor: 'not-allowed' } : {}}
                  />
                  {isAbsent && <small className="text-red-500" style={{ color: '#b91c1c', marginTop: '0.25rem', display: 'block' }}>Student is marked absent on this date.</small>}
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter any remarks..."
                ></textarea>
              </div>

              <div>
                <button type="submit" className="btn btn-primary">Save Marks</button>
              </div>
            </form>
          ) : (
            <div>
              <div className="form-group mb-4" style={{ maxWidth: '300px', margin: '0 auto 2rem auto' }}>
                <label className="form-label">Select Exam Name</label>
                <select
                  className="form-control"
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                  required
                >
                  <option value="">-- Select Exam Schedule --</option>
                  {examSchedules.map(sch => (
                    <option key={sch.id} value={sch.id}>{sch.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-5 p-4 border rounded bg-gray-50" style={{ marginBottom: '2rem', border: '1px dashed #ccc', padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Import from Excel</h3>
                <p className="text-secondary mb-3">Upload a .xlsx or .xls file with columns: <strong>S.NO, Name, Subject1, Subject2, ...</strong></p>
                <small style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '1rem' }}>Example: S.NO | Name | SAN | ENG | M.B | PHY | CHE</small>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="form-control"
                  style={{ maxWidth: '400px', margin: '0 auto' }}
                />
              </div>

              {previewData.length > 0 && (
                <div className="p-4 border rounded bg-gray-50" style={{ border: '1px solid #ddd', borderRadius: '0.5rem' }}>
                  <h4 className="mb-3" style={{ fontSize: '1.25rem', fontWeight: 'medium' }}>Import Preview - Subject Wise Marks</h4>
                  <p className="text-sm text-gray-500 mb-4" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                    Exam: <strong>{selectedExamInfo?.examName}</strong> | Total Marks: <strong>{selectedExamInfo?.totalMarks}</strong>
                  </p>

                  <div className="overflow-x-auto mb-4">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #ddd' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>S.NO</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Name</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Group</th>
                          {selectedExamInfo?.subjectColumns?.map((col, idx) => (
                            <th key={idx} style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                              {col}
                            </th>
                          ))}
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Total</th>
                          <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((item) => {
                          const totalMarks = Object.values(item.marksData).reduce((sum, m) => sum + m, 0);
                          return (
                            <tr key={item.admissionNo} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.sno}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.name}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>{item.group}</td>
                              {selectedExamInfo?.subjectColumns?.map((col, colIdx) => (
                                <td key={colIdx} style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: '#f9f9f9', fontWeight: '500' }}>
                                  {item.marksData[col] || 0}
                                </td>
                              ))}
                              <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>{totalMarks}</td>
                              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: totalMarks >= 35 ? '#dcfce7' : '#fee2e2', color: totalMarks >= 35 ? '#15803d' : '#b91c1c' }}>
                                  {totalMarks >= 35 ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4" style={{ marginTop: '1rem' }}>
                    <button
                      onClick={handleConfirmImport}
                      className="btn btn-primary"
                      style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                    >
                      Confirm Import & Generate List
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marks;