function UserTable() {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <table className="w-full">

        <thead>

          <tr className="border-b">

            <th className="text-left py-3">
              Name
            </th>

            <th className="text-left py-3">
              Role
            </th>

            <th className="text-left py-3">
              District
            </th>

            <th className="text-left py-3">
              Ward
            </th>

            <th className="text-left py-3">
              Status
            </th>

          </tr>

        </thead>

        <tbody>

          <tr>

            <td className="py-4">
              Ram Sharma
            </td>

            <td>
              Admin
            </td>

            <td>
              Kathmandu
            </td>

            <td>
              5
            </td>

            <td>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                Active
              </span>
            </td>

          </tr>

        </tbody>

      </table>

    </div>
  );
}

export default UserTable;