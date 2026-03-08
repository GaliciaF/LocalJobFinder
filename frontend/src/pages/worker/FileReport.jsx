import { useState, useEffect } from 'react'
import api from '../../api/axios'

const REASONS = [
  'Harassment',
  'Fraud / Scam',
  'No-show',
  'Non-payment',
  'Unsafe working conditions',
  'Fake job post',
  'Inappropriate behavior',
  'Other'
]

export default function FileReport() {
  const [employers,  setEmployers]  = useState([])
  const [form, setForm] = useState({ reported_id:'', reason:'', details:'' })
  const [submitting, setSubmitting] = useState(false)
  const [msg,        setMsg]        = useState({ type:'', text:'' })

  useEffect(() => {
    api.get('/worker/applications')
      .then(r => {
        const seen = new Map()
        ;(r.data ?? []).forEach(a => { 
          const e = a.job?.employer
          if (e && !seen.has(e.id)) seen.set(e.id, e)
        })
        setEmployers([...seen.values()])
      })
      .catch(()=>{})
  }, [])

  const flash  = (type, text) => { 
    setMsg({ type, text }) 
    setTimeout(() => setMsg({ type:'', text:'' }), 3500) 
  }

  const submit = async () => {
    if (!form.reported_id || !form.reason || !form.details.trim()) {
      flash('error','Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    try { 
      await api.post('/worker/reports', form)
      flash('success','Report submitted. Admin will review within 24 hours.')
      setForm({ reported_id:'', reason:'', details:'' })
    } catch (e) { 
      flash('error', e.response?.data?.message ?? 'Failed to submit.')
    } finally { 
      setSubmitting(false) 
    }
  }

  const card = { background:'#fff', borderRadius:'14px', border:'1px solid #e2e8e2', padding:'24px', marginBottom:'16px', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }
  const inp  = { width:'100%', padding:'10px 14px', border:'1.5px solid #e2e8e2', borderRadius:'9px', fontSize:'13px', background:'#fff', color:'#111827', outline:'none', boxSizing:'border-box' }
  const lbl  = { fontSize:'12px', fontWeight:600, color:'#6b7280', display:'block', marginBottom:'6px' }

  return (
    <div style={{ padding:'28px', maxWidth:'680px' }}>
      {msg.text && (
        <div style={{ 
          background: msg.type==='success' ? 'rgba(22,163,74,.1)' : 'rgba(239,68,68,.1)',
          border: `1px solid ${msg.type==='success' ? 'rgba(22,163,74,.3)' : 'rgba(239,68,68,.3)'}`,
          borderRadius:'10px', padding:'12px 16px', marginBottom:'16px',
          color: msg.type==='success' ? '#16a34a' : '#ef4444',
          fontSize:'13px', fontWeight:500 
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.2)', borderRadius:'12px', padding:'14px 16px', marginBottom:'20px', fontSize:'13px', color:'#7f1d1d' }}>
        🚨 Reports are reviewed by our admin team. Filing a false report may result in account suspension.
      </div>

      <div style={card}>
        <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'16px' }}>📋 File a Report</div>

        <div style={{ marginBottom:'14px' }}>
          <label style={lbl}>Report Against *</label>
          <select
            style={inp}
            value={form.reported_id}
            onChange={e => setForm(f => ({ ...f, reported_id: e.target.value }))}
          >
            <option value="">Select employer...</option>
            {employers.map(e => (
              <option key={e.id} value={e.id}>
                {e.employer_profile?.household_name ?? e.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom:'14px' }}>
          <label style={lbl}>Reason *</label>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {REASONS.map(r => (
              <div
                key={r}
                onClick={() => setForm(f => ({ ...f, reason: r }))}
                style={{ 
                  padding:'10px 12px',
                  border: `1.5px solid ${form.reason===r ? '#ef4444' : '#e2e8e2'}`,
                  borderRadius:'9px', fontSize:'13px', cursor:'pointer',
                  background: form.reason===r ? 'rgba(239,68,68,.06)' : '#fff',
                  color: form.reason===r ? '#ef4444' : '#374151',
                  fontWeight: form.reason===r ? 600 : 400
                }}
              >
                {r}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Details*</label>
          <textarea
            rows={5}
            style={{ ...inp, resize:'vertical' }}
            value={form.details}
            onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
            placeholder="Describe the incident in detail..."
          />
        </div>

        <button
          onClick={submit}
          disabled={submitting}
          style={{ 
            width:'100%', padding:'12px', background:'#ef4444', color:'#fff',
            border:'none', borderRadius:'10px', fontWeight:700, fontSize:'14px',
            cursor:'pointer', opacity: submitting ? 0.7 : 1 
          }}
        >
          {submitting ? 'Submitting...' : '🚨 Submit Report'}
        </button>
      </div>
    </div>
  )
}