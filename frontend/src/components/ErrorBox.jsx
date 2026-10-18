import './ErrorBox.css';

const ErrorBox = ({ error, onClose }) => {
  if (!error) return null;

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    
    if (error.response?.data) {
      const data = error.response.data;
      
      if (data.non_field_errors) {
        return Array.isArray(data.non_field_errors) 
          ? data.non_field_errors.join('. ') 
          : data.non_field_errors;
      }
      
      if (data.detail) return data.detail;
      if (data.error) return data.error;
      
      const fieldErrors = Object.entries(data)
        .filter(([key]) => key !== 'non_field_errors')
        .map(([field, msgs]) => {
          const message = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          return `${field.replace(/_/g, ' ')}: ${message}`;
        });
      
      if (fieldErrors.length > 0) return fieldErrors.join('. ');
    }
    
    if (error.message) return error.message;
    return 'An unexpected error occurred';
  };

  return (
    <div className="error-box">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <strong>Error</strong>
        <p>{getErrorMessage(error)}</p>
      </div>
      {onClose && (
        <button className="error-close" onClick={onClose}>×</button>
      )}
    </div>
  );
};

export default ErrorBox;
