/**
 * ProfilePage.tsx
 * Page de profil de l'utilisateur connecté.
 *
 * Layout : deux colonnes (info card à gauche, formulaire d'édition à droite)
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/shared/hooks/useAuth';
import { useGenres } from '@/shared/hooks/useReferences';
import { profileApi } from '../api/profileApi';
import type { UpdateUserProfileDto } from '../api/profileApi';

import { Card } from '@/shared/components/Card/Card';
import { Badge } from '@/shared/components/Badge/Badge';
import { Button } from '@/shared/components/Button/Button';
import { AlertBanner } from '@/shared/components/Feedback/AlertBanner';
import { FormField } from '@/shared/components/Forms/FormField';
import { SelectField } from '@/shared/components/Forms/SelectField';
import { cn, INPUT } from '@/shared/styles/designTokens';

// ─── Local types ──────────────────────────────────────────────────────────────

interface FormValues {
  first_name: string;
  last_name: string;
  telephone: string;
  adresse: string;
  date_of_birth: string;
  genre_id: string; // '' or numeric string
  photo_url: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extracts YYYY-MM-DD from any ISO date string (for <input type="date">) */
function toDateInputValue(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
}

/** Formats a date for display in the info card */
function formatDisplayDate(
  dateStr: string | null | undefined,
  fallback: string,
): string {
  if (!dateStr) return fallback;
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Maps a role_app string to a Badge variant */
function getRoleBadgeVariant(
  role: string,
): 'info' | 'purple' | 'neutral' | 'success' | 'warning' {
  switch (role) {
    case 'admin':
      return 'info';
    case 'professor':
      return 'purple';
    case 'member':
      return 'neutral';
    case 'parent':
      return 'success';
    default:
      return 'neutral';
  }
}

// ─── Avatar sub-component ─────────────────────────────────────────────────────

interface AvatarProps {
  photoUrl: string | null;
  initials: string;
  fullName: string;
}

function Avatar({ photoUrl, initials, fullName }: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (photoUrl && !imgError) {
    return (
      <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-white shadow-md">
        <img
          src={photoUrl}
          alt={fullName}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className="h-24 w-24 rounded-full bg-primary-600 ring-4 ring-white shadow-md flex items-center justify-center flex-shrink-0">
      <span className="text-2xl font-bold text-white select-none tracking-wider">
        {initials}
      </span>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="h-24 w-24 rounded-full bg-gray-200" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
          </div>
          <div className="space-y-3 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-100 rounded w-full" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="h-7 w-40 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProfilePage() {
  const { t } = useTranslation('users');
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  const genres = useGenres();

  const userId = authUser?.id ?? 0;

  // ── Query ────────────────────────────────────────────────────────────────
  const {
    data: profile,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => profileApi.getProfile(userId),
    enabled: userId > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // ── Form state ───────────────────────────────────────────────────────────
  const [formValues, setFormValues] = useState<FormValues>({
    first_name: '',
    last_name: '',
    telephone: '',
    adresse: '',
    date_of_birth: '',
    genre_id: '',
    photo_url: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Sync form when profile data arrives (or changes after mutation)
  useEffect(() => {
    if (profile) {
      setFormValues({
        first_name: profile.first_name,
        last_name: profile.last_name,
        telephone: profile.telephone ?? '',
        adresse: profile.adresse ?? '',
        date_of_birth: toDateInputValue(profile.date_of_birth),
        genre_id:
          profile.genre?.id !== undefined ? String(profile.genre.id) : '',
        photo_url: profile.photo_url ?? '',
      });
    }
  }, [profile]);

  // ── Mutation ─────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (data: UpdateUserProfileDto) =>
      profileApi.updateProfile(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      toast.success(t('profile.saved', 'Profil mis à jour'));
    },
    onError: (error: Error) => {
      // Axios errors expose the API message via error.message or response.data.message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (error as any)?.response?.data?.message ?? error.message;
      toast.error(msg);
    },
  });

  // ── Validation ───────────────────────────────────────────────────────────
  function validate(): boolean {
    const errors: FormErrors = {};

    if ((formValues.first_name ?? '').trim().length < 2) {
      errors.first_name = t(
        'profile.fields.firstNameMin',
        'Le prénom doit contenir au moins 2 caractères',
      );
    }
    if ((formValues.last_name ?? '').trim().length < 2) {
      errors.last_name = t(
        'profile.fields.lastNameMin',
        'Le nom doit contenir au moins 2 caractères',
      );
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: UpdateUserProfileDto = {
      first_name: formValues.first_name.trim(),
      last_name: formValues.last_name.trim(),
      telephone: formValues.telephone.trim() || null,
      adresse: formValues.adresse.trim() || null,
      date_of_birth: formValues.date_of_birth || undefined,
      genre_id: formValues.genre_id ? Number(formValues.genre_id) : undefined,
      photo_url: formValues.photo_url.trim() || null,
    };

    mutation.mutate(payload);
  }

  // ── Cancel — reset form to last known profile values ─────────────────────
  function handleCancel() {
    if (!profile) return;
    setFormValues({
      first_name: profile.first_name,
      last_name: profile.last_name,
      telephone: profile.telephone ?? '',
      adresse: profile.adresse ?? '',
      date_of_birth: toDateInputValue(profile.date_of_birth),
      genre_id:
        profile.genre?.id !== undefined ? String(profile.genre.id) : '',
      photo_url: profile.photo_url ?? '',
    });
    setFormErrors({});
  }

  // ── Field helpers ─────────────────────────────────────────────────────────
  function handleTextChange(
    field: keyof FormValues,
    value: string,
    errorField?: keyof FormErrors,
  ) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (errorField && formErrors[errorField]) {
      setFormErrors((prev) => ({ ...prev, [errorField]: undefined }));
    }
  }

  // ── Genre options ─────────────────────────────────────────────────────────
  const genreOptions = genres.map((g) => ({ value: g.id, label: g.nom }));

  // ── Render: loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // ── Render: error ─────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <AlertBanner
          variant="danger"
          title={t('profile.loadError', 'Erreur de chargement')}
          message={
            (fetchError as Error).message ||
            t('profile.loadErrorGeneric', 'Impossible de charger le profil.')
          }
        />
      </div>
    );
  }

  if (!profile) return null;

  // ── Derived display values ────────────────────────────────────────────────
  const fullName = `${profile.first_name} ${profile.last_name}`;
  const initials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
  const neverLabel = t('profile.never', 'Jamais');

  // ── Render: main ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('profile.title', 'Mon profil')}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            @{profile.nom_utilisateur}
          </p>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ══ LEFT COLUMN — Info card ══════════════════════════════════════ */}
        <div className="space-y-4">
          <Card variant="standard">

            {/* Avatar + name + role */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
              <Avatar
                photoUrl={profile.photo_url}
                initials={initials}
                fullName={fullName}
              />
              <h2 className="mt-4 text-xl font-bold text-gray-900 leading-tight">
                {fullName}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{profile.email}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Badge variant={getRoleBadgeVariant(profile.role_app)} dot>
                  {t(`roles.${profile.role_app}`, profile.role_app)}
                </Badge>
                {/* Email verified indicator */}
                {profile.email_verified ? (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5"
                    title={t('profile.emailVerified', 'Email vérifié')}
                  >
                    <svg
                      className="h-3 w-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t('profile.emailVerified', 'Email vérifié')}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"
                    title={t('profile.emailNotVerified', 'Email non vérifié')}
                  >
                    <svg
                      className="h-3 w-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t('profile.emailNotVerified', 'Non vérifié')}
                  </span>
                )}
              </div>
            </div>

            {/* Grade */}
            {profile.grade && (
              <div className="py-4 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Grade
                </p>
                <div className="flex items-center gap-2">
                  {profile.grade.couleur ? (
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0 ring-1 ring-black/10"
                      style={{ backgroundColor: profile.grade.couleur }}
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="h-3 w-3 rounded-full bg-gray-300 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium text-gray-800">
                    {profile.grade.nom}
                  </span>
                </div>
              </div>
            )}

            {/* Abonnement */}
            {profile.abonnement && (
              <div className="py-4 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Abonnement
                </p>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="info">{profile.abonnement.nom}</Badge>
                  <span className="text-sm font-semibold text-gray-700">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(profile.abonnement.prix)}
                  </span>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {t('status', 'Statut')}
              </p>
              <Badge variant="neutral" dot>
                {profile.status.nom}
              </Badge>
            </div>

            {/* Member since + last login */}
            <div className="pt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-7 w-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="h-3.5 w-3.5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">
                    {t('profile.memberSince', 'Membre depuis')}
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {formatDisplayDate(profile.date_inscription, neverLabel)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-7 w-7 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="h-3.5 w-3.5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">
                    {t('profile.lastLogin', 'Dernière connexion')}
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {formatDisplayDate(profile.derniere_connexion, neverLabel)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ══ RIGHT COLUMN — Edit form ══════════════════════════════════════ */}
        <div className="lg:col-span-2">
          <Card variant="standard">

            {/* Form header */}
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100 mb-6">
              <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-5 w-5 text-primary-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {t('profile.editForm', 'Modifier le profil')}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t(
                    'profile.editFormSubtitle',
                    'Mettez à jour vos informations personnelles',
                  )}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* ── Row 1 : Prénom / Nom ─────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <FormField
                  id="first_name"
                  label={t('profile.fields.firstName', 'Prénom')}
                  required
                  error={formErrors.first_name}
                >
                  <input
                    id="first_name"
                    type="text"
                    value={formValues.first_name}
                    onChange={(e) =>
                      handleTextChange(
                        'first_name',
                        e.target.value,
                        'first_name',
                      )
                    }
                    className={cn(
                      INPUT.base,
                      formErrors.first_name ? INPUT.error : '',
                    )}
                    autoComplete="given-name"
                    aria-required="true"
                    aria-invalid={!!formErrors.first_name}
                    disabled={mutation.isPending}
                  />
                </FormField>

                <FormField
                  id="last_name"
                  label={t('profile.fields.lastName', 'Nom')}
                  required
                  error={formErrors.last_name}
                >
                  <input
                    id="last_name"
                    type="text"
                    value={formValues.last_name}
                    onChange={(e) =>
                      handleTextChange(
                        'last_name',
                        e.target.value,
                        'last_name',
                      )
                    }
                    className={cn(
                      INPUT.base,
                      formErrors.last_name ? INPUT.error : '',
                    )}
                    autoComplete="family-name"
                    aria-required="true"
                    aria-invalid={!!formErrors.last_name}
                    disabled={mutation.isPending}
                  />
                </FormField>
              </div>

              {/* ── Row 2 : Téléphone / Date de naissance ────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <FormField
                  id="telephone"
                  label={t('profile.fields.phone', 'Téléphone')}
                  optional
                >
                  <input
                    id="telephone"
                    type="tel"
                    value={formValues.telephone}
                    onChange={(e) =>
                      handleTextChange('telephone', e.target.value)
                    }
                    className={INPUT.base}
                    autoComplete="tel"
                    placeholder="+33 6 00 00 00 00"
                    disabled={mutation.isPending}
                  />
                </FormField>

                <FormField
                  id="date_of_birth"
                  label={t('profile.fields.dateOfBirth', 'Date de naissance')}
                  optional
                >
                  <input
                    id="date_of_birth"
                    type="date"
                    value={formValues.date_of_birth}
                    onChange={(e) =>
                      handleTextChange('date_of_birth', e.target.value)
                    }
                    className={INPUT.base}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={mutation.isPending}
                  />
                </FormField>
              </div>

              {/* ── Row 3 : Genre / Photo URL ────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <SelectField
                  id="genre_id"
                  label={t('profile.fields.genre', 'Genre')}
                  options={genreOptions}
                  value={formValues.genre_id}
                  onChange={(val) =>
                    handleTextChange('genre_id', String(val))
                  }
                  placeholder={t('profile.fields.genreNone', 'Non renseigné')}
                  disabled={mutation.isPending}
                />

                <FormField
                  id="photo_url"
                  label={t('profile.fields.photoUrl', 'Photo (URL)')}
                  optional
                  helpText={t(
                    'profile.fields.photoUrlHelp',
                    'Lien vers une image en ligne (jpg, png…)',
                  )}
                >
                  <input
                    id="photo_url"
                    type="url"
                    value={formValues.photo_url}
                    onChange={(e) =>
                      handleTextChange('photo_url', e.target.value)
                    }
                    className={INPUT.base}
                    placeholder="https://example.com/photo.jpg"
                    autoComplete="photo"
                    disabled={mutation.isPending}
                  />
                </FormField>
              </div>

              {/* ── Row 4 : Adresse (full width) ─────────────────────────── */}
              <div className="mb-6">
                <FormField
                  id="adresse"
                  label={t('profile.fields.address', 'Adresse')}
                  optional
                >
                  <textarea
                    id="adresse"
                    rows={3}
                    value={formValues.adresse}
                    onChange={(e) =>
                      handleTextChange('adresse', e.target.value)
                    }
                    className={cn(INPUT.base, 'resize-none')}
                    autoComplete="street-address"
                    placeholder={t(
                      'profile.fields.addressPlaceholder',
                      'Votre adresse complète…',
                    )}
                    disabled={mutation.isPending}
                  />
                </FormField>
              </div>

              {/* ── Form actions ──────────────────────────────────────────── */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={mutation.isPending}
                >
                  {t('profile.cancel', 'Annuler')}
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  loading={mutation.isPending}
                  icon={
                    !mutation.isPending ? (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : undefined
                  }
                >
                  {mutation.isPending
                    ? t('profile.saving', 'Enregistrement…')
                    : t('profile.save', 'Enregistrer')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
