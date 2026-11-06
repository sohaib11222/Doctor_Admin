import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { useLanguage } from '../../contexts/LanguageContext'

const statuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
const unwrap = (response) => response?.data ?? response ?? {}
const label = (value) => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const statusClass = (value) => ({ NEW: 'bg-primary', IN_PROGRESS: 'bg-warning text-dark', RESOLVED: 'bg-success', CLOSED: 'bg-secondary' }[value] || 'bg-secondary')
const asText = (value, fallback = '') => typeof value === 'string' || typeof value === 'number' ? String(value) : fallback
const queryErrorText = (error) => error?.response?.data?.message || error?.data?.message || error?.message || 'Unable to load contact inquiries.'

const ContactQueries = () => {
  const client = useQueryClient()
  const { locale, translateText: tr } = useLanguage()
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [notes, setNotes] = useState('')
  const [responseMessage, setResponseMessage] = useState('')

  const list = useQuery({
    queryKey: ['contact-queries', status, search],
    queryFn: () => api.get('/contact-queries', { params: { page: 1, limit: 100, status, search } }),
    retry: 2,
    retryDelay: (attempt) => Math.min(500 * (attempt + 1), 2_000),
    refetchOnMount: 'always',
    throwOnError: false,
    refetchInterval: 15000,
  })
  const queries = useMemo(() => {
    const value = unwrap(list.data)
    return Array.isArray(value?.queries) ? value.queries.filter((item) => item && typeof item === 'object') : []
  }, [list.data])

  const formatDateTime = (value) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(locale)
  }

  const select = (query) => {
    setSelected(query)
    setNotes(query.adminNotes || '')
    setResponseMessage(query.resolutionMessage || '')
  }
  const refresh = () => {
    client.invalidateQueries({ queryKey: ['contact-queries'] })
    client.invalidateQueries({ queryKey: ['admin-sidebar-counts'] })
  }
  const update = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/contact-queries/${id}`, data),
    onSuccess: (response) => {
      const item = unwrap(response)
      setSelected(item)
      setNotes(item.adminNotes || '')
      setResponseMessage(item.resolutionMessage || '')
      refresh()
      toast.success('Inquiry updated.')
    },
    onError: (error) => toast.error(error?.response?.data?.message || error.message || 'Could not update inquiry.'),
  })
  const resolve = useMutation({
    mutationFn: ({ id, data }) => api.post(`/contact-queries/${id}/resolve`, data),
    onSuccess: (response) => {
      const item = unwrap(response)
      setSelected(item)
      setNotes(item.adminNotes || '')
      setResponseMessage(item.resolutionMessage || '')
      refresh()
      toast.success('Reply queued and inquiry resolved.')
    },
    onError: (error) => toast.error(error?.response?.data?.message || error.message || 'Could not resolve inquiry.'),
  })
  const remove = useMutation({
    mutationFn: (id) => api.delete(`/contact-queries/${id}`),
    onSuccess: () => { setSelected(null); setNotes(''); setResponseMessage(''); refresh(); toast.success('Inquiry deleted.') },
    onError: (error) => toast.error(error?.response?.data?.message || error.message || 'Could not delete inquiry.'),
  })

  const updateStatus = (nextStatus) => {
    if (!selected) return
    if (nextStatus === 'RESOLVED' && selected.status !== 'RESOLVED') {
      toast.info('Write a reply below and use “Send reply & resolve” so the requester receives it by email.')
      return
    }
    update.mutate({ id: selected._id, data: { status: nextStatus, adminNotes: notes } })
  }

  return <div className="card"><div className="card-body p-0"><div className="row g-0" style={{ minHeight: 620 }}>
    <aside className="col-lg-5 border-end">
      <div className="p-3 border-bottom"><h5 className="mb-3">Contact inquiries</h5><div className="d-flex gap-2"><input className="form-control form-control-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inquiries" /><select className="form-select form-select-sm" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All</option>{statuses.map((item) => <option key={item} value={item}>{tr(label(item))}</option>)}</select></div></div>
      <div style={{ maxHeight: 540, overflowY: 'auto' }}>{list.isLoading ? <div className="text-center py-5"><span className="spinner-border spinner-border-sm" /></div> : list.isError ? <div className="text-center text-muted p-4"><p className="mb-3">{tr(queryErrorText(list.error))}</p><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => list.refetch()}>{tr('Try again')}</button></div> : queries.length ? queries.map((query) => <button key={query._id} type="button" onClick={() => select(query)} className={`w-100 text-start border-0 border-bottom p-3 ${selected?._id === query._id ? 'bg-light' : 'bg-white'}`}><div className="d-flex justify-content-between gap-2"><strong className="text-truncate">{asText(query.name, '—')}</strong><span className={`badge ${statusClass(query.status)}`}>{tr(label(query.status))}</span></div><div className="small text-muted text-truncate">{asText(query.email, '—')}</div><div className="small text-muted text-truncate">{asText(query.message)}</div></button>) : <p className="text-center text-muted p-4">No contact inquiries found.</p>}</div>
    </aside>
    <section className="col-lg-7 p-4">{selected ? <>
      <div className="d-flex justify-content-between gap-3 mb-4"><div><h4 className="mb-1">{asText(selected.name, '—')}</h4><a href={`mailto:${asText(selected.email)}`}>{asText(selected.email, '—')}</a>{asText(selected.phone) && <span className="text-muted"> · {asText(selected.phone)}</span>}</div><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => { if (window.confirm('Delete this inquiry?')) remove.mutate(selected._id) }} disabled={remove.isPending}>Delete</button></div>
      <dl className="row small"><dt className="col-sm-3">Service</dt><dd className="col-sm-9">{asText(selected.services, '—')}</dd><dt className="col-sm-3">Received</dt><dd className="col-sm-9">{formatDateTime(selected.createdAt)}</dd></dl>
      <div className="border rounded p-3 mb-4" style={{ whiteSpace: 'pre-wrap' }}>{asText(selected.message)}</div>
      <div className="row g-3"><div className="col-md-5"><label className="form-label">Status</label><select className="form-select" value={selected.status} onChange={(event) => updateStatus(event.target.value)} disabled={update.isPending || resolve.isPending}>{statuses.map((item) => <option key={item} value={item}>{tr(label(item))}</option>)}</select></div>
        <div className="col-12"><label className="form-label">Internal notes</label><textarea className="form-control" rows="4" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength="5000" placeholder="Add handling notes for the admin team" /></div>
        {selected.status === 'RESOLVED' ? <div className="col-12"><label className="form-label">Reply sent to requester</label><div className="border rounded bg-light p-3" style={{ whiteSpace: 'pre-wrap' }}>{selected.resolutionMessage || 'This inquiry was resolved without a stored response.'}</div></div> : <div className="col-12"><label className="form-label">Reply to requester</label><textarea className="form-control" rows="5" value={responseMessage} onChange={(event) => setResponseMessage(event.target.value)} maxLength="5000" placeholder="Write the response that will be sent by email" /><div className="form-text">Sending the reply records it in the inquiry and marks the inquiry as resolved.</div></div>}
        <div className="col-12 d-flex flex-wrap gap-2"><button type="button" className="btn btn-outline-primary" onClick={() => update.mutate({ id: selected._id, data: { status: selected.status, adminNotes: notes } })} disabled={update.isPending || resolve.isPending}>{update.isPending ? 'Saving…' : 'Save notes'}</button>{selected.status !== 'RESOLVED' && <button type="button" className="btn btn-primary" onClick={() => resolve.mutate({ id: selected._id, data: { responseMessage, adminNotes: notes } })} disabled={resolve.isPending || !responseMessage.trim()}>{resolve.isPending ? 'Queueing reply…' : 'Send reply & resolve'}</button>}</div>
      </div>
    </> : <div className="d-flex h-100 align-items-center justify-content-center text-muted">Select an inquiry to view and manage it.</div>}</section>
  </div></div></div>
}

export default ContactQueries
