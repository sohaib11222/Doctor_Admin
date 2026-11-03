import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { useAuth } from '../../contexts/AuthContext'

const unwrap = (response) => { const outer = response?.data ?? response; return outer?.data ?? outer }
const participant = (conversation) => conversation.doctorId || conversation.businessId || null
const roleLabel = (conversation) => ({ ADMIN_DOCTOR: 'Doctor', ADMIN_PHARMACY: 'Pharmacy', ADMIN_PARAPHARMACY: 'Parapharmacy' }[conversation.conversationType] || 'Account')

const AdminSupportInbox = () => {
  const { user } = useAuth(); const client = useQueryClient(); const [selected, setSelected] = useState(null); const [text, setText] = useState(''); const endRef = useRef(null)
  const conversationsQuery = useQuery({ queryKey: ['admin-support-conversations'], queryFn: () => api.get('/chat/conversations', { params: { limit: 100 } }), refetchInterval: 5000, refetchIntervalInBackground: true })
  const payload = unwrap(conversationsQuery.data); const conversations = useMemo(() => (payload?.conversations || []).filter((conversation) => String(conversation.conversationType || '').startsWith('ADMIN_')), [payload])
  useEffect(() => { if (!selected && conversations.length) setSelected(conversations[0]); if (selected) setSelected(conversations.find((item) => item._id === selected._id) || selected) }, [conversations])
  const messagesQuery = useQuery({ queryKey: ['admin-support-messages', selected?._id], queryFn: () => api.get(`/chat/messages/${selected._id}`, { params: { limit: 100 } }), enabled: Boolean(selected?._id), refetchInterval: 2500, refetchIntervalInBackground: true })
  const messages = unwrap(messagesQuery.data)?.messages || []
  const send = useMutation({ mutationFn: () => api.post(`/chat/admin-support/conversations/${selected._id}/messages`, { message: text.trim() }), onSuccess: () => { setText(''); client.invalidateQueries({ queryKey: ['admin-support-messages', selected._id] }); client.invalidateQueries({ queryKey: ['admin-support-conversations'] }) }, onError: (error) => toast.error(error.response?.data?.message || error.message || 'Message could not be sent') })
  // New messages in the currently visible thread are read immediately, so an
  // Admin does not keep a stale unread badge while actively viewing it.
  useEffect(() => {
    if (!selected?._id) return
    api.put(`/chat/conversations/${selected._id}/read`)
      .then(() => client.invalidateQueries({ queryKey: ['admin-support-unread-count'] }))
      .catch(() => {})
  }, [client, selected?._id, messages.length])
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }) }, [messages])
  const onSubmit = (event) => { event.preventDefault(); if (text.trim()) send.mutate() }
  return <div className="card"><div className="card-body p-0"><div className="row g-0" style={{ minHeight: 620 }}><aside className="col-md-4 border-end"><div className="p-3 border-bottom"><h5 className="mb-1">Support inbox</h5><small className="text-muted">Doctors, pharmacies and parapharmacies</small></div><div style={{ maxHeight: 555, overflowY: 'auto' }}>{conversationsQuery.isLoading ? <div className="text-center py-4"><span className="spinner-border spinner-border-sm" /></div> : conversations.length ? conversations.map((conversation) => { const account = participant(conversation); return <button type="button" key={conversation._id} className={`w-100 text-start bg-white border-0 border-bottom p-3 ${selected?._id === conversation._id ? 'bg-light' : ''}`} onClick={() => setSelected(conversation)}><div className="d-flex justify-content-between gap-2"><strong className="text-truncate">{account?.fullName || account?.email || roleLabel(conversation)}</strong>{conversation.unreadCount > 0 && <span className="badge bg-danger">{conversation.unreadCount}</span>}</div><div className="small text-muted">{roleLabel(conversation)} · {conversation.lastMessage?.message || 'No messages yet'}</div></button> }) : <div className="text-center text-muted p-4">No support conversations yet.</div>}</div></aside><section className="col-md-8 d-flex flex-column">{selected ? <><div className="p-3 border-bottom"><strong>{participant(selected)?.fullName || participant(selected)?.email || 'Account'}</strong><div className="small text-muted">{roleLabel(selected)} support conversation</div></div><div className="flex-grow-1 p-3" style={{ overflowY: 'auto', background: '#f8fafc', minHeight: 470 }}>{messages.map((message) => { const own = String(message.senderId?._id || message.senderId) === String(user?._id); return <div className={`d-flex mb-3 ${own ? 'justify-content-end' : 'justify-content-start'}`} key={message._id}><div className={own ? 'bg-primary text-white p-3 rounded-3' : 'bg-white border p-3 rounded-3'} style={{ maxWidth: '76%' }}>{message.message}<div className={own ? 'small text-white-50 mt-1' : 'small text-muted mt-1'}>{new Date(message.createdAt).toLocaleString()}</div></div></div> })}<span ref={endRef} /></div><form className="border-top p-3 d-flex gap-2" onSubmit={onSubmit}><input className="form-control" value={text} onChange={(event) => setText(event.target.value)} placeholder="Reply to this account…" /><button className="btn btn-primary" disabled={send.isPending || !text.trim()}>{send.isPending ? 'Sending…' : 'Send'}</button></form></> : <div className="d-flex align-items-center justify-content-center h-100 text-muted">Select a conversation to reply.</div>}</section></div></div></div>
}
export default AdminSupportInbox
