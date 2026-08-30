import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Modal } from "../../../shared/components/Modal/Modal";
import { Button } from "../../../shared/components/Button/Button";
import { Input } from "../../../shared/components/Input/Input";
import { FormField } from "../../../shared/components/Forms/FormField";
import { useCreateReservation } from "../hooks/useReservations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export function ReservationCreateModal({ isOpen, onClose, isAdmin }: Props) {
  const { t } = useTranslation("reservations");
  const createMutation = useCreateReservation();

  const [formCoursId, setFormCoursId] = useState("");
  const [formUserId, setFormUserId] = useState("");
  const [formErrors, setFormErrors] = useState<{
    cours_id?: string;
    user_id?: string;
  }>({});

  const validate = () => {
    const errors: { cours_id?: string; user_id?: string } = {};
    if (!formCoursId.trim()) {
      errors.cours_id = t("validation.courseIdRequired");
    } else if (isNaN(parseInt(formCoursId, 10))) {
      errors.cours_id = t("validation.courseIdInvalid");
    }
    if (formUserId && isNaN(parseInt(formUserId, 10))) {
      errors.user_id = t("validation.userIdInvalid");
    }
    return errors;
  };

  const handleSubmit = () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const payload: { cours_id: number; user_id?: number } = {
      cours_id: parseInt(formCoursId, 10),
    };
    if (isAdmin && formUserId) payload.user_id = parseInt(formUserId, 10);
    
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t("messages.success.created"));
        handleClose();
      },
      onError: (e: any) =>
        toast.error(
          e?.response?.data?.message ?? t("messages.error.createError")
        ),
    });
  };

  const handleClose = () => {
    setFormCoursId("");
    setFormUserId("");
    setFormErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <Modal.Header
        title={t("modal.createTitle")}
        subtitle={t("modal.createSubtitle")}
        showCloseButton
        onClose={handleClose}
      />
      <Modal.Body>
        <div className="space-y-4">
          <FormField
            id="res-cours-id"
            label={t("fields.course")}
            required
            error={formErrors.cours_id}
          >
            <Input
              id="res-cours-id"
              type="number"
              value={formCoursId}
              onChange={(e) => setFormCoursId(e.target.value)}
              placeholder={t("placeholders.courseId")}
              autoFocus
              error={formErrors.cours_id}
            />
          </FormField>

          {isAdmin && (
            <FormField
              id="res-user-id"
              label={t("fields.userId")}
              error={formErrors.user_id}
            >
              <Input
                id="res-user-id"
                type="number"
                value={formUserId}
                onChange={(e) => setFormUserId(e.target.value)}
                placeholder={t("placeholders.userId")}
                error={formErrors.user_id}
              />
            </FormField>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={createMutation.isPending}
        >
          {t("actions.cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={createMutation.isPending}
          data-testid="btn-submit-create-reservation"
        >
          {t("actions.confirm")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
