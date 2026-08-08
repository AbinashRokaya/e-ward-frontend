import React, { useContext, useState } from "react";
import API_URL from "../api/api";
import { LoginContext } from "../components/context/LoginContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const loginContext = useContext(LoginContext) || {};
  const setisLogin = loginContext.setisLogin || (() => {});
  const setRole = loginContext.setRole || (() => {});

  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    phone_number: "",
    password: "",
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (!loginData.phone_number || !loginData.password) {
      alert("Please enter both phone number and password.");
      return;
    }

    fetch(`${API_URL}/v1/users/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: loginData.phone_number.trim(),
        password: loginData.password,
      }),
    })
      .then((res) => {
        return res.json().then((data) => {
          if (!res.ok) throw data;
          return data;
        });
      })
      .then((data) => {
        console.log("Login successful", data);
        setRole(data?.data?.user_details?.user_role || "citizen");
        setisLogin(true);
        navigate("/");
      })
      .catch((err) => {
        console.error("Login Error:", err);
        alert(err.message || "Invalid phone number or password.");
      });
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center gap-4 font-sans">
      <h1 className="text-2xl font-extrabold text-blue-950">E-Ward System</h1>
      <p className="text-slate-500 text-xs">Login with your phone number and password</p>

      <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
        {/* Phone Number Input */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Phone Number:
          </label>
          <input
            type="text"
            value={loginData.phone_number}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d+$/.test(val)) {
                setLoginData((prev) => ({ ...prev, phone_number: val }));
              }
            }}
            placeholder="98XXXXXXXX"
            maxLength={10}
            required
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
            value={loginData.password}
            onChange={(e) =>
              setLoginData((prev) => ({ ...prev, password: e.target.value }))
            }
            placeholder="••••••••"
            required
            className="border border-slate-300 p-2.5 rounded-lg w-full text-sm focus:outline-none focus:border-blue-900"
          />
        </div>

        {/* Login Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="bg-blue-950 text-sm text-white font-semibold p-3 rounded-lg w-full hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
          >
            Login
          </button>
        </div>
      </form>

      {/* Registration Link */}
      <p className="text-xs text-slate-500 mt-2">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-950 font-bold hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}

export default Login;