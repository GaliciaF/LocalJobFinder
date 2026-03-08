// PostJob.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function PostJob() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    title: '',
    category_id: '',
    custom_category: '',
    description: '',
    salary: '',
    rate_type: 'Daily',
    negotiable: false,
    barangay: '',
    purok: '',
    start_date: '',
    start_time: '',
    notify_nearby: true
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  // fetch categories from backend
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(() => setErr('Failed to load categories.'))
  }, [])

  // Barangays of Trinidad, Bohol
  const barangays = [
    'Banlasan', 'Bongbong', 'Catoogan', 'Guinobatan', 'Hinlayagan Ilaud', 
    'Hinlayagan Ilaya', 'Kauswagan', 'Kinan‑oan', 'La Union', 'La Victoria',
    'Mabuhay Cabigohan', 'Mahagbu', 'Manuel A. Roxas', 'Poblacion', 
    'San Isidro', 'San Vicente', 'Santo Tomas', 'Soom', 'Tagum Norte', 'Tagum Sur'
  ]

  // Placeholder puroks per barangay
  const puroksByBarangay = {
    'Banlasan': ['Purok 1', 'Purok 2', 'Purok 3'],
    'Bongbong': ['Purok 1', 'Purok 2', 'Purok 3'],
    'Catoogan': ['Purok 1', 'Purok 2'],
    'Guinobatan': ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4'],
    'Hinlayagan Ilaud': ['Purok 1', 'Purok 2'],
    'Hinlayagan Ilaya': ['Purok 1', 'Purok 2', 'Purok 3'],
    'Kauswagan': ['Purok 1', 'Purok 2'],
    'Kinan‑oan': ['Purok 1', 'Purok 2'],
    'La Union': ['Purok 1', 'Purok 2'],
    'La Victoria': ['Purok 1', 'Purok 2'],
    'Mabuhay Cabigohan': ['Purok 1', 'Purok 2'],
    'Mahagbu': ['Purok 1', 'Purok 2'],
    'Manuel A. Roxas': ['Purok 1', 'Purok 2'],
    'Poblacion': ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4'],
    'San Isidro': ['Purok 1', 'Purok 2'],
    'San Vicente': ['Purok 1', 'Purok 2', 'Purok 3'],
    'Santo Tomas': ['Purok 1', 'Purok 2'],
    'Soom': ['Purok 1', 'Purok 2'],
    'Tagum Norte': ['Purok 1', 'Purok 2'],
    'Tagum Sur': ['Purok 1', 'Purok 2']
  }

  const currentPuroks = form.barangay ? puroksByBarangay[form.barangay] || [] : []

  const handleSubmit = async () => {
    setErr('')
    if (!form.title.trim()) return setErr('Job title is required.')
    if (!form.category_id && !(form.custom_category && form.custom_category.trim()))
      return setErr('Category is required.')
    if (!form.salary || isNaN(parseFloat(form.salary))) return setErr('Salary must be a number.')
    if (!form.barangay) return setErr('Barangay is required.')
    if (!form.purok.trim()) return setErr('Purok is required.')

    setSaving(true)
    try {
      await api.post('/employer/jobs', {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        category_name: form.custom_category?.trim() || undefined,
        salary: parseFloat(form.salary)
      })
      navigate('/employer/jobs')
    } catch (e) {
      setErr(e.response?.data?.message ?? 'Failed to post job.')
    } finally {
      setSaving(false)
    }
  }

  const card = { background:'#fff', borderRadius:'14px', border:'1px solid #e5e0d0', padding:'24px', marginBottom:'16px', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }
  const inp  = { padding:'9px 12px', border:'1.5px solid #e5e0d0', borderRadius:'9px', fontSize:'13px', background:'#fffdf5', color:'#111827', outline:'none', width:'100%', boxSizing:'border-box' }
  const lbl  = { fontSize:'12px', fontWeight:600, color:'#6b7280', marginBottom:'6px', display:'block' }
  const btn  = (bg,c,b) => ({ background:bg, color:c, border:b?`1px solid ${b}`:'none', padding:'8px 18px', borderRadius:'9px', fontSize:'13px', fontWeight:600, cursor:'pointer' })

  return (
    <div style={{ padding:'28px', maxWidth:'800px', background:'#fffdf5', minHeight:'100vh' }}>
      {err && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', color:'#ef4444', fontSize:'13px' }}>{err}</div>}

      <div style={card}>
        <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'16px' }}>📢 Post a New Job</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>

          {/* Job Title */}
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Job Title</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Plumber Needed" style={inp} />
          </div>

          {/* Category (dropdown + custom input) */}
          <div>
            <label style={lbl}>Category</label>
            <select
              value={form.category_id}
              onChange={e => {
                const val = e.target.value
                if (val === 'custom') {
                  setForm(f => ({ ...f, category_id: '', custom_category: '' }))
                } else {
                  setForm(f => ({ ...f, category_id: Number(val), custom_category: undefined }))
                }
              }}
              style={{ ...inp, marginBottom:'6px' }}
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
              ))}
              <option value="custom">Other (type below)</option>
            </select>

            {form.category_id === '' && form.custom_category !== undefined && (
              <input
                type="text"
                placeholder="Or type your category here"
                value={form.custom_category || ''}
                onChange={e => setForm(f => ({ ...f, custom_category: e.target.value }))}
                style={inp}
              />
            )}
          </div>

          {/* Rate Type */}
          <div>
            <label style={lbl}>Rate Type</label>
            <select value={form.rate_type} onChange={e=>setForm(f=>({...f,rate_type:e.target.value}))} style={inp}>
              {['Daily','Hourly','Per Service','Monthly'].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>

          {/* Salary */}
          <div>
            <label style={lbl}>Salary Amount (₱)</label>
            <input type="number" value={form.salary} onChange={e=>setForm(f=>({...f,salary:e.target.value}))} placeholder="800" style={inp} />
          </div>

          {/* Barangay */}
          <div>
            <label style={lbl}>Barangay</label>
            <select value={form.barangay} onChange={e=>setForm(f=>({...f, barangay:e.target.value, purok:''}))} style={inp}>
              <option value="">Select barangay</option>
              {barangays.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>

          {/* Purok (dynamic + free-text) */}
          <div>
            <label style={lbl}>Purok / Street</label>
            <select
              value={form.purok}
              onChange={e=>setForm(f=>({...f,purok:e.target.value}))}
              style={{ ...inp, marginBottom:'6px' }}
            >
              <option value="">Select purok (or type below)</option>
              {currentPuroks.map(p => <option key={p}>{p}</option>)}
            </select>
            <input
              placeholder="Or type your purok here"
              value={form.purok}
              onChange={e=>setForm(f=>({...f,purok:e.target.value}))}
              style={inp}
            />
          </div>

          {/* Start Date */}
          <div>
            <label style={lbl}>Start Date</label>
            <input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))} style={inp} />
          </div>

          {/* Start Time */}
          <div>
            <label style={lbl}>Start Time</label>
            <input type="time" value={form.start_time} onChange={e=>setForm(f=>({...f,start_time:e.target.value}))} style={inp} />
          </div>

          {/* Job Description */}
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Job Description</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4} placeholder="Describe the job in detail..." style={{ ...inp, resize:'vertical' }} />
          </div>

          {/* Negotiable toggle */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div onClick={()=>setForm(f=>({...f,negotiable:!f.negotiable}))} style={{ width:'40px', height:'22px', borderRadius:'11px', background:form.negotiable?'#d97706':'#e5e0d0', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:'3px', left:form.negotiable?'21px':'3px', width:'16px', height:'16px', borderRadius:'50%', background:'#fff', transition:'left .2s' }} />
            </div>
            <span style={{ fontSize:'13px', color:'#6b7280' }}>Salary is negotiable</span>
          </div>

          {/* Notify nearby toggle */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div onClick={()=>setForm(f=>({...f,notify_nearby:!f.notify_nearby}))} style={{ width:'40px', height:'22px', borderRadius:'11px', background:form.notify_nearby?'#d97706':'#e5e0d0', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:'3px', left:form.notify_nearby?'21px':'3px', width:'16px', height:'16px', borderRadius:'50%', background:'#fff', transition:'left .2s' }} />
            </div>
            <span style={{ fontSize:'13px', color:'#6b7280' }}>Notify nearby workers</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ marginTop:'20px', display:'flex', gap:'10px' }}>
          <button style={btn('#d97706','#fff')} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Posting...' : '📢 Post Job'}
          </button>
          <button style={btn('transparent','#6b7280','#e5e0d0')} onClick={()=>navigate('/employer/jobs')}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}