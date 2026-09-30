import { useState } from "react";
import axios from "axios";
import { FiPlus, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import API_URL from "../api";
import useGetAllUsers from "../context/userGetAllUsers";

const CreateGroup = ({ onCreated }) => {
  const [usersData] = useGetAllUsers();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState("");

  const users = Array.isArray(usersData?.filtredUser) ? usersData.filtredUser : [];
  const toggleUser = (id) => setSelectedIds((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id]);

  const close = () => {
    setOpen(false);
    setName("");
    setSelectedIds([]);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedIds.length < 2) return setError("Select at least two members");
    try {
      const response = await axios.post(`${API_URL}/api/message/groups`, { name, memberIds: selectedIds });
      onCreated(response.data);
      toast.success("Group created");
      close();
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to create group";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <>
      <button type="button" title="Create group" aria-label="Create group" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl bg-[#183b32] text-lg text-white transition hover:bg-[#245346]">
        <FiPlus />
      </button>
      {open && <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-[#e3e9e6] bg-white p-5 shadow-[0_24px_70px_rgba(16,40,31,0.18)]">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="font-[Manrope] text-lg font-bold text-[#17211f]">Create a group</h2><p className="mt-0.5 text-xs text-[#71807b]">Bring your people together</p></div><button type="button" aria-label="Close" onClick={close} className="grid h-9 w-9 place-items-center rounded-lg text-[#71807b] hover:bg-[#f1f5f3]"><FiX /></button></div>
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Group name" className="mb-3 h-11 w-full rounded-xl border border-[#e1e8e4] bg-[#f8faf9] px-3.5 text-sm outline-none focus:border-[#87bda8] focus:bg-white" />
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {users.map((user) => <label key={user._id} className="flex cursor-pointer items-center gap-3 rounded-xl p-2 text-sm text-[#34423d] hover:bg-[#f4f8f6]"><input type="checkbox" checked={selectedIds.includes(user._id)} onChange={() => toggleUser(user._id)} className="h-4 w-4 accent-[#087f68]" /><span>{user.name}</span></label>)}
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button type="submit" className="mt-4 h-11 w-full rounded-xl bg-[#183b32] text-sm font-semibold text-white transition hover:bg-[#245346]">Create group</button>
        </form>
      </div>}
    </>
  );
};

export default CreateGroup;