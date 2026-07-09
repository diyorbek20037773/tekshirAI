// Brauzer login/register muvaffaqiyatidan keyin sessiyani localStorage'ga yozish.
// Telegram oqimidagi _saveRoleData bilan bir xil kalitlar — dashboard'lar o'zgarmasdan ishlaydi.
export function saveSession(user, token) {
  if (token) localStorage.setItem('token', token)
  localStorage.setItem('userRole', user.role)
  localStorage.setItem('userId', user.id)
  localStorage.setItem('telegramId', String(user.telegram_id))
  const r = user.role
  if (user.full_name) localStorage.setItem(`${r}Name`, user.full_name)
  if (user.maktab) localStorage.setItem(`${r}Maktab`, user.maktab)
  if (user.viloyat) localStorage.setItem(`${r}Viloyat`, user.viloyat)
  if (user.tuman) localStorage.setItem(`${r}Tuman`, user.tuman)
  if (user.grade) localStorage.setItem(`${r}Grade`, String(user.grade))
  if (user.class_letter) localStorage.setItem(`${r}ClassLetter`, user.class_letter)
  if (user.gender) localStorage.setItem(`${r}Gender`, user.gender)
  if (user.subject) localStorage.setItem(`${r}Subject`, user.subject)
  sessionStorage.removeItem('loggedOut')
}

// Chiqish — sessiyani tozalab, auto-login'ni to'xtatish (loggedOut bayrog'i).
export function logoutSession() {
  localStorage.clear()
  sessionStorage.setItem('loggedOut', '1')
}

// Brauzer rejimi — Telegram user yo'q (PWA/brauzer). Bunda chiqish = haqiqiy logout.
export function isBrowserMode() {
  return !window.Telegram?.WebApp?.initDataUnsafe?.user
}

// Brauzerda haqiqiy logout: sessiya tozalanadi va /login ga o'tiladi.
// Telegramda esa false qaytadi (chaqiruvchi eski "rol menyusi" xatti-harakatini bajaradi).
export function browserLogout() {
  if (!isBrowserMode()) return false
  logoutSession()
  window.location.replace('/login')
  return true
}
