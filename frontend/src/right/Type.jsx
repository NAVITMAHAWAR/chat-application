

import { FiSend } from "react-icons/fi";
import useSendMessage from "../context/useSendMessage.js";
import { useState } from "react";

const Type = () => {
	const [message,setMessage] = useState("")
const {sendMessages} =useSendMessage()

const handleSubmit = async(e)=>{
	e.preventDefault()
	const sent = await sendMessages(message)
	if (sent) setMessage("")

}
	return (
		<form
			className="flex shrink-0 items-center gap-3 h-[8vh] px-4"
			onSubmit={handleSubmit}
		>
			<input
				type="text"
				placeholder="Type here"
			value={message}
			onChange={(e)=> setMessage(e.target.value)}
				className="h-12 flex-1 rounded-lg border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-500"
			/>

			<button
				type="submit"
				className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-2xl text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
			>
				<FiSend />
			</button>
		</form>
	);
};

export default Type