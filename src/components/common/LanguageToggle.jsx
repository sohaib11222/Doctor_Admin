import { useLanguage } from '../../contexts/LanguageContext'

const LanguageToggle = () => {
  const { language, toggleLanguage, t } = useLanguage()
  const nextLanguage = language === 'it' ? t('English') : t('Italian')

  return (
    <button
      type="button"
      className="admin-language-toggle"
      onClick={toggleLanguage}
      aria-label={t('Switch to {language}', { language: nextLanguage })}
      title={t('Switch to {language}', { language: nextLanguage })}
    >
      <i className="fa-solid fa-language" aria-hidden="true" />
      <span>{language === 'it' ? 'IT' : 'EN'}</span>
    </button>
  )
}

export default LanguageToggle
