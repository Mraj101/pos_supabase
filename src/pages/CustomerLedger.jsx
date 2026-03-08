// import { useEffect, useState } from 'react'
// import { useParams, Link } from 'react-router-dom'
// import { supabase } from '../supabaseClient'
// import { ArrowLeft, BookOpen } from 'lucide-react'

// const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-BD')

// export default function CustomerLedger() {
//   const { customerId } = useParams()
//   const [customer, setCustomer] = useState(null)
//   const [balance,  setBalance]  = useState(null)
//   const [entries,  setEntries]  = useState([])
//   const [loading,  setLoading]  = useState(true)

//   useEffect(() => {
//     async function load() {
//       const [{ data: bal }, { data: ledger }] = await Promise.all([
//         supabase.from('customer_balances').select('*').eq('customer_id', customerId).single(),
//         supabase.from('ledger')
//           .select('id, entry_type, amount, reference_type, reference_id, note, entry_date')
//           .eq('customer_id', customerId)
//           .order('entry_date', { ascending: true }),
//       ])
//       setCustomer(bal)
//       setBalance(bal)
//       // Compute running balance
//       let running = 0
//       const withRunning = (ledger || []).map(e => {
//         if (e.entry_type === 'DEBIT')  running += Number(e.amount)
//         if (e.entry_type === 'CREDIT') running -= Number(e.amount)
//         return { ...e, running_balance: running }
//       })
//       setEntries(withRunning.reverse()) // most recent first
//       setLoading(false)
//     }
//     load()
//   }, [customerId])

//   if (loading) return <div className="flex items-center justify-center h-64 text-charcoal-soft">Loading…</div>
//   if (!customer) return <div className="text-center py-20 text-charcoal-soft">Customer not found.</div>

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-start justify-between">
//         <div>
//           <Link to="/customers" className="flex items-center gap-1 text-sm text-charcoal-soft hover:text-rose mb-3">
//             <ArrowLeft size={14} /> Back to Customers
//           </Link>
//           <h2 className="font-display text-4xl font-semibold text-charcoal">{customer.name}</h2>
//           <p className="text-charcoal-soft">{customer.phone}</p>
//         </div>
//         <Link to="/payments" state={{ customerId }} className="btn-primary flex items-center gap-2">
//           Record Payment
//         </Link>
//       </div>

//       {/* Balance summary */}
//       <div className="grid grid-cols-3 gap-4">
//         <div className="card text-center">
//           <p className="font-display text-3xl font-semibold text-charcoal">{fmt(balance?.total_debit)}</p>
//           <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Total Purchases</p>
//         </div>
//         <div className="card text-center">
//           <p className="font-display text-3xl font-semibold text-green-600">{fmt(balance?.total_credit)}</p>
//           <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Total Paid</p>
//         </div>
//         <div className="card text-center border-2 border-rose-light">
//           <p className={`font-display text-3xl font-semibold ${Number(balance?.balance_due) > 0 ? 'text-red-500' : 'text-green-600'}`}>
//             {fmt(balance?.balance_due)}
//           </p>
//           <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Balance Due</p>
//         </div>
//       </div>

//       {/* Ledger table */}
//       <div className="card p-0 overflow-hidden">
//         <div className="px-6 py-4 border-b border-cream-dark flex items-center gap-2">
//           <BookOpen size={18} className="text-rose" />
//           <h3 className="font-display text-xl font-semibold">Transaction Ledger</h3>
//           <span className="ml-auto text-xs text-charcoal-soft">{entries.length} entries</span>
//         </div>
//         <table className="w-full">
//           <thead>
//             <tr>
//               <th className="table-header">Date</th>
//               <th className="table-header">Type</th>
//               <th className="table-header">Reference</th>
//               <th className="table-header">Note</th>
//               <th className="table-header text-right">Debit (৳)</th>
//               <th className="table-header text-right">Credit (৳)</th>
//               <th className="table-header text-right">Balance (৳)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {entries.map(e => (
//               <tr key={e.id} className="hover:bg-cream/40 transition-colors">
//                 <td className="table-cell text-xs text-charcoal-soft whitespace-nowrap">
//                   {new Date(e.entry_date).toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
//                 </td>
//                 <td className="table-cell">
//                   <span className={e.entry_type === 'DEBIT' ? 'badge-debit' : 'badge-credit'}>
//                     {e.entry_type}
//                   </span>
//                 </td>
//                 <td className="table-cell text-xs font-medium capitalize text-charcoal-soft">{e.reference_type}</td>
//                 <td className="table-cell text-xs text-charcoal-soft max-w-xs truncate">{e.note || '—'}</td>
//                 <td className="table-cell text-right">
//                   {e.entry_type === 'DEBIT'
//                     ? <span className="font-medium text-red-500">{fmt(e.amount)}</span>
//                     : <span className="text-gray-300">—</span>}
//                 </td>
//                 <td className="table-cell text-right">
//                   {e.entry_type === 'CREDIT'
//                     ? <span className="font-medium text-green-600">{fmt(e.amount)}</span>
//                     : <span className="text-gray-300">—</span>}
//                 </td>
//                 <td className="table-cell text-right">
//                   <span className={`font-semibold ${e.running_balance > 0 ? 'text-red-500' : 'text-green-600'}`}>
//                     {fmt(e.running_balance)}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//             {entries.length === 0 && (
//               <tr><td colSpan={7} className="table-cell text-center text-charcoal-soft py-12">No transactions yet.</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }


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
        supabase.from('ledger').select('id,entry_type,amount,reference_type,note,entry_date')
          .eq('customer_id', customerId).order('entry_date', { ascending: true }),
      ])
      setCustomer(bal); setBalance(bal)
      let running = 0
      const withRunning = (ledger || []).map(e => {
        if (e.entry_type === 'DEBIT')  running += Number(e.amount)
        if (e.entry_type === 'CREDIT') running -= Number(e.amount)
        return { ...e, running_balance: running }
      })
      setEntries(withRunning.reverse())
      setLoading(false)
    }
    load()
  }, [customerId])

  if (loading) return <div className="flex items-center justify-center h-64 text-charcoal-soft">Loading…</div>
  if (!customer) return <div className="text-center py-20 text-charcoal-soft">Customer not found.</div>

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to="/customers" className="flex items-center gap-1 text-sm text-charcoal-soft hover:text-rose mb-2">
            <ArrowLeft size={14} /> Customers
          </Link>
          <h2 className="font-display text-2xl lg:text-4xl font-semibold text-charcoal">{customer.name}</h2>
          <p className="text-charcoal-soft text-sm">{customer.phone}</p>
        </div>
        <Link to="/payments" className="btn-primary flex items-center gap-2 text-sm flex-shrink-0">
          Record Payment
        </Link>
      </div>

      {/* Balance summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center p-3 sm:p-6">
          <p className="font-display text-xl sm:text-3xl font-semibold text-charcoal">{fmt(balance?.total_debit)}</p>
          <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Purchases</p>
        </div>
        <div className="card text-center p-3 sm:p-6">
          <p className="font-display text-xl sm:text-3xl font-semibold text-green-600">{fmt(balance?.total_credit)}</p>
          <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Paid</p>
        </div>
        <div className="card text-center p-3 sm:p-6 border-2 border-rose-light">
          <p className={`font-display text-xl sm:text-3xl font-semibold ${Number(balance?.balance_due) > 0 ? 'text-red-500' : 'text-green-600'}`}>
            {fmt(balance?.balance_due)}
          </p>
          <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Due</p>
        </div>
      </div>

      {/* Ledger — mobile cards, desktop table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-cream-dark flex items-center gap-2">
          <BookOpen size={18} className="text-rose" />
          <h3 className="font-display text-lg sm:text-xl font-semibold">Ledger</h3>
          <span className="ml-auto text-xs text-charcoal-soft">{entries.length} entries</span>
        </div>

        {/* Mobile: card list */}
        <div className="sm:hidden divide-y divide-cream-dark">
          {entries.map(e => (
            <div key={e.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={e.entry_type === 'DEBIT' ? 'badge-debit' : 'badge-credit'}>
                      {e.entry_type}
                    </span>
                    <span className="text-xs text-charcoal-soft capitalize">{e.reference_type}</span>
                  </div>
                  <p className="text-xs text-charcoal-soft">{e.note || '—'}</p>
                  <p className="text-xs text-charcoal-soft mt-0.5">
                    {new Date(e.entry_date).toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${e.entry_type === 'DEBIT' ? 'text-red-500' : 'text-green-600'}`}>
                    {e.entry_type === 'DEBIT' ? '+' : '-'}{fmt(e.amount)}
                  </p>
                  <p className={`text-xs font-medium mt-0.5 ${e.running_balance > 0 ? 'text-red-400' : 'text-green-500'}`}>
                    Bal: {fmt(e.running_balance)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {entries.length === 0 && <p className="text-center py-10 text-sm text-charcoal-soft">No transactions yet.</p>}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Type</th>
                <th className="table-header">Reference</th>
                <th className="table-header">Note</th>
                <th className="table-header text-right">Debit ৳</th>
                <th className="table-header text-right">Credit ৳</th>
                <th className="table-header text-right">Balance ৳</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-cream/40">
                  <td className="table-cell text-xs text-charcoal-soft whitespace-nowrap">
                    {new Date(e.entry_date).toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="table-cell">
                    <span className={e.entry_type === 'DEBIT' ? 'badge-debit' : 'badge-credit'}>{e.entry_type}</span>
                  </td>
                  <td className="table-cell text-xs capitalize text-charcoal-soft">{e.reference_type}</td>
                  <td className="table-cell text-xs text-charcoal-soft max-w-xs truncate">{e.note || '—'}</td>
                  <td className="table-cell text-right">
                    {e.entry_type === 'DEBIT' ? <span className="font-medium text-red-500">{fmt(e.amount)}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="table-cell text-right">
                    {e.entry_type === 'CREDIT' ? <span className="font-medium text-green-600">{fmt(e.amount)}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="table-cell text-right">
                    <span className={`font-semibold ${e.running_balance > 0 ? 'text-red-500' : 'text-green-600'}`}>{fmt(e.running_balance)}</span>
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
    </div>
  )
}
