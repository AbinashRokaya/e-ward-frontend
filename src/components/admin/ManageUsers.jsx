import React, { useState } from "react";
import Usertable from "../../components/usertable";
import Userform from "../../components/userform";

export default function ManageUsers() {
  const [view, setView] = useState("table"); // "table" | "form"
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setView("form");
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setView("form");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            प्रयोगकर्ता व्यवस्थापन (User Management)
          </h1>
          <p className="text-sm text-slate-500">
            Manage system users, view records, and register profiles.
          </p>
        </div>
        {view === "table" ? (
          <button
            onClick={handleAddNew}
            className="bg-blue-900 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-950 transition"
          >
            + नयाँ प्रयोगकर्ता थप्नुहोस् (Add User)
          </button>
        ) : (
          <button
            onClick={() => setView("table")}
            className="bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-slate-300 transition"
          >
            ← सूचीमा फर्कनुहोस् (Back to List)
          </button>
        )}
      </div>

      {view === "table" ? (
        <Usertable onEdit={handleEdit} />
      ) : (
        <Userform initialData={selectedUser} onSuccess={() => setView("table")} />
      )}
    </div>
  );
}