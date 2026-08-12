import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function useSocket(namespace, { token, enabled = true } = {}) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!enabled || !token) return undefined

    const socket = io(`${SOCKET_URL}${namespace}`, {
      auth: { token },
      withCredentials: true,
    })

    socketRef.current = socket
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [namespace, token, enabled])

  return { socket: socketRef.current, connected }
}
