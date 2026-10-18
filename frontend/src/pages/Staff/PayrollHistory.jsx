import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffService } from '../../api/staffService';
import './PayrollHistory.css';

const PayrollHistory = () => {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrollHistory();
  }, []);

  const fetchPayrollHistory = async () => {
    try {
      const response = await staffService.getMyPayrollHistory();
      setPayrolls(response.data);
    } catch (error) {
      console.error('Error fetching payroll history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="payroll-history-container">Loading...</div>;

  return (
    <div className="payroll-history-container">
      <div className="payroll-header">
        <h2>My Payroll History</h2>
        <button onClick={() => navigate('/staff/dashboard')} className="btn-primary">← Back to Dashboard</button>
      </div>

      {payrolls.length === 0 ? (
        <div className="no-records">No payroll records found</div>
      ) : (
        <>
          <div className="payroll-list">
            {payrolls.map(payroll => (
              <div key={payroll.id} className="payroll-card">
                <div className="payroll-card-header">
                  <span className={`status-badge status-${payroll.status}`}>
                    {payroll.status}
                  </span>
                  <span className="period">
                    {new Date(payroll.payment_period_start).toLocaleDateString()} - {new Date(payroll.payment_period_end).toLocaleDateString()}
                  </span>
                </div>
                <div className="payroll-details">
                  <div className="detail-row">
                    <span className="label">Salary:</span>
                    <span className="value">${parseFloat(payroll.salary).toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Deductions:</span>
                    <span className="value">-${parseFloat(payroll.deductions).toFixed(2)}</span>
                  </div>
                  <div className="detail-row net">
                    <span className="label">Net Amount:</span>
                    <span className="value">${parseFloat(payroll.net_amount).toFixed(2)}</span>
                  </div>
                  {payroll.payment_date && (
                    <div className="detail-row">
                      <span className="label">Payment Date:</span>
                      <span className="value">{new Date(payroll.payment_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-box">
            <h3>Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Records</span>
                <span className="summary-value">{payrolls.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Paid</span>
                <span className="summary-value">${payrolls.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.net_amount), 0).toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pending Payments</span>
                <span className="summary-value">${payrolls.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.net_amount), 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PayrollHistory;
