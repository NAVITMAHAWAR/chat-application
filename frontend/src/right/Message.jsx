import { useEffect, useRef } from "react"
import useGetMessage from "../context/useGetMessage.js"
import useGetSocketMessage from "../context/usegetSocketMessage.js"
import useConversation from "../stateManage/conversation.js"
import Messages from "./Messages.jsx"
import TypingIndicator from "./TypingIndicator.jsx";
import useTypingAndRead from "../context/useTypingAndRead.js";

/**
 * @typedef {{_id?: string, message?: string, senderId?: string | {_id?: string}}} MessageItem
 */


const Message = () => {
	useGetSocketMessage()
	useTypingAndRead();
	const {messages} = useGetMessage()
	const selectConversation = useConversation((state) => state.selectConversation)
	const typingUsers = useConversation((state) => state.typingUsers)
	const messageEndRef = useRef(null)
	const typingSenderId = selectConversation?._id
		? typingUsers[selectConversation._id]
		: undefined
	const messageList = /** @type {MessageItem[]} */ (
		Array.isArray(messages) ? messages : messages?.message || []
	)

	useEffect(() => {
		messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
	}, [messageList.length, selectConversation?._id, typingSenderId])

	const renderedMessages = []
	for (let index = 0; index < messageList.length; index += 1) {
		const message = messageList[index]
		renderedMessages.push(<Messages key={message._id} message={message} isGroup={selectConversation?.isGroup} />)
	}

  return (
	<div className="flex min-h-full flex-col justify-end">
		{messageList.length > 0 ? (
			renderedMessages
		) : (
			<p className="py-12 text-center font-sans text-slate-400">
				{selectConversation ? "Say hi!" : "Select a conversation to start chatting."}
			</p>
		)}
		<TypingIndicator />
		<div ref={messageEndRef} aria-hidden="true" />
	</div>
  )
}

export default Message