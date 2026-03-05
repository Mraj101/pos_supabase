import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ShoppingCart, AlertTriangle, Users, TrendingUp, ChevronRight } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'rose', link }) {
  const colorMap = {
    rose:   'bg-rose-light text-rose',
    gold:   'bg-gold-light text-gold',
    green:  'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-500',
  }
  const card = (
    <div className="card flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-charcoal-soft uppercase tracking-wide mb-1">{label}</p>
        <p className="font-display text-2xl font-semibold text-charcoal">{value}</p>
        {sub && <p className="text-xs text-charcoal-soft mt-0.5">{sub}</p>}
      </div>
      {link && <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />}
    </div>
  )
  return link ? <Link to={link}>{card}</Link> : card
}

function fmt(n) { return '৳' + Number(n || 0).toLocaleString('en-BD') }

export default function Dashboard() {
  const [stats,       setStats]       = useState({})
  const [recentSales, setRecentSales] = useState([])
  const [topDue,      setTopDue]      = useState([])
  const [lowStock,    setLowStock]    = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0]

      const [
        { data: todaySalesRaw },
        { data: balances },
        { data: lowStockRaw },
        { data: sales },
        { data: topDueRaw },
      ] = await Promise.all([
        supabase.from('sales').select('total_amount').gte('sale_date', today),
        supabase.from('customer_balances').select('balance_due').gt('balance_due', 0),
        supabase.from('low_stock_variants').select('*').limit(5),
        supabase.from('sales').select('id, total_amount, amount_paid, sale_date, customers(name)').order('sale_date', { ascending: false }).limit(8),
        supabase.from('customer_balances').select('customer_id, name, phone, balance_due').gt('balance_due', 0).order('balance_due', { ascending: false }).limit(5),
      ])

      const todayTotal  = (todaySalesRaw || []).reduce((s, r) => s + Number(r.total_amount), 0)
      const totalDue    = (balances || []).reduce((s, r) => s + Number(r.balance_due), 0)

      setStats({
        todayTotal,
        totalDue,
        lowStockCount: lowStockRaw?.length || 0,
        dueCustCount:  balances?.length || 0,
      })
      setRecentSales(sales || [])
      setTopDue(topDueRaw || [])
      setLowStock(lowStockRaw || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-charcoal-soft">Loading…</div>

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-4xl font-semibold text-charcoal">Dashboard</h2>
          <p className="text-charcoal-soft text-sm mt-1">
            {new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/new-sale" className="btn-primary flex items-center gap-2">
          <ShoppingCart size={16} />
          New Sale
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Today's Sales"  value={fmt(stats.todayTotal)}  color="rose" />
        <StatCard icon={Users}      label="Total Due"      value={fmt(stats.totalDue)}    sub={`${stats.dueCustCount} customers`} color="gold"   link="/customers" />
        <StatCard icon={AlertTriangle} label="Low Stock"   value={stats.lowStockCount}    sub="variants ≤ 5 units" color="orange" />
        <StatCard icon={Users}      label="Due Customers"  value={stats.dueCustCount}     color="green" link="/customers" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-6">

        {/* Recent Sales */}
        <div className="col-span-2 card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-dark flex justify-between items-center">
            <h3 className="font-display text-xl font-semibold">Recent Sales</h3>
            <Link to="/reports" className="text-rose text-xs hover:underline">View all</Link>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Customer</th>
                <th className="table-header">Total</th>
                <th className="table-header">Paid</th>
                <th className="table-header">Due</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map(sale => {
                const due = Number(sale.total_amount) - Number(sale.amount_paid)
                return (
                  <tr key={sale.id} className="hover:bg-cream/50 transition-colors">
                    <td className="table-cell font-medium">{sale.customers?.name || '—'}</td>
                    <td className="table-cell">{fmt(sale.total_amount)}</td>
                    <td className="table-cell text-green-600">{fmt(sale.amount_paid)}</td>
                    <td className="table-cell">
                      {due > 0
                        ? <span className="text-red-500 font-medium">{fmt(due)}</span>
                        : <span className="text-green-500">Paid</span>}
                    </td>
                    <td className="table-cell text-charcoal-soft text-xs">
                      {new Date(sale.sale_date).toLocaleDateString('en-BD')}
                    </td>
                  </tr>
                )
              })}
              {recentSales.length === 0 && (
                <tr><td colSpan={5} className="table-cell text-center text-charcoal-soft py-8">No sales yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Side panels */}
        <div className="space-y-4">
          {/* Top debtors */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-cream-dark">
              <h3 className="font-display text-lg font-semibold">Top Due</h3>
            </div>
            <div className="divide-y divide-cream-dark">
              {topDue.map(c => (
                <Link key={c.customer_id} to={`/ledger/${c.customer_id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-cream/60 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-charcoal">{c.name}</p>
                    <p className="text-xs text-charcoal-soft">{c.phone}</p>
                  </div>
                  <span className="text-red-500 text-sm font-semibold">{fmt(c.balance_due)}</span>
                </Link>
              ))}
              {topDue.length === 0 && (
                <p className="px-5 py-4 text-sm text-charcoal-soft text-center">No dues 🎉</p>
              )}
            </div>
          </div>

          {/* Low stock */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-cream-dark">
              <h3 className="font-display text-lg font-semibold text-orange-500">Low Stock</h3>
            </div>
            <div className="divide-y divide-cream-dark">
              {lowStock.map((v, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-charcoal">{v.product_name}</p>
                    <p className="text-xs text-charcoal-soft">{[v.size, v.color].filter(Boolean).join(' / ')}</p>
                  </div>
                  <span className="text-orange-500 text-sm font-bold">{v.stock_quantity}</span>
                </div>
              ))}
              {lowStock.length === 0 && (
                <p className="px-5 py-4 text-sm text-charcoal-soft text-center">Stock is healthy ✓</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
