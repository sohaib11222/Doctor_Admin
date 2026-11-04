import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const unwrap = (response) => response?.data ?? response ?? {}

const Settings = () => {
  const client = useQueryClient()
  const details = useQuery({ queryKey: ['contact-details'], queryFn: () => api.get('/footer-options') })
  const [form, setForm] = useState({ address: '', phoneNumber: '', supportEmail: '' })
  useEffect(() => {
    if (!details.data) return
    const current = unwrap(details.data)
    setForm({ address: current.address || '', phoneNumber: current.phoneNumber || '', supportEmail: current.supportEmail || '' })
  }, [details.data])
  const save = useMutation({
    mutationFn: () => api.put('/footer-options', form),
    onSuccess: () => { client.invalidateQueries({ queryKey: ['contact-details'] }); toast.success('Public contact details updated.') },
    onError: (error) => toast.error(error?.response?.data?.message || error.message || 'Could not save contact details.')
  })
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  return <div className="card"><div className="card-header"><h4 className="card-title mb-0">Public contact details</h4><small className="text-muted">These values are shown live on the My Doctor Contact Us page.</small></div><div className="card-body">{details.isLoading ? <div className="text-center py-4"><span className="spinner-border spinner-border-sm" /></div> : <form onSubmit={(event) => { event.preventDefault(); save.mutate() }} className="row g-3"><div className="col-12"><label className="form-label">Address</label><textarea className="form-control" name="address" rows="3" value={form.address} onChange={update} maxLength="500" placeholder="Business address" /></div><div className="col-md-6"><label className="form-label">Phone number</label><input className="form-control" name="phoneNumber" value={form.phoneNumber} onChange={update} maxLength="80" placeholder="Phone number" /></div><div className="col-md-6"><label className="form-label">Support email</label><input type="email" className="form-control" name="supportEmail" value={form.supportEmail} onChange={update} maxLength="254" placeholder="support@example.com" /></div><div className="col-12"><button className="btn btn-primary" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save contact details'}</button></div></form>}</div></div>
}
export default Settings
