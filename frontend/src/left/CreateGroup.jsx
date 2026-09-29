import { useState } from "react";
import axios from "axios";
import { FiPlus, FiX } from "react-icons/fi";
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
    if (selectedIds.length < 2) return setError("At least two members select karein");
    try {
      const response = await axios.post(`${API_URL}/api/message/groups`, { name, memberIds: selectedIds });
      onCreated(response.data);
      close();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Group create nahi hua");
    }
  };

  return (
    <>
      <button type="button" title="Create group" onClick={() => setOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-xl text-white hover:bg-gray-700">
        <FiPlus />
      </button>
      {open && <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Create group</h2><button type="button" title="Close" onClick={close}><FiX /></button></div>
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Group name" className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-gray-600" />
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {users.map((user) => <label key={user._id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-100"><input type="checkbox" checked={selectedIds.includes(user._id)} onChange={() => toggleUser(user._id)} /><span>{user.name}</span></label>)}
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button type="submit" className="mt-4 w-full rounded-lg bg-gray-800 py-2 text-white hover:bg-gray-700">Create group</button>
        </form>
      </div>}
    </>
  );
};

export default CreateGroup;