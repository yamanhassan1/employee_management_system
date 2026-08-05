import { API_BASE, API_ENDPOINTS } from '../utils/constants'

const jsonHeaders = { 'Content-Type': 'application/json' }

async function request(path, options = {}) {
	const res = await fetch(`${API_BASE}${path}`, {
		credentials: 'include',
		headers: { ...options.headers },
		...options,
	})
	const text = await res.text()
	let data = null
	try { data = text ? JSON.parse(text) : null } catch {}
	if (!res.ok) throw data || new Error(res.statusText)
	return data
}

export const authApi = {
	register: (payload) => request(API_ENDPOINTS.AUTH_REGISTER, { method: 'POST', body: JSON.stringify(payload), headers: jsonHeaders }),
	login: (payload) => request(API_ENDPOINTS.AUTH_LOGIN, { method: 'POST', body: JSON.stringify(payload), headers: jsonHeaders }),
	refresh: () => request(API_ENDPOINTS.AUTH_REFRESH, { method: 'POST' }),
	me: () => request('/auth/me', { method: 'GET' }),
	logout: () => request(API_ENDPOINTS.AUTH_LOGOUT, { method: 'POST' }),
	logoutAll: () => request(API_ENDPOINTS.AUTH_LOGOUT_ALL, { method: 'POST' }),
	forgotPassword: (payload) => request(API_ENDPOINTS.PASSWORD_FORGOT, { method: 'POST', body: JSON.stringify(payload), headers: jsonHeaders }),
	resetPassword: (payload) => request(API_ENDPOINTS.PASSWORD_RESET, { method: 'POST', body: JSON.stringify(payload), headers: jsonHeaders }),
	verifyEmail: (payload) => request(API_ENDPOINTS.EMAIL_VERIFY, { method: 'POST', body: JSON.stringify(payload), headers: jsonHeaders }),
	resendVerification: (payload) => request(API_ENDPOINTS.EMAIL_RESEND, { method: 'POST', body: JSON.stringify(payload), headers: jsonHeaders }),
}

export default authApi

