import { Link } from 'react-router-dom'

export default function EmptyState({ icon, title, message, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-4">
      {icon && <div className="text-5xl text-purple-200 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {message && <p className="text-sm text-gray-500 mt-1 max-w-sm">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="mt-5 btn-accent text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
