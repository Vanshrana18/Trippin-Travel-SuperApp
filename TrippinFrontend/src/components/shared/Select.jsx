export default function Select({ label, error, id, children, className = '', ...props }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label" htmlFor={selectId}>{label}</label>}
      <select id={selectId} className={`form-select ${error ? 'error' : ''}`} {...props}>
        {children}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
