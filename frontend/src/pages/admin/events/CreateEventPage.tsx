import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { CalendarAltIcon, ArrowLeftIcon } from "@patternfly/react-icons";
import { ImageUpload } from "../../../shared/components/ui/ImageUpload";

import { useEvents } from "../../../features/events/hooks/useEvents";

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { createEvent, isCreating, uploadEventImage, isUploadingImage } = useEvents();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    capacity: "",
    price: "",
    visibility: "public" as const,
    min_grade_id: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEvent = await createEvent({
        ...formData,
        start_date: new Date(formData.date),
        end_date: new Date(new Date(formData.date).getTime() + 2 * 60 * 60 * 1000), // Default +2h
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        price: formData.price ? parseInt(formData.price) : undefined,
        min_grade_id: formData.min_grade_id ? parseInt(formData.min_grade_id) : undefined,
      });

      if (imageFile && newEvent.id) {
        await uploadEventImage({ eventId: newEvent.id, file: imageFile });
      }

      navigate("/events");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6" data-testid="create-event-page">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/events")}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Retour aux évènements"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <PageHeader
          title="Créer un évènement"
          description="Ajoutez un nouvel évènement au calendrier du club."
          icon={<CalendarAltIcon className="w-8 h-8 text-blue-600" />}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-3xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block mb-1.5 font-medium text-gray-700">Titre de l'évènement *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                placeholder="Ex: Assemblée générale annuelle"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 font-medium text-gray-700">Date et Heure *</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 font-medium text-gray-700">Visibilité</label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              >
                <option value="public">Public</option>
                <option value="members_only">Membres uniquement</option>
                <option value="invite_only">Sur invitation</option>
              </select>
            </div>

            <div>
              <label className="block mb-1.5 font-medium text-gray-700">Capacité (personnes)</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                placeholder="Ex: 50"
              />
            </div>

            <div>
              <label className="block mb-1.5 font-medium text-gray-700">Prix (€)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                placeholder="Ex: 15"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block mb-1.5 font-medium text-gray-700">Grade Minimum Requis (Optionnel)</label>
              <input
                type="text"
                name="min_grade_id"
                value={formData.min_grade_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                placeholder="ID du grade"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1.5 font-medium text-gray-700">Image de l'évènement (Optionnel)</label>
              <ImageUpload
                onImageSelected={setImageFile}
                isUploading={isUploadingImage}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isCreating ? "Création..." : "Créer l'évènement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
