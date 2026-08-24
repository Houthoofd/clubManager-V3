import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "../../../features/events/hooks/useEvents";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { ConfirmDialog } from "../../../shared/components/Modal/ConfirmDialog";
import { Card } from "../../../shared/components/Card";
import { useAuth } from "../../../shared/hooks/useAuth";
import { toast } from "sonner";
import { CalendarAltIcon, ArrowLeftIcon, ClockIcon, MapMarkerAltIcon } from "@patternfly/react-icons";

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEvent, registerToEvent, isRegistering, cancelRegistration, isCanceling, getRegistrationStatus } = useEvents();
  
  const eventId = id ? parseInt(id, 10) : undefined;
  const { data: event, isLoading: isEventLoading } = getEvent(eventId);
  const { data: registration, isLoading: isRegLoading } = getRegistrationStatus(eventId, user?.id);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const handleRegister = async () => {
    if (eventId && user) {
      try {
        await registerToEvent({ eventId, userId: user.id });
        setIsConfirmOpen(false);
        toast.success(`Inscription confirmée à ${event?.title} ! Un email récapitulatif a été envoyé.`);
      } catch (error: any) {
        toast.error(error.response?.data?.error || error.message || "Impossible de s'inscrire à l'évènement.");
      }
    }
  };

  const handleCancel = async () => {
    if (eventId && user) {
      try {
        await cancelRegistration({ eventId, userId: user.id });
        setIsCancelOpen(false);
        toast.success(`Vous êtes désinscrit de ${event?.title}.`);
      } catch (error: any) {
        toast.error(error.response?.data?.error || error.message || "Erreur lors de l'annulation.");
      }
    }
  };

  if (isEventLoading || isRegLoading) {
    return <div className="p-6 text-center text-gray-500">Chargement...</div>;
  }

  if (!event) {
    return <div className="p-6 text-center text-red-500">Évènement introuvable.</div>;
  }

  const isRegistered = registration && registration.status !== 'NOT_REGISTERED' && registration.status !== 'CANCELLED';
  const hasPaid = registration && registration.payment_status === 'PAID';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/events")}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          title="Retour aux évènements"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <PageHeader
          title={event.title}
          description="Détails de l'évènement et inscription."
        />
      </div>

      <Card shadow="md" className="overflow-hidden border-0">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-10 text-white flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm">
                {event.visibility === 'MEMBERS_ONLY' ? 'Membres uniquement' : event.visibility === 'SPECIFIC_GRADES' ? 'Sur sélection' : 'Public'}
              </span>
              {isRegistered && (
                <span className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm flex items-center gap-1">
                  ✓ Inscrit
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{event.title}</h1>
            {event.location && (
              <div className="flex items-center text-blue-100 mt-2">
                <MapMarkerAltIcon className="w-5 h-5 mr-2 opacity-80" />
                <span className="text-lg">{event.location}</span>
              </div>
            )}
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20 text-center min-w-[120px]">
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Tarif</p>
            <p className="text-3xl font-bold">{event.price ? `${event.price} €` : "Gratuit"}</p>
          </div>
        </div>

        <Card.Body className="p-8 sm:p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Date et Heure</h3>
                <div className="flex items-start">
                  <div className="bg-blue-50 p-3 rounded-lg mr-4">
                    <ClockIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{new Date(event.start_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-gray-500">
                      De {new Date(event.start_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à {new Date(event.end_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              {event.capacity && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Capacité</h3>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mr-4 max-w-[200px]">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }}></div> {/* TODO: Calculate actual capacity percentage later */}
                    </div>
                    <span className="text-sm font-medium text-gray-600">{event.capacity} places max</span>
                  </div>
                </div>
              )}
            </div>

            {event.description && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">À propos</h3>
                <div className="prose prose-sm sm:prose text-gray-600">
                  <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>
                </div>
              </div>
            )}
          </div>
        </Card.Body>

        <Card.Footer className="bg-gray-50 p-6 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-gray-900 font-medium">Prêt à participer ?</h4>
            <p className="text-gray-500 text-sm">Ne manquez pas cet évènement exceptionnel.</p>
          </div>
          
          <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
            {isRegistered ? (
              <button
                onClick={() => setIsCancelOpen(true)}
                disabled={isCanceling}
                className="w-full sm:w-auto bg-white hover:bg-red-50 text-red-600 font-medium py-3 px-8 rounded-xl border-2 border-red-200 transition-all focus:ring-4 focus:ring-red-100 disabled:opacity-50"
              >
                Se désinscrire
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={isRegistering || (event.min_grade_id && user && (!user.grade_id || user.grade_id < event.min_grade_id))}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-10 rounded-xl shadow-md hover:shadow-lg transition-all focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  Confirmer ma présence
                </button>
                {event.min_grade_id && user && (!user.grade_id || user.grade_id < event.min_grade_id) && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 block"></span>
                    Grade insuffisant pour s'inscrire
                  </p>
                )}
              </>
            )}
          </div>
        </Card.Footer>
      </Card>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleRegister}
        title="Confirmer l'inscription"
        message={`Êtes-vous sûr de vouloir vous inscrire à l'évènement "${event.title}" ?`}
        variant="info"
        confirmLabel="Confirmer l'inscription"
        cancelLabel="Annuler"
        isLoading={isRegistering}
      />

      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancel}
        title="Annuler l'inscription"
        message={hasPaid 
          ? `Êtes-vous sûr de vouloir annuler votre inscription à "${event.title}" ?\n\nVous avez déjà payé cet évènement. Votre demande de remboursement sera transmise à l'administrateur.` 
          : `Êtes-vous sûr de vouloir annuler votre inscription à l'évènement "${event.title}" ?`}
        variant="danger"
        confirmLabel="Oui, me désinscrire"
        cancelLabel="Non, conserver"
        isLoading={isCanceling}
      />
    </div>
  );
};
