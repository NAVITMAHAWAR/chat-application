import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import API_URL from "../../api";

const LogOut = () => {
  const navigate = useNavigate();
  const [, setAuthUser] = useAuth();

  const handleLogout = async () => {
	try {
	  await axios.post(`${API_URL}/user/LogOut`, {}, { withCredentials: true });
	} finally {
	localStorage.removeItem("messenger");
	setAuthUser(null);
	navigate("/login");
	}
  };

  return (
	<div className="flex h-full w-12 shrink-0 flex-col items-center rounded-none bg-[#18362f] py-3 text-white sm:w-[58px] sm:rounded-2xl sm:py-4">
<div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 font-[Manrope] text-sm font-extrabold tracking-wide text-[#a9e4ce]" aria-label="Chatly">C</div>
<div className="mt-auto flex justify-center p-1">
			<button
				type="button"
				onClick={handleLogout}
				className="cursor-pointer rounded-xl p-2.5 text-[#c1d2cc] transition-colors hover:bg-white/10 hover:text-white"
				title="Logout"
				aria-label="Logout"
			>
				<FiLogOut />
			</button>
	</div>	
	</div>
  )
}

export default LogOut