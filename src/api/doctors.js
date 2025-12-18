import api from './axios'

export const getDoctors = (params = {}) => {
  return api.get('/doctors', { params })
}

export const getDoctor = (id) => {
  return api.get(`/doctors/${id}`)
}

export const getDashboardStats = () => {
  return api.get('/doctors/dashboard/stats')
}

export const getAppointments = (params = {}) => {
  return api.get('/doctors/appointments', { params })
}

export const getPatients = (params = {}) => {
  return api.get('/doctors/patients', { params })
}

