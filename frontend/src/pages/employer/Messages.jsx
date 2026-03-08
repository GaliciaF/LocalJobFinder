import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'

export default function EmployerMessages() {
  const { user }              = useAuth()
  const [convos, setConvos]   = useState([])
  const [thread, setThread]   = useState([])
  const [active, setActive]   = useState(null)
  const [body, setBody]       = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef              = useRef()
  const pollRef                = useRef()

  // Fetch all conversations on mount
  useEffect(() => {
    api.get('/employer/messages')
      .then(r => {
        setConvos(r.data)
        if (r.data.length > 0) openThread(r.data[0])
      })
      .finally(() => setLoading(false))
  }, [])

  // Auto-scroll to bottom when thread updates
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [thread])

  // Poll messages every 5s for active thread
  useEffect(() => {
    if (!active) return
    pollRef.current = setInterval(() => {
      api.get(`/employer/messages/${active.user.id}`).then(r => setThread(r.data)).catch(() => {})
      api.get('/employer/messages').then(r => setConvos(r.data)).catch(() => {})
    }, 5000)
    return () => clearInterval(pollRef.current)
  }, [active])

  const openThread = async (convo) => {
    setActive(convo)
    clearInterval(pollRef.current)
    try {
      const r = await api.get(`/employer/messages/${convo.user.id}`)
      setThread(r.data)
      setConvos(prev => prev.map(c => c.user.id === convo.user.id ? { ...c, unread: 0 } : c))
    } catch { setThread([]) }
  }

  const sendMessage = async () => {
    if (!body.trim() || !active || sending) return
    setSending(true)
    try {
      const r = await api.post('/employer/messages', { receiver_id: active.user.id, body: body.trim() })
      setThread(prev => [...prev, r.data])
      setBody('')
      api.get('/employer/messages').then(r => setConvos(r.data))
    } catch {}
    finally { setSending(false) }
  }

  const ini = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const fmtTime = d => new Date(d).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  const fmtDate = d => {
    const date = new Date(d), today = new Date()
    return date.toDateString() === today.toDateString()
      ? fmtTime(d)
      : date.toLocaleDateString('en-PH', { month:'short', day:'numeric' })
  }

  if (loading) return <div style={{ padding: 28, color: '#6b7280' }}>Loading messages...</div>

  return (
    <div style={{ padding: 28, background: '#fffdf5', minHeight: '100vh' }}>
      {convos.length === 0 ? (
        <div style={{ textAlign:'center', color:'#6b7280', padding:60, background:'#fff', borderRadius:14, border:'1px solid #e5e0d0' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
          <div style={{ fontWeight:700, marginBottom:6 }}>No conversations yet</div>
          <div style={{ fontSize:13 }}>Workers will appear here once they message you or you contact them.</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', height:'calc(100vh - 130px)', border:'1px solid #e5e0d0', borderRadius:14, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
          
          {/* Sidebar */}
          <div style={{ background:'#fff', borderRight:'1px solid #e5e0d0', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'16px 18px', borderBottom:'1px solid #e5e0d0', fontWeight:700, fontSize:15 }}>
              💬 Messages
              {convos.reduce((s,c)=>s+(c.unread??0),0) > 0 && (
                <span style={{ marginLeft:8, background:'#d97706', color:'#fff', borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:700 }}>
                  {convos.reduce((s,c)=>s+(c.unread??0),0)}
                </span>
              )}
            </div>
            <div style={{ flex:1, overflowY:'auto' }}>
              {convos.map(c => (
                <div key={c.user.id} onClick={()=>openThread(c)}
                  style={{ display:'flex', gap:12, alignItems:'center', padding:'14px 16px', borderBottom:'1px solid #f3f4f6', cursor:'pointer', background: active?.user.id===c.user.id?'rgba(217,119,6,.08)':'transparent', transition:'background .15s' }}
                  onMouseEnter={e=>{ if(active?.user.id!==c.user.id) e.currentTarget.style.background='#fffbf0' }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=active?.user.id===c.user.id?'rgba(217,119,6,.08)':'transparent' }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>
                    {ini(c.user.name)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'#111827' }}>{c.user.name}</div>
                    <div style={{ fontSize:12, color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {c.last?.sender_id===user?.id?'You: ':''}{c.last?.body??''}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{c.last?fmtDate(c.last.created_at):''}</div>
                    {c.unread>0 && (
                      <div style={{ width:18, height:18, background:'#d97706', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', marginTop:4, marginLeft:'auto' }}>
                        {c.unread}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thread */}
          <div style={{ background:'#fafaf8', display:'flex', flexDirection:'column' }}>
            {active ? (
              <>
                {/* Header */}
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #e5e0d0', display:'flex', alignItems:'center', gap:12, background:'#fff' }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff' }}>
                    {ini(active.user.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{active.user.name}</div>
                    <div style={{ fontSize:11, color:'#16a34a' }}>Worker</div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:12 }}>
                  {thread.length===0 && <div style={{ textAlign:'center', color:'#9ca3af', fontSize:13, marginTop:40 }}>No messages yet. Say hello! 👋</div>}
                  {thread.map((m,i)=>{
                    const isMe = m.sender_id===user?.id
                    const showDate = i===0 || new Date(thread[i-1].created_at).toDateString()!==new Date(m.created_at).toDateString()
                    return (
                      <div key={m.id??i}>
                        {showDate && <div style={{ textAlign:'center', fontSize:11, color:'#9ca3af', margin:'8px 0' }}>{new Date(m.created_at).toLocaleDateString('en-PH', { weekday:'short', month:'short', day:'numeric' })}</div>}
                        <div style={{ display:'flex', gap:8, flexDirection:isMe?'row-reverse':'row', alignItems:'flex-end' }}>
                          {!isMe && <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>{ini(active.user.name)}</div>}
                          <div style={{ maxWidth:'65%' }}>
                            <div style={{ padding:'10px 14px', borderRadius:isMe?'16px 16px 4px 16px':'16px 16px 16px 4px', fontSize:14, lineHeight:1.5, background:isMe?'#d97706':'#fff', color:isMe?'#fff':'#111827', boxShadow:'0 1px 2px rgba(0,0,0,.08)' }}>
                              {m.body}
                            </div>
                            <div style={{ fontSize:10, color:'#9ca3af', marginTop:3, textAlign:isMe?'right':'left' }}>
                              {fmtTime(m.created_at)} {isMe && <span style={{ marginLeft:4 }}>{m.is_read?' ✓✓':' ✓'}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef}/>
                </div>

                {/* Input */}
                <div style={{ padding:'14px 16px', borderTop:'1px solid #e5e0d0', display:'flex', gap:10, alignItems:'center', background:'#fff' }}>
                  <input placeholder="Type a message..." value={body} onChange={e=>setBody(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendMessage()}
                    style={{ flex:1, padding:'10px 14px', border:'1.5px solid #e5e0d0', borderRadius:24, fontSize:14, outline:'none', background:'#fffdf5' }}/>
                  <button onClick={sendMessage} disabled={sending||!body.trim()}
                    style={{ width:40, height:40, borderRadius:'50%', background:body.trim()?'#d97706':'#e5e0d0', color:'#fff', border:'none', fontSize:18, cursor:body.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s', flexShrink:0 }}>
                    ➤
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#6b7280', flexDirection:'column', gap:8 }}>
                <div style={{ fontSize:32 }}>💬</div>
                <div>Select a conversation</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}