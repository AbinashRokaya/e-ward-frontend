import AdminLayout from "../../layouts/AdminLayout";
// import UserTable from "../../components/admin/usertable";

function Users() {
  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add User
        </button>
      </div>

      {/* <UserTable /> */}
    </AdminLayout>
  );
}

export default Users;
