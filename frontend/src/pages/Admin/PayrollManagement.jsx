import { useState, useEffect } from 'react';
import { staffService } from '../../api/staffService';
import { coreService } from '../../api/coreService';
import './PayrollManagement.css';

const PayrollManagement = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    staff_member: '',
    salary: '',
    payment_period_start: '',
    payment_period_end: '',
    deductions: '0'
  });
  const [reportData, setReportData] = useState(null);
  const [reportDates, setReportDates] = useState({ start_date: '', end_date: '' });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchPayrolls();
    fetchStaff();
  }, [filter]);

  const fetchPayrolls = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const response = await staffService.getPayrollRecords(params);
      setPayrolls(response.data);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const profResponse = await coreService.getUsers('professor');
      const taResponse = await coreService.getUsers('ta');
      console.log('Prof response:', profResponse);
      console.log('TA response:', taResponse);
      const profData = Array.isArray(profResponse) ? profResponse : (Array.isArray(profResponse.data) ? profResponse.data : []);
      const taData = Array.isArray(taResponse) ? taResponse : (Array.isArray(taResponse.data) ? taResponse.data : []);
      console.log('Staff data:', [...profData, ...taData]);
      setStaff([...profData, ...taData]);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await staffService.updatePayrollRecord(editingId, formData);
        alert('Payroll record updated successfully');
        setEditingId(null);
      } else {
        await staffService.createPayrollRecord(formData);
        alert('Payroll record created successfully');
      }
      setShowForm(false);
      setFormData({ staff_member: '', salary: '', payment_period_start: '', payment_period_end: '', deductions: '0' });
      fetchPayrolls();
    } catch (error) {
      alert('Error saving payroll record');
    }
  };

  const handleProcess = async (id) => {
    if (!confirm('Process this payroll record?')) return;
    try {
      await staffService.processPayroll(id);
      alert('Payroll processed successfully');
      fetchPayrolls();
    } catch (error) {
      alert('Error processing payroll');
    }
  };

  const handleEdit = (payroll) => {
    setEditingId(payroll.id);
    setFormData({
      staff_member: payroll.staff_member,
      salary: payroll.salary,
      payment_period_start: payroll.payment_period_start,
      payment_period_end: payroll.payment_period_end,
      deductions: payroll.deductions
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this payroll record?')) return;
    try {
      await staffService.deletePayrollRecord(id);
      alert('Payroll record deleted successfully');
      fetchPayrolls();
    } catch (error) {
      alert('Error deleting payroll record');
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      const response = await staffService.getPayrollReport(reportDates);
      console.log('Report response:', response);
      setReportData(response.data);
    } catch (error) {
      console.error('Report error:', error);
      alert('Error generating report');
    }
  };

  return (
    <div className="payroll-container">
      <h2>Payroll Management</h2>
      
      <div className="payroll-actions">
        <button onClick={() => {
          setShowForm(!showForm);
          if (showForm) {
            setEditingId(null);
            setFormData({ staff_member: '', salary: '', payment_period_start: '', payment_period_end: '', deductions: '0' });
          }
        }}>
          {showForm ? 'Cancel' : 'Create Payroll Record'}
        </button>
        <button onClick={() => setShowReport(!showReport)}>
          {showReport ? 'Hide Report' : 'Generate Report'}
        </button>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '8px' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="payroll-form">
          <h3>{editingId ? 'Edit Payroll Record' : 'Create Payroll Record'}</h3>
          <div className="form-grid">
            <select required value={formData.staff_member} onChange={(e) => setFormData({...formData, staff_member: e.target.value})}>
              <option value="">Select Staff Member</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.user_id})</option>
              ))}
            </select>
            <input type="number" step="0.01" placeholder="Salary" required value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} />
            <input type="date" placeholder="Period Start" required value={formData.payment_period_start} onChange={(e) => setFormData({...formData, payment_period_start: e.target.value})} />
            <input type="date" placeholder="Period End" required value={formData.payment_period_end} onChange={(e) => setFormData({...formData, payment_period_end: e.target.value})} />
            <input type="number" step="0.01" placeholder="Deductions" value={formData.deductions} onChange={(e) => setFormData({...formData, deductions: e.target.value})} />
            <button type="submit">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      )}

      {showReport && (
        <form onSubmit={handleGenerateReport} className="payroll-form">
          <h3>Generate Payroll Report</h3>
          <div className="form-row">
            <input type="date" required value={reportDates.start_date} onChange={(e) => setReportDates({...reportDates, start_date: e.target.value})} />
            <span>to</span>
            <input type="date" required value={reportDates.end_date} onChange={(e) => setReportDates({...reportDates, end_date: e.target.value})} />
            <button type="submit">Generate</button>
          </div>
          {reportData && (
            <div className="report-summary">
              <h4>Report Summary</h4>
              <p>Total Records: {reportData.total_records || 0}</p>
              <p>Total Salary: ${Number(reportData.total_salary || 0).toFixed(2)}</p>
              <p>Total Deductions: ${Number(reportData.total_deductions || 0).toFixed(2)}</p>
              <p>Total Net Amount: ${Number(reportData.total_net_amount || 0).toFixed(2)}</p>
            </div>
          )}
        </form>
      )}

      <table className="payroll-table">
        <thead>
          <tr>
            <th>Staff</th>
            <th>Period</th>
            <th>Salary</th>
            <th>Deductions</th>
            <th>Net Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map(payroll => (
            <tr key={payroll.id}>
              <td>{payroll.staff_member_name} ({payroll.staff_member_id})</td>
              <td>{payroll.payment_period_start} to {payroll.payment_period_end}</td>
              <td>${payroll.salary}</td>
              <td>${payroll.deductions}</td>
              <td>${payroll.net_amount}</td>
              <td>
                <span className={`status-badge status-${payroll.status}`}>
                  {payroll.status}
                </span>
              </td>
              <td>
                {payroll.status === 'pending' && (
                  <>
                    <button onClick={() => handleProcess(payroll.id)}>Process</button>
                    <button onClick={() => handleEdit(payroll)} style={{ marginLeft: '5px' }}>Edit</button>
                    <button onClick={() => handleDelete(payroll.id)} style={{ marginLeft: '5px', background: '#dc3545' }}>Delete</button>
                  </>
                )}
                {payroll.status === 'paid' && payroll.payment_date && (
                  <small>Paid: {new Date(payroll.payment_date).toLocaleDateString()}</small>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollManagement;
