import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let projectsSocket = null
let notificationsSocket = null

export const getProjectsSocket = (token) => {
  if (!projectsSocket) {
    projectsSocket = io(`${SOCKET_URL}/projects`, {
      auth: { token },
      withCredentials: true,
      autoConnect: false,
    })
  }
  return projectsSocket
}

export const getNotificationsSocket = (token) => {
  if (!notificationsSocket) {
    notificationsSocket = io(`${SOCKET_URL}/notifications`, {
      auth: { token },
      withCredentials: true,
      autoConnect: false,
    })
  }
  return notificationsSocket
}
