import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./authContext.js"
import { io } from "socket.io-client"
import API_URL from "../api"

export const socketContext = createContext()

export const useSocketContext = () => {
	return useContext(socketContext)
}

export const SocketProvider = ({ children }) => {
	const [socket, setSocket] = useState(null)
	const [online, setOnline] = useState([])

	const [authUser] = useAuth()

	useEffect(() => {
		if (authUser?.user?._id) {
			const nextSocket = io(API_URL, {
				query: {
					userId: authUser.user._id,
				},
			})
			setSocket(nextSocket)
			nextSocket.on("getOnline", (users) => {
				setOnline(users)
			})
			return () => {
				nextSocket.close()
				setOnline([])
			}
		} else {
			setOnline([])
		}

	}, [authUser])
	return (
		<socketContext.Provider value={{ socket, online }}>{children}</socketContext.Provider>
	)
}