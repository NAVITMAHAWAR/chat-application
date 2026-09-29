import { useState } from "react"
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import axios from "axios"
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
	  formState: { errors },
	} = useForm()



	 const onSubmit = async(data) => {
			const userinfo = {
				email:data.email,
				password: data.password,
			}
      await axios.post(`${API_URL}/user/login`,userinfo,{ withCredentials: true }).then((res)=>{
				console.log(res.data)
	
				if(res.data){
					alert("Login SuccessFully ")
				}
				localStorage.setItem("messenger",JSON.stringify(res.data))
				setAuthUser(res.data)
				navigate("/")

			}).catch((error)=>{
				if(error.response){
					alert(error.response.data.message)
				}
			})
		}
  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-900 flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gray-400/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gray-300/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur border border-gray-200 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 border border-gray-200 text-2xl">
            💬
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-500">
            Log in to continue your conversations
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm text-gray-700">
              Email
            </label>
			 {errors.email && <span className="text-red-700">**This field is required**</span>}
            <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-gray-400 transition-all">
              <FiMail className="text-gray-500" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder-gray-400"
              {...register("email", { required: true })}
			 />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm text-gray-700">
                Password
              </label>
			   {errors.password && <span className="text-red-700">**This field is required**</span>}
              <a
                href="#"
                className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-gray-400 transition-all">
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

          {/* Remember me */}
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="remember"
              className="h-4 w-4 rounded accent-gray-500"
            />
            <span>Remember me</span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors cursor-pointer"
          >
            Log in
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-500">OR</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Social */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <span className="text-base">G</span>
          Continue with Google
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-gray-900 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login