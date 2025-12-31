"use client";

import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";

const ForgotPasswordFlow = ({ isOpen, onClose }) => {
  // Always start at "email"
  const [step, setStep] = useState("email");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPass, setShowPass] = useState(false);

  // Reset the flow to step 1 whenever the modal is closed/opened
  useEffect(() => {
    if (!isOpen) {
      setStep("email");
      setOtp(["", "", "", "", "", ""]);
    }
  }, [isOpen]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-1 rounded-full border border-primary/30 text-primary hover:bg-secondary/50 transition-all"
        >
          <X size={20} />
        </button>

        {/* STEP 1: EMAIL */}
        {step === "email" && (
          <div className="space-y-6">
            <div className="text-center space-y-2 mt-4">
              <h2 className="text-2xl font-bold text-dark">
                Forget password ?
              </h2>
              <p className="text-gray-500 text-sm">
                Enter email to receive verification code
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-dark">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white border border-primary/30 rounded-xl focus:outline-none focus:border-primary text-dark"
              />
            </div>
            <button
              onClick={() => setStep("otp")}
              className="w-full py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
            >
              Send Code
            </button>
          </div>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <div className="space-y-8">
            <div className="text-center space-y-2 mt-4">
              <h2 className="text-2xl font-bold text-dark">
                Verification Code
              </h2>
              <p className="text-gray-500 text-sm">
                Check your email for the 6-digit code
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-12 h-12 border-2 border-primary/30 rounded-xl text-center text-xl font-bold focus:border-primary focus:outline-none bg-secondary/10 text-dark"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                />
              ))}
            </div>
            <button
              onClick={() => setStep("reset")}
              className="w-full py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
            >
              Verify Code
            </button>
          </div>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === "reset" && (
          <div className="space-y-6">
            <div className="text-center space-y-2 mt-4">
              <h2 className="text-2xl font-bold text-dark">Set New Password</h2>
              <p className="text-gray-500 text-sm">
                Create a new strong password
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-dark">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="********"
                    className="w-full px-4 py-3 bg-white border border-primary/30 rounded-xl focus:outline-none focus:border-primary text-dark"
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-dark">
                  Confrim Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="********"
                    className="w-full px-4 py-3 bg-white border border-primary/30 rounded-xl focus:outline-none focus:border-primary text-dark"
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:opacity-90 transition-all"
            >
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordFlow;
