import { useState } from "react"
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiMessageCircle } from "react-icons/fi"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/authContext"
import { useNavigate } from "react-router-dom"
import API_URL from "../api"

const Login = () => {
	const navigate = useNavigate()
	const [, setAuthUser] = useAuth()
  const [showPassword, setShowPassword] = useState(false)
   const {
	  register,
	  handleSubmit,
	  formState: { errors, isSubmitting },
	} = useForm()



	 const onSubmit = async (data) => {
      try {
        const response = await axios.post(`${API_URL}/user/login`, data, { withCredentials: true })
        localStorage.setItem("messenger", JSON.stringify(response.data))
        setAuthUser(response.data)
        toast.success("Welcome back")
        navigate(response.data?.user?.role === "admin" ? "/admin" : "/")
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to sign in. Check your details and try again.")
      }
    }
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#edf3f0] px-4 py-10 text-[#17211f]">
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(#9ab5aa 0.7px, transparent 0.7px)", backgroundSize: "18px 18px" }} />
      <div className="page-enter relative w-full max-w-110 rounded-2xl border border-white/80 bg-white px-6 py-8 shadow-[0_28px_80px_rgba(28,63,49,0.12)] sm:px-10 sm:py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-[15px] bg-[#e5f4ef] text-[#087f68]">
            <FiMessageCircle size={22} />
          </div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#087f68]">Chatly</p>
          <h1 className="font-[Manrope] text-[27px] font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-[#71807b]">
            Sign in to pick up where you left off.
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-semibold text-[#34423d]">
              Email
            </label>
			 {errors.email && <span className="text-xs text-rose-600">Email is required</span>}
            <div className="flex h-12 items-center rounded-xl border border-[#e1e8e4] bg-[#f8faf9] px-3.5 transition focus-within:border-[#87bda8] focus-within:bg-white">
              <FiMail className="text-[#83918b]" size={16} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full bg-transparent px-3 text-sm text-[#17211f] outline-none placeholder:text-[#a0aba6]"
              {...register("email", { required: true })}
			 />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs font-semibold text-[#34423d]">
                Password
              </label>
			   {errors.password && <span className="text-xs text-rose-600">Password is required</span>}
            </div>
            <div className="flex h-12 items-center rounded-xl border border-[#e1e8e4] bg-[#f8faf9] px-3.5 transition focus-within:border-[#87bda8] focus-within:bg-white">
              <FiLock className="text-[#83918b]" size={16} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-transparent px-3 text-sm text-[#17211f] outline-none placeholder:text-[#a0aba6]"
              {...register("password", { required: true })}
			  />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="grid h-8 w-8 place-items-center rounded-lg text-[#83918b] transition-colors hover:bg-[#edf3f0] hover:text-[#17211f]"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#183b32] text-sm font-semibold text-white transition hover:bg-[#245346] disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}<FiArrowRight aria-hidden="true" />
          </button>
        </form>

        {/* Footer */}
        <p className="mt-7 text-center text-sm text-[#71807b]">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-[#087f68] hover:text-[#066b58]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login