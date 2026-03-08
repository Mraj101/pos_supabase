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
//         supabase.from('ledger').select('id,entry_type,amount,reference_type,note,entry_date')
//           .eq('customer_id', customerId).order('entry_date', { ascending: true }),
//       ])
//       setCustomer(bal); setBalance(bal)
//       let running = 0
//       const withRunning = (ledger || []).map(e => {
//         if (e.entry_type === 'DEBIT')  running += Number(e.amount)
//         if (e.entry_type === 'CREDIT') running -= Number(e.amount)
//         return { ...e, running_balance: running }
//       })
//       setEntries(withRunning.reverse())
//       setLoading(false)
//     }
//     load()
//   }, [customerId])

//   if (loading) return <div className="flex items-center justify-center h-64 text-charcoal-soft">Loading…</div>
//   if (!customer) return <div className="text-center py-20 text-charcoal-soft">Customer not found.</div>

//   return (
//     <div className="space-y-5 lg:space-y-6">
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <Link to="/customers" className="flex items-center gap-1 text-sm text-charcoal-soft hover:text-rose mb-2">
//             <ArrowLeft size={14} /> Customers
//           </Link>
//           <h2 className="font-display text-2xl lg:text-4xl font-semibold text-charcoal">{customer.name}</h2>
//           <p className="text-charcoal-soft text-sm">{customer.phone}</p>
//         </div>
//         <Link to="/payments" className="btn-primary flex items-center gap-2 text-sm flex-shrink-0">
//           Record Payment
//         </Link>
//       </div>

//       {/* Balance summary */}
//       <div className="grid grid-cols-3 gap-3">
//         <div className="card text-center p-3 sm:p-6">
//           <p className="font-display text-xl sm:text-3xl font-semibold text-charcoal">{fmt(balance?.total_debit)}</p>
//           <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Purchases</p>
//         </div>
//         <div className="card text-center p-3 sm:p-6">
//           <p className="font-display text-xl sm:text-3xl font-semibold text-green-600">{fmt(balance?.total_credit)}</p>
//           <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Paid</p>
//         </div>
//         <div className="card text-center p-3 sm:p-6 border-2 border-rose-light">
//           <p className={`font-display text-xl sm:text-3xl font-semibold ${Number(balance?.balance_due) > 0 ? 'text-red-500' : 'text-green-600'}`}>
//             {fmt(balance?.balance_due)}
//           </p>
//           <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Due</p>
//         </div>
//       </div>

//       {/* Ledger — mobile cards, desktop table */}
//       <div className="card p-0 overflow-hidden">
//         <div className="px-4 sm:px-6 py-4 border-b border-cream-dark flex items-center gap-2">
//           <BookOpen size={18} className="text-rose" />
//           <h3 className="font-display text-lg sm:text-xl font-semibold">Ledger</h3>
//           <span className="ml-auto text-xs text-charcoal-soft">{entries.length} entries</span>
//         </div>

//         {/* Mobile: card list */}
//         <div className="sm:hidden divide-y divide-cream-dark">
//           {entries.map(e => (
//             <div key={e.id} className="px-4 py-3">
//               <div className="flex items-start justify-between gap-2">
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 mb-1">
//                     <span className={e.entry_type === 'DEBIT' ? 'badge-debit' : 'badge-credit'}>
//                       {e.entry_type}
//                     </span>
//                     <span className="text-xs text-charcoal-soft capitalize">{e.reference_type}</span>
//                   </div>
//                   <p className="text-xs text-charcoal-soft">{e.note || '—'}</p>
//                   <p className="text-xs text-charcoal-soft mt-0.5">
//                     {new Date(e.entry_date).toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
//                   </p>
//                 </div>
//                 <div className="text-right flex-shrink-0">
//                   <p className={`text-sm font-bold ${e.entry_type === 'DEBIT' ? 'text-red-500' : 'text-green-600'}`}>
//                     {e.entry_type === 'DEBIT' ? '+' : '-'}{fmt(e.amount)}
//                   </p>
//                   <p className={`text-xs font-medium mt-0.5 ${e.running_balance > 0 ? 'text-red-400' : 'text-green-500'}`}>
//                     Bal: {fmt(e.running_balance)}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))}
//           {entries.length === 0 && <p className="text-center py-10 text-sm text-charcoal-soft">No transactions yet.</p>}
//         </div>

//         {/* Desktop: table */}
//         <div className="hidden sm:block overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr>
//                 <th className="table-header">Date</th>
//                 <th className="table-header">Type</th>
//                 <th className="table-header">Reference</th>
//                 <th className="table-header">Note</th>
//                 <th className="table-header text-right">Debit ৳</th>
//                 <th className="table-header text-right">Credit ৳</th>
//                 <th className="table-header text-right">Balance ৳</th>
//               </tr>
//             </thead>
//             <tbody>
//               {entries.map(e => (
//                 <tr key={e.id} className="hover:bg-cream/40">
//                   <td className="table-cell text-xs text-charcoal-soft whitespace-nowrap">
//                     {new Date(e.entry_date).toLocaleString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
//                   </td>
//                   <td className="table-cell">
//                     <span className={e.entry_type === 'DEBIT' ? 'badge-debit' : 'badge-credit'}>{e.entry_type}</span>
//                   </td>
//                   <td className="table-cell text-xs capitalize text-charcoal-soft">{e.reference_type}</td>
//                   <td className="table-cell text-xs text-charcoal-soft max-w-xs truncate">{e.note || '—'}</td>
//                   <td className="table-cell text-right">
//                     {e.entry_type === 'DEBIT' ? <span className="font-medium text-red-500">{fmt(e.amount)}</span> : <span className="text-gray-300">—</span>}
//                   </td>
//                   <td className="table-cell text-right">
//                     {e.entry_type === 'CREDIT' ? <span className="font-medium text-green-600">{fmt(e.amount)}</span> : <span className="text-gray-300">—</span>}
//                   </td>
//                   <td className="table-cell text-right">
//                     <span className={`font-semibold ${e.running_balance > 0 ? 'text-red-500' : 'text-green-600'}`}>{fmt(e.running_balance)}</span>
//                   </td>
//                 </tr>
//               ))}
//               {entries.length === 0 && (
//                 <tr><td colSpan={7} className="table-cell text-center text-charcoal-soft py-12">No transactions yet.</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }


import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, ShoppingBag } from 'lucide-react'

const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-BD')

// Fetches and shows sale items for a given sale_id
function SaleItems({ saleId }) {
  const [items,   setItems]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('sale_items')
      .select('id, quantity, unit_price, subtotal, product_variants(sku, size, color, fabric, products(name))')
      .eq('sale_id', saleId)
      .then(({ data }) => { setItems(data || []); setLoading(false) })
  }, [saleId])

  if (loading) return <p className="text-xs text-charcoal-soft px-4 py-3">Loading items…</p>
  if (!items?.length) return <p className="text-xs text-charcoal-soft px-4 py-3">No items found.</p>

  return (
    <div className="bg-cream/60 border-t border-cream-dark">
      <div className="px-4 py-2 flex items-center gap-2">
        <ShoppingBag size={13} className="text-rose flex-shrink-0" />
        <span className="text-xs font-semibold text-charcoal uppercase tracking-wide">Items Purchased</span>
      </div>
      <div className="divide-y divide-cream-dark">
        {items.map(item => {
          const v = item.product_variants
          const variant = [v?.size, v?.color, v?.fabric].filter(Boolean).join(' · ')
          return (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-charcoal truncate">
                  {v?.products?.name || '—'}
                </p>
                <p className="text-xs text-charcoal-soft">
                  {v?.sku}{variant ? ` · ${variant}` : ''}
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-sm font-semibold text-charcoal">{fmt(item.subtotal)}</p>
                <p className="text-xs text-charcoal-soft">
                  {item.quantity} × {fmt(item.unit_price)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-end px-4 py-2 border-t border-cream-dark">
        <p className="text-xs font-semibold text-charcoal">
          Total: {fmt(items.reduce((s, i) => s + Number(i.subtotal), 0))}
        </p>
      </div>
    </div>
  )
}

export default function CustomerLedger() {
  const { customerId } = useParams()
  const [customer,  setCustomer]  = useState(null)
  const [balance,   setBalance]   = useState(null)
  const [entries,   setEntries]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState({}) // saleId → bool

  useEffect(() => {
    async function load() {
      const [{ data: bal }, { data: ledger }] = await Promise.all([
        supabase.from('customer_balances').select('*').eq('customer_id', customerId).single(),
        supabase.from('ledger')
          .select('id, entry_type, amount, reference_type, reference_id, note, entry_date')
          .eq('customer_id', customerId)
          .order('entry_date', { ascending: true }),
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

  const toggleSale = (entry) => {
    if (entry.reference_type !== 'sale') return
    setExpanded(ex => ({ ...ex, [entry.reference_id]: !ex[entry.reference_id] }))
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-charcoal-soft">Loading…</div>
  if (!customer) return <div className="text-center py-20 text-charcoal-soft">Customer not found.</div>

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* Header */}
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

      {/* Ledger */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-cream-dark flex items-center gap-2">
          <BookOpen size={18} className="text-rose" />
          <h3 className="font-display text-lg sm:text-xl font-semibold">Ledger</h3>
          <span className="ml-auto text-xs text-charcoal-soft">{entries.length} entries</span>
        </div>

        <p className="px-4 sm:px-6 py-2 text-xs text-charcoal-soft bg-cream/40 border-b border-cream-dark">
          💡 Tap any <span className="font-semibold text-rose">DEBIT</span> row to see which products were purchased
        </p>

        {/* Works same on mobile and desktop — expandable rows */}
        <div className="divide-y divide-cream-dark">
          {entries.map(e => {
            const isSale     = e.entry_type === 'DEBIT' && e.reference_type === 'sale'
            const isExpanded = expanded[e.reference_id]

            return (
              <div key={e.id}>
                {/* Entry row */}
                <div
                  onClick={() => toggleSale(e)}
                  className={`flex items-start gap-3 px-4 sm:px-6 py-3 transition-colors ${isSale ? 'cursor-pointer hover:bg-cream/60' : ''}`}
                >
                  {/* Expand toggle — only for sale debits */}
                  <div className="flex-shrink-0 mt-0.5 w-4">
                    {isSale
                      ? isExpanded
                        ? <ChevronDown size={14} className="text-rose" />
                        : <ChevronRight size={14} className="text-charcoal-soft" />
                      : null
                    }
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={e.entry_type === 'DEBIT' ? 'badge-debit' : 'badge-credit'}>
                        {e.entry_type}
                      </span>
                      <span className="text-xs text-charcoal-soft capitalize">{e.reference_type}</span>
                      {isSale && (
                        <span className="text-xs text-rose font-medium">
                          {isExpanded ? 'hide items' : 'view items'}
                        </span>
                      )}
                    </div>
                    {e.note && <p className="text-xs text-charcoal-soft truncate">{e.note}</p>}
                    <p className="text-xs text-charcoal-soft mt-0.5">
                      {new Date(e.entry_date).toLocaleString('en-BD', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Amounts */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${e.entry_type === 'DEBIT' ? 'text-red-500' : 'text-green-600'}`}>
                      {e.entry_type === 'DEBIT' ? '+' : '−'}{fmt(e.amount)}
                    </p>
                    <p className={`text-xs font-medium mt-0.5 ${e.running_balance > 0 ? 'text-red-400' : 'text-green-500'}`}>
                      Bal: {fmt(e.running_balance)}
                    </p>
                  </div>
                </div>

                {/* Expanded sale items */}
                {isSale && isExpanded && (
                  <SaleItems saleId={e.reference_id} />
                )}
              </div>
            )
          })}
          {entries.length === 0 && (
            <p className="text-center py-10 text-sm text-charcoal-soft">No transactions yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}