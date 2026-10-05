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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="edit-user-name" className="text-xs font-semibold text-[#34423d]">Name</label>
              {errors.name && <span className="text-xs text-rose-600">{errors.name.message}</span>}
            </div>
            <input
              id="edit-user-name"
              className="h-11 w-full rounded-xl border border-[#e1e8e4] bg-[#f8faf9] px-3.5 text-sm text-[#17211f] outline-none transition focus:border-[#87bda8] focus:bg-white"
              {...register("name", { required: "Name is required" })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="edit-user-email" className="text-xs font-semibold text-[#34423d]">Email</label>
              {errors.email && <span className="text-xs text-rose-600">{errors.email.message}</span>}
            </div>
            <input
              id="edit-user-email"
              type="email"
              className="h-11 w-full rounded-xl border border-[#e1e8e4] bg-[#f8faf9] px-3.5 text-sm text-[#17211f] outline-none transition focus:border-[#87bda8] focus:bg-white"
              {...register("email", { required: "Email is required" })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="edit-user-role" className="text-xs font-semibold text-[#34423d]">Role</label>
            <select
              id="edit-user-role"
              className="h-11 w-full rounded-xl border border-[#e1e8e4] bg-[#f8faf9] px-3 text-sm text-[#34423d] outline-none transition focus:border-[#87bda8] focus:bg-white"
              {...register("role")}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-[#e1e8e4] px-4 text-sm font-semibold text-[#53625c] transition hover:bg-[#f1f5f3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl bg-[#183b32] px-4 text-sm font-semibold text-white transition hover:bg-[#245346] disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;