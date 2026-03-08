import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/axios'

export default function WorkerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [apps, setApps] = useState([])
  const [jobs, setJobs] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null) // Modal state

  useEffect(() => {
    Promise.all([
      api.get('/worker/applications'),
      api.get('/worker/jobs'),
      api.get('/worker/profile'),
    ])
      .then(([aRes, jRes, pRes]) => {
        setApps(aRes.data ?? [])
        setJobs((jRes.data?.data ?? jRes.data ?? []).slice(0, 3))
        setProfile(pRes.data.worker_profile ?? {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const card = { background:'#fff', borderRadius:'14px', border:'1px solid #e2e8e2', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,.08)', cursor:'pointer' }
  const stat = (accent) => ({ background:'#fff', border:'1px solid #e2e8e2', borderRadius:'14px', padding:'20px 24px', borderTop:`3px solid ${accent}`, boxShadow:'0 1px 3px rgba(0,0,0,.08)' })
  const tag  = (bg,c,b) => ({ display:'inline-flex', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:600, background:bg, color:c, border:`1px solid ${b}` })

  const statusColor = {
    pending:      { bg:'#f1f5f1',             c:'#6b7280', b:'#e2e8e2' },
    under_review: { bg:'rgba(245,158,11,.1)', c:'#f59e0b', b:'rgba(245,158,11,.3)' },
    accepted:     { bg:'rgba(22,163,74,.1)',  c:'#16a34a', b:'rgba(22,163,74,.25)' },
    declined:     { bg:'rgba(239,68,68,.1)',  c:'#ef4444', b:'rgba(239,68,68,.3)' },
  }
  const statusLabel = { pending:'Pending', under_review:'Under Review', accepted:'Accepted', declined:'Declined' }

  const completed = apps.filter(a => a.status === 'accepted').length
  const pending   = apps.filter(a => ['pending','under_review'].includes(a.status)).length
  const avgRating = profile?.average_rating ?? user?.average_rating ?? 0
  const upcoming  = apps.filter(a => a.status === 'accepted' && a.job?.start_date).slice(0, 2)

  if (loading) return <div style={{ padding:'28px', color:'#6b7280' }}>Loading dashboard...</div>

  return (
    <div style={{ padding:'28px', maxWidth:'1280px' }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'24px' }}>
        {[
          { n:completed, l:'Jobs Accepted', c:`${completed} total`, accent:'#16a34a', nc:'#16a34a', clickable:false },
          { n:pending, l:'Pending Applications', c:'Under review', accent:'#3b82f6', nc:'#3b82f6', route:'/worker/applications', clickable:true },
          { n:avgRating > 0 ? `${avgRating}★` : '—', l:'Your Rating', c:avgRating >= 4.5 ? 'Top Worker! 🏆' : 'Keep going!', accent:'#f59e0b', nc:'#f59e0b', route:'/worker/profile', clickable:true },
          { n:`₱${(parseFloat(profile?.expected_rate)||0).toLocaleString()}`, l:'Your Rate', c:`per ${(profile?.rate_type??'Day').toLowerCase()}`, accent:'#7c3aed', nc:'#7c3aed', route:'/worker/profile', clickable:true },
        ].map(({ n,l,c,accent,nc,route,clickable }) => (
          <div key={l} style={{ ...stat(accent), cursor: clickable ? 'pointer' : 'default' }} onClick={() => clickable && navigate(route)}>
            <div style={{ fontSize:'32px', fontWeight:800, color:nc, fontFamily:'Syne,sans-serif' }}>{n}</div>
            <div style={{ fontSize:'13px', color:'#6b7280', marginTop:'2px' }}>{l}</div>
            <div style={{ fontSize:'11px', fontWeight:600, marginTop:'6px', color:nc }}>{c}</div>
          </div>
        ))}
      </div>

      {/* Jobs and Applications */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
        {/* Jobs Near You */}
        <div>
          <div style={{ marginBottom:'16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:'17px', fontWeight:800, fontFamily:'Syne,sans-serif' }}>🔥 Jobs Near You</div>
              <div style={{ fontSize:'13px', color:'#6b7280' }}>Open positions in your area</div>
            </div>
            <button onClick={() => navigate('/worker/browse-job')} style={{ background:'transparent', border:'1px solid #e2e8e2', padding:'6px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer', color:'#6b7280' }}>View All →</button>
          </div>

          {jobs.length === 0 ? (
            <div style={{ ...card, textAlign:'center', color:'#6b7280', padding:'32px', cursor:'default' }}>
              No open jobs right now. <span style={{ color:'#16a34a', cursor:'pointer' }} onClick={() => navigate('/worker/browse-job')}>Check again →</span>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {jobs.map(job => (
                <div key={job.id} style={card} onClick={() => setSelectedJob(job)}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                    <div style={{ fontSize:'32px' }}>{job.category?.emoji ?? '💼'}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontFamily:'Syne,sans-serif' }}>{job.title}</div>
                      <div style={{ fontSize:'13px', color:'#6b7280' }}>{job.employer?.employer_profile?.household_name ?? job.employer?.name} · 📍 {job.barangay}</div>
                      <div style={{ display:'flex', gap:'8px', marginTop:'8px' }}>
                        {job.category && <span style={tag('rgba(22,163,74,.1)','#16a34a','rgba(22,163,74,.25)')}>{job.category.name}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'22px', fontWeight:800, color:'#16a34a', fontFamily:'Syne,sans-serif' }}>₱{parseFloat(job.salary).toLocaleString()}</div>
                      <div style={{ fontSize:'11px', color:'#6b7280' }}>/{job.rate_type === 'Daily' ? 'day' : 'hr'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Activity */}
        <div>
          <div style={{ marginBottom:'16px' }}>
            <div style={{ fontSize:'17px', fontWeight:800, fontFamily:'Syne,sans-serif' }}>📊 Your Activity</div>
            <div style={{ fontSize:'13px', color:'#6b7280' }}>Recent applications</div>
          </div>

          <div style={{ ...card, marginBottom:'16px' }}>
            {apps.length === 0 ? (
              <div style={{ textAlign:'center', color:'#6b7280', padding:'20px', fontSize:'13px' }}>
                No applications yet. <span style={{ color:'#16a34a', cursor:'pointer' }} onClick={() => navigate('/worker/browse-job')}>Browse jobs →</span>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {apps.slice(0, 4).map(a => {
                  const st = statusColor[a.status] ?? statusColor.pending
                  return (
                    <div key={a.id} style={{ display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }} onClick={() => setSelectedJob(a.job)}>
                      <span style={{ fontSize:'13px', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.job?.title ?? 'Job'}</span>
                      <span style={tag(st.bg, st.c, st.b)}>{statusLabel[a.status] ?? a.status}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Upcoming Schedule */}
          <div style={{ ...card, cursor:'pointer' }} onClick={() => navigate('/worker/schedule')}>
            <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'12px' }}>📅 Upcoming Schedule</div>
            {upcoming.length === 0 ? (
              <div style={{ color:'#6b7280', fontSize:'13px', textAlign:'center', padding:'12px' }}>No upcoming jobs scheduled.</div>
            ) : upcoming.map(a => (
              <div key={a.id} style={{ background:'rgba(22,163,74,.08)', borderRadius:'10px', padding:'12px 14px', border:'1px solid rgba(22,163,74,.3)', marginBottom:'8px' }}>
                <div style={{ fontWeight:600, fontSize:'14px' }}>{a.job?.category?.emoji} {a.job?.title}</div>
                <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'2px' }}>
                  {new Date(a.job.start_date).toLocaleDateString('en-PH',{ month:'short',day:'numeric',year:'numeric' })}
                  {a.job.start_time ? ` · ${a.job.start_time}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Modal */}
      {selectedJob && (
        <div style={{
          position:'fixed', top:0, left:0, width:'100%', height:'100%',
          background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000
        }} onClick={() => setSelectedJob(null)}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', maxWidth:'500px', width:'90%', position:'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedJob(null)} style={{ position:'absolute', top:'12px', right:'12px', border:'none', background:'transparent', fontSize:'18px', cursor:'pointer' }}>×</button>
            <div style={{ fontSize:'22px', fontWeight:700 }}>{selectedJob.title}</div>
            <div style={{ margin:'8px 0', color:'#6b7280' }}>{selectedJob.employer?.employer_profile?.household_name ?? selectedJob.employer?.name} · 📍 {selectedJob.barangay}</div>
            <div style={{ margin:'8px 0' }}>
              <strong>Category:</strong> {selectedJob.category?.name ?? 'N/A'}
            </div>
            <div style={{ margin:'8px 0' }}>
              <strong>Salary:</strong> ₱{parseFloat(selectedJob.salary).toLocaleString()} / {selectedJob.rate_type === 'Daily' ? 'day' : 'hr'}
            </div>
            <div style={{ marginTop:'12px', fontSize:'13px', color:'#374151' }}>
              {selectedJob.description ?? 'No description provided.'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}