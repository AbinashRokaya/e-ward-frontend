function UserForm() {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-semibold mb-6">
        Add User
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <input
          type="text"
          placeholder="First Name"
          className="border rounded-lg p-3"
        />

        <input
          type="text"
          placeholder="Last Name"
          className="border rounded-lg p-3"
        />

        <input
          type="email"
          placeholder="Email"
          className="border rounded-lg p-3"
        />

        <input
          type="tel"
          placeholder="Phone Number"
          className="border rounded-lg p-3"
        />

        <select className="border rounded-lg p-3">
          <option>Select Role</option>
          <option>Admin</option>
          <option>Ward Officer</option>
          <option>Operator</option>
        </select>

        <input
          type="text"
          placeholder="District"
          className="border rounded-lg p-3"
        />

        <input
          type="number"
          placeholder="Ward Number"
          className="border rounded-lg p-3"
        />

      </div>

      <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Create User
      </button>

    </div>
  );
}

export default UserForm;