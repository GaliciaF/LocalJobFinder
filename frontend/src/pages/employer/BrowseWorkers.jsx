import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function BrowseWorkers() {
  const navigate = useNavigate()
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  const fetch = () => {
    setLoading(true)
    api.get('/employer/workers', { params: { search: search||null } })
      .then(res => setWorkers(res.data.data ?? res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const card = { background:'#fff', borderRadius:'14px', border:'1px solid #e5e0d0', padding:'18px', boxShadow:'0 1px 3px rgba(0,0,0,.08)', transition:'all .2s', cursor:'pointer' }
  const tag  = (bg,c,b) => ({ display:'inline-flex', padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:600, background:bg, color:c, border:`1px solid ${b}` })
  const btn  = (bg,c,b) => ({ background:bg, color:c, border:b?`1px solid ${b}`:'none', padding:'7px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:600, cursor:'pointer' })
  const ava  = (sz=52) => ({ width:sz, height:sz, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:sz*.36, fontWeight:700, color:'#fff', flexShrink:0 })
  const ini  = (n='') => n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  const startConversation = async (workerId) => {
    try {
      // Create or fetch existing conversation
      await api.post('/employer/messages/start', { worker_id: workerId })
      // Redirect to messages page with query param
      navigate(`/employer/messages?worker_id=${workerId}`)
    } catch (err) {
      console.error('Failed to start conversation', err)
      alert('Failed to start conversation. Please try again.')
    }
  }

  return (
    <div style={{ padding:'28px', maxWidth:'1200px', background:'#fffdf5', minHeight:'100vh' }}>
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by skill or name..."
          style={{ flex:1, padding:'9px 14px', border:'1.5px solid #e5e0d0', borderRadius:'9px', fontSize:'13px', background:'#fff', color:'#111827', outline:'none' }} />
        <button style={btn('#d97706','#fff')} onClick={fetch}>Search</button>
      </div>

      {loading ? <div style={{ color:'#6b7280' }}>Loading workers...</div>
        : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'16px' }}>
          {workers.length===0
            ? <div style={{ gridColumn:'1/-1', textAlign:'center', color:'#6b7280', padding:'40px' }}>No workers found.</div>
            : workers.map(w => (
              <div key={w.id} style={card}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#d97706'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e5e0d0'; e.currentTarget.style.transform='translateY(0)' }}>
                
                <div style={{ display:'flex', gap:'12px', marginBottom:'10px' }}>
                  <div style={ava()}>{ini(w.name)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:'14px' }}>{w.name}</div>
                    <div style={{ fontSize:'12px', color:'#6b7280' }}>{w.worker_profile?.barangay} · ⭐ {w.avg_rating ?? 'New'}</div>
                    {w.worker_profile?.id_verification_status==='verified' && <span style={tag('rgba(22,163,74,.1)','#16a34a','rgba(22,163,74,.3)')}>✓ Verified</span>}
                  </div>
                </div>

                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px' }}>
                  {(w.worker_profile?.skills??[]).slice(0,3).map(s => <span key={s} style={tag('rgba(217,119,6,.08)','#d97706','rgba(217,119,6,.25)')}>{s}</span>)}
                </div>

                <div style={{ fontSize:'12px', color:'#16a34a', fontWeight:700, marginBottom:'10px' }}>
                  ₱{w.worker_profile?.expected_rate?.toLocaleString() ?? '—'}/{w.worker_profile?.rate_type==='Daily'?'day':'hr'}
                  {w.worker_profile?.negotiable && <span style={{ color:'#6b7280', fontWeight:400 }}> · Negotiable</span>}
                </div>

                <button style={{ ...btn('#d97706','#fff'), width:'100%', justifyContent:'center', display:'flex' }}
                  onClick={() => startConversation(w.id)}>
                  💬 Message
                </button>
              </div>
            ))
          }
        </div>
      }
    </div>
  )
}