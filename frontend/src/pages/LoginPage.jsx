import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { user, login } = useAuth()   // <-- added user from context
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  // ── Added: redirect if already logged in ──
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`, { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const role = await login(form.email, form.password)
      navigate(`/${role}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="relative min-h-screen flex bg-[#0b0a13] overflow-hidden">

      {/* BACKGROUND BLUR EFFECTS */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-700 rounded-full blur-[140px] opacity-30"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-indigo-700 rounded-full blur-[140px] opacity-30"></div>

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 relative items-center justify-center p-16">
        <div className="z-10 max-w-lg">
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Find Local Jobs <br /> Faster & Easier
          </h1>

          <p className="text-gray-400 text-lg mb-8">
            A modern platform connecting local workers and employers with speed,
            simplicity, and security.
          </p>

          <div className="space-y-4 text-gray-300">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <p>Post jobs in seconds</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              <p>Hire trusted workers nearby</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              <p>Simple and secure login system</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl">

          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            Sign in to continue
          </p>

          {error && (
            <p className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-800 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-600/40 outline-none transition"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-600/40 outline-none transition"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold rounded-xl transition duration-300 shadow-lg shadow-purple-900/40"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-400 text-center">
            No account?{" "}
            <Link
              to="/register"
              className="text-purple-400 hover:text-purple-300 transition"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}