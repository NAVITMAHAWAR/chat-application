import { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/authContext";
import API_URL from "../api";
import toast from "react-hot-toast"

const Register = () => {
  const navigate = useNavigate();
  const [, setAuthUser] = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [emailForOtp, setEmailForOtp] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Start resend countdown
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP
  const onSubmitDetails = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/user/send-otp`,
        {
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
        { withCredentials: true }
      );
      setEmailForOtp(res.data.email);
      setStep(2);
      startResendTimer();
      toast.success("OTP sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.success("Please enter 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/user/verify-otp`,
        { email: emailForOtp, otp },
        { withCredentials: true }
      );
      localStorage.setItem("messenger", JSON.stringify(res.data));
      setAuthUser(res.data);
      toast.success("Registration successful!");
      navigate(res.data?.user?.role === "admin" ? "/admin" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/user/resend-otp`,
        { email: emailForOtp },
        { withCredentials: true }
      );
      startResendTimer();
      toast.success("OTP resent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 text-gray-900 flex items-center justify-center p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gray-400/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gray-300/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-white/80 backdrop-blur border border-gray-200 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 border border-gray-200 text-2xl">
            💬
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {step === 1 ? "Create account" : "Verify OTP"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {step === 1
              ? "Fill details to get started"
              : `OTP sent to ${emailForOtp}`}
          </p>
        </div>

        {/* STEP 1: Details */}
        {step === 1 && (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmitDetails)}>
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Name</label>
              {errors.name && <span className="text-red-600 text-xs">Required</span>}
              <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-400">
                <FiUser className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                  {...register("name", { required: true })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Email</label>
              {errors.email && <span className="text-red-600 text-xs">Required</span>}
              <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-400">
                <FiMail className="text-gray-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                  {...register("email", { required: true })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Password</label>
              {errors.password && <span className="text-red-600 text-xs">Required</span>}
              <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-400">
                <FiLock className="text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                  {...register("password", { required: true, minLength: 6 })}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-700">Confirm Password</label>
              {errors.confirmPassword && (
                <span className="text-red-600 text-xs">Required</span>
              )}
              <div className="flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 focus-within:ring-2 focus-within:ring-gray-400">
                <FiLock className="text-gray-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                  {...register("confirmPassword", { required: true })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50 mt-2"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form className="flex flex-col gap-5" onSubmit={onVerifyOtp}>
            <div>
              <label className="text-sm text-gray-700">Enter 6-digit OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full mt-2 px-4 py-3 text-center text-2xl tracking-[0.5em] font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-2.5 rounded-lg bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Register"}
            </button>

            <div className="text-center text-sm text-gray-500">
              {resendTimer > 0 ? (
                <span>Resend OTP in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-gray-800 font-medium hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
              }}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              ← Change email / details
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?
          <Link to="/login" className="text-gray-900 font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;