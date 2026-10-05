import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./authContext.js"
import { io } from "socket.io-client"
import toast from "react-hot-toast"
import API_URL from "../api"
import useConversation from "../stateManage/conversation.js"

export const socketContext = createContext()

export const useSocketContext = () => {
	return useContext(socketContext)
}

export const SocketProvider = ({ children }) => {
	const [socket, setSocket] = useState(null)
	const [online, setOnline] = useState([])
	const [presence, setPresence] = useState({})
	const [now, setNow] = useState(0)
	const [friendsVersion, setFriendsVersion] = useState(0)
	const notifyFriendsChanged = () => setFriendsVersion((version) => version + 1)

	const [authUser] = useAuth()
	const userId = authUser?.user?._id

	useEffect(() => {
		const initialUpdate = setTimeout(() => setNow(Date.now()), 0)
		const timer = setInterval(() => setNow(Date.now()), 60_000)
		return () => {
			clearTimeout(initialUpdate)
			clearInterval(timer)
		}
	}, [])

	useEffect(() => {
		useConversation.getState().setSelectConversation(null)
		useConversation.getState().setMessages([])

		if (userId) {
			const nextSocket = io(API_URL, {
				query: {
					userId,
				},
			})
			let hasConnected = false
			setSocket(nextSocket)
			nextSocket.on("connect", () => {
				if (hasConnected) {
					setFriendsVersion((version) => version + 1)
				}
				hasConnected = true
			})
			nextSocket.on("getOnline", (users) => {
				setOnline(users)
			})
			nextSocket.on("userStatusChanged", (status) => {
				setPresence((current) => {
					const statusKey = String(status.userId)
					if (statusKey === String(userId) && status.isOnline) {
						return { [statusKey]: status }
					}
					return { ...current, [statusKey]: status }
				})
			})
			nextSocket.on("friendRequest", (request) => {
				toast(`${request.from?.name || "Someone"} sent you a friend request`)
			})
			nextSocket.on("friendRequestAccepted", (request) => {
				toast(`${request.to?.name || "Someone"} accepted your request`)
				setFriendsVersion((version) => version + 1)
			})
			return () => {
				nextSocket.close()
				setOnline([])
			}
		} else {
			setOnline([])
			setSocket(null)
		}

	}, [userId])
	return (
		<socketContext.Provider value={{ socket, online, presence, now, friendsVersion, notifyFriendsChanged }}>{children}</socketContext.Provider>
	)
}