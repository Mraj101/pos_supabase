import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Search, CheckCircle, CreditCard } from 'lucide-react'

const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-BD')

export default function Payments() {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState([])
  const [customer, setCustomer] = useState(null)
  const [balance,  setBalance]  = useState(null)
  const [sales,    setSales]    = useState([])
  const [amount,   setAmount]   = useState('')
  const [saleId,   setSaleId]   = useState('')
  const [note,     setNote]     = useState('')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  // Recent payments
  const [recent, setRecent] = useState([])

  useEffect(() => {
    supabase.from('payments')
      .select('id, amount, payment_date, note, customers(name)')
      .order('payment_date', { ascending: false })
      .limit(10)
      .then(({ data }) => setRecent(data || []))
  }, [success])

  // Search customers
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('customers')
        .select('id, name, phone')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(6)
      setResults(data || [])
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const selectCustomer = async (c) => {
    setCustomer(c)
    setQuery(c.name)
    setResults([])
    setError('')
    setAmount('')
    setSaleId('')

    const [{ data: bal }, { data: openSales }] = await Promise.all([
      supabase.from('customer_balances').select('balance_due').eq('customer_id', c.id).single(),
      supabase.from('sales').select('id, total_amount, amount_paid, sale_date')
        .eq('customer_id', c.id)
        .order('sale_date', { ascending: false })
        .limit(20),
    ])
    setBalance(bal?.balance_due || 0)
    setSales((openSales || []).filter(s => Number(s.total_amount) - Number(s.amount_paid) > 0))
  }

  const handleSubmit = async () => {
    if (!customer) { setError('Select a customer'); return }
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    if (Number(amount) > Number(balance)) { setError(`Amount exceeds balance due (${fmt(balance)})`); return }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.rpc('record_payment', {
      p_customer_id: customer.id,
      p_amount:      Number(amount),
      p_sale_id:     saleId || null,
      p_note:        note || null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
    setTimeout(() => {
      setCustomer(null); setQuery(''); setBalance(null); setSales([])
      setAmount(''); setSaleId(''); setNote(''); setSuccess(false)
    }, 2500)
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-4xl font-semibold text-charcoal">Record Payment</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Payment form */}
        <div className="col-span-2 space-y-5">
          <div className="card">
            <h3 className="font-display text-xl font-semibold mb-4">Customer</h3>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search customer by name or phone…"
                value={query}
                onChange={e => { setQuery(e.target.value); setCustomer(null); setBalance(null) }}
              />
              {results.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-cream-dark rounded-xl shadow-lg overflow-hidden">
                  {results.map(c => (
                    <button key={c.id} onClick={() => selectCustomer(c)}
                      className="w-full flex justify-between px-4 py-3 hover:bg-cream/70 text-left transition-colors">
                      <span className="font-medium text-sm">{c.name}</span>
                      <span className="text-xs text-charcoal-soft">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {customer && balance !== null && (
              <div className="mt-4 bg-rose-light/30 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-charcoal">{customer.name}</p>
                    <p className="text-xs text-charcoal-soft">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-charcoal-soft">Balance Due</p>
                    <p className={`font-display text-2xl font-semibold ${Number(balance) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {fmt(balance)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {customer && (
            <div className="card space-y-4">
              <h3 className="font-display text-xl font-semibold">Payment Details</h3>

              {sales.length > 0 && (
                <div>
                  <label className="label">Link to Sale (optional)</label>
                  <select className="input" value={saleId} onChange={e => setSaleId(e.target.value)}>
                    <option value="">— General payment (applies to oldest due) —</option>
                    {sales.map(s => {
                      const due = Number(s.total_amount) - Number(s.amount_paid)
                      return (
                        <option key={s.id} value={s.id}>
                          {new Date(s.sale_date).toLocaleDateString('en-BD')} — Total: {fmt(s.total_amount)} | Due: {fmt(due)}
                        </option>
                      )
                    })}
                  </select>
                </div>
              )}

              <div>
                <label className="label">Payment Amount ৳ *</label>
                <input
                  type="number"
                  className="input text-right text-lg font-semibold"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                {balance !== null && Number(balance) > 0 && (
                  <button onClick={() => setAmount(String(balance))} className="text-xs text-rose hover:underline mt-1">
                    Pay full balance ({fmt(balance)})
                  </button>
                )}
              </div>

              <div>
                <label className="label">Note (optional)</label>
                <input className="input" placeholder="Payment via bKash, cash, etc." value={note} onChange={e => setNote(e.target.value)} />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {success ? (
                <div className="flex items-center justify-center gap-2 py-3 text-green-600 font-medium">
                  <CheckCircle size={20} />
                  Payment recorded successfully!
                </div>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={saving || !customer || !amount}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  <CreditCard size={17} />
                  {saving ? 'Recording…' : 'Record Payment'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="card p-0 overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-cream-dark">
            <h3 className="font-display text-lg font-semibold">Recent Payments</h3>
          </div>
          <div className="divide-y divide-cream-dark">
            {recent.map(p => (
              <div key={p.id} className="px-5 py-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-charcoal">{p.customers?.name}</p>
                    <p className="text-xs text-charcoal-soft">{p.note || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{fmt(p.amount)}</p>
                    <p className="text-xs text-charcoal-soft">{new Date(p.payment_date).toLocaleDateString('en-BD')}</p>
                  </div>
                </div>
              </div>
            ))}
            {recent.length === 0 && <p className="px-5 py-4 text-sm text-charcoal-soft text-center">No payments yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
