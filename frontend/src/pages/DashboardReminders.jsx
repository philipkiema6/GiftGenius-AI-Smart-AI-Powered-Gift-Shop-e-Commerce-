import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaBell, FaPlus, FaTrash, FaBirthdayCake, FaHeart } from 'react-icons/fa'
import * as reminderService from '../services/reminderService'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

const initialForm = { person_name: '', occasion: 'birthday', date: '', notes: '' }

export default function DashboardReminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(initialForm)
  const [showForm, setShowForm] = useState(false)

  const loadReminders = () => reminderService.getReminders().then(setReminders).finally(() => setLoading(false))

  useEffect(() => {
    loadReminders()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await reminderService.addReminder(form)
      toast.success('Reminder added')
      setForm(initialForm)
      setShowForm(false)
      loadReminders()
    } catch {
      toast.error('Could not add reminder')
    }
  }

  const handleDelete = async (id) => {
    await reminderService.deleteReminder(id)
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Saved Reminders</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 btn-accent text-sm font-semibold px-4 py-2.5 rounded-full hover:opacity-90 transition-opacity"
        >
          <FaPlus /> Add Reminder
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <input
            required value={form.person_name} onChange={(e) => setForm({ ...form, person_name: e.target.value })}
            placeholder="Person's name" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
          />
          <select
            value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}
            className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
          >
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="other">Other</option>
          </select>
          <input
            type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
          />
          <input
            value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Notes (optional)" className="px-4 py-2.5 rounded-xl bg-purple-50 focus:outline-none"
          />
          <button type="submit" className="sm:col-span-2 btn-accent font-semibold py-3 rounded-full hover:opacity-90 transition-opacity">
            Save Reminder
          </button>
        </form>
      )}

      {reminders.length === 0 ? (
        <EmptyState icon={<FaBell />} title="No reminders yet" message="Add birthdays and anniversaries so you never miss a gift moment." />
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center gap-4 bg-white rounded-2xl border border-purple-50 shadow-sm p-4">
              <span className="w-11 h-11 rounded-full gradient-brand text-white flex items-center justify-center">
                {reminder.occasion === 'birthday' ? <FaBirthdayCake /> : <FaHeart />}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{reminder.person_name}</p>
                <p className="text-xs text-gray-400 capitalize">{reminder.occasion} • {reminder.date}</p>
                {reminder.notes && <p className="text-xs text-gray-500 mt-1">{reminder.notes}</p>}
              </div>
              <span className="text-xs font-semibold text-brand-purple bg-purple-50 px-3 py-1 rounded-full">
                {reminder.days_until === 0 ? 'Today!' : `${reminder.days_until} days`}
              </span>
              <button onClick={() => handleDelete(reminder.id)} className="text-gray-400 hover:text-red-500 p-2">
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
