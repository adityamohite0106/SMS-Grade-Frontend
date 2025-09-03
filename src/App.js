import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Fix: Use environment variable for production, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [students, setStudents] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [message, setMessage] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchUploadHistory();
  }, []);

  const fetchStudents = async () => {
    setFetchingData(true);
    setMessage('');
    try {
      const response = await axios.get(`${API_URL}/api/students`);
      setStudents(response.data);
      if (response.data.length === 0) {
        setMessage('No students found. Upload a file to get started.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage('Failed to connect to server. Please check if backend is running.');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchUploadHistory = async () => {
    setFetchingHistory(true);
    try {
      const response = await axios.get(`${API_URL}/api/upload-history`);
      setUploadHistory(response.data);
    } catch (error) {
      console.error('Fetch history error:', error);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(`Success! Uploaded ${response.data.count} students`);
      fetchStudents();
      fetchUploadHistory(); // Refresh history after upload
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Failed to upload file - Check backend connection');
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
      console.error('Update error:', error);
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
        console.error('Delete error:', error);
        setMessage('Failed to delete student');
      }
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Student Grade Management System</h1>
        <p>Current API URL: {API_URL}</p>
      </header>

      <main className="main-content">
        {/* File Upload Section */}
        <div className="upload-section">
          <h2>Upload Student Data</h2>
          <p>Supported formats: Excel (.xlsx) and CSV (.csv)</p>
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileUpload}
            disabled={loading}
          />
          {loading && <p>Uploading...</p>}
          {message && <p className={message.includes('Success') ? 'success' : 'error'}>{message}</p>}
        </div>

        {/* Upload History Section */}
        <div className="history-section">
          <div className="history-header">
            <h2>Upload History</h2>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="toggle-history-btn"
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>
          
          {showHistory && (
            <div className="history-content">
              {fetchingHistory ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading upload history...</p>
                </div>
              ) : uploadHistory.length > 0 ? (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Filename</th>
                      <th>Type</th>
                      <th>Students</th>
                      <th>Size</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadHistory.map((upload, index) => (
                      <tr key={index} className={upload.status === 'error' ? 'error-row' : 'success-row'}>
                        <td>{new Date(upload.upload_date).toLocaleString()}</td>
                        <td>{upload.filename}</td>
                        <td>{upload.file_type}</td>
                        <td>{upload.students_count}</td>
                        <td>{(upload.file_size / 1024).toFixed(1)} KB</td>
                        <td>
                          <span className={`status ${upload.status}`}>
                            {upload.status === 'success' ? '✅ Success' : '❌ Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-history">No upload history found.</p>
              )}
            </div>
          )}
        </div>

        {/* Students Table */}
        <div className="students-section">
          <h2>Students ({students.length})</h2>
          
          {fetchingData ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading students data...</p>
            </div>
          ) : students.length > 0 ? (
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
            <div className="no-data">
              <p>No students found. Upload an Excel or CSV file to get started.</p>
              <button onClick={fetchStudents} className="retry-btn">
                Retry Connection
              </button>
            </div>
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