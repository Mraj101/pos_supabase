// import { useEffect, useState } from 'react'
// import { supabase } from '../supabaseClient'
// import { Plus, Pencil, ChevronDown, ChevronRight, Package } from 'lucide-react'

// function Modal({ title, onClose, children, wide }) {
//   return (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
//       <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} my-4`}>
//         <div className="px-6 pt-6 pb-4 border-b border-cream-dark flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
//           <h3 className="font-display text-xl font-semibold">{title}</h3>
//           <button onClick={onClose} className="text-charcoal-soft hover:text-charcoal text-xl leading-none">×</button>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   )
// }

// const emptyVariant = () => ({ sku: '', size: '', color: '', fabric: '', purchase_price: '', selling_price: '', stock_quantity: '' })

// // ⚠️ Must be defined OUTSIDE Products() to prevent focus loss on every keystroke
// function VariantForm({ idx, variantForms, editVariant, updateVF, setVariantForms }) {
//   return (
//     <div className="border border-cream-dark rounded-xl p-4 space-y-3">
//       {!editVariant && variantForms.length > 1 && (
//         <div className="flex justify-between items-center">
//           <span className="text-xs text-charcoal-soft">Variant {idx + 1}</span>
//           <button onClick={() => setVariantForms(fs => fs.filter((_, i) => i !== idx))} className="text-red-400 text-xs hover:text-red-600">Remove</button>
//         </div>
//       )}
//       <div className="grid grid-cols-3 gap-3">
//         <div className="col-span-3"><label className="label">SKU *</label><input className="input" placeholder="e.g. KRT-RED-M" value={variantForms[idx].sku} onChange={e => updateVF(idx, 'sku', e.target.value)} /></div>
//         <div><label className="label">Size</label><input className="input" placeholder="M, L, XL…" value={variantForms[idx].size} onChange={e => updateVF(idx, 'size', e.target.value)} /></div>
//         <div><label className="label">Color</label><input className="input" placeholder="Red" value={variantForms[idx].color} onChange={e => updateVF(idx, 'color', e.target.value)} /></div>
//         <div><label className="label">Fabric</label><input className="input" placeholder="Cotton" value={variantForms[idx].fabric} onChange={e => updateVF(idx, 'fabric', e.target.value)} /></div>
//         <div><label className="label">Buy Price ৳</label><input type="number" className="input" value={variantForms[idx].purchase_price} onChange={e => updateVF(idx, 'purchase_price', e.target.value)} /></div>
//         <div><label className="label">Sell Price ৳ *</label><input type="number" className="input" value={variantForms[idx].selling_price} onChange={e => updateVF(idx, 'selling_price', e.target.value)} /></div>
//         <div><label className="label">Stock Qty</label><input type="number" className="input" value={variantForms[idx].stock_quantity} onChange={e => updateVF(idx, 'stock_quantity', e.target.value)} /></div>
//       </div>
//     </div>
//   )
// }

// export default function Products() {
//   const [products,   setProducts]   = useState([])
//   const [categories, setCategories] = useState([])
//   const [expanded,   setExpanded]   = useState({})
//   const [variants,   setVariants]   = useState({})
//   const [modal,      setModal]      = useState(null) // 'product' | 'variant'
//   const [editProduct, setEditProduct] = useState(null)
//   const [editVariant,  setEditVariant]  = useState(null)
//   const [form,         setForm]         = useState({})
//   const [variantForms, setVariantForms] = useState([emptyVariant()])
//   const [saving,       setSaving]       = useState(false)
//   const [error,        setError]        = useState('')

//   const loadProducts = async () => {
//     const { data } = await supabase.from('products').select('*, categories(name)').order('name')
//     setProducts(data || [])
//   }

//   const loadVariants = async (productId) => {
//     const { data } = await supabase.from('product_variants').select('*').eq('product_id', productId).order('sku')
//     setVariants(v => ({ ...v, [productId]: data || [] }))
//   }

//   useEffect(() => {
//     loadProducts()
//     supabase.from('categories').select('id, name').eq('is_active', true).order('name').then(({ data }) => setCategories(data || []))
//   }, [])

//   const toggleExpand = (pid) => {
//     setExpanded(e => ({ ...e, [pid]: !e[pid] }))
//     if (!variants[pid]) loadVariants(pid)
//   }

//   // ---- Product modal ----
//   const openProductCreate = () => {
//     setEditProduct(null)
//     setForm({ name: '', category_id: '', brand: '', season: '', description: '' })
//     setVariantForms([emptyVariant()])
//     setError('')
//     setModal('product')
//   }

//   const openProductEdit = (p) => {
//     setEditProduct(p)
//     setForm({ name: p.name, category_id: p.category_id || '', brand: p.brand || '', season: p.season || '', description: p.description || '' })
//     setVariantForms([])
//     setError('')
//     setModal('product')
//   }

//   const saveProduct = async () => {
//     if (!form.name.trim()) { setError('Product name is required'); return }
//     setSaving(true)
//     const payload = { name: form.name.trim(), category_id: form.category_id || null, brand: form.brand || null, season: form.season || null, description: form.description || null }

//     let productId = editProduct?.id
//     if (editProduct) {
//       const { error: err } = await supabase.from('products').update(payload).eq('id', editProduct.id)
//       if (err) { setError(err.message); setSaving(false); return }
//     } else {
//       const { data, error: err } = await supabase.from('products').insert(payload).select().single()
//       if (err) { setError(err.message); setSaving(false); return }
//       productId = data.id

//       // Save variants
//       for (const vf of variantForms.filter(v => v.sku.trim())) {
//         const { error: ve } = await supabase.from('product_variants').insert({
//           product_id: productId, sku: vf.sku.trim(),
//           size: vf.size || null, color: vf.color || null, fabric: vf.fabric || null,
//           purchase_price: Number(vf.purchase_price) || 0,
//           selling_price:  Number(vf.selling_price)  || 0,
//           stock_quantity: Number(vf.stock_quantity)  || 0,
//         })
//         if (ve) { setError(ve.message); setSaving(false); return }
//       }
//     }
//     setSaving(false)
//     setModal(null)
//     loadProducts()
//     if (expanded[productId]) loadVariants(productId)
//   }

//   // ---- Variant modal ----
//   const openVariantCreate = (product) => {
//     setEditProduct(product)
//     setEditVariant(null)
//     setVariantForms([emptyVariant()])
//     setError('')
//     setModal('variant')
//   }

//   const openVariantEdit = (product, v) => {
//     setEditProduct(product)
//     setEditVariant(v)
//     setVariantForms([{ sku: v.sku, size: v.size || '', color: v.color || '', fabric: v.fabric || '', purchase_price: v.purchase_price, selling_price: v.selling_price, stock_quantity: v.stock_quantity }])
//     setError('')
//     setModal('variant')
//   }

//   const saveVariant = async () => {
//     const vf = variantForms[0]
//     if (!vf.sku.trim()) { setError('SKU is required'); return }
//     if (!vf.selling_price) { setError('Selling price is required'); return }
//     setSaving(true)
//     const payload = {
//       product_id: editProduct.id, sku: vf.sku.trim(),
//       size: vf.size || null, color: vf.color || null, fabric: vf.fabric || null,
//       purchase_price: Number(vf.purchase_price) || 0,
//       selling_price:  Number(vf.selling_price),
//       stock_quantity: Number(vf.stock_quantity) || 0,
//     }
//     const { error: err } = editVariant
//       ? await supabase.from('product_variants').update(payload).eq('id', editVariant.id)
//       : await supabase.from('product_variants').insert(payload)
//     setSaving(false)
//     if (err) { setError(err.message); return }
//     setModal(null)
//     loadVariants(editProduct.id)
//   }

//   const updateVF = (i, field, val) => {
//     setVariantForms(fs => fs.map((f, idx) => idx === i ? { ...f, [field]: val } : f))
//   }



//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="font-display text-4xl font-semibold text-charcoal">Products</h2>
//         <button onClick={openProductCreate} className="btn-primary flex items-center gap-2">
//           <Plus size={16} /> Add Product
//         </button>
//       </div>

//       <div className="space-y-2">
//         {products.map(p => (
//           <div key={p.id} className="card p-0 overflow-hidden">
//             {/* Product row */}
//             <div className="flex items-center gap-4 px-5 py-4">
//               <button onClick={() => toggleExpand(p.id)} className="text-charcoal-soft hover:text-rose">
//                 {expanded[p.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//               </button>
//               <div className="w-9 h-9 bg-rose-light rounded-lg flex items-center justify-center flex-shrink-0">
//                 <Package size={16} className="text-rose" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="font-medium text-charcoal">{p.name}</p>
//                 <p className="text-xs text-charcoal-soft">{p.categories?.name || 'No category'}{p.brand ? ` · ${p.brand}` : ''}{p.season ? ` · ${p.season}` : ''}</p>
//               </div>
//               <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
//                 {p.is_active ? 'Active' : 'Inactive'}
//               </span>
//               <div className="flex items-center gap-2">
//                 <button onClick={() => openProductEdit(p)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1">
//                   <Pencil size={12} /> Edit
//                 </button>
//                 <button onClick={() => openVariantCreate(p)} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1">
//                   <Plus size={12} /> Variant
//                 </button>
//               </div>
//             </div>

//             {/* Variants */}
//             {expanded[p.id] && (
//               <div className="border-t border-cream-dark">
//                 {(variants[p.id] || []).length === 0
//                   ? <p className="text-sm text-charcoal-soft px-12 py-4">No variants. Add one!</p>
//                   : (
//                     <table className="w-full">
//                       <thead>
//                         <tr>
//                           {['SKU','Size','Color','Fabric','Buy ৳','Sell ৳','Stock',''].map(h => (
//                             <th key={h} className="table-header text-xs">{h}</th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {(variants[p.id] || []).map(v => (
//                           <tr key={v.id} className="hover:bg-cream/40">
//                             <td className="table-cell text-xs font-mono">{v.sku}</td>
//                             <td className="table-cell text-xs">{v.size || '—'}</td>
//                             <td className="table-cell text-xs">{v.color || '—'}</td>
//                             <td className="table-cell text-xs">{v.fabric || '—'}</td>
//                             <td className="table-cell text-xs">৳{v.purchase_price}</td>
//                             <td className="table-cell text-xs font-medium">৳{v.selling_price}</td>
//                             <td className="table-cell">
//                               <span className={`text-xs font-semibold ${v.stock_quantity <= 5 ? 'text-orange-500' : 'text-charcoal'}`}>
//                                 {v.stock_quantity}
//                               </span>
//                             </td>
//                             <td className="table-cell">
//                               <button onClick={() => openVariantEdit(p, v)} className="text-charcoal-soft hover:text-rose">
//                                 <Pencil size={13} />
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )
//                 }
//               </div>
//             )}
//           </div>
//         ))}
//         {products.length === 0 && (
//           <div className="card text-center py-12 text-charcoal-soft">
//             <Package size={40} className="mx-auto mb-3 text-rose-light" />
//             <p>No products yet. Add your first product!</p>
//           </div>
//         )}
//       </div>

//       {/* Product Modal */}
//       {modal === 'product' && (
//         <Modal title={editProduct ? 'Edit Product' : 'New Product'} onClose={() => setModal(null)} wide>
//           <div className="space-y-4">
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="col-span-2"><label className="label">Product Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Floral Summer Kurti" /></div>
//               <div><label className="label">Category</label><select className="input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}><option value="">— None —</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
//               <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Optional" /></div>
//               <div><label className="label">Season / Collection</label><input className="input" value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))} placeholder="Summer 2025" /></div>
//               <div className="col-span-2"><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
//             </div>

//             {!editProduct && (
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <label className="label mb-0">Variants</label>
//                   <button onClick={() => setVariantForms(fs => [...fs, emptyVariant()])} className="text-rose text-xs hover:underline">+ Add another</button>
//                 </div>
//                 {variantForms.map((_, i) => <VariantForm key={i} idx={i} variantForms={variantForms} editVariant={editVariant} updateVF={updateVF} setVariantForms={setVariantForms} />)}
//               </div>
//             )}

//             <div className="flex gap-3 pt-2">
//               <button onClick={saveProduct} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Product'}</button>
//               <button onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {/* Variant Modal */}
//       {modal === 'variant' && (
//         <Modal title={editVariant ? 'Edit Variant' : `Add Variant — ${editProduct?.name}`} onClose={() => setModal(null)} wide>
//           <div className="space-y-4">
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//             <VariantForm idx={0} variantForms={variantForms} editVariant={editVariant} updateVF={updateVF} setVariantForms={setVariantForms} />
//             <div className="flex gap-3 pt-2">
//               <button onClick={saveVariant} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Variant'}</button>
//               <button onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   )
// }



import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Plus, Pencil, ChevronDown, ChevronRight, Package, Boxes } from 'lucide-react'

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} my-4`}>
        <div className="px-6 pt-6 pb-4 border-b border-cream-dark flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-display text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-charcoal-soft hover:text-charcoal text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const emptyVariant = () => ({ sku: '', size: '', color: '', fabric: '', purchase_price: '', selling_price: '', stock_quantity: '' })

// Outside Products() to prevent focus loss bug
function VariantForm({ idx, variantForms, editVariant, updateVF, setVariantForms }) {
  return (
    <div className="border border-cream-dark rounded-xl p-4 space-y-3">
      {!editVariant && variantForms.length > 1 && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-charcoal-soft">Variant {idx + 1}</span>
          <button onClick={() => setVariantForms(fs => fs.filter((_, i) => i !== idx))} className="text-red-400 text-xs hover:text-red-600">Remove</button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3"><label className="label">SKU *</label><input className="input" placeholder="e.g. KRT-RED-M" value={variantForms[idx].sku} onChange={e => updateVF(idx, 'sku', e.target.value)} /></div>
        <div><label className="label">Size</label><input className="input" placeholder="M, L, XL…" value={variantForms[idx].size} onChange={e => updateVF(idx, 'size', e.target.value)} /></div>
        <div><label className="label">Color</label><input className="input" placeholder="Red" value={variantForms[idx].color} onChange={e => updateVF(idx, 'color', e.target.value)} /></div>
        <div><label className="label">Fabric</label><input className="input" placeholder="Cotton" value={variantForms[idx].fabric} onChange={e => updateVF(idx, 'fabric', e.target.value)} /></div>
        <div><label className="label">Buy Price ৳</label><input type="number" className="input" value={variantForms[idx].purchase_price} onChange={e => updateVF(idx, 'purchase_price', e.target.value)} /></div>
        <div><label className="label">Sell Price ৳ *</label><input type="number" className="input" value={variantForms[idx].selling_price} onChange={e => updateVF(idx, 'selling_price', e.target.value)} /></div>
        {!editVariant && (
          <div><label className="label">Initial Stock</label><input type="number" className="input" value={variantForms[idx].stock_quantity} onChange={e => updateVF(idx, 'stock_quantity', e.target.value)} /></div>
        )}
      </div>
      {editVariant && (
        <p className="text-xs text-charcoal-soft bg-cream rounded-lg px-3 py-2 mt-1">
          📦 To update stock, close this and click the <strong>box icon</strong> on the variant row. Changes are logged with date and reason.
        </p>
      )}
    </div>
  )
}

const changeTypeMeta = {
  purchase:   { label: 'Purchase',        color: 'bg-blue-50 text-blue-600' },
  sale:       { label: 'Sale',            color: 'bg-red-50 text-red-500' },
  return:     { label: 'Customer Return', color: 'bg-green-50 text-green-600' },
  adjustment: { label: 'Adjustment',      color: 'bg-orange-50 text-orange-500' },
}

export default function Products() {
  const [products,     setProducts]     = useState([])
  const [categories,   setCategories]   = useState([])
  const [expanded,     setExpanded]     = useState({})
  const [variants,     setVariants]     = useState({})
  const [modal,        setModal]        = useState(null) // 'product'|'variant'|'stock'
  const [editProduct,  setEditProduct]  = useState(null)
  const [editVariant,  setEditVariant]  = useState(null)
  const [stockVariant, setStockVariant] = useState(null)
  const [form,         setForm]         = useState({})
  const [variantForms, setVariantForms] = useState([emptyVariant()])
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')

  // Stock adjustment state
  const [adjType,    setAdjType]    = useState('purchase')
  const [adjQty,     setAdjQty]     = useState('')
  const [adjNote,    setAdjNote]    = useState('')
  const [adjLogs,    setAdjLogs]    = useState([])
  const [adjLoading, setAdjLoading] = useState(false)

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*, categories(name)').order('name')
    setProducts(data || [])
  }

  const loadVariants = async (productId) => {
    const { data } = await supabase.from('product_variants').select('*').eq('product_id', productId).order('sku')
    setVariants(v => ({ ...v, [productId]: data || [] }))
  }

  useEffect(() => {
    loadProducts()
    supabase.from('categories').select('id, name').eq('is_active', true).order('name')
      .then(({ data }) => setCategories(data || []))
  }, [])

  const toggleExpand = (pid) => {
    setExpanded(e => ({ ...e, [pid]: !e[pid] }))
    if (!variants[pid]) loadVariants(pid)
  }

  // ---- Product modal ----
  const openProductCreate = () => {
    setEditProduct(null)
    setForm({ name: '', category_id: '', brand: '', season: '', description: '' })
    setVariantForms([emptyVariant()])
    setError('')
    setModal('product')
  }

  const openProductEdit = (p) => {
    setEditProduct(p)
    setForm({ name: p.name, category_id: p.category_id || '', brand: p.brand || '', season: p.season || '', description: p.description || '' })
    setVariantForms([])
    setError('')
    setModal('product')
  }

  const saveProduct = async () => {
    if (!form.name.trim()) { setError('Product name is required'); return }
    setSaving(true)
    const payload = {
      name: form.name.trim(), category_id: form.category_id || null,
      brand: form.brand || null, season: form.season || null, description: form.description || null
    }
    let productId = editProduct?.id
    if (editProduct) {
      const { error: err } = await supabase.from('products').update(payload).eq('id', editProduct.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { data, error: err } = await supabase.from('products').insert(payload).select().single()
      if (err) { setError(err.message); setSaving(false); return }
      productId = data.id
      for (const vf of variantForms.filter(v => v.sku.trim())) {
        const { error: ve } = await supabase.from('product_variants').insert({
          product_id: productId, sku: vf.sku.trim(),
          size: vf.size || null, color: vf.color || null, fabric: vf.fabric || null,
          purchase_price: Number(vf.purchase_price) || 0,
          selling_price:  Number(vf.selling_price)  || 0,
          stock_quantity: Number(vf.stock_quantity)  || 0,
        })
        if (ve) { setError(ve.message); setSaving(false); return }
      }
    }
    setSaving(false)
    setModal(null)
    loadProducts()
    if (expanded[productId]) loadVariants(productId)
  }

  // ---- Variant modal ----
  const openVariantCreate = (product) => {
    setEditProduct(product)
    setEditVariant(null)
    setVariantForms([emptyVariant()])
    setError('')
    setModal('variant')
  }

  const openVariantEdit = (product, v) => {
    setEditProduct(product)
    setEditVariant(v)
    setVariantForms([{
      sku: v.sku, size: v.size || '', color: v.color || '', fabric: v.fabric || '',
      purchase_price: v.purchase_price, selling_price: v.selling_price, stock_quantity: v.stock_quantity
    }])
    setError('')
    setModal('variant')
  }

  const saveVariant = async () => {
    const vf = variantForms[0]
    if (!vf.sku.trim()) { setError('SKU is required'); return }
    if (!vf.selling_price) { setError('Selling price is required'); return }
    setSaving(true)
    const payload = {
      product_id: editProduct.id, sku: vf.sku.trim(),
      size: vf.size || null, color: vf.color || null, fabric: vf.fabric || null,
      purchase_price: Number(vf.purchase_price) || 0,
      selling_price:  Number(vf.selling_price),
      // stock_quantity intentionally excluded when editing — use Stock Adjustment modal
      ...(editVariant ? {} : { stock_quantity: Number(vf.stock_quantity) || 0 }),
    }
    const { error: err } = editVariant
      ? await supabase.from('product_variants').update(payload).eq('id', editVariant.id)
      : await supabase.from('product_variants').insert(payload)
    setSaving(false)
    if (err) { setError(err.message); return }
    setModal(null)
    loadVariants(editProduct.id)
  }

  // ---- Stock Adjustment modal ----
  const openStockModal = async (product, v) => {
    setEditProduct(product)
    setStockVariant(v)
    setAdjType('purchase')
    setAdjQty('')
    setAdjNote('')
    setError('')
    setModal('stock')
    setAdjLoading(true)
    const { data } = await supabase
      .from('inventory_logs')
      .select('*')
      .eq('variant_id', v.id)
      .order('created_at', { ascending: false })
      .limit(30)
    setAdjLogs(data || [])
    setAdjLoading(false)
  }

  const saveStockAdjustment = async () => {
    const qty = parseInt(adjQty)
    if (!adjQty || isNaN(qty) || qty === 0) { setError('Enter a non-zero quantity'); return }

    const change   = adjType === 'adjustment' ? qty : Math.abs(qty)
    const newStock = stockVariant.stock_quantity + change

    if (newStock < 0) {
      setError(`Cannot reduce below 0. Current stock: ${stockVariant.stock_quantity}`)
      return
    }

    setSaving(true)
    setError('')

    const { error: e1 } = await supabase
      .from('product_variants')
      .update({ stock_quantity: newStock })
      .eq('id', stockVariant.id)

    if (e1) { setError(e1.message); setSaving(false); return }

    const { error: e2 } = await supabase
      .from('inventory_logs')
      .insert({
        variant_id:      stockVariant.id,
        change_type:     adjType,
        quantity_change: change,
        note:            adjNote || null,
      })

    setSaving(false)
    if (e2) { setError(e2.message); return }

    // Update local state so number updates immediately without closing modal
    setStockVariant(sv => ({ ...sv, stock_quantity: newStock }))
    setAdjQty('')
    setAdjNote('')

    // Reload logs
    const { data } = await supabase
      .from('inventory_logs')
      .select('*')
      .eq('variant_id', stockVariant.id)
      .order('created_at', { ascending: false })
      .limit(30)
    setAdjLogs(data || [])

    // Refresh variant row in background
    loadVariants(editProduct.id)
  }

  const updateVF = (i, field, val) => {
    setVariantForms(fs => fs.map((f, idx) => idx === i ? { ...f, [field]: val } : f))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-4xl font-semibold text-charcoal">Products</h2>
        <button onClick={openProductCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="card p-0 overflow-hidden">
            <div className="flex items-center gap-4 px-5 py-4">
              <button onClick={() => toggleExpand(p.id)} className="text-charcoal-soft hover:text-rose">
                {expanded[p.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <div className="w-9 h-9 bg-rose-light rounded-lg flex items-center justify-center flex-shrink-0">
                <Package size={16} className="text-rose" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-charcoal">{p.name}</p>
                <p className="text-xs text-charcoal-soft">
                  {p.categories?.name || 'No category'}
                  {p.brand  ? ` · ${p.brand}`  : ''}
                  {p.season ? ` · ${p.season}` : ''}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {p.is_active ? 'Active' : 'Inactive'}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => openProductEdit(p)} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => openVariantCreate(p)} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1">
                  <Plus size={12} /> Variant
                </button>
              </div>
            </div>

            {expanded[p.id] && (
              <div className="border-t border-cream-dark">
                {(variants[p.id] || []).length === 0
                  ? <p className="text-sm text-charcoal-soft px-12 py-4">No variants. Add one!</p>
                  : (
                    <table className="w-full">
                      <thead>
                        <tr>
                          {['SKU','Size','Color','Fabric','Buy ৳','Sell ৳','Stock','Actions'].map(h => (
                            <th key={h} className="table-header text-xs">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(variants[p.id] || []).map(v => (
                          <tr key={v.id} className="hover:bg-cream/40">
                            <td className="table-cell text-xs font-mono">{v.sku}</td>
                            <td className="table-cell text-xs">{v.size  || '—'}</td>
                            <td className="table-cell text-xs">{v.color || '—'}</td>
                            <td className="table-cell text-xs">{v.fabric || '—'}</td>
                            <td className="table-cell text-xs">৳{v.purchase_price}</td>
                            <td className="table-cell text-xs font-medium">৳{v.selling_price}</td>
                            <td className="table-cell">
                              <span className={`text-sm font-bold ${
                                v.stock_quantity === 0 ? 'text-gray-400' :
                                v.stock_quantity <= 5  ? 'text-orange-500' : 'text-charcoal'
                              }`}>
                                {v.stock_quantity}
                              </span>
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openVariantEdit(p, v)}
                                  title="Edit variant"
                                  className="text-charcoal-soft hover:text-rose transition-colors"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => openStockModal(p, v)}
                                  title="Adjust stock & view history"
                                  className="text-charcoal-soft hover:text-blue-500 transition-colors"
                                >
                                  <Boxes size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                }
              </div>
            )}
          </div>
        ))}

        {products.length === 0 && (
          <div className="card text-center py-12 text-charcoal-soft">
            <Package size={40} className="mx-auto mb-3 text-rose-light" />
            <p>No products yet. Add your first product!</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {modal === 'product' && (
        <Modal title={editProduct ? 'Edit Product' : 'New Product'} onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Product Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Floral Summer Kurti" />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                  <option value="">— None —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Brand</label>
                <input className="input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Optional" />
              </div>
              <div>
                <label className="label">Season / Collection</label>
                <input className="input" value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))} placeholder="Summer 2025" />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            {!editProduct && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label mb-0">Variants</label>
                  <button onClick={() => setVariantForms(fs => [...fs, emptyVariant()])} className="text-rose text-xs hover:underline">+ Add another</button>
                </div>
                {variantForms.map((_, i) => (
                  <VariantForm key={i} idx={i} variantForms={variantForms} editVariant={editVariant} updateVF={updateVF} setVariantForms={setVariantForms} />
                ))}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={saveProduct} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Product'}</button>
              <button onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Variant Modal */}
      {modal === 'variant' && (
        <Modal title={editVariant ? 'Edit Variant' : `Add Variant — ${editProduct?.name}`} onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <VariantForm idx={0} variantForms={variantForms} editVariant={editVariant} updateVF={updateVF} setVariantForms={setVariantForms} />
            <div className="flex gap-3 pt-2">
              <button onClick={saveVariant} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Variant'}</button>
              <button onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Stock Adjustment Modal */}
      {modal === 'stock' && stockVariant && (
        <Modal title="Stock Adjustment" onClose={() => setModal(null)} wide>
          <div className="space-y-5">

            {/* Current stock display */}
            <div className="bg-cream rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-charcoal">{editProduct?.name}</p>
                <p className="text-xs text-charcoal-soft font-mono">
                  {stockVariant.sku}
                  {stockVariant.size  ? ` · ${stockVariant.size}`  : ''}
                  {stockVariant.color ? ` · ${stockVariant.color}` : ''}
                  {stockVariant.fabric ? ` · ${stockVariant.fabric}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-charcoal-soft uppercase tracking-wide">Current Stock</p>
                <p className={`font-display text-4xl font-semibold ${
                  stockVariant.stock_quantity === 0 ? 'text-gray-400' :
                  stockVariant.stock_quantity <= 5  ? 'text-orange-500' : 'text-charcoal'
                }`}>
                  {stockVariant.stock_quantity}
                </p>
              </div>
            </div>

            {/* Type selector */}
            <div>
              <label className="label">Type of Change</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'purchase',   label: '+ New Purchase',     desc: 'Stock received',     color: 'border-blue-300 bg-blue-50 text-blue-700' },
                  { value: 'return',     label: '+ Customer Return',  desc: 'Returned item',      color: 'border-green-300 bg-green-50 text-green-700' },
                  { value: 'adjustment', label: '± Manual Adjust',    desc: 'Positive or negative', color: 'border-orange-300 bg-orange-50 text-orange-600' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAdjType(opt.value)}
                    className={`border-2 rounded-xl px-3 py-2.5 text-left transition-all ${
                      adjType === opt.value
                        ? opt.color
                        : 'border-cream-dark text-charcoal-soft hover:border-gray-300 bg-white'
                    }`}
                  >
                    <p className="text-xs font-semibold">{opt.label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + note */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">
                  {adjType === 'adjustment' ? 'Quantity (+ to add, − to remove)' : 'Quantity to Add'}
                </label>
                <input
                  type="number"
                  className="input text-xl font-bold text-center"
                  placeholder={adjType === 'adjustment' ? '10 or -5' : '24'}
                  value={adjQty}
                  onChange={e => setAdjQty(e.target.value)}
                />
                {adjQty && !isNaN(parseInt(adjQty)) && (() => {
                  const change   = adjType === 'adjustment' ? parseInt(adjQty) : Math.abs(parseInt(adjQty))
                  const newStock = stockVariant.stock_quantity + change
                  return (
                    <p className="text-xs mt-1.5 text-charcoal-soft">
                      After adjustment:{' '}
                      <span className={`font-bold ${newStock < 0 ? 'text-red-500' : 'text-charcoal'}`}>
                        {newStock} units
                      </span>
                    </p>
                  )
                })()}
              </div>
              <div>
                <label className="label">Note (optional)</label>
                <input
                  className="input"
                  placeholder="e.g. New shipment from Dhaka"
                  value={adjNote}
                  onChange={e => setAdjNote(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={saveStockAdjustment}
              disabled={saving || !adjQty}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
            >
              <Boxes size={16} />
              {saving ? 'Saving…' : 'Apply & Save'}
            </button>

            {/* History log */}
            <div className="border-t border-cream-dark pt-5">
              <h4 className="font-display text-lg font-semibold mb-3">Stock History</h4>
              {adjLoading ? (
                <p className="text-sm text-charcoal-soft text-center py-4">Loading…</p>
              ) : adjLogs.length === 0 ? (
                <p className="text-sm text-charcoal-soft text-center py-4">No history yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {adjLogs.map(log => {
                    const meta   = changeTypeMeta[log.change_type] || { label: log.change_type, color: 'bg-gray-100 text-gray-500' }
                    const isAdd  = log.quantity_change > 0
                    return (
                      <div key={log.id} className="flex items-center justify-between bg-cream/70 rounded-lg px-4 py-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${meta.color}`}>
                            {meta.label}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs text-charcoal truncate">{log.note || <span className="text-gray-400">No note</span>}</p>
                            <p className="text-xs text-charcoal-soft">
                              {new Date(log.created_at).toLocaleString('en-BD', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ml-3 ${isAdd ? 'text-green-600' : 'text-red-500'}`}>
                          {isAdd ? '+' : ''}{log.quantity_change}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}