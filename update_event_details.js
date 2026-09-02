const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/member/events/EventDetailsPage.tsx', 'utf8');

c = `import { StripePaymentModal } from "../../../features/payments/components/StripePaymentModal";\nimport { eventsService } from "../../../features/events/api/eventsService";\n` + c;

const newStates = `
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<string | null>(null);
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);

  const handleConfirmClick = async () => {
    if (event?.price && Number(event.price) > 0) {
      if (eventId) {
        setIsInitializingPayment(true);
        try {
          const { clientSecret, paymentIntentId } = await eventsService.createPaymentIntent(eventId);
          setStripeClientSecret(clientSecret);
          setStripePaymentIntentId(paymentIntentId);
          setIsStripeOpen(true);
        } catch (error: any) {
          toast.error("Impossible d'initialiser le paiement Stripe.");
        } finally {
          setIsInitializingPayment(false);
        }
      }
    } else {
      setIsConfirmOpen(true);
    }
  };

  const handleRegister = async () => {
    if (eventId && user) {
      try {
        await registerToEvent({ eventId, userId: user.id });
        setIsConfirmOpen(false);
        toast.success(\`Inscription confirmée à \${event?.title} ! Un email récapitulatif a été envoyé.\`);
      } catch (error: any) {
        toast.error(error.response?.data?.error || error.message || "Impossible de s'inscrire à l'événement.");
      }
    }
  };

  const handleStripeSuccess = async () => {
    setIsStripeOpen(false);
    if (eventId && user && stripePaymentIntentId) {
      try {
        await registerToEvent({ eventId, userId: user.id, paymentIntentId: stripePaymentIntentId });
        toast.success(\`Inscription confirmée à \${event?.title} !\`);
      } catch (error: any) {
        toast.error(error.response?.data?.error || error.message || "Erreur lors de l'inscription finale.");
      }
    }
  };

  const handleCancel = async () => {
    if (eventId && user) {
      try {
        await cancelRegistration({ eventId, userId: user.id });
        setIsCancelOpen(false);
        toast.success(\`Vous êtes désinscrit de \${event?.title}.\`);
      } catch (error: any) {
        toast.error(error.response?.data?.error || error.message || "Erreur lors de l'annulation.");
      }
    }
  };`;
  
c = c.replace(/  const \[isConfirmOpen[\s\S]*?toast\.error[^}]*\}\s*\}\s*\};\s*const handleCancel[\s\S]*?toast\.error[^}]*\}\s*\}\s*\};/m, newStates);

c = c.replace(/onClick=\{\(\) => setIsConfirmOpen\(true\)\}\n\s*disabled=\{isRegistering/, `onClick={handleConfirmClick}\n                  disabled={isRegistering || isInitializingPayment`);

const newModal = `cancelLabel="Annuler"
        isLoading={isCanceling}
      />

      {isStripeOpen && stripeClientSecret && event && (
        <StripePaymentModal
          isOpen={isStripeOpen}
          onClose={() => setIsStripeOpen(false)}
          onSuccess={handleStripeSuccess}
          clientSecret={stripeClientSecret}
          amount={Number(event.price)}
        />
      )}`;

c = c.replace(/cancelLabel="Annuler"\n\s*isLoading=\{isCanceling\}\n\s*\/\>/, newModal);

fs.writeFileSync('frontend/src/pages/member/events/EventDetailsPage.tsx', c, 'utf8');
