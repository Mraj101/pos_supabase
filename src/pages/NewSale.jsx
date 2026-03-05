import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle } from 'lucide-react'

const fmt = (n) => '৳' + Number(n || 0).toLocaleString('en-BD')

export default function NewSale() {
  const navigate = useNavigate()

  // Customer
  const [customerQuery,   setCustomerQuery]   = useState('')
  const [customerResults, setCustomerResults] = useState([])
  const [customer,        setCustomer]        = useState(null)
  const [customerBalance, setCustomerBalance] = useState(null)

  // Product search
  const [variantQuery,   setVariantQuery]   = useState('')
  const [variantResults, setVariantResults] = useState([])
  const [showVariants,   setShowVariants]   = useState(false)

  // Cart
  const [cart, setCart] = useState([])

  // Payment
  const [amountPaid, setAmountPaid] = useState('')
  const [note,       setNote]       = useState('')
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState(false)

  const variantRef = useRef()

  // Search customers
  useEffect(() => {
    if (!customerQuery.trim()) { setCustomerResults([]); return }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('customers')
        .select('id, name, phone')
        .or(`name.ilike.%${customerQuery}%,phone.ilike.%${customerQuery}%`)
        .limit(6)
      setCustomerResults(data || [])
    }, 300)
    return () => clearTimeout(t)
  }, [customerQuery])

  // Load customer balance when selected
  useEffect(() => {
    if (!customer) { setCustomerBalance(null); return }
    supabase.from('customer_balances').select('balance_due').eq('customer_id', customer.id).single()
      .then(({ data }) => setCustomerBalance(data?.balance_due || 0))
  }, [customer])

  // Search variants
  useEffect(() => {
    if (!variantQuery.trim()) { setVariantResults([]); setShowVariants(false); return }
    const t = setTimeout(async () => {
      const { data } = await supabase.rpc('search_variants', { search_term: variantQuery })
      setVariantResults(data || [])
      setShowVariants(true)
    }, 300)
    return () => clearTimeout(t)
  }, [variantQuery])

  const selectCustomer = (c) => {
    setCustomer(c)
    setCustomerQuery(c.name)
    setCustomerResults([])
  }

  const addToCart = (variant) => {
    setCart(cart => {
      const existing = cart.find(i => i.id === variant.id)
      if (existing) {
        if (existing.qty >= variant.stock_quantity) return cart
        return cart.map(i => i.id === variant.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...cart, { ...variant, qty: 1, unit_price: variant.selling_price }]
    })
    setVariantQuery('')
    setVariantResults([])
    setShowVariants(false)
  }

  const updateQty = (id, delta) => {
    setCart(cart => cart.map(i => {
      if (i.id !== id) return i
      const newQty = i.qty + delta
      if (newQty <= 0) return null
      if (newQty > i.stock_quantity) return i
      return { ...i, qty: newQty }
    }).filter(Boolean))
  }

  const updatePrice = (id, price) => {
    setCart(cart => cart.map(i => i.id === id ? { ...i, unit_price: Number(price) || 0 } : i))
  }

  const removeItem = (id) => setCart(cart => cart.filter(i => i.id !== id))

  const total = cart.reduce((s, i) => s + i.qty * i.unit_price, 0)
  const paid  = Number(amountPaid) || 0
  const due   = total - paid

  const handleSubmit = async () => {
    if (!customer)       { setError('Please select a customer'); return }
    if (cart.length === 0) { setError('Cart is empty'); return }
    if (paid > total)    { setError('Payment cannot exceed total'); return }

    setSaving(true)
    setError('')

    const { error: err } = await supabase.rpc('create_sale', {
      p_customer_id:  customer.id,
      p_items:        cart.map(i => ({ variant_id: i.id, quantity: i.qty, unit_price: i.unit_price })),
      p_total_amount: total,
      p_amount_paid:  paid,
      p_note:         note || null,
    })

    setSaving(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
  }

  const resetForm = () => {
    setCustomer(null); setCustomerQuery(''); setCustomerBalance(null)
    setCart([]); setAmountPaid(''); setNote(''); setError(''); setSuccess(false)
  }

  if (success) return (
    <div className="flex flex-col items-center justify-center min-h-96 text-center space-y-4">
      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h2 className="font-display text-3xl font-semibold text-charcoal">Sale Recorded!</h2>
      <p className="text-charcoal-soft">
        {fmt(total)} sale for <strong>{customer.name}</strong>.{' '}
        {due > 0 ? <span className="text-red-500">Due: {fmt(due)}</span> : 'Fully paid.'}
      </p>
      <div className="flex gap-3">
        <button onClick={resetForm} className="btn-primary">New Sale</button>
        <button onClick={() => navigate('/dashboard')} className="btn-ghost">Dashboard</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h2 className="font-display text-4xl font-semibold text-charcoal">New Sale</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Customer + Items */}
        <div className="col-span-2 space-y-5">

          {/* Customer */}
          <div className="card">
            <h3 className="font-display text-xl font-semibold mb-4">Customer</h3>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search customer by name or phone…"
                value={customerQuery}
                onChange={e => { setCustomerQuery(e.target.value); setCustomer(null) }}
              />
              {customerResults.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-cream-dark rounded-xl shadow-lg overflow-hidden">
                  {customerResults.map(c => (
                    <button key={c.id} onClick={() => selectCustomer(c)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-cream/70 text-left transition-colors">
                      <span className="font-medium text-sm">{c.name}</span>
                      <span className="text-xs text-charcoal-soft">{c.phone}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {customer && (
              <div className="mt-3 flex items-center justify-between bg-rose-light/40 rounded-lg px-4 py-3">
                <div>
                  <p className="font-medium text-charcoal">{customer.name}</p>
                  <p className="text-xs text-charcoal-soft">{customer.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-charcoal-soft">Existing Due</p>
                  <p className={`font-semibold text-sm ${Number(customerBalance) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {customerBalance !== null ? fmt(customerBalance) : '…'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Product Search */}
          <div className="card">
            <h3 className="font-display text-xl font-semibold mb-4">Add Items</h3>
            <div className="relative" ref={variantRef}>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="Search by product name or SKU…"
                value={variantQuery}
                onChange={e => setVariantQuery(e.target.value)}
                onFocus={() => variantResults.length > 0 && setShowVariants(true)}
              />
              {showVariants && variantResults.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-cream-dark rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                  {variantResults.map(v => (
                    <button key={v.id} onClick={() => addToCart(v)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-cream/70 text-left border-b border-cream-dark last:border-0 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{v.product_name}</p>
                        <p className="text-xs text-charcoal-soft">{[v.sku, v.size, v.color, v.fabric].filter(Boolean).join(' · ')}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-semibold text-rose">{fmt(v.selling_price)}</p>
                        <p className="text-xs text-charcoal-soft">Stock: {v.stock_quantity}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart items */}
            {cart.length > 0 ? (
              <div className="mt-4 space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-cream/60 rounded-xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">{item.product_name}</p>
                      <p className="text-xs text-charcoal-soft">{[item.sku, item.size, item.color].filter(Boolean).join(' · ')}</p>
                    </div>
                    {/* Qty control */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full bg-white border border-rose-light flex items-center justify-center hover:bg-rose-light">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full bg-white border border-rose-light flex items-center justify-center hover:bg-rose-light">
                        <Plus size={12} />
                      </button>
                    </div>
                    {/* Price */}
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-charcoal-soft text-xs">৳</span>
                      <input
                        type="number"
                        className="input w-28 pl-5 text-right text-sm"
                        value={item.unit_price}
                        onChange={e => updatePrice(item.id, e.target.value)}
                      />
                    </div>
                    <p className="w-24 text-right text-sm font-semibold text-charcoal">
                      {fmt(item.qty * item.unit_price)}
                    </p>
                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-center py-8 text-charcoal-soft border-2 border-dashed border-cream-dark rounded-xl">
                <ShoppingCart size={28} className="mx-auto mb-2 text-rose-light" />
                <p className="text-sm">Search and add products above</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order summary */}
        <div className="space-y-4">
          <div className="card sticky top-8">
            <h3 className="font-display text-xl font-semibold mb-5">Order Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-charcoal-soft">
                <span>Items ({cart.reduce((s, i) => s + i.qty, 0)})</span>
                <span>{fmt(total)}</span>
              </div>
              <div className="border-t border-cream-dark pt-3">
                <div className="flex justify-between font-semibold text-base text-charcoal">
                  <span>Total</span>
                  <span className="font-display text-xl">{fmt(total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="label">Amount Paid ৳</label>
                <input
                  type="number"
                  className="input text-right font-semibold"
                  placeholder="0"
                  value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  max={total}
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setAmountPaid(String(total))} className="text-xs text-rose hover:underline">Full payment</button>
                  <span className="text-xs text-gray-300">|</span>
                  <button onClick={() => setAmountPaid('0')} className="text-xs text-rose hover:underline">No payment (credit)</button>
                </div>
              </div>

              {due !== 0 && total > 0 && (
                <div className={`flex justify-between text-sm font-semibold p-3 rounded-lg ${due > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                  <span>{due > 0 ? 'Remaining Due' : 'Overpayment'}</span>
                  <span>{fmt(Math.abs(due))}</span>
                </div>
              )}

              <div>
                <label className="label">Note (optional)</label>
                <input className="input" placeholder="Any remark…" value={note} onChange={e => setNote(e.target.value)} />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={saving || cart.length === 0 || !customer}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
              >
                <ShoppingCart size={17} />
                {saving ? 'Processing…' : 'Confirm Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
