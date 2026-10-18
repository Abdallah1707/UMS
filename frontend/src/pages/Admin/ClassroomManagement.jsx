import { useState, useEffect } from 'react';
import { facilitiesService } from '../../api/facilitiesService';
import './ClassroomManagement.css';

const ClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    floor: '',
    capacity: '',
    has_projector: false,
    has_whiteboard: true,
    is_available: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await facilitiesService.getClassrooms();
      setClassrooms(response.data);
    } catch (err) {
      setError('Failed to fetch classrooms');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await facilitiesService.updateClassroom(editingId, formData);
        setSuccess('Classroom updated successfully');
      } else {
        await facilitiesService.createClassroom(formData);
        setSuccess('Classroom created successfully');
      }
      fetchClassrooms();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (classroom) => {
    setFormData(classroom);
    setEditingId(classroom.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this classroom?')) return;

    try {
      await facilitiesService.deleteClassroom(id);
      setSuccess('Classroom deleted successfully');
      fetchClassrooms();
    } catch (err) {
      setError('Failed to delete classroom');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      building: '',
      floor: '',
      capacity: '',
      has_projector: false,
      has_whiteboard: true,
      is_available: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="classroom-management">
      <h1>Classroom Management</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button onClick={() => setShowForm(!showForm)} className="btn-primary">
        {showForm ? 'Cancel' : 'Add Classroom'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="classroom-form">
          <input
            type="text"
            placeholder="Classroom Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Building"
            value={formData.building}
            onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Floor"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Capacity"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={formData.has_projector}
              onChange={(e) => setFormData({ ...formData, has_projector: e.target.checked })}
            />
            Has Projector
          </label>
          <label>
            <input
              type="checkbox"
              checked={formData.has_whiteboard}
              onChange={(e) => setFormData({ ...formData, has_whiteboard: e.target.checked })}
            />
            Has Whiteboard
          </label>
          <label>
            <input
              type="checkbox"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
            />
            Available
          </label>
          <button type="submit" className="btn-primary">
            {editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <table className="classroom-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Building</th>
            <th>Floor</th>
            <th>Capacity</th>
            <th>Projector</th>
            <th>Whiteboard</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {classrooms.map((classroom) => (
            <tr key={classroom.id}>
              <td>{classroom.name}</td>
              <td>{classroom.building}</td>
              <td>{classroom.floor}</td>
              <td>{classroom.capacity}</td>
              <td>{classroom.has_projector ? '✓' : '✗'}</td>
              <td>{classroom.has_whiteboard ? '✓' : '✗'}</td>
              <td>{classroom.is_available ? '✓' : '✗'}</td>
              <td>
                <button onClick={() => handleEdit(classroom)} className="btn-edit">Edit</button>
                <button onClick={() => handleDelete(classroom.id)} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClassroomManagement;
