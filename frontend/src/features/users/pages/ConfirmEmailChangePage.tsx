/**
 * ConfirmEmailChangePage
 * GAP-15 — Page publique de confirmation du changement d'email
 *
 * Accessible via : /confirm-email-change?token=xxx
 * Appelle POST /api/auth/confirm-email-change avec le token de l'URL.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import apiClient from "@/shared/api/apiClient";
import { LoadingSpinner } from "@/shared/components/Layout/LoadingSpinner";

type Status = "loading" | "success" | "error";

export function ConfirmEmailChangePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [newEmail, setNewEmail] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Token manquant dans l'URL.");
      return;
    }

    apiClient
      .post("/auth/confirm-email-change", { token })
      .then((res) => {
        setNewEmail(res.data.newEmail ?? "");
        setStatus("success");
      })
      .catch((err) => {
        setErrorMsg(
          err?.response?.data?.message ?? "Token invalide ou expiré.",
        );
        setStatus("error");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md p-8 text-center space-y-4">
        {status === "loading" && (
          <>
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 text-sm">Vérification en cours…</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon className="h-14 w-14 text-green-500 mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">
              Adresse email mise à jour !
            </h1>
            <p className="text-gray-600 text-sm">
              Votre nouvelle adresse email est désormais{" "}
              <span className="font-semibold">{newEmail}</span>.
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Retour au profil
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircleIcon className="h-14 w-14 text-red-500 mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">
              Lien invalide ou expiré
            </h1>
            <p className="text-gray-600 text-sm">{errorMsg}</p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Retour au profil
            </button>
          </>
        )}
      </div>
    </div>
  );
}
