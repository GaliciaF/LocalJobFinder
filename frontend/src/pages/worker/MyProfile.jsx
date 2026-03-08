import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'

const ALL_DAYS = ['M','T','W','Th','F','Sa','Su']

export default function MyProfile() {
  const [profile,    setProfile]    = useState(null)
  const [barangays,  setBarangays]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [msg,        setMsg]        = useState({ type:'', text:'' })
  const [skillInput, setSkillInput] = useState('')
  const [preview,    setPreview]    = useState(null)
  const photoRef = useRef()

  useEffect(() => {
    Promise.all([
      api.get('/worker/profile'),
      api.get('/barangays'),
    ]).then(([profileRes, barangayRes]) => {
      const p = profileRes.data.worker_profile ?? {}
      setProfile({
        full_name:        p.full_name        ?? profileRes.data.name ?? '',
        phone:            p.phone            ?? '',
        email:            p.email            ?? '',
        barangay:         p.barangay         ?? '',
        purok:            p.purok            ?? '',
        bio:              p.bio              ?? '',
        skills:           p.skills           ?? [],
        years_experience: p.years_experience ?? 0,
        travel_distance:  p.travel_distance  ?? 'Up to 3km',
        expected_rate:    p.expected_rate    ?? '',
        rate_type:        p.rate_type        ?? 'Daily',
        negotiable:       p.negotiable       ?? true,
        is_available:     p.is_available     ?? true,
        work_days:        p.work_days        ?? ['M','T','W','Th','F'],
        work_start:       p.work_start       ?? '08:00',
        work_end:         p.work_end         ?? '17:00',
        photo_path:       p.photo_path       ?? null,
      })
      if (p.photo_path) setPreview(p.photo_path)
      setBarangays(barangayRes.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type:'', text:'' }), 3000) }

  const save = async () => {
    setSaving(true)
    try { await api.put('/worker/profile', profile); flash('success','Profile saved successfully.') }
    catch { flash('error','Failed to save. Please try again.') }
    finally { setSaving(false) }
  }

  const uploadPhoto = async (e) => {
    const file = e.target.files[0]; if (!file) return
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    const form = new FormData(); form.append('photo', file)
    try {
      const res = await api.post('/worker/profile/photo', form, { headers:{ 'Content-Type':'multipart/form-data' } })
      setProfile(p => ({ ...p, photo_path: res.data.photo_url }))
      setPreview(res.data.photo_url)
      flash('success','Photo updated.')
    } catch {
      setPreview(profile?.photo_path ?? null)
      flash('error','Photo upload failed.')
    }
  }

  const toggleDay   = (d) => setProfile(p => ({ ...p, work_days: p.work_days.includes(d) ? p.work_days.filter(x=>x!==d) : [...p.work_days,d] }))
  const addSkill    = () => { const s=skillInput.trim(); if(s && !profile.skills.includes(s)){ setProfile(p=>({...p,skills:[...p.skills,s]})); setSkillInput('') } }
  const removeSkill = (s) => setProfile(p => ({ ...p, skills: p.skills.filter(x=>x!==s) }))

  const ini = (name='') => name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  const Toggle = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{ position:'relative',width:'40px',height:'22px',flexShrink:0,cursor:'pointer' }}>
      <div style={{ position:'absolute',inset:0,background:on?'#16a34a':'#e2e8e2',borderRadius:'20px',transition:'background .25s' }} />
      <div style={{ position:'absolute',width:'16px',height:'16px',top:'3px',left:on?'21px':'3px',background:'#fff',borderRadius:'50%',transition:'left .25s' }} />
    </div>
  )

  const card = { background:'#fff',borderRadius:'14px',border:'1px solid #e2e8e2',padding:'24px',boxShadow:'0 1px 3px rgba(0,0,0,.08)' }
  const inp  = { width:'100%',padding:'10px 14px',border:'1.5px solid #e2e8e2',borderRadius:'9px',fontSize:'14px',background:'#fff',color:'#111827',outline:'none',boxSizing:'border-box' }
  const lbl  = { fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',color:'#6b7280',display:'block',marginBottom:'6px' }

  if (loading) return <div style={{ padding:'28px',color:'#6b7280' }}>Loading profile...</div>

  return (
    <div style={{ padding:'28px',maxWidth:'1280px' }}>
      {msg.text && (
        <div style={{ background:msg.type==='success'?'rgba(22,163,74,.1)':'rgba(239,68,68,.1)', border:`1px solid ${msg.type==='success'?'rgba(22,163,74,.3)':'rgba(239,68,68,.3)'}`, borderRadius:'10px',padding:'12px 16px',marginBottom:'16px',color:msg.type==='success'?'#16a34a':'#ef4444',fontSize:'13px',fontWeight:500 }}>
          {msg.text}
        </div>
      )}

      {/* Profile Header Banner */}
      <div style={{ ...card, marginBottom:'20px', padding:'0', overflow:'hidden' }}>
        {/* Green banner */}
        <div style={{ height:'100px', background:'linear-gradient(135deg,#16a34a,#15803d)', position:'relative' }}>
          <div style={{ position:'absolute',inset:0,opacity:.15,backgroundImage:'radial-gradient(circle at 20% 50%,#fff 1px,transparent 1px),radial-gradient(circle at 80% 20%,#fff 1px,transparent 1px)',backgroundSize:'40px 40px' }} />
        </div>
        <div style={{ padding:'0 28px 24px', display:'flex', alignItems:'flex-end', gap:'20px', marginTop:'-48px', position:'relative' }}>
          {/* Avatar */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{ width:'96px',height:'96px',borderRadius:'50%',border:'4px solid #fff',boxShadow:'0 2px 12px rgba(0,0,0,.15)',overflow:'hidden',background:'linear-gradient(135deg,#16a34a,#15803d)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              {preview
                ? <img src={preview} alt="Profile" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                : <span style={{ fontSize:'32px',fontWeight:700,color:'#fff' }}>{ini(profile.full_name)}</span>
              }
            </div>
            {/* Camera button */}
            <div onClick={() => photoRef.current.click()} style={{ position:'absolute',bottom:'2px',right:'2px',width:'26px',height:'26px',borderRadius:'50%',background:'#16a34a',border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'13px' }} title="Change photo">
              📷
            </div>
          </div>
          <input type="file" accept="image/*" ref={photoRef} style={{ display:'none' }} onChange={uploadPhoto} />
          {/* Name + status */}
          <div style={{ paddingBottom:'6px', flex:1 }}>
            <div style={{ fontSize:'20px',fontWeight:800,color:'#111827' }}>{profile.full_name || 'Your Name'}</div>
            <div style={{ fontSize:'13px',color:'#6b7280',marginTop:'2px' }}>
              {profile.barangay || 'No barangay set'}{profile.purok ? ` · ${profile.purok}` : ''}
            </div>
            <div style={{ display:'flex',gap:'8px',marginTop:'8px',flexWrap:'wrap' }}>
              <span style={{ display:'inline-flex',alignItems:'center',gap:'4px',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:600,background:profile.is_available?'rgba(22,163,74,.12)':'rgba(107,114,128,.1)',color:profile.is_available?'#16a34a':'#6b7280',border:`1px solid ${profile.is_available?'rgba(22,163,74,.3)':'rgba(107,114,128,.2)'}` }}>
                <span style={{ width:'6px',height:'6px',borderRadius:'50%',background:profile.is_available?'#16a34a':'#9ca3af' }} />
                {profile.is_available ? 'Available for Work' : 'Not Available'}
              </span>
              {profile.expected_rate && (
                <span style={{ padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:600,background:'rgba(22,163,74,.08)',color:'#15803d',border:'1px solid rgba(22,163,74,.2)' }}>
                  ₱{parseFloat(profile.expected_rate).toLocaleString()}/{profile.rate_type==='Daily'?'day':profile.rate_type==='Hourly'?'hr':'job'}
                </span>
              )}
            </div>
          </div>
          <button onClick={save} disabled={saving} style={{ padding:'10px 24px',background:'#16a34a',color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,fontSize:'14px',cursor:'pointer',alignSelf:'flex-end',marginBottom:'6px' }}>
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px' }}>
        {/* LEFT COLUMN */}
        <div style={{ display:'flex',flexDirection:'column',gap:'16px' }}>
          <div style={card}>
            <div style={{ fontSize:'15px',fontWeight:700,marginBottom:'14px' }}>👤 Personal Information</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px' }}>
              <div><label style={lbl}>Full Name</label><input style={inp} value={profile.full_name} onChange={e=>setProfile(p=>({...p,full_name:e.target.value}))} /></div>
              <div><label style={lbl}>Phone</label><input style={inp} value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} /></div>
              <div><label style={lbl}>Email</label><input style={inp} type="email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} /></div>
              <div><label style={lbl}>Purok</label><input style={inp} value={profile.purok} placeholder="Purok 3" onChange={e=>setProfile(p=>({...p,purok:e.target.value}))} /></div>
            </div>
            <div><label style={lbl}>Barangay</label>
              <select style={{ ...inp,appearance:'none' }} value={profile.barangay} onChange={e=>setProfile(p=>({...p,barangay:e.target.value}))}>
                <option value="">Select barangay</option>
                {barangays.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ marginTop:'12px' }}><label style={lbl}>Bio</label>
              <textarea style={{ ...inp,minHeight:'80px',resize:'vertical' }} value={profile.bio} onChange={e=>setProfile(p=>({...p,bio:e.target.value}))} placeholder="Tell employers about yourself..." />
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize:'15px',fontWeight:700,marginBottom:'12px' }}>🛠️ Skills & Services</div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'12px',minHeight:'32px' }}>
              {profile.skills.length === 0
                ? <div style={{ fontSize:'13px',color:'#9ca3af' }}>No skills added yet.</div>
                : profile.skills.map(s=>(
                  <div key={s} onClick={()=>removeSkill(s)} style={{ display:'flex',alignItems:'center',gap:'4px',background:'rgba(22,163,74,.1)',border:'1px solid rgba(22,163,74,.3)',borderRadius:'20px',padding:'5px 12px',fontSize:'12px',fontWeight:600,color:'#16a34a',cursor:'pointer' }} title="Click to remove">{s} ×</div>
                ))
              }
            </div>
            <div style={{ display:'flex',gap:'8px' }}>
              <input style={{ ...inp,flex:1 }} placeholder="Add skill (e.g. Plumbing)" value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSkill()} />
              <button onClick={addSkill} style={{ background:'#16a34a',color:'#fff',border:'none',padding:'10px 16px',borderRadius:'9px',fontSize:'13px',fontWeight:600,cursor:'pointer' }}>+ Add</button>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginTop:'12px' }}>
              <div><label style={lbl}>Years Experience</label><input style={inp} type="number" min="0" value={profile.years_experience} onChange={e=>setProfile(p=>({...p,years_experience:parseInt(e.target.value)||0}))} /></div>
              <div><label style={lbl}>Travel Distance</label>
                <select style={{ ...inp,appearance:'none' }} value={profile.travel_distance} onChange={e=>setProfile(p=>({...p,travel_distance:e.target.value}))}>
                  {['Within Barangay','Up to 1km','Up to 3km','Up to 5km','Anywhere'].map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display:'flex',flexDirection:'column',gap:'16px' }}>
          <div style={card}>
            <div style={{ fontSize:'15px',fontWeight:700,marginBottom:'12px' }}>💰 Rate & Availability</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px' }}>
              <div><label style={lbl}>Expected Rate (₱)</label><input style={inp} type="number" min="0" value={profile.expected_rate} onChange={e=>setProfile(p=>({...p,expected_rate:e.target.value}))} /></div>
              <div><label style={lbl}>Rate Type</label>
                <select style={{ ...inp,appearance:'none' }} value={profile.rate_type} onChange={e=>setProfile(p=>({...p,rate_type:e.target.value}))}>
                  {['Daily','Hourly','Per Service','Monthly'].map(r=><option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',padding:'12px',borderRadius:'10px',background:'#f9fafb',marginBottom:'10px' }}>
              <Toggle on={profile.negotiable} onToggle={()=>setProfile(p=>({...p,negotiable:!p.negotiable}))} />
              <div>
                <div style={{ fontSize:'13px',fontWeight:600 }}>Open to Negotiation</div>
                <div style={{ fontSize:'11px',color:'#6b7280' }}>Employers can discuss your rate</div>
              </div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',padding:'12px',borderRadius:'10px',background:profile.is_available?'rgba(22,163,74,.06)':'#f9fafb',border:`1px solid ${profile.is_available?'rgba(22,163,74,.2)':'#e2e8e2'}` }}>
              <Toggle on={profile.is_available} onToggle={()=>setProfile(p=>({...p,is_available:!p.is_available}))} />
              <div>
                <div style={{ fontSize:'13px',fontWeight:600 }}>Currently Available for Work</div>
                <div style={{ fontSize:'11px',color:'#6b7280' }}>Employers can see and contact you</div>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize:'15px',fontWeight:700,marginBottom:'12px' }}>📅 Weekly Availability</div>
            <label style={lbl}>Working Days</label>
            <div style={{ display:'flex',gap:'6px',marginBottom:'14px' }}>
              {ALL_DAYS.map(d => {
                const on = profile.work_days.includes(d)
                return <div key={d} onClick={()=>toggleDay(d)} style={{ width:'36px',height:'36px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:600,border:`1.5px solid ${on?'#16a34a':'#e2e8e2'}`,color:on?'#fff':'#6b7280',background:on?'#16a34a':'transparent',cursor:'pointer',transition:'all .15s' }}>{d}</div>
              })}
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px' }}>
              <div><label style={lbl}>Start Time</label><input style={inp} type="time" value={profile.work_start} onChange={e=>setProfile(p=>({...p,work_start:e.target.value}))} /></div>
              <div><label style={lbl}>End Time</label><input style={inp} type="time" value={profile.work_end} onChange={e=>setProfile(p=>({...p,work_end:e.target.value}))} /></div>
            </div>
          </div>

          {/* Photo upload card */}
          <div style={{ ...card, textAlign:'center' }}>
            <div style={{ fontSize:'15px',fontWeight:700,marginBottom:'12px' }}>🖼️ Profile Photo</div>
            <div style={{ display:'flex',justifyContent:'center',marginBottom:'14px' }}>
              <div style={{ width:'120px',height:'120px',borderRadius:'50%',border:'3px solid #e2e8e2',overflow:'hidden',background:'linear-gradient(135deg,#16a34a,#15803d)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(0,0,0,.1)' }}>
                {preview
                  ? <img src={preview} alt="Profile preview" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                  : <span style={{ fontSize:'40px',fontWeight:700,color:'#fff' }}>{ini(profile.full_name)}</span>
                }
              </div>
            </div>
            <div onClick={() => photoRef.current.click()} style={{ border:'2px dashed #e2e8e2',borderRadius:'12px',padding:'16px',cursor:'pointer',transition:'border-color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#16a34a'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#e2e8e2'}>
              <div style={{ fontSize:'24px',marginBottom:'6px' }}>📷</div>
              <div style={{ fontSize:'13px',fontWeight:600,color:'#374151' }}>Click to change photo</div>
              <div style={{ fontSize:'11px',color:'#9ca3af',marginTop:'2px' }}>JPG, PNG up to 5MB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}