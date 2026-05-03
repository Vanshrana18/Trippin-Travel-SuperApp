export default function LoadingSpinner({ size = 'md', text }) {
  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner ${size}`} />
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
}
