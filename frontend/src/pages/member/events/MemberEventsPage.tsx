import React from "react";
import { useNavigate } from "react-router-dom";

export const MemberEventsPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock data
  const events = [
    { id: "1", title: "Annual General Meeting", date: "2026-09-01T18:00" },
    { id: "2", title: "Summer Party", date: "2026-09-15T20:00" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => (
          <div key={evt.id} className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold">{evt.title}</h2>
              <p className="text-gray-600 mb-4">{new Date(evt.date).toLocaleString()}</p>
            </div>
            <button
              onClick={() => navigate(`/events/${evt.id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
