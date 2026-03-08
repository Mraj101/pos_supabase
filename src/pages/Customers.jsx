// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'
// import { supabase } from '../supabaseClient'
// import { Plus, Pencil, BookOpen, Search, Users } from 'lucide-react'

// function Modal({ title, onClose, children }) {
//   return (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
//         <div className="px-6 pt-6 pb-4 border-b border-cream-dark flex justify-between items-center">
//           <h3 className="font-display text-xl font-semibold">{title}</h3>
//           <button onClick={onClose} className="text-charcoal-soft hover:text-charcoal text-xl leading-none">×</button>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   )
// }

// const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-BD')

// export default function Customers() {
//   const [customers, setCustomers] = useState([])
//   const [search,    setSearch]    = useState('')
//   const [modal,     setModal]     = useState(false)
//   const [editing,   setEditing]   = useState(null)
//   const [form,      setForm]      = useState({ name: '', phone: '', address: '' })
//   const [saving,    setSaving]    = useState(false)
//   const [error,     setError]     = useState('')

//   const load = async () => {
//     const { data } = await supabase
//       .from('customer_balances')
//       .select('*')
//       .order('name')
//     setCustomers(data || [])
//   }

//   useEffect(() => { load() }, [])

//   const filtered = customers.filter(c =>
//     c.name.toLowerCase().includes(search.toLowerCase()) ||
//     c.phone.includes(search)
//   )

//   const openCreate = () => {
//     setEditing(null)
//     setForm({ name: '', phone: '', address: '' })
//     setError('')
//     setModal(true)
//   }

//   const openEdit = (c) => {
//     setEditing(c)
//     setForm({ name: c.name, phone: c.phone, address: c.address || '' })
//     setError('')
//     setModal(true)
//   }

//   const handleSave = async () => {
//     if (!form.name.trim()) { setError('Name is required'); return }
//     if (!form.phone.trim()) { setError('Phone is required'); return }
//     setSaving(true)
//     const payload = { name: form.name.trim(), phone: form.phone.trim(), address: form.address || null }
//     const { error: err } = editing
//       ? await supabase.from('customers').update(payload).eq('id', editing.customer_id)
//       : await supabase.from('customers').insert(payload)
//     setSaving(false)
//     if (err) { setError(err.message); return }
//     setModal(false)
//     load()
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="font-display text-4xl font-semibold text-charcoal">Customers</h2>
//         <button onClick={openCreate} className="btn-primary flex items-center gap-2">
//           <Plus size={16} /> Add Customer
//         </button>
//       </div>

//       {/* Search */}
//       <div className="relative max-w-sm">
//         <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//         <input
//           className="input pl-9"
//           placeholder="Search by name or phone…"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//         />
//       </div>

//       {/* Summary */}
//       <div className="grid grid-cols-3 gap-4">
//         <div className="card text-center">
//           <p className="font-display text-3xl font-semibold text-charcoal">{customers.length}</p>
//           <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Total Customers</p>
//         </div>
//         <div className="card text-center">
//           <p className="font-display text-3xl font-semibold text-red-500">
//             {customers.filter(c => Number(c.balance_due) > 0).length}
//           </p>
//           <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">With Dues</p>
//         </div>
//         <div className="card text-center">
//           <p className="font-display text-3xl font-semibold text-red-500">
//             {fmt(customers.reduce((s, c) => s + Number(c.balance_due), 0))}
//           </p>
//           <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Total Outstanding</p>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="card p-0 overflow-hidden">
//         <table className="w-full">
//           <thead>
//             <tr>
//               <th className="table-header">Customer</th>
//               <th className="table-header">Phone</th>
//               <th className="table-header">Total Purchases</th>
//               <th className="table-header">Total Paid</th>
//               <th className="table-header">Balance Due</th>
//               <th className="table-header w-28">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map(c => (
//               <tr key={c.customer_id} className="hover:bg-cream/50 transition-colors">
//                 <td className="table-cell">
//                   <p className="font-medium text-charcoal">{c.name}</p>
//                 </td>
//                 <td className="table-cell text-charcoal-soft">{c.phone}</td>
//                 <td className="table-cell">{fmt(c.total_debit)}</td>
//                 <td className="table-cell text-green-600">{fmt(c.total_credit)}</td>
//                 <td className="table-cell">
//                   <span className={`font-semibold ${Number(c.balance_due) > 0 ? 'text-red-500' : 'text-green-600'}`}>
//                     {Number(c.balance_due) > 0 ? fmt(c.balance_due) : '✓ Clear'}
//                   </span>
//                 </td>
//                 <td className="table-cell">
//                   <div className="flex items-center gap-2">
//                     <Link to={`/ledger/${c.customer_id}`} className="text-charcoal-soft hover:text-rose" title="View Ledger">
//                       <BookOpen size={15} />
//                     </Link>
//                     <button onClick={() => openEdit(c)} className="text-charcoal-soft hover:text-rose" title="Edit">
//                       <Pencil size={14} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//             {filtered.length === 0 && (
//               <tr><td colSpan={6} className="table-cell text-center text-charcoal-soft py-12">
//                 <Users size={32} className="mx-auto mb-2 text-rose-light" />
//                 {search ? 'No customers match your search.' : 'No customers yet.'}
//               </td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {modal && (
//         <Modal title={editing ? 'Edit Customer' : 'New Customer'} onClose={() => setModal(false)}>
//           <div className="space-y-4">
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//             <div>
//               <label className="label">Full Name *</label>
//               <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Customer name" />
//             </div>
//             <div>
//               <label className="label">Phone *</label>
//               <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01XXXXXXXXX" />
//             </div>
//             <div>
//               <label className="label">Address (optional)</label>
//               <textarea className="input" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
//             </div>
//             <div className="flex gap-3 pt-2">
//               <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
//               <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   )
// }


import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Plus, Pencil, BookOpen, Search, Users } from 'lucide-react'

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-5 pt-5 pb-4 border-b border-cream-dark flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-display text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-charcoal-soft text-2xl leading-none w-8 h-8 flex items-center justify-center">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-BD')

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [search,    setSearch]    = useState('')
  const [modal,     setModal]     = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState({ name: '', phone: '', address: '' })
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  const load = async () => {
    const { data } = await supabase.from('customer_balances').select('*').order('name')
    setCustomers(data || [])
  }
  useEffect(() => { load() }, [])

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  const openCreate = () => { setEditing(null); setForm({ name: '', phone: '', address: '' }); setError(''); setModal(true) }
  const openEdit   = (c)  => { setEditing(c); setForm({ name: c.name, phone: c.phone, address: c.address || '' }); setError(''); setModal(true) }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.phone.trim()) { setError('Phone is required'); return }
    setSaving(true)
    const payload = { name: form.name.trim(), phone: form.phone.trim(), address: form.address || null }
    const { error: err } = editing
      ? await supabase.from('customers').update(payload).eq('id', editing.customer_id)
      : await supabase.from('customers').insert(payload)
    setSaving(false)
    if (err) { setError(err.message); return }
    setModal(false); load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl lg:text-4xl font-semibold text-charcoal">Customers</h2>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input pl-9" placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center p-3 sm:p-6">
          <p className="font-display text-2xl sm:text-3xl font-semibold text-charcoal">{customers.length}</p>
          <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Total</p>
        </div>
        <div className="card text-center p-3 sm:p-6">
          <p className="font-display text-2xl sm:text-3xl font-semibold text-red-500">
            {customers.filter(c => Number(c.balance_due) > 0).length}
          </p>
          <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">With Dues</p>
        </div>
        <div className="card text-center p-3 sm:p-6">
          <p className="font-display text-lg sm:text-2xl font-semibold text-red-500">
            {fmt(customers.reduce((s, c) => s + Number(c.balance_due), 0))}
          </p>
          <p className="text-xs text-charcoal-soft mt-1 uppercase tracking-wide">Outstanding</p>
        </div>
      </div>

      {/* Mobile: card list */}
      <div className="sm:hidden space-y-2">
        {filtered.map(c => (
          <div key={c.customer_id} className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-charcoal truncate">{c.name}</p>
                <p className="text-xs text-charcoal-soft">{c.phone}</p>
              </div>
              <div className="text-right ml-3 flex-shrink-0">
                <p className={`font-semibold text-sm ${Number(c.balance_due) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {Number(c.balance_due) > 0 ? fmt(c.balance_due) : '✓ Clear'}
                </p>
                <p className="text-xs text-charcoal-soft">Due</p>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                <Link to={`/ledger/${c.customer_id}`} className="text-charcoal-soft hover:text-rose p-1">
                  <BookOpen size={15} />
                </Link>
                <button onClick={() => openEdit(c)} className="text-charcoal-soft hover:text-rose p-1">
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-12 text-charcoal-soft">
            <Users size={32} className="mx-auto mb-2 text-rose-light" />
            {search ? 'No results.' : 'No customers yet.'}
          </div>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Customer</th>
              <th className="table-header">Phone</th>
              <th className="table-header">Purchases</th>
              <th className="table-header">Paid</th>
              <th className="table-header">Balance Due</th>
              <th className="table-header w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.customer_id} className="hover:bg-cream/50">
                <td className="table-cell font-medium">{c.name}</td>
                <td className="table-cell text-charcoal-soft">{c.phone}</td>
                <td className="table-cell">{fmt(c.total_debit)}</td>
                <td className="table-cell text-green-600">{fmt(c.total_credit)}</td>
                <td className="table-cell">
                  <span className={`font-semibold ${Number(c.balance_due) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {Number(c.balance_due) > 0 ? fmt(c.balance_due) : '✓ Clear'}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <Link to={`/ledger/${c.customer_id}`} className="text-charcoal-soft hover:text-rose"><BookOpen size={15} /></Link>
                    <button onClick={() => openEdit(c)} className="text-charcoal-soft hover:text-rose"><Pencil size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="table-cell text-center text-charcoal-soft py-12">
                <Users size={32} className="mx-auto mb-2 text-rose-light" />
                {search ? 'No customers match.' : 'No customers yet.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Customer' : 'New Customer'} onClose={() => setModal(false)}>
          <div className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label className="label">Full Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Customer name" />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01XXXXXXXXX" />
            </div>
            <div>
              <label className="label">Address (optional)</label>
              <textarea className="input" rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
