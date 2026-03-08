import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function EmployerDashboard() {
  const navigate = useNavigate()
  const [jobs, setJobs]       = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/employer/jobs'), api.get('/employer/profile')])
      .then(([jRes, pRes]) => {
        setJobs(Array.isArray(jRes.data) ? jRes.data : [])
        setProfile(pRes.data?.employer_profile ?? {})
      })
      .finally(() => setLoading(false))
  }, [])

  const card = { background:'#fff',borderRadius:'14px',border:'1px solid #e5e0d0',padding:'24px',boxShadow:'0 1px 3px rgba(0,0,0,.08)' }
  const stat = (a) => ({ ...card,padding:'20px 24px',borderTop:`3px solid ${a}`, cursor:'pointer' })
  const tag  = (bg,c,b) => ({ display:'inline-flex',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:600,background:bg,color:c,border:`1px solid ${b}` })
  const btn  = (bg,c,b) => ({ background:bg,color:c,border:b?`1px solid ${b}`:'none',padding:'7px 14px',borderRadius:'8px',fontSize:'12px',fontWeight:600,cursor:'pointer' })

  const activeJobs = jobs.filter(j=>j.status==='open')
  const totalApplicants = jobs.reduce((s,j)=>s+(j.applications_count??0),0)

  if (loading) return <div style={{ padding:'28px',color:'#6b7280' }}>Loading dashboard...</div>

  return (
    <div style={{ padding:'28px',maxWidth:'1280px',background:'#fffdf5',minHeight:'100vh' }}>
      {/* KPIs */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px' }}>
        {[
          { n:activeJobs.length, l:'Active Job Posts', c:'Receiving applicants', accent:'#d97706', nc:'#d97706', route:'/employer/jobs' },
          { n:totalApplicants,   l:'New Applicants', c:'Needs your review!', accent:'#ef4444', nc:'#ef4444', route:'/employer/applicants' },
          { n:jobs.filter(j=>j.status==='filled').length, l:'Workers Hired', c:'↑ 3 this month', accent:'#16a34a', nc:'#16a34a', route:'/employer/jobs' },
          { n:'4.9★', l:'Your Rating', c:'Top Employer!', accent:'#7c3aed', nc:'#7c3aed' }
        ].map(({ n,l,c,accent,nc,route }) => (
          <div key={l} style={stat(accent)} onClick={() => route && navigate(route)}>
            <div style={{ fontSize:'32px',fontWeight:800,color:nc,fontFamily:'Syne,sans-serif' }}>{n}</div>
            <div style={{ fontSize:'13px',color:'#6b7280',marginTop:'2px' }}>{l}</div>
            <div style={{ fontSize:'11px',fontWeight:600,marginTop:'6px',color:nc }}>{c}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px' }}>
        {/* Left column: Active Jobs */}
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px' }}>
            <div style={{ fontSize:'17px',fontWeight:800,fontFamily:'Syne,sans-serif' }}>📋 Your Active Job Posts</div>
            <button style={btn('#d97706','#fff')} onClick={()=>navigate('/employer/create-job')}>+ Post New Job</button>
          </div>
          {activeJobs.length===0
            ? <div style={{ ...card,textAlign:'center',color:'#6b7280',padding:'32px' }}>
                No active jobs. <span style={{ color:'#d97706',cursor:'pointer' }} onClick={()=>navigate('/employer/create-job')}>Post one now →</span>
              </div>
            : activeJobs.map(j=>(
              <div key={j.id} style={{ ...card,marginBottom:'12px',cursor:'pointer',transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#d97706';e.currentTarget.style.boxShadow='0 4px 20px rgba(245,158,11,.2)';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e5e0d0';e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,.08)';e.currentTarget.style.transform='translateY(0)'}}
                onClick={()=>navigate(`/employer/jobs/${j.id}`)}>
                <div style={{ display:'flex',alignItems:'flex-start',gap:'12px' }}>
                  <div style={{ fontSize:'32px' }}>{j.category?.emoji??'📋'}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,fontFamily:'Syne,sans-serif',marginBottom:'4px' }}>{j.title}</div>
                    <div style={{ fontSize:'13px',color:'#6b7280' }}>{j.barangay} · ₱{parseFloat(j.salary).toLocaleString()}/{j.rate_type==='Daily'?'day':'hr'}</div>
                    <div style={{ marginTop:'8px' }}>
                      <span style={j.applications_count>0 ? tag('rgba(239,68,68,.1)','#ef4444','rgba(239,68,68,.3)') : tag('#f3f4f6','#6b7280','#e5e0d0')}>
                        {j.applications_count??0} Applicants
                      </span>
                    </div>
                  </div>
                  {j.applications_count>0 && (
                    <button style={btn('#d97706','#fff')} onClick={e=>{e.stopPropagation();navigate(`/employer/jobs/${j.id}/applicants`)}}>Review →</button>
                  )}
                </div>
              </div>
            ))
          }
        </div>

        {/* Right column: Applicants & Schedule */}
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px' }}>
            <div style={{ fontSize:'17px',fontWeight:800,fontFamily:'Syne,sans-serif' }}>👷 Recent Applicants</div>
            <button style={btn('transparent','#6b7280','#e5e0d0')} onClick={()=>navigate('/employer/applicants')}>View All →</button>
          </div>
          <div style={card} onClick={()=>navigate('/employer/applicants')}>
            <div style={{ fontSize:'13px',color:'#6b7280',textAlign:'center',padding:'20px',cursor:'pointer' }}>
              {totalApplicants > 0 ? `${totalApplicants} applicant(s) waiting for review.` : 'No applicants yet.'}<br/>
              <span style={{ color:'#d97706',cursor:'pointer',fontWeight:600 }}>Go to Review Applicants →</span>
            </div>
          </div>

          <div style={{ marginTop:'16px' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px' }}>
              <div style={{ fontSize:'14px',fontWeight:700 }}>🗓️ Upcoming Schedule</div>
              <button style={btn('transparent','#6b7280','#e5e0d0')} onClick={()=>navigate('/employer/jobs')}>View Jobs →</button>
            </div>
            <div style={card}>
              {jobs.filter(j=>j.start_date).length===0
                ? <div style={{ color:'#6b7280',fontSize:'13px',textAlign:'center',padding:'12px' }}>No upcoming scheduled jobs.</div>
                : jobs.filter(j=>j.start_date).slice(0,3).map(j=>(
                  <div key={j.id} style={{ background:'rgba(217,119,6,.04)',borderRadius:'10px',padding:'12px 14px',border:'1px solid rgba(217,119,6,.2)',marginBottom:'8px',cursor:'pointer' }}
                       onClick={()=>navigate(`/employer/jobs/${j.id}`)}>
                    <div style={{ fontWeight:600,fontSize:'14px' }}>{j.category?.emoji} {j.title}</div>
                    <div style={{ fontSize:'12px',color:'#6b7280',marginTop:'2px' }}>{new Date(j.start_date).toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}