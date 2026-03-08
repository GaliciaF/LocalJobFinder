import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function MyProfile() {
  const [profile, setProfile] = useState({ household_name:'', phone:'', alt_phone:'', email:'', barangay:'', purok:'' })
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  const [barangays, setBarangays] = useState([])

  // Fetch profile and barangays on mount
  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/employer/profile'),
      api.get('/barangays') // your backend endpoint for seeder
    ])
      .then(([profileRes, barangayRes]) => {
        const p = profileRes.data.employer_profile ?? {}
        setProfile(prev => ({ ...prev, ...p }))

        // Handle both array of strings or array of objects {id, name}
        const bData = barangayRes.data ?? []
        if (bData.length > 0) {
          if (typeof bData[0] === 'string') setBarangays(bData)
          else if (typeof bData[0] === 'object') setBarangays(bData.map(b => b.name))
        }
      })
      .catch(() => setBarangays([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setErr('')
    try {
      await api.put('/employer/profile', profile)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setErr('Failed to save. Please try again.')
    }
  }

  const handlePhoto = async (e) => {
    const file = e.target.files[0]; if(!file) return
    const form = new FormData(); form.append('photo', file)
    await api.post('/employer/profile/photo', form, { headers:{ 'Content-Type':'multipart/form-data' } })
  }

  const card = { background:'#fff', borderRadius:'14px', border:'1px solid #e5e0d0', padding:'24px', marginBottom:'16px', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }
  const inp  = { padding:'9px 12px', border:'1.5px solid #e5e0d0', borderRadius:'9px', fontSize:'13px', background:'#fffdf5', color:'#111827', outline:'none', width:'100%', boxSizing:'border-box' }
  const btn  = (bg,c,b) => ({ background:bg, color:c, border:b?`1px solid ${b}`:'none', padding:'8px 18px', borderRadius:'9px', fontSize:'13px', fontWeight:600, cursor:'pointer' })
  const lbl  = { fontSize:'12px', fontWeight:600, color:'#6b7280', marginBottom:'6px', display:'block' }

  if (loading) return <div style={{ padding:'28px', color:'#6b7280' }}>Loading profile...</div>

  return (
    <div style={{ padding:'28px', maxWidth:'900px', background:'#fffdf5', minHeight:'100vh' }}>
      {saved && <div style={{ background:'rgba(22,163,74,.1)', border:'1px solid rgba(22,163,74,.3)', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', color:'#16a34a', fontSize:'13px', fontWeight:500 }}>✓ Profile saved successfully.</div>}
      {err && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', color:'#ef4444', fontSize:'13px' }}>{err}</div>}

      {/* Photo */}
      <div style={card}>
        <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'16px' }}>🏡 Employer Profile</div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'linear-gradient(135deg,#d97706,#b45309)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', fontWeight:700, color:'#fff' }}>
            {(profile.household_name||'E').charAt(0).toUpperCase()}
          </div>
          <div>
            <label style={{ ...btn('#d97706','#fff'), display:'inline-block', cursor:'pointer' }}>
              Upload Photo <input type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
            </label>
            <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'6px' }}>JPG, PNG up to 5MB</div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={card}>
        <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'16px' }}>📋 Household / Business Info</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div><label style={lbl}>Household / Business Name</label><input value={profile.household_name??''} onChange={e=>setProfile(p=>({...p, household_name:e.target.value}))} style={inp} /></div>
          <div><label style={lbl}>Contact Number</label><input value={profile.phone??''} onChange={e=>setProfile(p=>({...p, phone:e.target.value}))} style={inp} /></div>
          <div><label style={lbl}>Alt. Number</label><input value={profile.alt_phone??''} onChange={e=>setProfile(p=>({...p, alt_phone:e.target.value}))} style={inp} /></div>
          <div><label style={lbl}>Email Address</label><input value={profile.email??''} onChange={e=>setProfile(p=>({...p, email:e.target.value}))} type="email" style={inp} /></div>
          <div>
            <label style={lbl}>Barangay</label>
            <select value={profile.barangay??''} onChange={e=>setProfile(p=>({...p, barangay:e.target.value}))} style={inp}>
              <option value="">Select barangay</option>
              {barangays.map((b, i) => <option key={i} value={b}>{b}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Purok</label><input value={profile.purok??''} onChange={e=>setProfile(p=>({...p, purok:e.target.value}))} placeholder="Purok 3" style={inp} /></div>
        </div>
        <div style={{ marginTop:'16px', display:'flex', gap:'10px' }}>
          <button style={btn('#d97706','#fff')} onClick={handleSave}>Save Changes</button>
          <button style={btn('transparent','#6b7280','#e5e0d0')} onClick={()=>window.location.reload()}>Cancel</button>
        </div>
      </div>
    </div>
  )
}