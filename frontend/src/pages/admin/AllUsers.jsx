import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function AllUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [viewUser, setViewUser] = useState(null) // modal state

  const fetchUsers = () => {
    setLoading(true)
    const params = {}
    if (filter === 'suspended' || filter === 'banned') params.status = filter
    else if (filter !== 'all') params.role = filter
    if (search) params.search = search
    api.get('/admin/users', { params })
      .then(res => setUsers(res.data.data ?? res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [filter, search])

  const handleStatus = async (userId, status) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, {
        status,
        suspension_reason: status === 'suspended' ? 'Violation of terms' : null,
        suspended_until: status === 'suspended' ? new Date(Date.now()+30*24*60*60*1000).toISOString() : null,
      })
      fetchUsers()
    } catch(err) {
      alert('Failed to update status: ' + err.message)
    }
  }

  const tag  = (bg,c,b) => ({ display:'inline-flex',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:600,background:bg,color:c,border:`1px solid ${b}` })
  const btn  = (bg,c,b) => ({ background:bg,color:c,border:b?`1px solid ${b}`:'none',padding:'5px 12px',borderRadius:'8px',fontSize:'11px',fontWeight:600,cursor:'pointer' })
  const chip = (a) => ({ padding:'6px 14px',borderRadius:'20px',border:`1.5px solid ${a?'#7c3aed':'#2a2940'}`,fontSize:'12px',fontWeight:a?600:500,color:a?'#a78bfa':'#8b8aad',cursor:'pointer',background:a?'rgba(124,58,237,.12)':'transparent' })
  const th   = { fontSize:'10px',fontWeight:700,textTransform:'uppercase',color:'#5a5978',padding:'10px 14px',borderBottom:'1px solid #2a2940',textAlign:'left' }
  const td   = { padding:'12px 14px',borderBottom:'1px solid #1a1930',fontSize:'13px',color:'#f0eeff',verticalAlign:'middle' }
  const ava  = (bg,sz=34) => ({ width:sz,height:sz,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:sz*.36,fontWeight:700,color:'#fff',flexShrink:0 })
  const ini  = (n='') => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  const sTag = (s) => s==='active' ? tag('rgba(34,197,94,.12)','#22c55e','rgba(34,197,94,.3)') : s==='suspended' ? tag('rgba(251,191,36,.12)','#fbbf24','rgba(251,191,36,.3)') : tag('rgba(248,113,113,.12)','#f87171','rgba(248,113,113,.3)')

  return (
    <div style={{ padding:'28px',maxWidth:'1280px' }}>
      {/* Filters */}
      <div style={{ background:'#161525',borderRadius:'14px',border:'1px solid #2a2940',padding:'18px 20px',marginBottom:'16px' }}>
        <div style={{ display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'14px' }}>
          {[['all','All'],['worker','Workers'],['employer','Employers'],['suspended','Suspended'],['banned','Banned']].map(([k,l]) => (
            <div key={k} style={chip(filter===k)} onClick={()=>setFilter(k)}>{l}</div>
          ))}
        </div>
        <div style={{ display:'flex',gap:'10px' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search by name..."
            style={{ flex:1,padding:'9px 14px',border:'1.5px solid #2a2940',borderRadius:'9px',fontSize:'13px',background:'#1e1d30',color:'#f0eeff',outline:'none' }} />
          <button style={btn('#7c3aed','#fff')} onClick={fetchUsers}>Search</button>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background:'#161525',borderRadius:'14px',border:'1px solid #2a2940',overflow:'hidden' }}>
        {loading ? <div style={{ padding:'32px',textAlign:'center',color:'#8b8aad' }}>Loading...</div>
          : <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead><tr>{['User','Role','Barangay','Phone','Rating','Status','Actions'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {users.length===0 ? <tr><td colSpan={7} style={{ ...td,textAlign:'center',color:'#5a5978' }}>No users found.</td></tr>
                  : users.map(u=>(
                    <tr key={u.id} onMouseEnter={e=>e.currentTarget.style.background='rgba(124,58,237,.04)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={td}>
                        <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                          <div style={ava('linear-gradient(135deg,#7c3aed,#4c1d95)')}>{ini(u.name)}</div>
                          <div>
                            <div style={{ fontWeight:600 }}>{u.name}</div>
                            <div style={{ fontSize:'11px',color:'#8b8aad' }}>
                              {u.email ?? u.worker_profile?.email ?? u.employer_profile?.email ?? u.phone ?? u.worker_profile?.phone ?? u.employer_profile?.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={td}><span style={tag('rgba(124,58,237,.12)','#a78bfa','rgba(124,58,237,.3)')}>{u.role}</span></td>
                      <td style={{ ...td,color:'#8b8aad' }}>{u.worker_profile?.barangay ?? u.employer_profile?.barangay ?? '—'}</td>
                      <td style={{ ...td,color:'#8b8aad' }}>{u.worker_profile?.phone ?? u.employer_profile?.phone ?? '—'}</td>
                      <td style={td}>{u.avg_rating ? `⭐ ${parseFloat(u.avg_rating).toFixed(1)}` : '—'}</td>
                      <td style={td}><span style={sTag(u.status)}>{u.status}</span></td>
                      <td style={td}>
                        <div style={{ display:'flex',gap:'6px',flexWrap:'wrap' }}>
                          {u.status==='active' && <>
                            <button style={btn('rgba(251,191,36,.12)','#fbbf24','rgba(251,191,36,.3)')} onClick={()=>handleStatus(u.id,'suspended')}>Suspend</button>
                            <button style={btn('rgba(248,113,113,.12)','#f87171','rgba(248,113,113,.3)')} onClick={()=>handleStatus(u.id,'banned')}>Ban</button>
                          </>}
                          {(u.status==='suspended'||u.status==='banned') && <button style={btn('rgba(34,197,94,.12)','#22c55e','rgba(34,197,94,.3)')} onClick={()=>handleStatus(u.id,'active')}>Reinstate</button>}
                          <button style={btn('transparent','#8b8aad','#2a2940')} onClick={()=>setViewUser(u)}>View</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
        }
      </div>

      {/* View User Modal */}
      {viewUser && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.6)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:300 }}>
          <div style={{ background:'#161525',padding:'24px',borderRadius:'14px',width:'400px',maxHeight:'90vh',overflowY:'auto',position:'relative' }}>
            <button onClick={()=>setViewUser(null)} style={{ position:'absolute',top:'12px',right:'12px',background:'none',border:'none',color:'#f87171',fontSize:'16px',cursor:'pointer' }}>✕</button>
            <h3 style={{ marginBottom:'12px' }}>{viewUser.name}</h3>
            <p><strong>Email:</strong> {viewUser.email ?? viewUser.worker_profile?.email ?? viewUser.employer_profile?.email ?? '—'}</p>
            <p><strong>Phone:</strong> {viewUser.phone ?? viewUser.worker_profile?.phone ?? viewUser.employer_profile?.phone ?? '—'}</p>
            <p><strong>Role:</strong> {viewUser.role}</p>
            <p><strong>Status:</strong> {viewUser.status}</p>
            <p><strong>Barangay:</strong> {viewUser.worker_profile?.barangay ?? viewUser.employer_profile?.barangay ?? '—'}</p>
            <p><strong>Rating:</strong> {viewUser.avg_rating ? `⭐ ${parseFloat(viewUser.avg_rating).toFixed(1)}` : '—'}</p>
          </div>
        </div>
      )}
    </div>
  )
}