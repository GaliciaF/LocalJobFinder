import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function SecurityControls() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [tab,     setTab]     = useState('all')
  const [msg,     setMsg]     = useState('')

  const fetchUsers = () => {
    setLoading(true)
    const params = {}
    if (tab !== 'all') params.status = tab
    if (search) params.search = search
    api.get('/admin/users', { params })
      .then(res => setUsers(res.data.data ?? res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [tab])

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 2500) }

  const updateStatus = async (userId, status, reason = null) => {
    await api.patch(`/admin/users/${userId}/status`, { status, suspension_reason: reason })
    flash(`User ${status}.`)
    fetchUsers()
  }

  const deleteUser = async (userId) => {
    if (!confirm('Permanently delete this user?')) return
    await api.delete(`/admin/users/${userId}`)
    flash('User deleted.')
    fetchUsers()
  }

  const card = { background:'#161525', borderRadius:'14px', border:'1px solid #2a2940', padding:'0', overflow:'hidden' }
  const btn  = (bg,c,b) => ({ background:bg, color:c, border:b?`1px solid ${b}`:'none', padding:'6px 12px', borderRadius:'7px', fontSize:'11px', fontWeight:600, cursor:'pointer' })
  const chip = (active) => ({ padding:'6px 16px', borderRadius:'20px', border:`1.5px solid ${active?'#7c3aed':'#2a2940'}`, fontSize:'12px', fontWeight:active?700:500, color:active?'#a78bfa':'#8b8aad', cursor:'pointer', background:active?'rgba(124,58,237,.12)':'transparent' })
  const statusBadge = { active:['rgba(34,197,94,.12)','#22c55e','rgba(34,197,94,.3)'], suspended:['rgba(245,158,11,.12)','#f59e0b','rgba(245,158,11,.3)'], banned:['rgba(248,113,113,.12)','#f87171','rgba(248,113,113,.3)'] }
  const tag = (s) => { const [bg,c,b] = statusBadge[s] ?? statusBadge.active; return { display:'inline-flex', padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:600, background:bg, color:c, border:`1px solid ${b}` } }

  return (
    <div style={{ padding:'28px', maxWidth:'1100px' }}>
      {msg && <div style={{ background:'rgba(124,58,237,.15)', border:'1px solid rgba(124,58,237,.4)', borderRadius:'10px', padding:'10px 16px', marginBottom:'16px', color:'#a78bfa', fontSize:'13px', fontWeight:500 }}>{msg}</div>}

      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' }}>
        {['all','active','suspended','banned'].map(t => (
          <div key={t} style={chip(tab===t)} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchUsers()} placeholder="Search user..." style={{ padding:'7px 12px', border:'1.5px solid #2a2940', borderRadius:'9px', fontSize:'13px', background:'#1e1d30', color:'#f0eeff', outline:'none' }} />
          <button style={btn('#7c3aed','#fff')} onClick={fetchUsers}>Search</button>
        </div>
      </div>

      {loading ? (
        <div style={{ color:'#8b8aad', padding:'40px', textAlign:'center' }}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ color:'#8b8aad', padding:'40px', textAlign:'center', ...card }}>No users found.</div>
      ) : (
        <div style={card}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr', gap:'12px', padding:'12px 18px', borderBottom:'1px solid #2a2940', fontSize:'11px', fontWeight:700, color:'#5a5978', textTransform:'uppercase', letterSpacing:'1px' }}>
            <div>User</div><div>Role</div><div>Status</div><div>Actions</div>
          </div>
          {users.map(user => (
            <div key={user.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr', gap:'12px', padding:'14px 18px', borderBottom:'1px solid #1e1d30', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:'14px', color:'#f0eeff' }}>{user.name}</div>
                <div style={{ fontSize:'11px', color:'#5a5978' }}>{user.email ?? user.phone ?? '—'}</div>
              </div>
              <div style={{ fontSize:'12px', color:'#8b8aad', textTransform:'capitalize' }}>{user.role}</div>
              <div><span style={tag(user.status)}>{user.status}</span></div>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {user.status !== 'suspended' && <button style={btn('rgba(245,158,11,.15)','#f59e0b','rgba(245,158,11,.3)')} onClick={() => updateStatus(user.id,'suspended','Suspended by admin')}>Suspend</button>}
                {user.status !== 'active'    && <button style={btn('rgba(34,197,94,.12)','#22c55e','rgba(34,197,94,.3)')} onClick={() => updateStatus(user.id,'active')}>Reinstate</button>}
                {user.status !== 'banned'    && <button style={btn('rgba(248,113,113,.12)','#f87171','rgba(248,113,113,.3)')} onClick={() => updateStatus(user.id,'banned','Banned by admin')}>Ban</button>}
                <button style={btn('rgba(248,113,113,.08)','#f87171','rgba(248,113,113,.2)')} onClick={() => deleteUser(user.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}