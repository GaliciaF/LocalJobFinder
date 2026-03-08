import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function ReviewApplicants() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [applicants, setApplicants] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load all jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/employer/jobs', { params: { status: 'open' } })
        const jobData = Array.isArray(res.data) ? res.data : []
        setJobs(jobData)
        if (jobData.length > 0) loadApplicants(jobData[0].id)
        else setLoading(false)
      } catch (err) {
        console.error('Error fetching jobs:', err)
        setJobs([])
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  // Load applicants for a specific job
  const loadApplicants = async (jobId) => {
    setLoading(true)
    setSelectedJob(jobId)
    try {
      const res = await api.get(`/employer/jobs/${jobId}/applicants`)
      setApplicants(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error fetching applicants:', err)
      setApplicants([])
    } finally {
      setLoading(false)
    }
  }

  // Accept / Decline actions
  const handleAccept = async (appId) => {
    try {
      await api.patch(`/employer/applications/${appId}`, { status: 'accepted' })
      setApplicants(p => p.map(a => a.id === appId ? { ...a, status: 'accepted' } : a))
    } catch (err) { console.error(err) }
  }
  const handleDecline = async (appId) => {
    try {
      await api.patch(`/employer/applications/${appId}`, { status: 'declined' })
      setApplicants(p => p.map(a => a.id === appId ? { ...a, status: 'declined' } : a))
    } catch (err) { console.error(err) }
  }

  const card = { background: '#fff', borderRadius: '14px', border: '1px solid #e5e0d0', padding: '20px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
  const btn = (bg, c, b) => ({ background: bg, color: c, border: b ? `1px solid ${b}` : 'none', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' })
  const tag = (bg, c, b) => ({ display: 'inline-flex', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: bg, color: c, border: `1px solid ${b}` })
  const ava = (sz = 44) => ({ width: sz, height: sz, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: sz * 0.36, fontWeight: 700, color: '#fff', flexShrink: 0 })
  const ini = (n = '') => n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sTag = (s) => ({
    accepted: tag('rgba(22,163,74,.1)', '#16a34a', 'rgba(22,163,74,.3)'),
    declined: tag('rgba(239,68,68,.1)', '#ef4444', 'rgba(239,68,68,.3)'),
    pending: tag('rgba(245,158,11,.1)', '#f59e0b', 'rgba(245,158,11,.3)'),
    seen: tag('rgba(59,130,246,.1)', '#3b82f6', 'rgba(59,130,246,.3)')
  })[s] ?? tag('#f3f4f6', '#6b7280', '#e5e0d0')

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', background: '#fffdf5', minHeight: '100vh' }}>
      {/* Job selector */}
      {jobs.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {jobs.map(j => (
            <div key={j.id} onClick={() => loadApplicants(j.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: `1.5px solid ${selectedJob === j.id ? '#d97706' : '#e5e0d0'}`,
                fontSize: '12px',
                fontWeight: selectedJob === j.id ? 600 : 500,
                color: selectedJob === j.id ? '#d97706' : '#6b7280',
                cursor: 'pointer',
                background: selectedJob === j.id ? 'rgba(217,119,6,.08)' : 'transparent'
              }}>
              {j.category?.emoji} {j.title} ({j.applications_count ?? 0})
            </div>
          ))}
        </div>
      )}

      {loading ? <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Loading applicants...</div>
        : applicants.length === 0
          ? <div style={{ ...card, textAlign: 'center', color: '#6b7280', padding: '40px' }}>No applicants yet for this job.</div>
          : applicants.map(a => (
            <div key={a.id} style={card}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={ava()}>{ini(a.worker?.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'Syne,sans-serif' }}>{a.worker?.name}</div>
                    <span style={sTag(a.status)}>{a.status}</span>
                    {a.worker?.worker_profile?.id_verification_status === 'verified' &&
                      <span style={tag('rgba(22,163,74,.1)', '#16a34a', 'rgba(22,163,74,.3)')}>✓ Verified ID</span>}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
                    {a.worker?.worker_profile?.barangay} · ⭐ {a.worker?.avg_rating ?? 'New'} · {a.worker?.worker_profile?.years_experience ?? 0} yrs exp
                  </div>
                  {a.cover_message &&
                    <div style={{ fontSize: '13px', color: '#374151', background: '#fef9f0', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px', borderLeft: '3px solid #d97706' }}>
                      {a.cover_message}
                    </div>}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(a.status === 'pending' || a.status === 'seen') && <>
                      <button style={btn('rgba(22,163,74,.1)', '#16a34a', 'rgba(22,163,74,.3)')} onClick={() => handleAccept(a.id)}>✓ Accept</button>
                      <button style={btn('rgba(239,68,68,.1)', '#ef4444', 'rgba(239,68,68,.3)')} onClick={() => handleDecline(a.id)}>✕ Decline</button>
                    </>}
                    <button style={btn('transparent', '#6b7280', '#e5e0d0')} onClick={() => navigate('/employer/messages')}>💬 Message</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
    </div>
  )
}