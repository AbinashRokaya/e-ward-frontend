import React, { useContext, useState } from "react";
import API_URL from "../api/api";
import { LoginContext } from "../components/context/LoginContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { isLogin, setisLogin, userRole, setRole } = useContext(LoginContext);
  const nagavitor = useNavigate();

  const [loginData, setLoginData] = useState({
    otp_phone_number: "",
    otp_code: "",
  });

  const phoneRegex = /^(98|97)\d{8}$/;
  const [isNumber, setIsNumber] = useState(false);

  const handleButtonClick = () => {
    if (isNumber === true) {
      if (loginData.otp_code === "") return;
      fetch(`${API_URL}/v1/users/otp/verify`, {
        method: "POST",
        credentials: "include",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          otp_phone_number: loginData.otp_phone_number.toString(),
          otp_code: loginData.otp_code.toString(),
        }),
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
          console.log("Login successful");
          console.log(data);
          setRole(data.data.user_details.user_role);
          setIsNumber(true);
          nagavitor("/Citizen");
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (isNumber === false) {
      if (phoneRegex.test(loginData.otp_phone_number)) {
        fetch(`${API_URL}/v1/users/otp`, {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            otp_phone_number: loginData.otp_phone_number.toString(),
          }),
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
            console.log(data);
            setIsNumber(true);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />

      <h1 className="text-3xl font-bold text-blue-700">E-Ward System</h1>

      <p className="text-gray-500 text-sm">Login with your phone number</p>

      <div className="w-full  ">
        <label htmlFor="" className="text-md font-bold ">
          Phone Number:
        </label>
        <input
          type="text"
          name="otp_phone_number"
          value={loginData.otp_phone_number}
          readOnly={isNumber}
          onChange={(e) => {
            if (e.target.value === undefined || isNaN(Number(e.target.value)))
              return;
            setLoginData((prev) => ({
              ...prev,
              [e.target.name]: Number(e.target.value),
            }));
          }}
          placeholder="98XXXXXXXX"
          className="border border-gray-400 p-2 rounded-lg w-full mt-1"
        />
      </div>
      {isNumber && (
        <div className="w-full  ">
          <label htmlFor="" className="text-md font-bold ">
            OTP Code:
          </label>
          <input
            type="text"
            name="otp_code"
            value={loginData.otp_code}
            onChange={(e) => {
              if (e.target.value === undefined || isNaN(Number(e.target.value)))
                return;
              setLoginData((prev) => ({
                ...prev,
                [e.target.name]: Number(e.target.value),
              }));
            }}
            placeholder="XXXXXX"
            className="border border-gray-400 p-2 rounded-lg w-full mt-1"
          />
        </div>
      )}

      <div className="w-full  mt-2 mb-2">
        <button
          onClick={handleButtonClick}
          className="bg-blue-500 text-lg text-white p-2 rounded-lg w-full hover:bg-blue-400 hover:shadow-2xl hover:shadow-gray-600 active:bg-blue-600 cursor-pointer"
        >
          {isNumber === true ? "Login" : "Sent OTP"}
        </button>
      </div>
    </div>
  );
}

export default Login;
