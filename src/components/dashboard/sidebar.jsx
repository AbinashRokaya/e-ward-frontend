import React from "react";
import { Link } from "react-router-dom";




function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-blue-900 text-white">

      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold">
          E-Ward Admin
        </h1>
      </div>

      <nav className="mt-6">

        <ul className="space-y-2 px-4">

          <li>
            <button className="w-full text-left p-3 rounded-lg hover:bg-blue-700">
              Dashboard
            </button>
          </li>

          <li>
            <button className="w-full text-left p-3 rounded-lg hover:bg-blue-700">
              Users
            </button>
          </li>

          <li>
            <button className="w-full text-left p-3 rounded-lg hover:bg-blue-700">
              Roles
            </button>
          </li>

          <li>
            <button className="w-full text-left p-3 rounded-lg hover:bg-blue-700">
              Settings
            </button>
          </li>

        </ul>

      </nav>

    </div>
  );
}

export default Sidebar;