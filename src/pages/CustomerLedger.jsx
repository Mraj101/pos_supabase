import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ArrowLeft, BookOpen } from 'lucide-react'

const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-BD')

export default function CustomerLedger() {
  const { customerId } = useParams()
  const [customer, setCustomer] = useState(null)
  const [balance,  setBalance]  = useState(null)
  const [entries,  setEntries]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: bal }, { data: ledger }] = await Promise.all([
        supabase.from('customer_balances').select('*').eq('customer_id', customerId).single(),
        supabase.from('ledger')
          .select('id, entry_type, amount, reference_type, reference_id, note, entry_date')
          .eq('customer_id', customerId)
          .order('entry_date', { ascending: true }),
      ])
      setCustomer(bal)
      setBalance(bal)
      // Compute running balance
      let running = 0
      const withRunning = (ledger || []).map(e => {
        if (e.entry_type === 'DEBIT')  running += Number(e.amount)
        if (e.entry_type === 'CREDIT') running -= Number(e.amount)
        return { ...e, running_balance: running }
      })
      setEntries(withRunning.reverse()) // most recent first
      setLoading(false)
    }
    load()
  }, [customerId])

  if (loading) return <div className="flex items-center justify-center h-64 text-charcoal-soft">Loading…</div>
  if (!customer) return <div className="text-center py-20 text-charcoal-soft">Customer not found.</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/customers" className="flex items-center gap-1 text-sm text-charcoal-soft hover:text-rose mb-3">
            <ArrowLeft size={14} /> Back to Customers
          </Link>
          <h2 className="font-display text-4xl font-semibold text-charcoal">{customer.name}</h2>
          <p className="text-charcoal-soft">{customer.phone}</p>
        </div>
        <Link to="/payments" state={{ customerId }} className="btn-primary flex items-center gap-2">
          Record Payment
        </Link>
      </div>

      {/* Balance summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="font-display text-3xl font-semibold text-charcoal">{fmt(balance?.total_debit)}</p>
          <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Total Purchases</p>
        </div>
        <div className="card text-center">
          <p className="font-display text-3xl font-semibold text-green-600">{fmt(balance?.total_credit)}</p>
          <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Total Paid</p>
        </div>
        <div className="card text-center border-2 border-rose-light">
          <p className={`font-display text-3xl font-semibold ${Number(balance?.balance_due) > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {fmt(balance?.balance_due)}
          </p>
          <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Balance Due</p>
        </div>
      </div>

      {/* Ledger table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-dark flex items-center gap-2">
          <BookOpen size={18} className="text-rose" />
          <h3 className="font-display text-xl font-semibold">Transaction Ledger</h3>
          <span className="ml-auto text-xs text-charcoal-soft">{entries.length} entries</span>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Date</th>
              <th className="table-header">Type</th>
              <th className="table-header">Reference</th>
              <th className="table-header">Note</th>
              <th className="table-header text-right">Debit (৳)</th>
              <th className="table-header text-right">Credit (৳)</th>
              <th className="table-header text-right">Balance (৳)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="hover:bg-cream/40 transition-colors">
                <td className="table-cell text-xs text-charcoal-soft whitespace-nowrap">
                  {new Date(e.entry_date).toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="table-cell">
                  <span className={e.entry_type === 'DEBIT' ? 'badge-debit' : 'badge-credit'}>
                    {e.entry_type}
                  </span>
                </td>
                <td className="table-cell text-xs font-medium capitalize text-charcoal-soft">{e.reference_type}</td>
                <td className="table-cell text-xs text-charcoal-soft max-w-xs truncate">{e.note || '—'}</td>
                <td className="table-cell text-right">
                  {e.entry_type === 'DEBIT'
                    ? <span className="font-medium text-red-500">{fmt(e.amount)}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="table-cell text-right">
                  {e.entry_type === 'CREDIT'
                    ? <span className="font-medium text-green-600">{fmt(e.amount)}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="table-cell text-right">
                  <span className={`font-semibold ${e.running_balance > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {fmt(e.running_balance)}
                  </span>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={7} className="table-cell text-center text-charcoal-soft py-12">No transactions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
