import { createContext, useState } from 'react'
import authApi from '../api/authInstance'
import { useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(false)

	const register = async (payload) => {
		setLoading(true)
		try {
			const res = await authApi.register(payload)
			setLoading(false)
			return res
		} catch (err) {
			setLoading(false)
			throw err
		}
	}

	const login = async (payload) => {
		setLoading(true)
		try {
			const res = await authApi.login(payload)
			setUser(res?.data || null)
			setLoading(false)
			return res
		} catch (err) {
			setLoading(false)
			throw err
		}
	}

	const logout = async () => {
		await authApi.logout()
		setUser(null)
	}

	useEffect(() => {
		let mounted = true
		;(async () => {
			setLoading(true)
			try {
				await authApi.refresh()
				const res = await authApi.me()
				if (mounted) setUser(res?.data || null)
			} catch (err) {
				// ignore — user not authenticated
			} finally {
				if (mounted) setLoading(false)
			}
		})()
		return () => { mounted = false }
	}, [])

	const forgotPassword = (payload) => authApi.forgotPassword(payload)
	const resetPassword = (payload) => authApi.resetPassword(payload)
	const verifyEmail = (payload) => authApi.verifyEmail(payload)

	return (
		<AuthContext.Provider value={{ user, setUser, loading, register, login, logout, forgotPassword, resetPassword, verifyEmail }}>
			{children}
		</AuthContext.Provider>
	)
}

export default AuthContext
