import React, { useContext, useState } from "react";
import API_URL from "../api/api";
import { LoginContext } from "../components/context/LoginContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { setisLogin, setRole } = useContext(LoginContext);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    otp_phone_number: "",
    otp_code: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneRegex = /^(98|97)\d{8}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow numbers only
    if (!/^\d*$/.test(value)) {
      return;
    }

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SEND OTP
  // =========================
  const sendOTP = async () => {
    if (!phoneRegex.test(loginData.otp_phone_number)) {
      alert("Please enter a valid phone number.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/v1/users/otp`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp_phone_number: loginData.otp_phone_number,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      console.log("OTP sent successfully:", data);

      setOtpSent(true);
    } catch (error) {
      console.error("OTP sending failed:", error);

      let message = "Failed to send OTP.";

      if (typeof error?.detail === "string") {
        message = error.detail;
      } else if (Array.isArray(error?.detail)) {
        message = error.detail.map((item) => item.msg).join(", ");
      } else if (error?.message) {
        message = error.message;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY OTP / LOGIN
  // =========================
  const verifyOTP = async () => {
    if (!loginData.otp_code) {
      alert("Please enter the OTP code.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/v1/users/otp/verify`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp_phone_number: loginData.otp_phone_number,
          otp_code: loginData.otp_code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      console.log("Login successful:", data);

      const role = data?.data?.user_details?.user_role;

      if (!role) {
        throw new Error("User role was not returned by the server.");
      }

      // =========================
      // UPDATE GLOBAL LOGIN STATE
      // =========================
      setRole(role);
      setisLogin(true);

      // =========================
      // REDIRECT BASED ON ROLE
      // =========================

      switch (role) {
        case "superadmin":
          navigate("/admin");
          break;

        case "citizen":
          navigate("/citizen");
          break;

        case "wardchairperson":
          navigate("/wardchairperson");
          break;

        case "wardsecretary":
          navigate("/wardsecretary");
          break;

        case "datavalidationofficer":
          navigate("/validation");
          break;

        default:
          console.warn("Unknown user role:", role);
          navigate("/");
          break;
      }
    } catch (error) {
      console.error("Login failed:", error);

      let message = "Invalid OTP.";

      if (typeof error?.detail === "string") {
        message = error.detail;
      } else if (Array.isArray(error?.detail)) {
        message = error.detail.map((item) => item.msg).join(", ");
      } else if (error?.message) {
        message = error.message;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORM SUBMIT
  // =========================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (otpSent) {
      verifyOTP();
    } else {
      sendOTP();
    }
  };

  // =========================
  // CHANGE PHONE NUMBER
  // =========================
  const changePhoneNumber = () => {
    setOtpSent(false);

    setLoginData((prev) => ({
      ...prev,
      otp_code: "",
    }));
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Logo */}
      <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />

      {/* Title */}
      <h1 className="text-3xl font-bold text-blue-700">E-Ward System</h1>

      <p className="text-gray-500 text-sm">Login with your phone number</p>

      <form onSubmit={handleSubmit} className="w-full">
        {/* ================= PHONE NUMBER ================= */}
        <div className="w-full mb-4">
          <label htmlFor="otp_phone_number" className="text-md font-bold">
            Phone Number:
          </label>

          <input
            id="otp_phone_number"
            type="text"
            name="otp_phone_number"
            value={loginData.otp_phone_number}
            readOnly={otpSent}
            onChange={handleChange}
            maxLength={10}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="98XXXXXXXX"
            className="border border-gray-400 p-2 rounded-lg w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Change phone */}
          {otpSent && (
            <button
              type="button"
              onClick={changePhoneNumber}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              Change phone number
            </button>
          )}
        </div>

        {/* ================= OTP ================= */}
        {otpSent && (
          <div className="w-full mb-4">
            <label htmlFor="otp_code" className="text-md font-bold">
              OTP Code:
            </label>

            <input
              id="otp_code"
              type="text"
              name="otp_code"
              value={loginData.otp_code}
              onChange={handleChange}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="XXXXXX"
              className="border border-gray-400 p-2 rounded-lg w-full mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* ================= BUTTON ================= */}
        <div className="w-full mt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-lg text-white p-2 rounded-lg w-full hover:bg-blue-400 active:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Please wait..." : otpSent ? "Login" : "Send OTP"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
