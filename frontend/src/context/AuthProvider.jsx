import { useState } from "react";
import { AuthContext } from "./authContext";

const getStoredUser = () => {
	try {
		const stored = localStorage.getItem("messenger");
		if (!stored || stored === "undefined") return null;
		return JSON.parse(stored);
	} catch {
		return null;
	}
};

export const AuthProvider = ({children}) => {
	const [authUser, setAuthUser] = useState(getStoredUser)



  return (
	<AuthContext.Provider value={[authUser, setAuthUser]}>
		{children}
	</AuthContext.Provider>
  )
}
