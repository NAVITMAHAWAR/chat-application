import { useForm } from "react-hook-form";
import { FiEdit2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAdminUsers } from "../hooks/useAdminUsers";

const EditUserModal = ({ user, onClose, onSuccess }) => {
  const { updateUser } = useAdminUsers();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateUser(user._id, data);
      toast.success("User updated");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[#e3e9e6] bg-white p-6 shadow-[0_24px_70px_rgba(16,40,31,0.18)]">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e5f4ef] text-[#087f68]"><FiEdit2 /></span>
          <div><h3 className="font-[Manrope] text-lg font-bold text-[#17211f]">Edit user</h3><p className="text-xs text-[#71807b]">Update account details</p></div>
          <button type="button" onClick={onClose} aria-label="Close" className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-[#71807b] hover:bg-[#f1f5f3]"><FiX /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600">Role</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              {...register("role")}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;