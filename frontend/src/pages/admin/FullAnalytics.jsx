import { useState, useEffect } from 'react' 
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function FullAnalytics() {
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  const card = { background:'#161525', borderRadius:'14px', border:'1px solid #2a2940', padding:'24px', cursor:'default' }
  const stat = (accent) => ({ ...card, padding:'22px 24px', position:'relative', overflow:'hidden', borderTop:`3px solid ${accent}`, cursor:'default' })
  const tag  = (bg,c,b) => ({ display:'inline-flex', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:600, background:bg, color:c, border:`1px solid ${b}` })

  if (loading) return <div style={{ padding:'28px', color:'#8b8aad' }}>Loading analytics...</div>
  if (!data)   return <div style={{ padding:'28px', color:'#f87171' }}>Failed to load analytics.</div>

  return (
    <div style={{ padding:'28px', maxWidth:'1280px' }}>
      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { n: data.total_users,     l:'Total Users',     accent:'#7c3aed', nc:'#a78bfa', ico:'👥' },
          { n: data.total_workers,   l:'Workers',         accent:'#22c55e', nc:'#22c55e', ico:'👷' },
          { n: data.total_employers, l:'Employers',       accent:'#fbbf24', nc:'#fbbf24', ico:'🏢' },
          { n: data.total_jobs,      l:'Total Job Posts', accent:'#60a5fa', nc:'#60a5fa', ico:'📋' },
        ].map(({ n,l,accent,nc,ico }) => (
          <div key={l} style={stat(accent)}>
            <div style={{ position:'absolute', right:'18px', top:'18px', fontSize:'34px', opacity:.15 }}>{ico}</div>
            <div style={{ fontSize:'38px', fontWeight:800, lineHeight:1, color:nc }}>{n ?? '—'}</div>
            <div style={{ fontSize:'13px', color:'#8b8aad', marginTop:'4px' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Platform KPIs & Top Barangays */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
        {/* Platform KPIs */}
        <div style={card}>
          <div style={{ fontSize:'15px', fontWeight:700, color:'#f0eeff', marginBottom:'16px' }}>📊 Platform KPIs</div>
          {[
            { l:'Hire Success Rate', v:`${data.hire_success_rate ?? 0}%`, c:'#22c55e' },
            { l:'Average Rating',    v:`${data.avg_rating ?? 0} ⭐`,       c:'#fbbf24' },
            { l:'Report Rate',       v:`${data.report_rate ?? 0}%`,      c:'#f87171' },
          ].map(({ l,v,c }) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #2a2940' }}>
              <span style={{ fontSize:'14px', color:'#8b8aad' }}>{l}</span>
              <span style={{ fontSize:'20px', fontWeight:800, color:c }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Top Barangays */}
        <div style={card}>
          <div style={{ fontSize:'15px', fontWeight:700, color:'#f0eeff', marginBottom:'16px' }}>📍 Top Barangays by Workers</div>
          {(data.top_barangays ?? []).length === 0
            ? <div style={{ color:'#5a5978', fontSize:'13px' }}>No data available.</div>
            : data.top_barangays.map((b,i) => (
                <div key={b.barangay} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid #2a2940' }}>
                  <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4c1d95)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:700, color:'#fff' }}>{i+1}</div>
                  <span style={{ flex:1, fontSize:'14px', color:'#f0eeff' }}>{b.barangay ?? 'Unknown'}</span>
                  <span style={tag('rgba(124,58,237,.12)', '#a78bfa', 'rgba(124,58,237,.3)')}>{b.count} workers</span>
                </div>
              ))
          }
        </div>
      </div>

      {/* Weekly Activity */}
      <div style={card}>
        <div style={{ fontSize:'15px', fontWeight:700, color:'#f0eeff', marginBottom:'6px' }}>📈 Weekly Activity</div>
        <div style={{ fontSize:'12px', color:'#8b8aad', marginBottom:'16px' }}>New users and jobs per day this week</div>
        <div style={{ display:'flex', gap:'10px', alignItems:'flex-end', height:'150px', padding:'8px 0' }}>
          {(data.weekly_activity ?? []).map(({ day, new_users, new_jobs }) => {
            const total = new_users + new_jobs
            const maxHeight = Math.max(...(data.weekly_activity.map(w => w.new_users + w.new_jobs))) || 1
            const height = `${(total / maxHeight) * 100}%`
            return (
              <div key={day} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, gap:'6px' }}>
                <div style={{ background:'linear-gradient(180deg,#a78bfa,#7c3aed)', borderRadius:'6px 6px 0 0', width:'100%', height }} />
                <div style={{ fontSize:'10px', color:'#8b8aad', fontWeight:600 }}>{day}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}