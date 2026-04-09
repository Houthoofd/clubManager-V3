/**
 * AddFamilyMemberModal
 * Modal d'ajout d'un membre à la famille. Utilise react-hook-form + zod + sonner.
 */

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useFamily } from '../hooks/useFamily'
import type { AddFamilyMemberDto } from '@clubmanager/types'

// ─── Schéma de validation ────────────────────────────────────────────────────

const addMemberSchema = z.object({
  first_name: z.string().min(2, 'Au moins 2 caractères').max(100),
  last_name: z.string().min(2, 'Au moins 2 caractères').max(100),
  date_of_birth: z.string().min(1, 'Requis'),
  genre_id: z.string().min(1, 'Requis'),
  role: z.enum(['enfant', 'conjoint', 'autre']),
})

type AddMemberFormData = z.infer<typeof addMemberSchema>

// ─── Props ───────────────────────────────────────────────────────────────────

interface AddFamilyMemberModalProps {
  /** Contrôle la visibilité de la modal */
  isOpen: boolean
  /** Callback de fermeture de la modal */
  onClose: () => void
  /** Callback appelé après un ajout réussi */
  onSuccess: () => void
}

// ─── Utilitaire ──────────────────────────────────────────────────────────────

/** Retourne la date d'aujourd'hui au format YYYY-MM-DD pour l'attribut max. */
function getTodayString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ─── Icônes inline ───────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

// ─── Composant ───────────────────────────────────────────────────────────────

/**
 * AddFamilyMemberModal — Modal d'ajout d'un membre de famille.
 *
 * Affiche un formulaire validé par zod permettant d'ajouter un membre sans
 * email ni mot de passe. Se ferme sur clic en dehors ou touche Escape.
 */
export function AddFamilyMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: AddFamilyMemberModalProps) {
  const { addMember } = useFamily()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddMemberFormData>({
    resolver: zodResolver(addMemberSchema),
    mode: 'onBlur',
    defaultValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      genre_id: '',
      role: 'enfant',
    },
  })

  // ── Fermeture sur touche Escape ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // ── Bloquer le scroll du body quand la modal est ouverte ──────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (data: AddMemberFormData) => {
    const dto: AddFamilyMemberDto = {
      first_name: data.first_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      genre_id: Number(data.genre_id),
      role: data.role,
    }

    const result = await addMember(dto)

    if (result.success) {
      toast.success('Membre ajouté !', {
        description: `${data.first_name} ${data.last_name} a été ajouté à la famille.`,
      })
      reset()
      onSuccess()
    } else {
      toast.error("Erreur lors de l'ajout", {
        description: result.error ?? 'Une erreur est survenue.',
      })
    }
  }

  if (!isOpen) return null

  return (
    /* ── Overlay ─────────────────────────────────────────────────────────── */
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
      onClick={handleClose}
    >
      {/* ── Dialog ─────────────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Titre ── */}
        <h2
          id="add-member-title"
          className="text-xl font-semibold text-gray-900 mb-4"
        >
          Ajouter un membre de la famille
        </h2>

        {/* ── Boîte d'information ── */}
        <div className="mb-5 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 leading-relaxed">
          <span className="font-medium">ℹ️ Sans compte requis —</span>{' '}
          Aucun email ni mot de passe requis. Un identifiant unique (userId)
          sera généré automatiquement.
        </div>

        {/* ── Formulaire ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Prénom / Nom (2 colonnes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Prénom */}
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                id="first_name"
                type="text"
                autoComplete="off"
                {...register('first_name')}
                className={`block w-full px-3 py-2.5 border ${
                  errors.first_name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-lg shadow-sm placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-colors`}
                placeholder="Marie"
              />
              {errors.first_name && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            {/* Nom */}
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                id="last_name"
                type="text"
                autoComplete="off"
                {...register('last_name')}
                className={`block w-full px-3 py-2.5 border ${
                  errors.last_name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-lg shadow-sm placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-colors`}
                placeholder="Dupont"
              />
              {errors.last_name && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Date de naissance */}
          <div>
            <label
              htmlFor="date_of_birth"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Date de naissance <span className="text-red-500">*</span>
            </label>
            <input
              id="date_of_birth"
              type="date"
              max={getTodayString()}
              {...register('date_of_birth')}
              className={`block w-full px-3 py-2.5 border ${
                errors.date_of_birth
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition-colors`}
            />
            {errors.date_of_birth && (
              <p className="mt-1.5 text-xs text-red-600">
                {errors.date_of_birth.message}
              </p>
            )}
          </div>

          {/* Genre / Rôle (2 colonnes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Genre */}
            <div>
              <label
                htmlFor="genre_id"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Genre <span className="text-red-500">*</span>
              </label>
              <select
                id="genre_id"
                {...register('genre_id')}
                className={`block w-full px-3 py-2.5 border ${
                  errors.genre_id
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition-colors`}
              >
                <option value="">Sélectionner…</option>
                <option value="1">Homme</option>
                <option value="2">Femme</option>
                <option value="3">Autre / Non spécifié</option>
              </select>
              {errors.genre_id && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.genre_id.message}
                </p>
              )}
            </div>

            {/* Rôle */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                {...register('role')}
                className={`block w-full px-3 py-2.5 border ${
                  errors.role
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition-colors`}
              >
                <option value="enfant">Enfant</option>
                <option value="conjoint">Conjoint(e)</option>
                <option value="autre">Autre</option>
              </select>
              {errors.role && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && <SpinnerIcon />}
              {isSubmitting ? 'Ajout en cours…' : 'Ajouter le membre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
