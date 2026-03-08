import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function EmployerNotifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/employer/notifications')
      .then(res => {
        // Ensure notifications is always an array
        const data = Array.isArray(res.data) ? res.data : []
        setNotifications(data)
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    await api.patch(`/employer/notifications/${id}/read`).catch(()=>{})
    setNotifications(p => p.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
  }

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id)
    await Promise.all(unreadIds.map(id => api.patch(`/employer/notifications/${id}/read`).catch(()=>{})))
    setNotifications(p => p.map(n => !n.read_at ? { ...n, read_at: new Date().toISOString() } : n))
  }

  const card = { background:'#fff', borderRadius:'14px', border:'1px solid #e5e0d0', padding:'0', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }
  const ico  = (t) => ({ new_application:'👷', job_accepted:'✅', job_declined:'❌', new_message:'💬', system:'📢' })[t] ?? '🔔'

  if (loading) return <div style={{ padding:'28px',color:'#6b7280' }}>Loading notifications...</div>

  // Defensive filtering
  const unread = Array.isArray(notifications) ? notifications.filter(n => !n.read_at) : []
  const read   = Array.isArray(notifications) ? notifications.filter(n => n.read_at) : []

  // Navigate to relevant page based on notification type
  const goToNotification = (n) => {
    markRead(n.id)
    switch(n.type){
      case 'new_application':
        navigate(`/employer/applications/${n.data?.application_id}`)
        break
      case 'job_accepted':
      case 'job_declined':
        navigate(`/employer/jobs/${n.data?.job_id}`)
        break
      case 'new_message':
        navigate(`/employer/messages/${n.data?.chat_id}`)
        break
      default:
        break
    }
  }

  const Item = ({ n }) => (
    <div 
      onClick={() => goToNotification(n)} 
      style={{ 
        display:'flex', gap:'12px', padding:'14px 16px', borderBottom:'1px solid #f3f4f6', cursor:'pointer',
        background: !n.read_at ? 'rgba(217,119,6,.04)' : 'transparent', transition:'background .15s'
      }}
      onMouseEnter={e=>e.currentTarget.style.background='rgba(217,119,6,.06)'}
      onMouseLeave={e=>e.currentTarget.style.background=!n.read_at?'rgba(217,119,6,.04)':'transparent'}
    >
      <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'rgba(217,119,6,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>{ico(n.type)}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'13px', color:'#111827', lineHeight:1.5 }}>{n.data?.message ?? n.data?.body ?? 'New notification'}</div>
        <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'2px' }}>{new Date(n.created_at).toLocaleDateString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
      </div>
      {!n.read_at && <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#d97706', flexShrink:0, marginTop:'6px' }} />}
    </div>
  )

  return (
    <div style={{ padding:'28px', maxWidth:'700px', background:'#fffdf5', minHeight:'100vh' }}>
      {notifications.length === 0
        ? <div style={{ ...card, textAlign:'center', padding:'40px', color:'#6b7280' }}>No notifications yet. 🔔</div>
        : <>
            {unread.length>0 && (
              <div style={{ marginBottom:'20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                  <div style={{ fontSize:'12px', fontWeight:700, color:'#6b7280', letterSpacing:'1px', textTransform:'uppercase' }}>New ({unread.length})</div>
                  <button onClick={markAllRead} style={{ fontSize:'11px', cursor:'pointer', color:'#16a34a', background:'transparent', border:'none' }}>Mark all read</button>
                </div>
                <div style={card}>{unread.map(n => <Item key={n.id} n={n} />)}</div>
              </div>
            )}
            {read.length>0 && (
              <div>
                <div style={{ fontSize:'12px', fontWeight:700, color:'#6b7280', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'10px' }}>Earlier</div>
                <div style={card}>{read.map(n => <Item key={n.id} n={n} />)}</div>
              </div>
            )}
          </>
      }
    </div>
  )
}