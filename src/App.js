import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/students`);
      setStudents(response.data);
    } catch (error) {
      setMessage('Failed to fetch students');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(`Success! Uploaded ${response.data.count} students`);
      fetchStudents();
    } catch (error) {
      setMessage('Failed to upload file');
    }
    setLoading(false);
  };

  const handleEdit = (student) => {
    setEditingStudent({ ...student });
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/api/students/${editingStudent._id}`, editingStudent);
      setMessage('Student updated successfully');
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      setMessage('Failed to update student');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${API_URL}/api/students/${id}`);
        setMessage('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        setMessage('Failed to delete student');
      }
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Student Grade Management System</h1>
      </header>

      <main className="main-content">
        {/* File Upload Section */}
        <div className="upload-section">
          <h2>Upload Student Data</h2>
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileUpload}
            disabled={loading}
          />
          {loading && <p>Uploading...</p>}
          {message && <p className={message.includes('Success') ? 'success' : 'error'}>{message}</p>}
        </div>

        {/* Students Table */}
        <div className="students-section">
          <h2>Students ({students.length})</h2>
          {students.length > 0 ? (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Total Marks</th>
                  <th>Marks Obtained</th>
                  <th>Percentage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td>{student.student_id}</td>
                    <td>{student.student_name}</td>
                    <td>{student.total_marks}</td>
                    <td>{student.marks_obtained}</td>
                    <td>{student.percentage}%</td>
                    <td>
                      <button onClick={() => handleEdit(student)}>Edit</button>
                      <button onClick={() => handleDelete(student._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No students found. Upload an Excel or CSV file to get started.</p>
          )}
        </div>

        {/* Edit Modal */}
        {editingStudent && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Student</h3>
              <div className="form-group">
                <label>Student Name:</label>
                <input
                  type="text"
                  value={editingStudent.student_name}
                  onChange={(e) => setEditingStudent({...editingStudent, student_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Total Marks:</label>
                <input
                  type="number"
                  value={editingStudent.total_marks}
                  onChange={(e) => setEditingStudent({...editingStudent, total_marks: Number(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Marks Obtained:</label>
                <input
                  type="number"
                  value={editingStudent.marks_obtained}
                  onChange={(e) => setEditingStudent({...editingStudent, marks_obtained: Number(e.target.value)})}
                />
              </div>
              <div className="modal-actions">
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setEditingStudent(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;