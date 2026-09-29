import { useState } from "react";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form"
import axios from "axios"
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

const Register = () => {
	const [, setAuthUser] = useAuth()
	const navigate = useNavigate()

	 const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch("password")

  const validatePasswordMatch = (value)=>{
	return value === password || "Password and confirm password dont match"
  }

    const onSubmit =async (data) => {
		const userinfo = {
			name: data.name,
			email:data.email,
			password: data.password,
			confirmPassword: data.confirmPassword
		}
    await axios.post(`${API_URL}/user/register`,userinfo,{ withCredentials: true }).then((res)=>{
			console.log(res.data)

			if(res.data){
				alert("Register SuccessFully ")
			}
			localStorage.setItem("messenger",JSON.stringify(res.data))
			setAuthUser(res.data)
			navigate("/")
		}).catch((error)=>{
			if(error.response){
        alert(error.response.data.message || error.response.data.error || "Registration failed")
			}
		})
	}

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-900 flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gray-300/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gray-200/50 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white/90 backdrop-blur border border-gray-200 rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 border border-gray-200 text-2xl">
            💬
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Join and start chatting with your friends
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm text-gray-700">
              Username
            </label>
			    {errors.name && <span className="text-red-700">**This field is required**</span>}
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-gray-400 transition-all">
              <FiUser className="text-gray-500" />
              <input
                id="username"
                type="text"
                placeholder="your name"
                className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder-gray-400"
              {...register("name", { required: true })}
			  />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm text-gray-700">
              Email
            </label>
			    {errors.email && <span className="text-red-700">**This field is required**</span>}
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-gray-400 transition-all">
              <FiMail className="text-gray-500" />
              <input
                id="email"
                type="email"
                placeholder="Enter Your Email"
				className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder-gray-400"
              {...register("email", { required: true })}
			  />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm text-gray-700">
              Password
            </label>
			    {errors.password && <span className="text-red-700">**This field is required**</span>}
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-gray-400 transition-all">
              <FiLock className="text-gray-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder-gray-400"
              {...register("password", { required: true })}
			  />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm text-gray-700">
              Confirm password
            </label>
			    {errors.confirmPassword && <span className="text-red-700">**This field is required**</span>}
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-gray-400 transition-all">
              <FiLock className="text-gray-500" />
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder-gray-400"
              {...register("confirmPassword", { required: true ,validate: validatePasswordMatch})}
			  />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                title={showConfirm ? "Hide password" : "Show password"}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              name="terms"
              className="mt-0.5 h-4 w-4 rounded accent-gray-600"
            />
            <span>
              I agree to the Terms of Service and Privacy Policy
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gray-800 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors cursor-pointer"
          >
            Sign up
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register