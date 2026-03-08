import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [analytics, setAnalytics]         = useState(null)
  const [verifications, setVerifications] = useState([])
  const [reports, setReports]             = useState([])
  const [categories, setCategories]       = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, aRes, vRes, rRes, cRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/analytics'),
          api.get('/admin/verifications', { params: { status: 'pending' } }),
          api.get('/admin/reports',       { params: { status: 'pending' } }),
          api.get('/admin/categories'),
        ])
        const totalUsers = (usersRes.data.data ?? usersRes.data).length
        setAnalytics({ ...aRes.data, total_users: totalUsers })
        setVerifications((vRes.data.data ?? vRes.data).slice(0, 3))
        setReports((rRes.data.data ?? rRes.data).slice(0, 3))
        setCategories((cRes.data).slice(0, 5))
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleVerify = async id => { await api.patch(`/admin/verifications/${id}`, { action: 'approve' }); setVerifications(p => p.filter(v => v.id !== id)) }
  const handleReject = async id => { await api.patch(`/admin/verifications/${id}`, { action: 'reject', rejection_reason: 'ID unclear' }); setVerifications(p => p.filter(v => v.id !== id)) }
  const handleSuspend = async (reportId, reportedId) => { await api.patch(`/admin/users/${reportedId}/status`, { status: 'suspended', suspension_reason: 'Multiple reports' }); await api.patch(`/admin/reports/${reportId}`, { action: 'suspend' }); setReports(p => p.filter(r => r.id !== reportId)) }

  const card = { background: '#161525', borderRadius: '14px', border: '1px solid #2a2940', padding: '24px', cursor:'pointer' }
  const stat = a => ({ ...card, padding: '22px 24px', position: 'relative', overflow: 'hidden', borderTop: `3px solid ${a}` })
  const tag  = (bg,c,b) => ({ display:'inline-flex',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:600,background:bg,color:c,border:`1px solid ${b}` })
  const btn  = (bg,c,b) => ({ background:bg,color:c,border:b?`1px solid ${b}`:'none',padding:'6px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:600,cursor:'pointer' })
  const ava  = (bg,sz=36) => ({ width:sz,height:sz,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:sz*.36,fontWeight:700,color:'#fff',flexShrink:0 })
  const ini  = n=>n.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
  const th   = { fontSize:'10px',fontWeight:700,textTransform:'uppercase',color:'#5a5978',padding:'8px 12px',borderBottom:'1px solid #2a2940',textAlign:'left' }
  const td   = { padding:'10px 12px',borderBottom:'1px solid #2a2940' }

  if (loading) return <div style={{ padding:'28px',color:'#8b8aad' }}>Loading dashboard...</div>

  return (
    <div style={{ padding:'28px',maxWidth:'1280px' }}>
      {/* KPIs */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px' }}>
        {[
          { n: analytics?.total_users ?? '—',           l:'Total Users',           c:'Click to view', accent:'#7c3aed', nc:'#a78bfa', ico:'👥', link:'/admin/users' },
          { n: analytics?.total_jobs  ?? '—',           l:'Active Job Posts',      c:'Click to view', accent:'#22c55e', nc:'#22c55e', ico:'📋', link:'/admin/jobs' },
          { n: analytics?.open_reports ?? '—',          l:'Open Reports',          c:'Needs review!', accent:'#f87171', nc:'#f87171', ico:'🚨', link:'/admin/reports' },
          { n: analytics?.pending_verifications ?? '—', l:'Pending Verifications', c:'Queue growing', accent:'#fbbf24', nc:'#fbbf24', ico:'🪪', link:'/admin/verifications' },
        ].map(({ n,l,c,accent,nc,ico,link })=>(
          <div key={l} style={stat(accent)} onClick={()=>navigate(link)}>
            <div style={{ position:'absolute',right:'18px',top:'18px',fontSize:'34px',opacity:.15 }}>{ico}</div>
            <div style={{ fontSize:'38px',fontWeight:800,lineHeight:1,color:nc }}>{n}</div>
            <div style={{ fontSize:'13px',color:'#8b8aad',marginTop:'4px' }}>{l}</div>
            <div style={{ fontSize:'11px',fontWeight:600,marginTop:'8px',color:nc }}>{c}</div>
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'20px' }}>
        {/* Weekly Platform Activity - stays non-clickable */}
        <div style={{ ...card, cursor:'default' }}>
          <div style={{ fontSize:'15px',fontWeight:700,marginBottom:'6px',color:'#f0eeff' }}>📊 Weekly Platform Activity</div>
          <div style={{ fontSize:'12px',color:'#8b8aad',marginBottom:'16px' }}>New jobs + applications per day</div>
          <div style={{ display:'flex',gap:'10px',alignItems:'flex-end',height:'130px',padding:'8px 0' }}>
            {[['Mon','35%'],['Tue','55%'],['Wed','72%'],['Thu','48%'],['Fri','90%'],['Sat','100%'],['Sun','78%']].map(([d,h])=>(
              <div key={d} style={{ display:'flex',flexDirection:'column',alignItems:'center',flex:1,gap:'6px' }}>
                <div style={{ background:'linear-gradient(180deg,#a78bfa,#7c3aed)',borderRadius:'6px 6px 0 0',width:'100%',height:h }} />
                <div style={{ fontSize:'10px',color:'#8b8aad',fontWeight:600 }}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginTop:'16px',borderTop:'1px solid #2a2940',paddingTop:'16px' }}>
            {[ [analytics?.total_jobs ?? '—','Jobs this week','#a78bfa'], [analytics?.total_users ?? '—','Total users','#22c55e'], [analytics?.hire_success_rate?`${analytics.hire_success_rate}%`:'—','Hire rate','#fbbf24'] ].map(([n,l,c])=><div key={l}><div style={{ fontSize:'22px',fontWeight:800,color:c }}>{n}</div><div style={{ fontSize:'11px',color:'#8b8aad' }}>{l}</div></div>)}
          </div>
        </div>

        {/* Pending Verifications */}
        <div style={card}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px' }}>
            <div style={{ fontSize:'15px',fontWeight:700,color:'#f0eeff' }}>🪪 Pending ID Verifications</div>
            <span style={tag('rgba(251,191,36,.12)','#fbbf24','rgba(251,191,36,.3)')}>{analytics?.pending_verifications ?? 0} queued</span>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
            {verifications.length===0?<div style={{ color:'#5a5978',fontSize:'13px' }}>No pending verifications.</div>:verifications.map(v=>(
              <div key={v.id} style={{ display:'flex',alignItems:'center',gap:'12px' }}>
                <div style={ava('linear-gradient(135deg,#22c55e,#15803d)')}>{ini(v.worker?.name)}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600,fontSize:'13px',color:'#f0eeff' }}>{v.worker?.name}</div>
                  <div style={{ fontSize:'11px',color:'#8b8aad' }}>Worker · {v.id_type} · {new Date(v.created_at).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}</div>
                </div>
                <div style={{ display:'flex',gap:'6px' }}>
                  <button style={btn('rgba(34,197,94,.12)','#22c55e','rgba(34,197,94,.3)')} onClick={()=>handleVerify(v.id)}>✓ Verify</button>
                  <button style={btn('rgba(248,113,113,.12)','#f87171','rgba(248,113,113,.3)')} onClick={()=>handleReject(v.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
          <button style={{ ...btn('transparent','#8b8aad','#2a2940'),width:'100%',marginTop:'12px',padding:'8px',display:'flex',justifyContent:'center' }} onClick={()=>navigate('/admin/verifications')}>
            View All {analytics?.pending_verifications ?? ''} Pending →
          </button>
        </div>
      </div>

      {/* Row 3 */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px' }}>
        {/* Reports */}
        <div style={card}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px' }}>
            <div style={{ fontSize:'15px',fontWeight:700,color:'#f0eeff' }}>🚨 Flagged Reports</div>
            <button style={btn('transparent','#8b8aad','#2a2940')} onClick={()=>navigate('/admin/reports')}>View All →</button>
          </div>
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead><tr>{['User','Reason','Action'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {reports.length===0?<tr><td colSpan={3} style={{ ...td,color:'#5a5978',fontSize:'13px' }}>No flagged reports.</td></tr>:reports.map(r=>{
                const isRed = ['Fake profile','Fake credentials'].includes(r.reason)
                return <tr key={r.id}>
                  <td style={{ ...td,color:'#f0eeff' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                      <div style={ava('linear-gradient(135deg,#60a5fa,#1d4ed8)',28)}>{ini(r.reported?.name)}</div>
                      <span style={{ fontWeight:600,fontSize:'13px' }}>{r.reported?.name}</span>
                    </div>
                  </td>
                  <td style={td}><span style={tag(isRed?'rgba(248,113,113,.12)':'rgba(251,191,36,.12)',isRed?'#f87171':'#fbbf24',isRed?'rgba(248,113,113,.3)':'rgba(251,191,36,.3)')}>{r.reason}</span></td>
                  <td style={td}><div style={{ display:'flex',gap:'6px' }}>
                    <button style={btn('rgba(248,113,113,.12)','#f87171','rgba(248,113,113,.3)')} onClick={()=>handleSuspend(r.id,r.reported_id)}>Suspend</button>
                    <button style={btn('transparent','#8b8aad','#2a2940')} onClick={()=>navigate('/admin/reports')}>Review</button>
                  </div></td>
                </tr>
              })}
            </tbody>
          </table>
        </div>

        {/* Categories */}
        <div style={card}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px' }}>
            <div style={{ fontSize:'15px',fontWeight:700,color:'#f0eeff' }}>🗂️ Service Categories</div>
            <button style={btn('#7c3aed','#fff')} onClick={()=>navigate('/admin/categories')}>+ Add</button>
          </div>
          {categories.length===0?<div style={{ color:'#5a5978',fontSize:'13px' }}>No categories yet.</div>:categories.map(cat=>(
            <div key={cat.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                <span style={{ fontSize:'18px' }}>{cat.emoji}</span>
                <span style={{ fontWeight:600,color:'#f0eeff' }}>{cat.name}</span>
                <span style={tag('rgba(34,197,94,.12)','#22c55e','rgba(34,197,94,.25)')}>{cat.jobs_count ?? 0} jobs</span>
              </div>
              <div style={{ display:'flex',gap:'6px' }}>
                <button style={btn('transparent','#8b8aad','#2a2940')} onClick={()=>navigate('/admin/categories')}>Edit</button>
                <button style={btn('rgba(248,113,113,.12)','#f87171','rgba(248,113,113,.3)')} onClick={()=>navigate('/admin/categories')}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}