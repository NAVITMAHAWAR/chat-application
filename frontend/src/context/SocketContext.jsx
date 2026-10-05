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
	const [friendsVersion, setFriendsVersion] = useState(0)

	const [authUser] = useAuth()
	const userId = authUser?.user?._id

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
		<socketContext.Provider value={{ socket, online, friendsVersion }}>{children}</socketContext.Provider>
	)
}