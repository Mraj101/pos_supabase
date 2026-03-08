// import { useEffect, useState } from 'react'
// import { supabase } from '../supabaseClient'
// import { Plus, Pencil, ToggleLeft, ToggleRight, ChevronRight } from 'lucide-react'

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

// export default function Categories() {
//   const [categories, setCategories] = useState([])
//   const [modal,      setModal]      = useState(false)
//   const [form,       setForm]       = useState({ name: '', parent_id: '' })
//   const [editing,    setEditing]    = useState(null)
//   const [saving,     setSaving]     = useState(false)
//   const [error,      setError]      = useState('')

//   const load = async () => {
//     const { data } = await supabase
//       .from('categories')
//       .select('*')
//       .order('name')
//     setCategories(data || [])
//   }

//   useEffect(() => { load() }, [])

//   const openCreate = () => {
//     setEditing(null)
//     setForm({ name: '', parent_id: '' })
//     setError('')
//     setModal(true)
//   }

//   const openEdit = (cat) => {
//     setEditing(cat)
//     setForm({ name: cat.name, parent_id: cat.parent_id || '' })
//     setError('')
//     setModal(true)
//   }

//   const handleSave = async () => {
//     if (!form.name.trim()) { setError('Name is required'); return }
//     setSaving(true)
//     const payload = {
//       name:      form.name.trim(),
//       parent_id: form.parent_id || null,
//     }
//     const { error: err } = editing
//       ? await supabase.from('categories').update(payload).eq('id', editing.id)
//       : await supabase.from('categories').insert(payload)
//     setSaving(false)
//     if (err) { setError(err.message); return }
//     setModal(false)
//     load()
//   }

//   const toggleActive = async (cat) => {
//     await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
//     load()
//   }

//   // Build tree view
//   const roots    = categories.filter(c => !c.parent_id)
//   const children = (parentId) => categories.filter(c => c.parent_id === parentId)
//   const parents  = categories.filter(c => !c.parent_id)

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="font-display text-4xl font-semibold text-charcoal">Categories</h2>
//         <button onClick={openCreate} className="btn-primary flex items-center gap-2">
//           <Plus size={16} /> Add Category
//         </button>
//       </div>

//       <div className="card p-0 overflow-hidden">
//         <table className="w-full">
//           <thead>
//             <tr>
//               <th className="table-header">Name</th>
//               <th className="table-header">Parent</th>
//               <th className="table-header">Status</th>
//               <th className="table-header w-24">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {roots.map(cat => (
//               <>
//                 <tr key={cat.id} className="hover:bg-cream/50">
//                   <td className="table-cell font-medium">{cat.name}</td>
//                   <td className="table-cell text-charcoal-soft text-xs">— Root</td>
//                   <td className="table-cell">
//                     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
//                       {cat.is_active ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>
//                   <td className="table-cell">
//                     <div className="flex items-center gap-2">
//                       <button onClick={() => openEdit(cat)} className="text-charcoal-soft hover:text-rose">
//                         <Pencil size={14} />
//                       </button>
//                       <button onClick={() => toggleActive(cat)} className="text-charcoal-soft hover:text-rose">
//                         {cat.is_active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//                 {children(cat.id).map(child => (
//                   <tr key={child.id} className="hover:bg-cream/50 bg-cream/30">
//                     <td className="table-cell pl-8 text-charcoal-soft">
//                       <span className="flex items-center gap-1">
//                         <ChevronRight size={12} className="text-rose" />
//                         {child.name}
//                       </span>
//                     </td>
//                     <td className="table-cell text-xs text-charcoal-soft">{cat.name}</td>
//                     <td className="table-cell">
//                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${child.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
//                         {child.is_active ? 'Active' : 'Inactive'}
//                       </span>
//                     </td>
//                     <td className="table-cell">
//                       <div className="flex items-center gap-2">
//                         <button onClick={() => openEdit(child)} className="text-charcoal-soft hover:text-rose">
//                           <Pencil size={14} />
//                         </button>
//                         <button onClick={() => toggleActive(child)} className="text-charcoal-soft hover:text-rose">
//                           {child.is_active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </>
//             ))}
//             {categories.length === 0 && (
//               <tr><td colSpan={4} className="table-cell text-center text-charcoal-soft py-10">No categories yet. Add one!</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {modal && (
//         <Modal title={editing ? 'Edit Category' : 'New Category'} onClose={() => setModal(false)}>
//           <div className="space-y-4">
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//             <div>
//               <label className="label">Category Name *</label>
//               <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Saree" />
//             </div>
//             <div>
//               <label className="label">Parent Category (optional)</label>
//               <select className="input" value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}>
//                 <option value="">— None (top-level) —</option>
//                 {parents.filter(p => p.id !== editing?.id).map(p => (
//                   <option key={p.id} value={p.id}>{p.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex gap-3 pt-2">
//               <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
//                 {saving ? 'Saving…' : 'Save'}
//               </button>
//               <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   )
// }


import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Plus, Pencil, ToggleLeft, ToggleRight, ChevronRight } from 'lucide-react'

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-5 pt-5 pb-4 border-b border-cream-dark flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-display text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-charcoal-soft hover:text-charcoal text-2xl leading-none w-8 h-8 flex items-center justify-center">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [modal,      setModal]      = useState(false)
  const [form,       setForm]       = useState({ name: '', parent_id: '' })
  const [editing,    setEditing]    = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', parent_id: '' }); setError(''); setModal(true) }
  const openEdit   = (cat) => { setEditing(cat); setForm({ name: cat.name, parent_id: cat.parent_id || '' }); setError(''); setModal(true) }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    const payload = { name: form.name.trim(), parent_id: form.parent_id || null }
    const { error: err } = editing
      ? await supabase.from('categories').update(payload).eq('id', editing.id)
      : await supabase.from('categories').insert(payload)
    setSaving(false)
    if (err) { setError(err.message); return }
    setModal(false); load()
  }

  const toggleActive = async (cat) => {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id)
    load()
  }

  const roots   = categories.filter(c => !c.parent_id)
  const children = (pid) => categories.filter(c => c.parent_id === pid)
  const parents  = categories.filter(c => !c.parent_id)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl lg:text-4xl font-semibold text-charcoal">Categories</h2>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Add
        </button>
      </div>

      {/* Mobile: card list */}
      <div className="sm:hidden space-y-2">
        {roots.map(cat => (
          <div key={cat.id} className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-charcoal">{cat.name}</p>
                <p className="text-xs text-charcoal-soft">Root category</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {cat.is_active ? 'Active' : 'Off'}
                </span>
                <button onClick={() => openEdit(cat)} className="text-charcoal-soft hover:text-rose p-1"><Pencil size={14} /></button>
                <button onClick={() => toggleActive(cat)} className="text-charcoal-soft hover:text-rose p-1">
                  {cat.is_active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                </button>
              </div>
            </div>
            {children(cat.id).map(child => (
              <div key={child.id} className="flex items-center justify-between px-4 py-3 bg-cream/40 border-t border-cream-dark">
                <div className="flex items-center gap-2">
                  <ChevronRight size={12} className="text-rose" />
                  <div>
                    <p className="text-sm text-charcoal">{child.name}</p>
                    <p className="text-xs text-charcoal-soft">Under {cat.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${child.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {child.is_active ? 'Active' : 'Off'}
                  </span>
                  <button onClick={() => openEdit(child)} className="text-charcoal-soft hover:text-rose p-1"><Pencil size={13} /></button>
                  <button onClick={() => toggleActive(child)} className="text-charcoal-soft hover:text-rose p-1">
                    {child.is_active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
        {categories.length === 0 && <div className="card text-center py-10 text-charcoal-soft">No categories yet.</div>}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Parent</th>
              <th className="table-header">Status</th>
              <th className="table-header w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roots.map(cat => (
              <>
                <tr key={cat.id} className="hover:bg-cream/50">
                  <td className="table-cell font-medium">{cat.name}</td>
                  <td className="table-cell text-charcoal-soft text-xs">— Root</td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(cat)} className="text-charcoal-soft hover:text-rose"><Pencil size={14} /></button>
                      <button onClick={() => toggleActive(cat)} className="text-charcoal-soft hover:text-rose">
                        {cat.is_active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
                {children(cat.id).map(child => (
                  <tr key={child.id} className="hover:bg-cream/50 bg-cream/30">
                    <td className="table-cell pl-8 text-charcoal-soft">
                      <span className="flex items-center gap-1"><ChevronRight size={12} className="text-rose" />{child.name}</span>
                    </td>
                    <td className="table-cell text-xs text-charcoal-soft">{cat.name}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${child.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {child.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(child)} className="text-charcoal-soft hover:text-rose"><Pencil size={14} /></button>
                        <button onClick={() => toggleActive(child)} className="text-charcoal-soft hover:text-rose">
                          {child.is_active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={4} className="table-cell text-center text-charcoal-soft py-10">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={editing ? 'Edit Category' : 'New Category'} onClose={() => setModal(false)}>
          <div className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label className="label">Category Name *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Saree" />
            </div>
            <div>
              <label className="label">Parent Category (optional)</label>
              <select className="input" value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}>
                <option value="">— None (top-level) —</option>
                {parents.filter(p => p.id !== editing?.id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
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
