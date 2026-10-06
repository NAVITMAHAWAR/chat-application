import { useState } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api";
import EditProfile from "../../admin/components/EditProfile.jsx";
import { FiEdit2, FiLogOut } from "react-icons/fi";

const LogOut = () => {
  const [authUser, setAuthUser] = useAuth();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);

  const user = authUser?.user || {};
  const pic = user.profilePic
    ? user.profilePic.startsWith("http")
      ? user.profilePic
      : `${API_URL}${user.profilePic}`
    : "";

  const initials = (user.name || "U")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/user/LogOut`, {}, { withCredentials: true });
    } catch {}
    localStorage.removeItem("messenger");
    setAuthUser(null);
    navigate("/login");
  };

  return (
    <>
      <div className="flex h-full w-full flex-col items-center gap-3 border-r border-[#e3e9e6] bg-white px-2 py-4">
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowEdit(true)}
          className="flex w-full flex-col items-center gap-1.5 rounded-xl p-1.5 text-center transition-colors hover:bg-[#f5f8f6]"
          title="Update profile"
          aria-label="Update profile"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f4ef] text-sm font-bold text-[#087f68]">
            <span className="h-full w-full overflow-hidden rounded-full">
              {pic ? (
                <img src={pic} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-[#087f68] text-white">
              <FiEdit2 aria-hidden="true" size={10} />
            </span>
          </div>
          <span className="w-full truncate text-[10px] font-semibold text-[#34423d]">
            {user.name || "Profile"}
          </span>
        </button>
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="grid h-10 w-10 place-items-center rounded-xl text-rose-700 transition-colors hover:bg-rose-50"
        >
          <FiLogOut aria-hidden="true" size={18} />
        </button>
      </div>

      {showEdit && <EditProfile onClose={() => setShowEdit(false)} />}
    </>
  );
};

export default LogOut;