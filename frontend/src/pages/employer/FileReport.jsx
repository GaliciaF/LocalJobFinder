import { useState, useEffect } from 'react'
import api from '../../api/axios'

const REASONS = ['No-show', 'Payment dispute', 'Rude behavior', 'Fake profile', 'Unsafe behavior', 'Other']

export default function FileReport() {
  const [workers,        setWorkers]        = useState([])
  const [form,           setForm]           = useState({ reported_id:'', reason:'', details:'' })
  const [selectedReason, setSelectedReason] = useState(null)
  const [submitting,     setSubmitting]     = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [err,            setErr]            = useState('')

  useEffect(() => {
    api.get('/employer/jobs', { params: { status:'filled' } }).then(res => {
      const seen = new Map()
      ;(res.data ?? []).forEach(job => {
        const w = job.hired_worker
        if (w && !seen.has(w.id)) seen.set(w.id, w)
      })
      setWorkers([...seen.values()])
    }).catch(() => {})
  }, [])

  const handleSubmit = async () => {
    setErr('')
    if (!form.reported_id || selectedReason === null || !form.details.trim()) {
      setErr('Please fill in all required fields.'); return
    }
    setSubmitting(true)
    try {
      await api.post('/employer/reports', { ...form, reason: REASONS[selectedReason] })
      setSaved(true)
      setForm({ reported_id:'', reason:'', details:'' })
      setSelectedReason(null)
    } catch { setErr('Failed to submit report. Please try again.') }
    finally { setSubmitting(false) }
  }

  const card = { background:'#fff', borderRadius:'14px', border:'1px solid #e5e0d0', padding:'24px', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }
  const inp  = { padding:'9px 12px', border:'1.5px solid #e5e0d0', borderRadius:'9px', fontSize:'13px', background:'#fffdf5', color:'#111827', outline:'none', width:'100%', boxSizing:'border-box' }
  const btn  = (bg,c,b) => ({ background:bg, color:c, border:b?`1px solid ${b}`:'none', padding:'8px 18px', borderRadius:'9px', fontSize:'13px', fontWeight:600, cursor:'pointer', opacity:submitting?0.7:1 })

  if (saved) return (
    <div style={{ padding:'28px', maxWidth:'700px' }}>
      <div style={{ ...card, textAlign:'center', padding:'48px' }}>
        <div style={{ fontSize:'44px', marginBottom:'16px' }}>✅</div>
        <div style={{ fontSize:'18px', fontWeight:700, marginBottom:'8px' }}>Report Submitted</div>
        <div style={{ fontSize:'14px', color:'#6b7280', marginBottom:'24px' }}>Our admin team will review it within 24 hours.</div>
        <button style={btn('#d97706','#fff')} onClick={() => setSaved(false)}>Submit Another Report</button>
      </div>
    </div>
  )

  return (
    <div style={{ padding:'28px', maxWidth:'700px', background:'#fffdf5', minHeight:'100vh' }}>
      <div style={{ background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.2)', borderRadius:'12px', padding:'12px 16px', marginBottom:'20px', fontSize:'13px', color:'#7f1d1d' }}>
        🚨 Filing a false report may result in account suspension. Only report genuine violations.
      </div>
      {err && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', color:'#ef4444', fontSize:'13px' }}>{err}</div>}
      <div style={card}>
        <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'18px' }}>🚨 File a Report Against a Worker</div>

        <div style={{ marginBottom:'16px' }}>
          <div style={{ fontSize:'12px', fontWeight:600, color:'#6b7280', marginBottom:'6px' }}>Worker *</div>
          <select value={form.reported_id} onChange={e=>setForm(f=>({...f,reported_id:e.target.value}))} style={{ ...inp, appearance:'none' }}>
            <option value="">Select a worker you hired...</option>
            {workers.map(w => <option key={w.id} value={w.id}>{w.name}{w.worker_profile?.barangay ? ` · ${w.worker_profile.barangay}` : ''}</option>)}
          </select>
          {workers.length === 0 && <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'4px' }}>Only workers hired through your jobs will appear here.</div>}
        </div>

        <div style={{ marginBottom:'16px' }}>
          <div style={{ fontSize:'12px', fontWeight:600, color:'#6b7280', marginBottom:'8px' }}>Reason *</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {REASONS.map((r, i) => (
              <div key={r} onClick={() => setSelectedReason(i)} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', border:`1.5px solid ${selectedReason===i?'#d97706':'#e5e0d0'}`, borderRadius:'10px', cursor:'pointer', background:selectedReason===i?'rgba(217,119,6,.06)':'#fff' }}>
                <div style={{ width:'16px', height:'16px', borderRadius:'50%', border:`2px solid ${selectedReason===i?'#d97706':'#e5e0d0'}`, background:selectedReason===i?'#d97706':'transparent', flexShrink:0 }} />
                <span style={{ fontSize:'14px', fontWeight:selectedReason===i?600:400, color:selectedReason===i?'#d97706':'#111827' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:'20px' }}>
          <div style={{ fontSize:'12px', fontWeight:600, color:'#6b7280', marginBottom:'6px' }}>Details *</div>
          <textarea value={form.details} onChange={e=>setForm(f=>({...f,details:e.target.value}))} rows={4} placeholder="Describe what happened in detail..." style={{ ...inp, resize:'vertical' }} />
        </div>

        <button style={btn('#ef4444','#fff')} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : '🚨 Submit Report'}
        </button>
      </div>
    </div>
  )
}