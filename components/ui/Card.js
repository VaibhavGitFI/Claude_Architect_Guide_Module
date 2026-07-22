export default function Card({ children, className = "", hover = false, style }) {
  return (
    <div
      style={style}
      className={`bg-surface border border-border-soft rounded-xl shadow-sm ${
        hover ? "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
