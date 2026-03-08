import { useState, useEffect } from 'react'
import api from '../../api/axios'

export default function SystemSettings() {

  const [settings, setSettings] = useState({
    platform_name:'',
    municipality:'',
    admin_email:'',
    support_phone:'',
    barangays:[]
  })

  const [loading, setLoading]   = useState(true)
  const [saved, setSaved]       = useState(false)
  const [newBrgy, setNewBrgy]   = useState('')

  // Load settings + barangays
  useEffect(() => {

    const loadData = async () => {
      try {

        const [settingsRes, brgyRes] = await Promise.all([
          api.get('/admin/settings'),
          api.get('/barangays')
        ])

        setSettings(s => ({
          ...s,
          ...settingsRes.data,
          barangays: brgyRes.data || []
        }))

      } catch (err) {
        console.error('Failed loading settings:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()

  }, [])

  const handleSave = async () => {
    await api.put('/admin/settings', settings)
    setSaved(true)
    setTimeout(()=>setSaved(false), 2000)
  }

  const addBrgy = () => {
    if (!newBrgy.trim()) return
    setSettings(s=>({ ...s, barangays:[...s.barangays, newBrgy.trim()] }))
    setNewBrgy('')
  }

  const removeBrgy = (i) =>
    setSettings(s=>({ ...s, barangays: s.barangays.filter((_,idx)=>idx!==i) }))

  const card = {
    background:'#161525',
    borderRadius:'14px',
    border:'1px solid #2a2940',
    padding:'24px',
    marginBottom:'16px'
  }

  const inp = {
    padding:'9px 12px',
    border:'1.5px solid #2a2940',
    borderRadius:'9px',
    fontSize:'13px',
    background:'#1e1d30',
    color:'#f0eeff',
    outline:'none',
    width:'100%',
    boxSizing:'border-box'
  }

  const btn = (bg,c,b) => ({
    background:bg,
    color:c,
    border:b?`1px solid ${b}`:'none',
    padding:'8px 18px',
    borderRadius:'9px',
    fontSize:'13px',
    fontWeight:600,
    cursor:'pointer'
  })

  if (loading)
    return <div style={{ padding:'28px',color:'#8b8aad' }}>Loading settings...</div>

  return (
    <div style={{ padding:'28px',maxWidth:'900px' }}>

      {saved && (
        <div style={{
          background:'rgba(34,197,94,.12)',
          border:'1px solid rgba(34,197,94,.3)',
          borderRadius:'10px',
          padding:'12px 16px',
          marginBottom:'16px',
          color:'#22c55e',
          fontSize:'13px',
          fontWeight:500
        }}>
          ✓ Settings saved successfully.
        </div>
      )}

      {/* Platform Info */}
      <div style={card}>
        <div style={{ fontSize:'15px',fontWeight:700,color:'#f0eeff',marginBottom:'16px' }}>
          ⚙️ Platform Information
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px' }}>
          {[
            { k:'platform_name',  l:'Platform Name' },
            { k:'municipality',   l:'Municipality' },
            { k:'admin_email',    l:'Admin Email' },
            { k:'support_phone',  l:'Support Phone' },
          ].map(({ k,l }) => (
            <div key={k}>
              <div style={{ fontSize:'12px',fontWeight:600,color:'#8b8aad',marginBottom:'6px' }}>
                {l}
              </div>
              <input
                value={settings[k] ?? ''}
                onChange={e=>setSettings(s=>({...s,[k]:e.target.value}))}
                style={inp}
              />
            </div>
          ))}
        </div>

        <button style={btn('#7c3aed','#fff')} onClick={handleSave}>
          Save Changes
        </button>
      </div>

      {/* Barangay Management */}
      <div style={card}>

        <div style={{ fontSize:'15px',fontWeight:700,color:'#f0eeff',marginBottom:'16px' }}>
          📍 Barangay Management
        </div>

        <div style={{ display:'flex',gap:'10px',marginBottom:'14px' }}>
          <input
            value={newBrgy}
            onChange={e=>setNewBrgy(e.target.value)}
            placeholder="Add barangay name..."
            style={{ ...inp,width:'auto',flex:1 }}
          />
          <button style={btn('#7c3aed','#fff')} onClick={addBrgy}>
            + Add
          </button>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
          {(settings.barangays ?? []).map((b,i)=>(
            <div
              key={i}
              style={{
                display:'flex',
                alignItems:'center',
                justifyContent:'space-between',
                background:'#1e1d30',
                borderRadius:'9px',
                padding:'10px 14px',
                border:'1px solid #2a2940'
              }}
            >
              <span style={{ fontSize:'14px',color:'#f0eeff' }}>
                📍 {b}
              </span>

              <button
                style={{
                  background:'none',
                  border:'none',
                  color:'#f87171',
                  cursor:'pointer',
                  fontSize:'16px'
                }}
                onClick={()=>removeBrgy(i)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}