import { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/authContext.js";
import API_URL from "../../api";
import toast from "react-hot-toast";

const EditProfile = ({ onClose }) => {
  const [authUser, setAuthUser] = useAuth();
  const user = authUser?.user || {};

  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [preview, setPreview] = useState(
    user.profilePic
      ? user.profilePic.startsWith("http")
        ? user.profilePic
        : `${API_URL}${user.profilePic}`
      : ""
  );
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      // 1) Update name + bio
      const { data: profileData } = await axios.put(
        `${API_URL}/user/profile`,
        { name: name.trim(), bio: bio.trim() },
        { withCredentials: true }
      );

      let updatedUser = profileData.user;

      // 2) Upload avatar if selected
      if (file) {
        const formData = new FormData();
        formData.append("avatar", file);
        const { data: avatarData } = await axios.put(
          `${API_URL}/user/profile/avatar`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        updatedUser = avatarData.user;
      }

      // Update localStorage + context
      const next = { ...authUser, user: { ...authUser.user, ...updatedUser } };
      localStorage.setItem("messenger", JSON.stringify(next));
      setAuthUser(next);

      toast.success("Profile updated!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const initials = (name || "U")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-700 text-white flex items-center justify-center text-2xl font-bold cursor-pointer ring-4 ring-gray-100"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center text-xs text-white transition-opacity">
                Change
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-400">Click photo to change (max 5MB)</p>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              maxLength={50}
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm text-gray-600">
              Bio
              <span className="text-gray-400">({bio.length}/200)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="Write something about yourself..."
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              className="w-full mt-1 px-3 py-2 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
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
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;