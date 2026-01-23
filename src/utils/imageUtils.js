/**
 * Utility function to normalize image URLs
 * Converts relative paths to full URLs based on API base URL
 * 
 * @param {string} imageUri - The image URI (can be relative or full URL)
 * @returns {string|null} - Normalized full URL or null if invalid
 */
export const normalizeImageUrl = (imageUri) => {
  if (!imageUri || typeof imageUri !== 'string') return null
  const trimmedUri = imageUri.trim()
  if (!trimmedUri) return null
  
  // If already a full URL, return as-is
  if (trimmedUri.startsWith('http://') || trimmedUri.startsWith('https://')) {
    return trimmedUri
  }
  
  // Get base URL without /api
  const apiBaseURL = import.meta.env.VITE_API_URL || 'https://mydoctoradmin.mydoctorplus.it/api'
  const baseURL = apiBaseURL.replace('/api', '')
  
  // If path already starts with /, use as-is; otherwise add /
  const imagePath = trimmedUri.startsWith('/') ? trimmedUri : `/${trimmedUri}`
  
  // Construct full URL
  return `${baseURL}${imagePath}`
}

/**
 * Get image URL with fallback
 * @param {string} imageUri - The image URI
 * @param {string} fallback - Fallback image path
 * @returns {string} - Normalized image URL or fallback
 */
export const getImageUrl = (imageUri, fallback = '/assets_admin/img/patients/patient1.jpg') => {
  const normalized = normalizeImageUrl(imageUri)
  return normalized || fallback
}

/**
 * Get user profile image URL
 * @param {object} user - User object (can be userId from transaction/order)
 * @param {string} fallback - Fallback image path
 * @returns {string} - Normalized profile image URL or fallback
 */
export const getUserProfileImage = (user, fallback = '/assets_admin/img/patients/patient1.jpg') => {
  if (!user) return fallback
  
  // Handle if user is an object (populated)
  if (typeof user === 'object') {
    const profileImage = user.profileImage || user.profile?.profileImage
    if (profileImage) {
      return getImageUrl(profileImage, fallback)
    }
  }
  
  return fallback
}
