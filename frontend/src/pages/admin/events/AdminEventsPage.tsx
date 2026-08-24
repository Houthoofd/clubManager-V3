import React from "react";
import { useNavigate } from "react-router-dom";

export const AdminEventsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Events</h1>
        <button
          onClick={() => navigate("/admin/events/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Event
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="pb-2">Title</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Capacity</th>
              <th className="pb-2">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2" colSpan={4}>No events yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
