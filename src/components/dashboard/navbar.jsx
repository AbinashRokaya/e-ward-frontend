import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="bg-white shadow-sm p-4 flex justify-between items-center">

      <h2 className="text-2xl font-semibold">
        User Management
      </h2>

      <div className="flex items-center gap-3">

        <div className="text-right">
          <p className="font-semibold">
            Admin User
          </p>

          <p className="text-sm text-gray-500">
            Super Admin
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-600"></div>

      </div>

    </div>
  );
}

export default Navbar;