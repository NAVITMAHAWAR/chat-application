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
	<div className="flex h-full w-[4%] flex-col bg-gray-800 text-white">
<div className="p-2 mt-auto flex justify-center">
			<button
				type="button"
				onClick={handleLogout}
				className="cursor-pointer rounded-full p-2 text-2xl text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
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