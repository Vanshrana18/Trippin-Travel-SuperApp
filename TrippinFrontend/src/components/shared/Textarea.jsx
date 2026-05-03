export default function Textarea({ label, error, id, className = '', ...props }) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label" htmlFor={textareaId}>{label}</label>}
      <textarea 
        id={textareaId} 
        className={`form-textarea ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
