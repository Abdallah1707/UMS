import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coreService } from '../../api/coreService';
import './Application.css';

const Application = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    program: '',
    schoolName: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    transcript: null,
    idCopy: null,
    photo: null,
    referenceNumber: ''
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await coreService.getDepartments();
        setDepartments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepartments();
  }, []);

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files[0] }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.program) newErrors.program = 'Program choice is required';
    if (!formData.schoolName) newErrors.schoolName = 'School name is required';
    if (!formData.parentFirstName) newErrors.parentFirstName = 'Parent first name is required';
    if (!formData.parentLastName) newErrors.parentLastName = 'Parent last name is required';
    if (!formData.parentEmail) newErrors.parentEmail = 'Parent email is required';
    if (!formData.parentPhone) newErrors.parentPhone = 'Parent phone is required';
    if (!formData.transcript) newErrors.transcript = 'Transcript is required';
    if (!formData.idCopy) newErrors.idCopy = 'ID copy is required';
    if (!formData.photo) newErrors.photo = 'Photo is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('first_name', formData.firstName);
    formDataToSubmit.append('last_name', formData.lastName);
    formDataToSubmit.append('email', formData.email);
    formDataToSubmit.append('phone', formData.phone);
    formDataToSubmit.append('program', formData.program);
    formDataToSubmit.append('school_name', formData.schoolName);
    formDataToSubmit.append('parent_first_name', formData.parentFirstName);
    formDataToSubmit.append('parent_last_name', formData.parentLastName);
    formDataToSubmit.append('parent_email', formData.parentEmail);
    formDataToSubmit.append('parent_phone', formData.parentPhone);
    formDataToSubmit.append('transcript', formData.transcript);
    formDataToSubmit.append('id_copy', formData.idCopy);
    formDataToSubmit.append('photo', formData.photo);

    try {
      const res = await coreService.submitApplication(formDataToSubmit);
      setSubmitted(true);
      setFormData(prev => ({ ...prev, referenceNumber: res.data.reference_number }));
    } catch (err) {
      console.error(err);
      alert('Failed to submit application. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="application-container">
        <div className="application-card">
          <h1>Application Submitted!</h1>
          <p>Your application reference number: <strong>{formData.referenceNumber}</strong></p>
          <p>You will receive a confirmation email shortly.</p>
          <Link to="/login" className="back-link">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="application-container">
      <div className="application-card">
        <h1>University Application</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
              {errors.firstName && <span className="error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
              {errors.lastName && <span className="error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Program Choice *</label>
            <select name="program" value={formData.program} onChange={handleChange}>
              <option value="">Select a program</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {errors.program && <span className="error">{errors.program}</span>}
          </div>

          <div className="form-group">
            <label>School Name *</label>
            <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="Enter your previous school name" />
            {errors.schoolName && <span className="error">{errors.schoolName}</span>}
          </div>

          <h3 style={{marginTop: '30px', marginBottom: '15px'}}>Parent Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Parent First Name *</label>
              <input type="text" name="parentFirstName" value={formData.parentFirstName} onChange={handleChange} />
              {errors.parentFirstName && <span className="error">{errors.parentFirstName}</span>}
            </div>
            <div className="form-group">
              <label>Parent Last Name *</label>
              <input type="text" name="parentLastName" value={formData.parentLastName} onChange={handleChange} />
              {errors.parentLastName && <span className="error">{errors.parentLastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Parent Email *</label>
            <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} />
            {errors.parentEmail && <span className="error">{errors.parentEmail}</span>}
          </div>

          <div className="form-group">
            <label>Parent Phone *</label>
            <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} />
            {errors.parentPhone && <span className="error">{errors.parentPhone}</span>}
          </div>

          <h3 style={{marginTop: '30px', marginBottom: '15px'}}>Required Documents</h3>

          <div className="form-group">
            <label>Previous Transcript *</label>
            <input type="file" name="transcript" onChange={handleFileChange} accept=".pdf" />
            {errors.transcript && <span className="error">{errors.transcript}</span>}
          </div>

          <div className="form-group">
            <label>ID Copy *</label>
            <input type="file" name="idCopy" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
            {errors.idCopy && <span className="error">{errors.idCopy}</span>}
          </div>

          <div className="form-group">
            <label>Photo *</label>
            <input type="file" name="photo" onChange={handleFileChange} accept=".jpg,.jpeg,.png" />
            {errors.photo && <span className="error">{errors.photo}</span>}
          </div>

          <button type="submit" className="submit-button">Submit Application</button>
        </form>

        <div className="back-to-login">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Application;
