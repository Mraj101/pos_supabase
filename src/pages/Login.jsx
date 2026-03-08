// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'

// export default function Login() {
//   const { signIn } = useAuth()
//   const navigate   = useNavigate()
//   const [email,    setEmail]    = useState('')
//   const [password, setPassword] = useState('')
//   const [error,    setError]    = useState('')
//   const [loading,  setLoading]  = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)
//     const { error: err } = await signIn(email, password)
//     setLoading(false)
//     if (err) { setError(err.message); return }
//     navigate('/dashboard')
//   }

//   return (
//     <div className="min-h-screen bg-charcoal flex items-center justify-center">
//       {/* Decorative background */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose/10 rounded-full blur-3xl" />
//         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose/8 rounded-full blur-3xl" />
//       </div>

//       <div className="relative w-full max-w-md mx-4">
//         {/* Card */}
//         <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
//           {/* Top accent bar */}
//           <div className="h-1 bg-gradient-to-r from-rose-light via-rose to-rose-dark" />

//           <div className="px-10 pt-10 pb-10">
//             {/* Brand */}
//             <div className="text-center mb-8">
//               <h1 className="font-display text-4xl font-semibold text-charcoal mb-1">
//                 Boutique POS
//               </h1>
//               <p className="text-sm text-charcoal-soft font-body">
//                 Sign in to your store
//               </p>
//             </div>

//             {error && (
//               <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="label">Email address</label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={e => setEmail(e.target.value)}
//                   className="input"
//                   placeholder="owner@boutique.com"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="label">Password</label>
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={e => setPassword(e.target.value)}
//                   className="input"
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="btn-primary w-full py-3 text-base mt-2"
//               >
//                 {loading ? 'Signing in…' : 'Sign in'}
//               </button>
//             </form>

//             <p className="mt-6 text-center text-xs text-charcoal-soft">
//               Contact your admin to create or reset your account.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-rose-light via-rose to-rose-dark" />

          <div className="px-10 pt-10 pb-10">
            {/* Brand */}
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl font-semibold text-charcoal mb-1">
                Boutique POS
              </h1>
              <p className="text-sm text-charcoal-soft font-body">
                Sign in to your store
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input"
                  placeholder="owner@boutique.com"
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base mt-2"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-charcoal-soft">
              Contact your admin to create or reset your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
