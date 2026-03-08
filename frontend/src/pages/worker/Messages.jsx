import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'

export default function WorkerMessages() {
  const { user }              = useAuth()
  const [convos,   setConvos] = useState([])
  const [thread,   setThread] = useState([])
  const [active,   setActive] = useState(null)
  const [body,     setBody]   = useState('')
  const [sending,  setSending] = useState(false)
  const [loading,  setLoading] = useState(true)
  const bottomRef  = useRef()
  const pollRef    = useRef()

  // Load conversations on mount
  useEffect(() => {
    api.get('/worker/messages')
      .then(r => {
        setConvos(r.data)
        if (r.data.length > 0) openThread(r.data[0])
      })
      .finally(() => setLoading(false))
  }, [])

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  // Poll for new messages every 5s when a thread is open
  useEffect(() => {
    if (!active) return
    pollRef.current = setInterval(() => {
      api.get(`/worker/messages/${active.user.id}`)
        .then(r => setThread(r.data))
        .catch(() => {})
      api.get('/worker/messages')
        .then(r => setConvos(r.data))
        .catch(() => {})
    }, 5000)
    return () => clearInterval(pollRef.current)
  }, [active])

  const openThread = async (convo) => {
    setActive(convo)
    clearInterval(pollRef.current)
    try {
      const r = await api.get(`/worker/messages/${convo.user.id}`)
      setThread(r.data)
      setConvos(prev => prev.map(c =>
        c.user.id === convo.user.id ? { ...c, unread: 0 } : c
      ))
    } catch { setThread([]) }
  }

  const sendMessage = async () => {
    if (!body.trim() || !active || sending) return
    setSending(true)
    try {
      const r = await api.post('/worker/messages', {
        receiver_id: active.user.id,
        body: body.trim()
      })
      setThread(prev => [...prev, r.data])
      setBody('')
      // Refresh conversation list
      api.get('/worker/messages').then(r => setConvos(r.data))
    } catch {}
    finally { setSending(false) }
  }

  const ini = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  const fmtDate = (d) => {
    const date = new Date(d)
    const today = new Date()
    if (date.toDateString() === today.toDateString()) return fmtTime(d)
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  }

  if (loading) return <div style={{ padding: '28px', color: '#6b7280' }}>Loading messages...</div>

  return (
    <div style={{ padding: '28px', maxWidth: '1100px' }}>
      {convos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8e2' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
          <div style={{ fontWeight: 700, marginBottom: '6px' }}>No conversations yet</div>
          <div style={{ fontSize: '13px' }}>Apply to jobs to start messaging employers.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '600px', border: '1px solid #e2e8e2', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>

          {/* Sidebar */}
          <div style={{ background: '#fff', borderRight: '1px solid #e2e8e2', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #e2e8e2', fontWeight: 700, fontSize: '15px' }}>
              💬 Messages
              {convos.reduce((s, c) => s + (c.unread ?? 0), 0) > 0 && (
                <span style={{ marginLeft: '8px', background: '#16a34a', color: '#fff', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                  {convos.reduce((s, c) => s + (c.unread ?? 0), 0)}
                </span>
              )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {convos.map(convo => (
                <div key={convo.user.id} onClick={() => openThread(convo)}
                  style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: active?.user.id === convo.user.id ? 'rgba(22,163,74,.08)' : 'transparent', transition: 'background .15s' }}
                  onMouseEnter={e => { if (active?.user.id !== convo.user.id) e.currentTarget.style.background = '#f9fafb' }}
                  onMouseLeave={e => { e.currentTarget.style.background = active?.user.id === convo.user.id ? 'rgba(22,163,74,.08)' : 'transparent' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {ini(convo.user.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{convo.user.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {convo.last?.sender_id === user?.id ? 'You: ' : ''}{convo.last?.body ?? ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{convo.last ? fmtDate(convo.last.created_at) : ''}</div>
                    {convo.unread > 0 && (
                      <div style={{ width: '18px', height: '18px', background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', marginTop: '4px', marginLeft: 'auto' }}>
                        {convo.unread}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thread */}
          <div style={{ background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
            {active ? (
              <>
                {/* Header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8e2', display: 'flex', alignItems: 'center', gap: '12px', background: '#fff' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                    {ini(active.user.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{active.user.name}</div>
                    <div style={{ fontSize: '11px', color: '#16a34a' }}>Employer</div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {thread.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '40px' }}>
                      No messages yet. Say hello! 👋
                    </div>
                  )}
                  {thread.map((m, i) => {
                    const isMe = m.sender_id === user?.id
                    const showDate = i === 0 || new Date(thread[i-1].created_at).toDateString() !== new Date(m.created_at).toDateString()
                    return (
                      <div key={m.id ?? i}>
                        {showDate && (
                          <div style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', margin: '8px 0' }}>
                            {new Date(m.created_at).toLocaleDateString('en-PH', { weekday:'short', month:'short', day:'numeric' })}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                          {!isMe && (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                              {ini(active.user.name)}
                            </div>
                          )}
                          <div style={{ maxWidth: '65%' }}>
                            <div style={{ padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: '14px', lineHeight: 1.5, background: isMe ? '#16a34a' : '#fff', color: isMe ? '#fff' : '#111827', boxShadow: '0 1px 2px rgba(0,0,0,.08)' }}>
                              {m.body}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', textAlign: isMe ? 'right' : 'left' }}>
                              {fmtTime(m.created_at)}
                              {isMe && <span style={{ marginLeft: '4px' }}>{m.is_read ? ' ✓✓' : ' ✓'}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '14px 16px', borderTop: '1px solid #e2e8e2', display: 'flex', gap: '10px', alignItems: 'center', background: '#fff' }}>
                  <input
                    placeholder="Type a message..."
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8e2', borderRadius: '24px', fontSize: '14px', outline: 'none', background: '#f9fafb' }}
                  />
                  <button onClick={sendMessage} disabled={sending || !body.trim()}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: body.trim() ? '#16a34a' : '#e2e8e2', color: '#fff', border: 'none', fontSize: '18px', cursor: body.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s', flexShrink: 0 }}>
                    ➤
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '32px' }}>💬</div>
                <div>Select a conversation</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}