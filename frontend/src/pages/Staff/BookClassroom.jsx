import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { facilitiesService } from '../../api/facilitiesService';
import './BookClassroom.css';

const BookClassroom = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [availableClassrooms, setAvailableClassrooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    classroom: '',
    date: '',
    time_from: '',
    time_to: '',
    purpose: '',
    num_students: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await facilitiesService.getBookings();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to fetch bookings');
    }
  };

  const handleCheckAvailability = async () => {
    if (!formData.date || !formData.time_from || !formData.time_to || !formData.num_students) {
      setError('Please fill in date, time, and number of students');
      return;
    }

    try {
      const response = await facilitiesService.getAvailableClassrooms(
        formData.date,
        formData.time_from,
        formData.time_to,
        formData.num_students
      );
      setAvailableClassrooms(response);
      setError('');
    } catch (err) {
      setError(err.response?.data?.errors?.detail?.[0] || err.response?.data?.error || 'Failed to check availability');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.classroom) {
      setError('Please select a classroom');
      return;
    }

    try {
      await facilitiesService.createBooking({
        classroom: formData.classroom,
        date: formData.date,
        time_from: formData.time_from,
        time_to: formData.time_to,
        purpose: formData.purpose
      });
      setSuccess('Classroom booked successfully');
      fetchBookings();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Booking failed');
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await facilitiesService.deleteBooking(id);
      setSuccess('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  const resetForm = () => {
    setFormData({
      classroom: '',
      date: '',
      time_from: '',
      time_to: '',
      purpose: '',
      num_students: ''
    });
    setAvailableClassrooms([]);
    setShowForm(false);
  };

  return (
    <div className="book-classroom">
      <button onClick={() => navigate('/staff/dashboard')} className="back-btn">← Back to Dashboard</button>
      <h1>Classroom Booking</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button onClick={() => setShowForm(!showForm)} className="btn-primary">
        {showForm ? 'Cancel' : 'Book Classroom'}
      </button>

      {showForm && (
        <div className="booking-form">
          <h3>Check Availability</h3>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <input
            type="time"
            value={formData.time_from}
            onChange={(e) => setFormData({ ...formData, time_from: e.target.value })}
            required
          />
          <input
            type="time"
            value={formData.time_to}
            onChange={(e) => setFormData({ ...formData, time_to: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Number of Students"
            value={formData.num_students}
            onChange={(e) => setFormData({ ...formData, num_students: e.target.value })}
            required
          />
          <button onClick={handleCheckAvailability} className="btn-secondary">
            Check Availability
          </button>

          {availableClassrooms.length > 0 && (
            <form onSubmit={handleSubmit}>
              <h3>Available Classrooms</h3>
              <select
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                required
              >
                <option value="">Select Classroom</option>
                {availableClassrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} - {classroom.building} (Capacity: {classroom.capacity})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Purpose (optional)"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />
              <button type="submit" className="btn-primary">Book</button>
            </form>
          )}
        </div>
      )}

      <h2>My Bookings</h2>
      <table className="bookings-table">
        <thead>
          <tr>
            <th>Classroom</th>
            <th>Date</th>
            <th>Time</th>
            <th>Purpose</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.classroom_name}</td>
              <td>{booking.date}</td>
              <td>{booking.time_from} - {booking.time_to}</td>
              <td>{booking.purpose || '-'}</td>
              <td>
                <button onClick={() => handleCancelBooking(booking.id)} className="btn-delete">
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookClassroom;
