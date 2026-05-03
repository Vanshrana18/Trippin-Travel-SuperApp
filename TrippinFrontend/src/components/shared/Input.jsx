export default function Input({ 
  label, 
  error, 
  hint, 
  icon: Icon, 
  id,
  className = '',
  ...props 
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label" htmlFor={inputId}>{label}</label>}
      {Icon ? (
        <div className="form-input-wrapper">
          <span className="form-input-icon"><Icon size={18} /></span>
          <input 
            id={inputId}
            className={`form-input ${error ? 'error' : ''}`}
            {...props}
          />
        </div>
      ) : (
        <input 
          id={inputId}
          className={`form-input ${error ? 'error' : ''}`}
          {...props}
        />
      )}
      {error && <span className="form-error">{error}</span>}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}
