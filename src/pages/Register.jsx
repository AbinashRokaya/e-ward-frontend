import React, { useState } from "react";
import API_URL from "../api/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState({
    user_name: "",
    user_phone_number: "",
    password: "", // Added password field required for account creation
    user_citizenship_number: "",
    user_provience: "Bagmati",
    user_district: "",
    user_municipality: "",
    user_ward_number: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("FORM DATA", registerData);

    fetch(`${API_URL}/v1/users`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            throw data;
          }
          return data;
        });
      })
      .then((data) => {
        console.log("Submission successful", data);
        alert("Registration successful! Please login.");
        navigate("/login");
      })
      .catch((err) => {
        console.error("Submission failed:", err);
        alert(err.message || "Failed to connect to server. Ensure backend is running.");
      });
  };

  return (
    <div className="min-h-screen w-full flex flex-col gap-6 justify-center items-center bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col gap-4">
        
        <div className="w-full flex justify-center items-center">
          <h1 className="text-2xl font-extrabold text-blue-950">Register Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              User Name:
            </label>
            <input
              type="text"
              name="user_name"
              required
              value={registerData.user_name}
              onChange={(e) => {
                setRegisterData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }));
              }}
              placeholder="Full Name"
              className="border border-slate-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Phone Number:
            </label>
            <input
              type="text"
              name="user_phone_number"
              required
              value={registerData.user_phone_number}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  setRegisterData((prev) => ({
                    ...prev,
                    user_phone_number: val,
                  }));
                }
              }}
              placeholder="98XXXXXXXX"
              maxLength={10}
              className="border border-slate-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Password:
            </label>
            <input
              type="password"
              name="password"
              required
              value={registerData.password}
              onChange={(e) => {
                setRegisterData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }));
              }}
              placeholder="••••••••"
              className="border border-slate-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Citizenship Number */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Citizenship Number:
            </label>
            <input
              type="text"
              required
              name="user_citizenship_number"
              value={registerData.user_citizenship_number}
              onChange={(e) => {
                setRegisterData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }));
              }}
              placeholder="xx-xx-xx-xxxx"
              className="border border-slate-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Province Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Province Name:
            </label>
            <select
              name="user_provience"
              required
              value={registerData.user_provience}
              onChange={(e) => {
                setRegisterData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }));
              }}
              className="border border-slate-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:border-blue-900 bg-white"
            >
              {[
                "Koshi",
                "Madhesh",
                "Bagmati",
                "Gandaki",
                "Lumbini",
                "Karnali",
                "Sudurpashchim",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* District Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              District Name:
            </label>
            <input
              type="text"
              name="user_district"
              required
              value={registerData.user_district}
              onChange={(e) => {
                setRegisterData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }));
              }}
              placeholder="e.g. Kathmandu"
              className="border border-slate-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Municipality */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Municipality:
            </label>
            <input
              type="text"
              required
              name="user_municipality"
              value={registerData.user_municipality}
              onChange={(e) => {
                setRegisterData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }));
              }}
              placeholder="e.g. Kathmandu"
              className="border border-slate-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Ward Number */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Ward Number:
            </label>
            <input
              type="text"
              name="user_ward_number"
              required
              value={registerData.user_ward_number}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  setRegisterData((prev) => ({
                    ...prev,
                    user_ward_number: val,
                  }));
                }
              }}
              placeholder="1"
              maxLength={2}
              className="border border-slate-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Submit Button */}
          <div className="w-full pt-2">
            <button
              type="submit"
              className="bg-blue-950 text-sm font-semibold text-white p-3 rounded-lg w-full hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
            >
              Register
            </button>
          </div>
        </form>

        <p className="text-xs text-slate-500 text-center mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-900 font-bold hover:underline">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;