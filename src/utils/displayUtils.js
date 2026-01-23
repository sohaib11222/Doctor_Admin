/**
 * Utility functions for displaying data in tables and forms
 */

/**
 * Returns a user-friendly placeholder for missing/null data
 * @param {string} customText - Optional custom text to display
 * @returns {JSX.Element|string} Styled placeholder element or text
 */
export const getPlaceholder = (customText = null) => {
  const text = customText || '—'
  return (
    <span className="text-muted" style={{ fontStyle: 'italic' }}>
      {text}
    </span>
  )
}

/**
 * Returns a user-friendly placeholder for missing/null data (text only, no JSX)
 * Useful for simple string returns
 * @param {string} customText - Optional custom text to display
 * @returns {string} Placeholder text
 */
export const getPlaceholderText = (customText = null) => {
  return customText || '—'
}

/**
 * Formats a value, returning placeholder if null/undefined/empty
 * @param {any} value - Value to format
 * @param {string} placeholder - Custom placeholder text (default: '—')
 * @returns {JSX.Element|string} Formatted value or placeholder
 */
export const formatValue = (value, placeholder = null) => {
  if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'N/A') {
    return getPlaceholder(placeholder)
  }
  return value
}

/**
 * Formats a value, returning placeholder text if null/undefined/empty
 * @param {any} value - Value to format
 * @param {string} placeholder - Custom placeholder text (default: '—')
 * @returns {string} Formatted value or placeholder text
 */
export const formatValueText = (value, placeholder = null) => {
  if (value === null || value === undefined || value === '' || value === 'N/A' || value === 'N/A') {
    return getPlaceholderText(placeholder)
  }
  return value
}
