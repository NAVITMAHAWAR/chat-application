import { useState } from "react";
import { FiArrowRight, FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiMessageCircle, FiShield } from "react-icons/fi";
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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#edf3f0] px-4 py-10 text-[#17211f]">
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(#9ab5aa 0.7px, transparent 0.7px)", backgroundSize: "18px 18px" }} />
      <div className="page-enter relative w-full max-w-110 rounded-2xl border border-white/80 bg-white px-6 py-8 shadow-[0_28px_80px_rgba(28,63,49,0.12)] sm:px-10 sm:py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-[15px] bg-[#e5f4ef] text-[#087f68]">
            {step === 1 ? <FiMessageCircle size={22} /> : <FiShield size={22} />}
          </div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#087f68]">Chatly</p>
          <h1 className="font-[Manrope] text-[27px] font-bold tracking-tight">
            {step === 1 ? "Create your account" : "Verify your email"}
          </h1>
          <p className="mt-2 text-sm text-[#71807b]">
            {step === 1
              ? "Join your community in a few steps."
              : `We sent a 6-digit code to ${emailForOtp}`}
          </p>
        </div>

        {/* STEP 1: Details */}
        {step === 1 && (
          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmitDetails)}>
            {/* Name */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="name" className="text-xs font-semibold text-[#34423d]">Name</label>
                {errors.name && <span className="text-xs text-rose-600">Name is required</span>}
              </div>
              <div className="flex h-12 items-center rounded-xl border border-[#e1e8e4] bg-[#f8faf9] px-3.5 transition focus-within:border-[#87bda8] focus-within:bg-white">
                <FiUser className="text-[#83918b]" size={16} />
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-transparent px-3 text-sm text-[#17211f] outline-none placeholder:text-[#a0aba6]"
                  {...register("name", { required: true })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="email" className="text-xs font-semibold text-[#34423d]">Email</label>
                {errors.email && <span className="text-xs text-rose-600">Email is required</span>}
              </div>
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
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="password" className="text-xs font-semibold text-[#34423d]">Password</label>
                {errors.password && <span className="text-xs text-rose-600">At least 6 characters required</span>}
              </div>
              <div className="flex h-12 items-center rounded-xl border border-[#e1e8e4] bg-[#f8faf9] px-3.5 transition focus-within:border-[#87bda8] focus-within:bg-white">
                <FiLock className="text-[#83918b]" size={16} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 text-sm text-[#17211f] outline-none placeholder:text-[#a0aba6]"
                  {...register("password", { required: true, minLength: 6 })}
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

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="confirmPassword" className="text-xs font-semibold text-[#34423d]">Confirm password</label>
                {errors.confirmPassword && <span className="text-xs text-rose-600">Confirm your password</span>}
              </div>
              <div className="flex h-12 items-center rounded-xl border border-[#e1e8e4] bg-[#f8faf9] px-3.5 transition focus-within:border-[#87bda8] focus-within:bg-white">
                <FiLock className="text-[#83918b]" size={16} />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-transparent px-3 text-sm text-[#17211f] outline-none placeholder:text-[#a0aba6]"
                  {...register("confirmPassword", { required: true })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#183b32] text-sm font-semibold text-white transition hover:bg-[#245346] disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Sending code..." : "Create account"}<FiArrowRight aria-hidden="true" />
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form className="flex flex-col gap-5" onSubmit={onVerifyOtp}>
            <div className="flex flex-col gap-2">
              <label htmlFor="otp" className="text-xs font-semibold text-[#34423d]">6-digit code</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="h-14 w-full rounded-xl border border-[#e1e8e4] bg-[#f8faf9] text-center font-[Manrope] text-2xl font-bold tracking-[0.4em] text-[#17211f] outline-none transition placeholder:text-[#c3cdc8] focus:border-[#87bda8] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#183b32] text-sm font-semibold text-white transition hover:bg-[#245346] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify and continue"}<FiArrowRight aria-hidden="true" />
            </button>

            <div className="text-center text-sm text-[#71807b]">
              {resendTimer > 0 ? (
                <span>Resend code in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-semibold text-[#087f68] hover:text-[#066b58]"
                >
                  Resend code
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
              }}
              className="text-sm text-[#71807b] hover:text-[#17211f]"
            >
              ← Change email or details
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-[#71807b]">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#087f68] hover:text-[#066b58]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;