import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { TabGroup } from "../../../shared/components/Navigation/TabGroup";
import { CalendarAltIcon, ClipboardListIcon } from "@patternfly/react-icons";
import { useEvents } from "../hooks/useEvents";

export const EventsPage: React.FC = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { events, isLoading } = useEvents();

  const [activeTab, setActiveTab] = useState("list");

  const tabs = [
    {
      id: "list",
      label: "Tous les évènements",
      icon: <ClipboardListIcon className="w-5 h-5" />,
      testId: "tab-list",
    },
    {
      id: "upcoming",
      label: "Vue cartes",
      icon: <CalendarAltIcon className="w-5 h-5" />,
      testId: "tab-upcoming",
    },
  ];

  return (
    <div className="space-y-6" data-testid="events-page">
      <PageHeader
        title={t("navigation.events", { defaultValue: "Évènements" })}
        description="Gérez les évènements de votre club et les inscriptions."
        icon={<CalendarAltIcon className="w-8 h-8 text-blue-600" />}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 px-2">
          <TabGroup
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="p-6">
          {activeTab === "list" && (
            <div className="space-y-4">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => navigate("/admin/events/create")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Créer un évènement
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-3 text-sm font-semibold text-gray-600">Titre</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Capacité</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((evt) => (
                      <tr key={evt.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 font-medium text-gray-800">{evt.title}</td>
                        <td className="py-3 text-gray-600">{new Date(evt.start_date).toLocaleString()}</td>
                        <td className="py-3 text-gray-600">{evt.capacity}</td>
                        <td className="py-3 text-gray-600">{evt.price} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "upcoming" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => (
                <div key={evt.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{evt.title}</h2>
                    <div className="flex items-center text-gray-500 mb-4 text-sm">
                      <CalendarAltIcon className="w-4 h-4 mr-2" />
                      {new Date(evt.start_date).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/events/${evt.id}`)}
                    className="w-full bg-blue-50 text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors mt-4"
                  >
                    Voir les détails
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
