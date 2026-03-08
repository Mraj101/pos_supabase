// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { supabase } from '../supabaseClient'
// import { BarChart2, Users, Package } from 'lucide-react'

// const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-BD')

// const tabs = ['Sales', 'Customers Due', 'Inventory']

// export default function Reports() {
//   const [tab,          setTab]          = useState('Sales')
//   const [dateFrom,     setDateFrom]     = useState(() => {
//     const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]
//   })
//   const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])

//   const [sales,     setSales]     = useState([])
//   const [dues,      setDues]      = useState([])
//   const [lowStock,  setLowStock]  = useState([])
//   const [deadStock, setDeadStock] = useState([])
//   const [loading,   setLoading]   = useState(false)

//   useEffect(() => { if (tab === 'Sales') loadSales() },    [tab, dateFrom, dateTo])
//   useEffect(() => { if (tab === 'Customers Due') loadDues() }, [tab])
//   useEffect(() => { if (tab === 'Inventory') loadInventory() }, [tab])

//   const loadSales = async () => {
//     setLoading(true)
//     const { data } = await supabase
//       .from('sales')
//       .select('id, total_amount, amount_paid, sale_date, customers(name, phone)')
//       .gte('sale_date', dateFrom)
//       .lte('sale_date', dateTo + 'T23:59:59')
//       .order('sale_date', { ascending: false })
//     setSales(data || [])
//     setLoading(false)
//   }

//   const loadDues = async () => {
//     setLoading(true)
//     const { data } = await supabase
//       .from('customer_balances')
//       .select('*')
//       .gt('balance_due', 0)
//       .order('balance_due', { ascending: false })
//     setDues(data || [])
//     setLoading(false)
//   }

//   const loadInventory = async () => {
//     setLoading(true)
//     const [{ data: low }, { data: dead }] = await Promise.all([
//       supabase.from('low_stock_variants').select('*').gt('stock_quantity', 0),
//       supabase.from('dead_stock_variants').select('*'),
//     ])
//     setLowStock(low || [])
//     setDeadStock(dead || [])
//     setLoading(false)
//   }

//   // Sales summary stats
//   const totalSales     = sales.reduce((s, r) => s + Number(r.total_amount), 0)
//   const totalCollected = sales.reduce((s, r) => s + Number(r.amount_paid), 0)
//   const totalSalesDue  = totalSales - totalCollected

//   return (
//     <div className="space-y-6">
//       <h2 className="font-display text-4xl font-semibold text-charcoal">Reports</h2>

//       {/* Tabs */}
//       <div className="flex gap-1 bg-cream-dark p-1 rounded-xl w-fit">
//         {tabs.map(t => (
//           <button key={t} onClick={() => setTab(t)}
//             className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal-soft hover:text-charcoal'}`}>
//             {t}
//           </button>
//         ))}
//       </div>

//       {/* ---- SALES TAB ---- */}
//       {tab === 'Sales' && (
//         <div className="space-y-5">
//           {/* Date filter */}
//           <div className="card flex items-center gap-4">
//             <div>
//               <label className="label">From</label>
//               <input type="date" className="input w-40" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
//             </div>
//             <div>
//               <label className="label">To</label>
//               <input type="date" className="input w-40" value={dateTo} onChange={e => setDateTo(e.target.value)} />
//             </div>
//             <button onClick={loadSales} className="btn-primary mt-5">Apply</button>
//           </div>

//           {/* Summary */}
//           <div className="grid grid-cols-3 gap-4">
//             <div className="card text-center"><p className="font-display text-3xl font-semibold">{fmt(totalSales)}</p><p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Gross Sales</p></div>
//             <div className="card text-center"><p className="font-display text-3xl font-semibold text-green-600">{fmt(totalCollected)}</p><p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Collected</p></div>
//             <div className="card text-center"><p className="font-display text-3xl font-semibold text-red-500">{fmt(totalSalesDue)}</p><p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Outstanding</p></div>
//           </div>

//           {/* Table */}
//           <div className="card p-0 overflow-hidden">
//             {loading
//               ? <div className="py-12 text-center text-charcoal-soft">Loading…</div>
//               : (
//                 <table className="w-full">
//                   <thead><tr>
//                     <th className="table-header">Date</th>
//                     <th className="table-header">Customer</th>
//                     <th className="table-header text-right">Total</th>
//                     <th className="table-header text-right">Paid</th>
//                     <th className="table-header text-right">Due</th>
//                   </tr></thead>
//                   <tbody>
//                     {sales.map(s => {
//                       const due = Number(s.total_amount) - Number(s.amount_paid)
//                       return (
//                         <tr key={s.id} className="hover:bg-cream/40">
//                           <td className="table-cell text-xs text-charcoal-soft whitespace-nowrap">{new Date(s.sale_date).toLocaleDateString('en-BD')}</td>
//                           <td className="table-cell">
//                             <p className="font-medium text-sm">{s.customers?.name}</p>
//                             <p className="text-xs text-charcoal-soft">{s.customers?.phone}</p>
//                           </td>
//                           <td className="table-cell text-right font-medium">{fmt(s.total_amount)}</td>
//                           <td className="table-cell text-right text-green-600">{fmt(s.amount_paid)}</td>
//                           <td className="table-cell text-right">
//                             {due > 0 ? <span className="text-red-500 font-medium">{fmt(due)}</span> : <span className="text-green-500 text-xs">✓ Paid</span>}
//                           </td>
//                         </tr>
//                       )
//                     })}
//                     {sales.length === 0 && (
//                       <tr><td colSpan={5} className="table-cell text-center text-charcoal-soft py-10">
//                         <BarChart2 size={28} className="mx-auto mb-2 text-rose-light" />
//                         No sales in this period.
//                       </td></tr>
//                     )}
//                   </tbody>
//                 </table>
//               )
//             }
//           </div>
//         </div>
//       )}

//       {/* ---- DUES TAB ---- */}
//       {tab === 'Customers Due' && (
//         <div className="space-y-4">
//           <div className="flex items-center justify-between">
//             <p className="text-sm text-charcoal-soft">{dues.length} customers with outstanding dues</p>
//             <p className="font-display text-xl font-semibold text-red-500">
//               Total: {fmt(dues.reduce((s, c) => s + Number(c.balance_due), 0))}
//             </p>
//           </div>
//           <div className="card p-0 overflow-hidden">
//             {loading
//               ? <div className="py-12 text-center text-charcoal-soft">Loading…</div>
//               : (
//                 <table className="w-full">
//                   <thead><tr>
//                     <th className="table-header">Customer</th>
//                     <th className="table-header text-right">Total Purchases</th>
//                     <th className="table-header text-right">Total Paid</th>
//                     <th className="table-header text-right">Balance Due</th>
//                     <th className="table-header w-24"></th>
//                   </tr></thead>
//                   <tbody>
//                     {dues.map(c => (
//                       <tr key={c.customer_id} className="hover:bg-cream/40">
//                         <td className="table-cell">
//                           <p className="font-medium">{c.name}</p>
//                           <p className="text-xs text-charcoal-soft">{c.phone}</p>
//                         </td>
//                         <td className="table-cell text-right">{fmt(c.total_debit)}</td>
//                         <td className="table-cell text-right text-green-600">{fmt(c.total_credit)}</td>
//                         <td className="table-cell text-right">
//                           <span className="font-bold text-red-500">{fmt(c.balance_due)}</span>
//                         </td>
//                         <td className="table-cell">
//                           <Link to={`/ledger/${c.customer_id}`} className="text-rose text-xs hover:underline">Ledger</Link>
//                         </td>
//                       </tr>
//                     ))}
//                     {dues.length === 0 && (
//                       <tr><td colSpan={5} className="table-cell text-center text-charcoal-soft py-10">
//                         <Users size={28} className="mx-auto mb-2 text-rose-light" />
//                         No outstanding dues 🎉
//                       </td></tr>
//                     )}
//                   </tbody>
//                 </table>
//               )
//             }
//           </div>
//         </div>
//       )}

//       {/* ---- INVENTORY TAB ---- */}
//       {tab === 'Inventory' && (
//         <div className="space-y-6">
//           {/* Low Stock */}
//           <div>
//             <h3 className="font-display text-2xl font-semibold text-orange-500 mb-3">Low Stock (≤ 5 units)</h3>
//             <div className="card p-0 overflow-hidden">
//               <table className="w-full">
//                 <thead><tr>
//                   <th className="table-header">Product</th>
//                   <th className="table-header">SKU</th>
//                   <th className="table-header">Variant</th>
//                   <th className="table-header text-right">Stock</th>
//                   <th className="table-header text-right">Sell Price</th>
//                 </tr></thead>
//                 <tbody>
//                   {lowStock.map((v, i) => (
//                     <tr key={i} className="hover:bg-cream/40">
//                       <td className="table-cell font-medium">{v.product_name}</td>
//                       <td className="table-cell font-mono text-xs">{v.sku}</td>
//                       <td className="table-cell text-xs text-charcoal-soft">{[v.size, v.color, v.fabric].filter(Boolean).join(' / ')}</td>
//                       <td className="table-cell text-right font-bold text-orange-500">{v.stock_quantity}</td>
//                       <td className="table-cell text-right">{fmt(v.selling_price)}</td>
//                     </tr>
//                   ))}
//                   {lowStock.length === 0 && (
//                     <tr><td colSpan={5} className="table-cell text-center text-charcoal-soft py-8">All variants have sufficient stock ✓</td></tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Dead Stock */}
//           <div>
//             <h3 className="font-display text-2xl font-semibold text-gray-400 mb-3">Dead Stock (0 units)</h3>
//             <div className="card p-0 overflow-hidden">
//               <table className="w-full">
//                 <thead><tr>
//                   <th className="table-header">Product</th>
//                   <th className="table-header">SKU</th>
//                   <th className="table-header">Variant</th>
//                   <th className="table-header text-right">Stock</th>
//                 </tr></thead>
//                 <tbody>
//                   {deadStock.map((v, i) => (
//                     <tr key={i} className="hover:bg-cream/40 opacity-60">
//                       <td className="table-cell font-medium">{v.product_name}</td>
//                       <td className="table-cell font-mono text-xs">{v.sku}</td>
//                       <td className="table-cell text-xs text-charcoal-soft">{[v.size, v.color].filter(Boolean).join(' / ')}</td>
//                       <td className="table-cell text-right font-bold text-gray-400">0</td>
//                     </tr>
//                   ))}
//                   {deadStock.length === 0 && (
//                     <tr><td colSpan={4} className="table-cell text-center text-charcoal-soft py-8">
//                       <Package size={28} className="mx-auto mb-2 text-rose-light" />
//                       No dead stock items ✓
//                     </td></tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { BarChart2, Users, Package } from 'lucide-react'

const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-BD')
const tabs = ['Sales', 'Customers Due', 'Inventory']

export default function Reports() {
  const [tab,      setTab]      = useState('Sales')
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] })
  const [dateTo,   setDateTo]   = useState(new Date().toISOString().split('T')[0])
  const [sales,    setSales]    = useState([])
  const [dues,     setDues]     = useState([])
  const [lowStock, setLowStock] = useState([])
  const [deadStock,setDeadStock]= useState([])
  const [loading,  setLoading]  = useState(false)

  useEffect(() => { if (tab === 'Sales') loadSales() }, [tab, dateFrom, dateTo])
  useEffect(() => { if (tab === 'Customers Due') loadDues() }, [tab])
  useEffect(() => { if (tab === 'Inventory') loadInventory() }, [tab])

  const loadSales = async () => {
    setLoading(true)
    const { data } = await supabase.from('sales')
      .select('id,total_amount,amount_paid,sale_date,customers(name,phone)')
      .gte('sale_date', dateFrom).lte('sale_date', dateTo + 'T23:59:59')
      .order('sale_date', { ascending: false })
    setSales(data || []); setLoading(false)
  }

  const loadDues = async () => {
    setLoading(true)
    const { data } = await supabase.from('customer_balances').select('*')
      .gt('balance_due', 0).order('balance_due', { ascending: false })
    setDues(data || []); setLoading(false)
  }

  const loadInventory = async () => {
    setLoading(true)
    const [{ data: low }, { data: dead }] = await Promise.all([
      supabase.from('low_stock_variants').select('*').gt('stock_quantity', 0),
      supabase.from('dead_stock_variants').select('*'),
    ])
    setLowStock(low || []); setDeadStock(dead || []); setLoading(false)
  }

  const totalSales     = sales.reduce((s, r) => s + Number(r.total_amount), 0)
  const totalCollected = sales.reduce((s, r) => s + Number(r.amount_paid), 0)
  const totalSalesDue  = totalSales - totalCollected

  return (
    <div className="space-y-5">
      <h2 className="font-display text-3xl lg:text-4xl font-semibold text-charcoal">Reports</h2>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-1 bg-cream-dark p-1 rounded-xl w-full overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 min-w-max px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${tab === t ? 'bg-white text-charcoal shadow-sm' : 'text-charcoal-soft hover:text-charcoal'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* SALES TAB */}
      {tab === 'Sales' && (
        <div className="space-y-4">
          {/* Date filter */}
          <div className="card">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-32">
                <label className="label">From</label>
                <input type="date" className="input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div className="flex-1 min-w-32">
                <label className="label">To</label>
                <input type="date" className="input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
              <button onClick={loadSales} className="btn-primary">Apply</button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center p-3 sm:p-6">
              <p className="font-display text-lg sm:text-3xl font-semibold">{fmt(totalSales)}</p>
              <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Gross</p>
            </div>
            <div className="card text-center p-3 sm:p-6">
              <p className="font-display text-lg sm:text-3xl font-semibold text-green-600">{fmt(totalCollected)}</p>
              <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Collected</p>
            </div>
            <div className="card text-center p-3 sm:p-6">
              <p className="font-display text-lg sm:text-3xl font-semibold text-red-500">{fmt(totalSalesDue)}</p>
              <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Outstanding</p>
            </div>
          </div>

          {/* Mobile: card list */}
          {loading ? <div className="card text-center py-10 text-charcoal-soft">Loading…</div> : (
            <>
              <div className="sm:hidden space-y-2">
                {sales.map(s => {
                  const due = Number(s.total_amount) - Number(s.amount_paid)
                  return (
                    <div key={s.id} className="card p-0 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-charcoal truncate">{s.customers?.name}</p>
                          <p className="text-xs text-charcoal-soft">{new Date(s.sale_date).toLocaleDateString('en-BD')}</p>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className="text-sm font-semibold">{fmt(s.total_amount)}</p>
                          {due > 0
                            ? <p className="text-xs text-red-500">Due: {fmt(due)}</p>
                            : <p className="text-xs text-green-500">✓ Paid</p>}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {sales.length === 0 && <div className="card text-center py-10 text-charcoal-soft">No sales in this period.</div>}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block card p-0 overflow-hidden">
                <table className="w-full">
                  <thead><tr>
                    <th className="table-header">Date</th>
                    <th className="table-header">Customer</th>
                    <th className="table-header text-right">Total</th>
                    <th className="table-header text-right">Paid</th>
                    <th className="table-header text-right">Due</th>
                  </tr></thead>
                  <tbody>
                    {sales.map(s => {
                      const due = Number(s.total_amount) - Number(s.amount_paid)
                      return (
                        <tr key={s.id} className="hover:bg-cream/40">
                          <td className="table-cell text-xs text-charcoal-soft whitespace-nowrap">{new Date(s.sale_date).toLocaleDateString('en-BD')}</td>
                          <td className="table-cell">
                            <p className="font-medium text-sm">{s.customers?.name}</p>
                            <p className="text-xs text-charcoal-soft">{s.customers?.phone}</p>
                          </td>
                          <td className="table-cell text-right font-medium">{fmt(s.total_amount)}</td>
                          <td className="table-cell text-right text-green-600">{fmt(s.amount_paid)}</td>
                          <td className="table-cell text-right">
                            {due > 0 ? <span className="text-red-500 font-medium">{fmt(due)}</span> : <span className="text-green-500 text-xs">✓ Paid</span>}
                          </td>
                        </tr>
                      )
                    })}
                    {sales.length === 0 && (
                      <tr><td colSpan={5} className="table-cell text-center text-charcoal-soft py-10">
                        <BarChart2 size={28} className="mx-auto mb-2 text-rose-light" />No sales in this period.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* DUES TAB */}
      {tab === 'Customers Due' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-charcoal-soft">{dues.length} customers with dues</p>
            <p className="font-display text-lg sm:text-xl font-semibold text-red-500">
              {fmt(dues.reduce((s, c) => s + Number(c.balance_due), 0))}
            </p>
          </div>

          {loading ? <div className="card text-center py-10 text-charcoal-soft">Loading…</div> : (
            <>
              {/* Mobile */}
              <div className="sm:hidden space-y-2">
                {dues.map(c => (
                  <div key={c.customer_id} className="card p-0 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-charcoal truncate">{c.name}</p>
                        <p className="text-xs text-charcoal-soft">{c.phone}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        <p className="text-sm font-bold text-red-500">{fmt(c.balance_due)}</p>
                        <Link to={`/ledger/${c.customer_id}`} className="text-rose text-xs hover:underline">Ledger</Link>
                      </div>
                    </div>
                  </div>
                ))}
                {dues.length === 0 && <div className="card text-center py-10 text-charcoal-soft">No dues 🎉</div>}
              </div>

              {/* Desktop */}
              <div className="hidden sm:block card p-0 overflow-hidden">
                <table className="w-full">
                  <thead><tr>
                    <th className="table-header">Customer</th>
                    <th className="table-header text-right">Purchases</th>
                    <th className="table-header text-right">Paid</th>
                    <th className="table-header text-right">Balance Due</th>
                    <th className="table-header w-20"></th>
                  </tr></thead>
                  <tbody>
                    {dues.map(c => (
                      <tr key={c.customer_id} className="hover:bg-cream/40">
                        <td className="table-cell">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-charcoal-soft">{c.phone}</p>
                        </td>
                        <td className="table-cell text-right">{fmt(c.total_debit)}</td>
                        <td className="table-cell text-right text-green-600">{fmt(c.total_credit)}</td>
                        <td className="table-cell text-right"><span className="font-bold text-red-500">{fmt(c.balance_due)}</span></td>
                        <td className="table-cell"><Link to={`/ledger/${c.customer_id}`} className="text-rose text-xs hover:underline">Ledger</Link></td>
                      </tr>
                    ))}
                    {dues.length === 0 && (
                      <tr><td colSpan={5} className="table-cell text-center text-charcoal-soft py-10">
                        <Users size={28} className="mx-auto mb-2 text-rose-light" />No outstanding dues 🎉
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* INVENTORY TAB */}
      {tab === 'Inventory' && (
        <div className="space-y-5">
          {loading ? <div className="card text-center py-10 text-charcoal-soft">Loading…</div> : (
            <>
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-orange-500 mb-3">Low Stock (≤ 5 units)</h3>
                {/* Mobile */}
                <div className="sm:hidden space-y-2">
                  {lowStock.map((v, i) => (
                    <div key={i} className="card p-0 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-charcoal truncate">{v.product_name}</p>
                          <p className="text-xs text-charcoal-soft font-mono">{v.sku} {[v.size, v.color].filter(Boolean).join(' · ')}</p>
                        </div>
                        <span className="text-orange-500 font-bold text-lg ml-3 flex-shrink-0">{v.stock_quantity}</span>
                      </div>
                    </div>
                  ))}
                  {lowStock.length === 0 && <div className="card text-center py-8 text-charcoal-soft">All stock healthy ✓</div>}
                </div>
                {/* Desktop */}
                <div className="hidden sm:block card p-0 overflow-hidden">
                  <table className="w-full">
                    <thead><tr>
                      <th className="table-header">Product</th>
                      <th className="table-header">SKU</th>
                      <th className="table-header">Variant</th>
                      <th className="table-header text-right">Stock</th>
                      <th className="table-header text-right">Price</th>
                    </tr></thead>
                    <tbody>
                      {lowStock.map((v, i) => (
                        <tr key={i} className="hover:bg-cream/40">
                          <td className="table-cell font-medium">{v.product_name}</td>
                          <td className="table-cell font-mono text-xs">{v.sku}</td>
                          <td className="table-cell text-xs text-charcoal-soft">{[v.size, v.color, v.fabric].filter(Boolean).join(' / ')}</td>
                          <td className="table-cell text-right font-bold text-orange-500">{v.stock_quantity}</td>
                          <td className="table-cell text-right">{fmt(v.selling_price)}</td>
                        </tr>
                      ))}
                      {lowStock.length === 0 && <tr><td colSpan={5} className="table-cell text-center text-charcoal-soft py-8">All stock healthy ✓</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-gray-400 mb-3">Dead Stock (0 units)</h3>
                <div className="sm:hidden space-y-2">
                  {deadStock.map((v, i) => (
                    <div key={i} className="card p-0 overflow-hidden opacity-60">
                      <div className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="font-medium text-sm text-charcoal">{v.product_name}</p>
                          <p className="text-xs text-charcoal-soft font-mono">{v.sku}</p>
                        </div>
                        <span className="text-gray-400 font-bold text-lg">0</span>
                      </div>
                    </div>
                  ))}
                  {deadStock.length === 0 && <div className="card text-center py-8 text-charcoal-soft">No dead stock ✓</div>}
                </div>
                <div className="hidden sm:block card p-0 overflow-hidden">
                  <table className="w-full">
                    <thead><tr>
                      <th className="table-header">Product</th>
                      <th className="table-header">SKU</th>
                      <th className="table-header">Variant</th>
                      <th className="table-header text-right">Stock</th>
                    </tr></thead>
                    <tbody>
                      {deadStock.map((v, i) => (
                        <tr key={i} className="hover:bg-cream/40 opacity-60">
                          <td className="table-cell font-medium">{v.product_name}</td>
                          <td className="table-cell font-mono text-xs">{v.sku}</td>
                          <td className="table-cell text-xs text-charcoal-soft">{[v.size, v.color].filter(Boolean).join(' / ')}</td>
                          <td className="table-cell text-right font-bold text-gray-400">0</td>
                        </tr>
                      ))}
                      {deadStock.length === 0 && (
                        <tr><td colSpan={4} className="table-cell text-center text-charcoal-soft py-8">
                          <Package size={28} className="mx-auto mb-2 text-rose-light" />No dead stock ✓
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
