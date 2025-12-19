/**
 * Custom API functions
 * Reusable API call functions to avoid code repetition
 */
import api from '../api/axios'

/**
 * Generic GET request
 */
export const get = async (url, config = {}) => {
  try {
    const response = await api.get(url, config)
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Generic POST request
 */
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config)
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Generic PUT request
 */
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config)
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Generic PATCH request
 */
export const patch = async (url, data = {}, config = {}) => {
  try {
    const response = await api.patch(url, data, config)
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Generic DELETE request
 */
export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config)
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Generic POST request for file uploads (multipart/form-data)
 */
export const uploadFile = async (url, formData, config = {}) => {
  try {
    const response = await api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers,
      },
    })
    return response
  } catch (error) {
    throw error
  }
}

/**
 * Generic request with query parameters
 */
export const getWithParams = async (url, params = {}) => {
  try {
    const response = await api.get(url, { params })
    return response
  } catch (error) {
    throw error
  }
}

