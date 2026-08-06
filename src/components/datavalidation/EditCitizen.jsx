import React, { useState } from "react";
import CitizenConformForm from "./CitizenConformForm";
import API_URL from "../../api/api";

function EditCitizen({ citizen, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    ...citizen,
  });

  const handlleApproved = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    const approved_data = {
      user_id: formData.user_id,
      user_phone_number: formData.user_phone_number,
      user_status: e.target.value,
    };
    fetch(`${API_URL}/v1/users/verif/Citizen`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(approved_data),
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
        console.log("Submission successful");
        console.log(data);
        if (onSaved) onSaved();
        onClose();
      })
      .catch((err) => {
        console.error("Submission failed:", err);
      });
  };
  const handlleRejected = (e) => {
    e.preventDefault();
    console.log(e.target.value);
    const rejected_data = {
      user_id: formData.user_id,
      user_phone_number: formData.user_phone_number,
      user_status: e.target.value,
    };
    fetch(`${API_URL}/v1/users/verif/Citizen`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rejected_data),
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
        console.log("Submission successful");
        console.log(data);
        if (onSaved) onSaved();
        onClose();
      })
      .catch((err) => {
        console.error("Submission failed:", err);
      });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-blue-700">
            वडा सम्पादन गर्नुहोस् (Edit Ward)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <form
          //  onSubmit={handleSubmit}
          noValidate
        >
          <CitizenConformForm
            formData={formData}
            // errors={errors}
            // onChange={handleChange}
            // onContactChange={handleContactChange}
          />
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              value="rejected"
              onClick={handlleRejected}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Rejected
            </button>

            <button
              type="button"
              value="approved"
              onClick={handlleApproved}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Aproved
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCitizen;
