/**
 * SettingsPage
 * Page de gestion des paramètres du club.
 * Accessible aux administrateurs uniquement.
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSettings } from "../hooks/useSettings";
import { INFORMATION_KEYS } from "@clubmanager/types";
import type { CreateInformation } from "@clubmanager/types";
import { TabGroup } from "../../../shared/components/Navigation/TabGroup";
import type { Tab } from "../../../shared/components/Navigation/TabGroup";

// ─── Tab type ─────────────────────────────────────────────────────────────────

type TabId =
  | "club"
  | "horaires"
  | "social"
  | "finance"
  | "apparence"
  | "navigation"
  | "localisation";

// ─── Icons ────────────────────────────────────────────────────────────────────

function CogIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function BuildingIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
      />
    </svg>
  );
}

function ClockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function GlobeAltIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  );
}

function BanknotesIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
      />
    </svg>
  );
}

function PaintBrushIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
      />
    </svg>
  );
}

function Squares2x2Icon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
      />
    </svg>
  );
}

function LanguageIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
      />
    </svg>
  );
}

function SpinnerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`${className} animate-spin`}
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
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// Brand icons (filled, used in the social section)

function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function TwitterXIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ─── Reusable field sub-components ───────────────────────────────────────────

interface FieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  hint?: string;
}

function TextAreaField({
  label,
  id,
  value,
  onChange,
  rows = 6,
  placeholder,
  hint,
}: TextAreaFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y"
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// ─── Select field ─────────────────────────────────────────────────────────────

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  description?: string;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  description,
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}

// ─── Color field ──────────────────────────────────────────────────────────────

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorField({ label, value, onChange, description }: ColorFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value || "#2563eb"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 cursor-pointer rounded border border-gray-300 p-0.5"
        />
        <input
          type="text"
          value={value || "#2563eb"}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#2563eb"
          className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
        <div
          className="h-8 w-8 rounded-full border border-gray-300"
          style={{ backgroundColor: value || "#2563eb" }}
        />
      </div>
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}

// ─── Module toggle ────────────────────────────────────────────────────────────

interface ModuleToggleProps {
  label: string;
  moduleKey: string;
  enabled: boolean;
  disabled?: boolean;
  onChange: (key: string, enabled: boolean) => void;
}

function ModuleToggle({
  label,
  moduleKey,
  enabled,
  disabled = false,
  onChange,
}: ModuleToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p
          className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-900"}`}
        >
          {label}
        </p>
        {disabled && <p className="text-xs text-gray-400">Toujours actif</p>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(moduleKey, !enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? "bg-blue-600" : "bg-gray-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        aria-checked={enabled}
        role="switch"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Save button ──────────────────────────────────────────────────────────────

interface SaveButtonProps {
  onClick: () => void;
  isSaving: boolean;
}

function SaveButton({ onClick, isSaving }: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSaving}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isSaving && <SpinnerIcon className="h-4 w-4" />}
      {isSaving ? "Sauvegarde..." : "Sauvegarder"}
    </button>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

function SectionHeader({
  icon,
  iconBg,
  iconColor,
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
      <span
        className={`inline-flex items-center justify-center rounded-xl p-2.5 ${iconBg} ${iconColor} flex-shrink-0`}
      >
        {icon}
      </span>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SkeletonField() {
  return (
    <div className="space-y-1.5">
      <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
      <div className="h-9 w-full rounded-md bg-gray-200 animate-pulse" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
        <div className="space-y-1">
          <div className="h-7 w-36 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-64 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="relative flex items-end border-b border-gray-200">
        <div className="flex-shrink-0 w-8 h-10 rounded-tl-lg bg-gray-100 animate-pulse" />
        <div className="flex-1 flex gap-1 overflow-hidden">
          {[160, 170, 140, 140].map((w, i) => (
            <div
              key={i}
              style={{ width: w }}
              className="flex-shrink-0 h-10 rounded-t-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
        <div className="flex-shrink-0 w-8 h-10 rounded-tr-lg bg-gray-100 animate-pulse" />
      </div>

      {/* Card skeleton */}
      <div className="bg-white rounded-lg shadow p-6 space-y-5">
        <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
          <div className="h-11 w-11 rounded-xl bg-gray-200 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-3.5 w-60 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SkeletonField />
          </div>
          <div className="sm:col-span-2">
            <SkeletonField />
          </div>
          <SkeletonField />
          <SkeletonField />
          <div className="sm:col-span-2">
            <SkeletonField />
          </div>
        </div>
        <div className="flex justify-end border-t border-gray-100 pt-5">
          <div className="h-10 w-32 rounded-md bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const SettingsPage = () => {
  const { settings, isLoading, isSaving, bulkUpsertSettings, getByKey } =
    useSettings();

  const [activeTab, setActiveTab] = useState<TabId>("club");

  // ── Form states ───────────────────────────────────────────────────────────
  const [clubForm, setClubForm] = useState({
    club_name: "",
    club_address: "",
    club_phone: "",
    club_email: "",
    club_website: "",
  });

  const [horairesForm, setHorairesForm] = useState({
    opening_hours: "",
  });

  const [socialForm, setSocialForm] = useState({
    social_facebook: "",
    social_instagram: "",
    social_twitter: "",
  });

  const [financeForm, setFinanceForm] = useState({
    bank_account: "",
    vat_number: "",
    legal_info: "",
  });

  const [apparenceForm, setApparenceForm] = useState({
    theme_primary_color: "#2563eb",
    theme_secondary_color: "#7c3aed",
    theme_sidebar_bg: "#ffffff",
    theme_sidebar_text: "#374151",
    club_logo_url: "",
    navbar_name: "",
  });

  const [activeModules, setActiveModules] = useState<Record<string, boolean>>({
    dashboard: true,
    courses: true,
    users: true,
    families: true,
    payments: true,
    store: true,
    messages: true,
    statistics: true,
  });

  const [localisationForm, setLocalisationForm] = useState({
    app_language: "fr",
    date_format: "DD/MM/YYYY",
    time_format: "24h",
    timezone: "Europe/Paris",
  });

  // ── Sync forms when store data loads ─────────────────────────────────────
  useEffect(() => {
    if (settings.length > 0 || !isLoading) {
      setClubForm({
        club_name: getByKey(INFORMATION_KEYS.CLUB_NAME)?.valeur ?? "",
        club_address: getByKey(INFORMATION_KEYS.CLUB_ADDRESS)?.valeur ?? "",
        club_phone: getByKey(INFORMATION_KEYS.CLUB_PHONE)?.valeur ?? "",
        club_email: getByKey(INFORMATION_KEYS.CLUB_EMAIL)?.valeur ?? "",
        club_website: getByKey(INFORMATION_KEYS.CLUB_WEBSITE)?.valeur ?? "",
      });
      setHorairesForm({
        opening_hours: getByKey(INFORMATION_KEYS.OPENING_HOURS)?.valeur ?? "",
      });
      setSocialForm({
        social_facebook:
          getByKey(INFORMATION_KEYS.SOCIAL_FACEBOOK)?.valeur ?? "",
        social_instagram:
          getByKey(INFORMATION_KEYS.SOCIAL_INSTAGRAM)?.valeur ?? "",
        social_twitter: getByKey(INFORMATION_KEYS.SOCIAL_TWITTER)?.valeur ?? "",
      });
      setFinanceForm({
        bank_account: getByKey(INFORMATION_KEYS.BANK_ACCOUNT)?.valeur ?? "",
        vat_number: getByKey(INFORMATION_KEYS.VAT_NUMBER)?.valeur ?? "",
        legal_info: getByKey(INFORMATION_KEYS.LEGAL_INFO)?.valeur ?? "",
      });

      setApparenceForm({
        theme_primary_color:
          getByKey(INFORMATION_KEYS.THEME_PRIMARY_COLOR)?.valeur ?? "#2563eb",
        theme_secondary_color:
          getByKey(INFORMATION_KEYS.THEME_SECONDARY_COLOR)?.valeur ?? "#7c3aed",
        theme_sidebar_bg:
          getByKey(INFORMATION_KEYS.THEME_SIDEBAR_BG)?.valeur ?? "#ffffff",
        theme_sidebar_text:
          getByKey(INFORMATION_KEYS.THEME_SIDEBAR_TEXT)?.valeur ?? "#374151",
        club_logo_url: getByKey(INFORMATION_KEYS.CLUB_LOGO_URL)?.valeur ?? "",
        navbar_name: getByKey(INFORMATION_KEYS.NAVBAR_NAME)?.valeur ?? "",
      });

      const savedModules = getByKey(INFORMATION_KEYS.ACTIVE_MODULES)?.valeur;
      if (savedModules) {
        const moduleList = savedModules.split(",").map((m) => m.trim());
        setActiveModules({
          dashboard: true, // always on
          courses: moduleList.includes("courses"),
          users: moduleList.includes("users"),
          families: moduleList.includes("families"),
          payments: moduleList.includes("payments"),
          store: moduleList.includes("store"),
          messages: moduleList.includes("messages"),
          statistics: moduleList.includes("statistics"),
        });
      }

      setLocalisationForm({
        app_language: getByKey(INFORMATION_KEYS.APP_LANGUAGE)?.valeur ?? "fr",
        date_format:
          getByKey(INFORMATION_KEYS.DATE_FORMAT)?.valeur ?? "DD/MM/YYYY",
        time_format: getByKey(INFORMATION_KEYS.TIME_FORMAT)?.valeur ?? "24h",
        timezone: getByKey(INFORMATION_KEYS.TIMEZONE)?.valeur ?? "Europe/Paris",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // ── Save helpers ──────────────────────────────────────────────────────────
  const buildPayload = (fields: [string, string][]): CreateInformation[] =>
    fields
      .filter(([, v]) => v.trim() !== "")
      .map(([cle, valeur]) => ({ cle, valeur: valeur.trim() }));

  const saveSection = async (
    payload: CreateInformation[],
    successMessage: string,
  ): Promise<void> => {
    if (payload.length === 0) {
      toast.error("Veuillez remplir au moins un champ avant de sauvegarder.");
      return;
    }
    try {
      await bulkUpsertSettings(payload);
      toast.success(successMessage);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  // ── Section save handlers ─────────────────────────────────────────────────
  const handleSaveClub = () =>
    saveSection(
      buildPayload([
        [INFORMATION_KEYS.CLUB_NAME, clubForm.club_name],
        [INFORMATION_KEYS.CLUB_ADDRESS, clubForm.club_address],
        [INFORMATION_KEYS.CLUB_PHONE, clubForm.club_phone],
        [INFORMATION_KEYS.CLUB_EMAIL, clubForm.club_email],
        [INFORMATION_KEYS.CLUB_WEBSITE, clubForm.club_website],
      ]),
      "Informations du club sauvegardées",
    );

  const handleSaveHoraires = () =>
    saveSection(
      buildPayload([
        [INFORMATION_KEYS.OPENING_HOURS, horairesForm.opening_hours],
      ]),
      "Horaires sauvegardés",
    );

  const handleSaveSocial = () =>
    saveSection(
      buildPayload([
        [INFORMATION_KEYS.SOCIAL_FACEBOOK, socialForm.social_facebook],
        [INFORMATION_KEYS.SOCIAL_INSTAGRAM, socialForm.social_instagram],
        [INFORMATION_KEYS.SOCIAL_TWITTER, socialForm.social_twitter],
      ]),
      "Réseaux sociaux sauvegardés",
    );

  const handleSaveFinance = () =>
    saveSection(
      buildPayload([
        [INFORMATION_KEYS.BANK_ACCOUNT, financeForm.bank_account],
        [INFORMATION_KEYS.VAT_NUMBER, financeForm.vat_number],
        [INFORMATION_KEYS.LEGAL_INFO, financeForm.legal_info],
      ]),
      "Informations financières sauvegardées",
    );

  const handleSaveApparence = () =>
    saveSection(
      buildPayload([
        [
          INFORMATION_KEYS.THEME_PRIMARY_COLOR,
          apparenceForm.theme_primary_color,
        ],
        [
          INFORMATION_KEYS.THEME_SECONDARY_COLOR,
          apparenceForm.theme_secondary_color,
        ],
        [INFORMATION_KEYS.THEME_SIDEBAR_BG, apparenceForm.theme_sidebar_bg],
        [INFORMATION_KEYS.THEME_SIDEBAR_TEXT, apparenceForm.theme_sidebar_text],
        [INFORMATION_KEYS.CLUB_LOGO_URL, apparenceForm.club_logo_url],
        [INFORMATION_KEYS.NAVBAR_NAME, apparenceForm.navbar_name],
      ]),
      "Apparence sauvegardée",
    );

  const handleSaveNavigation = () => {
    const enabledModules = Object.entries(activeModules)
      .filter(([key, enabled]) => enabled && key !== "dashboard")
      .map(([key]) => key)
      .join(",");
    saveSection(
      [{ cle: INFORMATION_KEYS.ACTIVE_MODULES, valeur: enabledModules }],
      "Navigation sauvegardée",
    );
  };

  const handleSaveLocalisation = () =>
    saveSection(
      buildPayload([
        [INFORMATION_KEYS.APP_LANGUAGE, localisationForm.app_language],
        [INFORMATION_KEYS.DATE_FORMAT, localisationForm.date_format],
        [INFORMATION_KEYS.TIME_FORMAT, localisationForm.time_format],
        [INFORMATION_KEYS.TIMEZONE, localisationForm.timezone],
      ]),
      "Localisation sauvegardée",
    );

  // ── Tab definitions ───────────────────────────────────────────────────────
  const tabs: Tab[] = [
    {
      id: "club",
      label: "Informations du club",
      icon: <BuildingIcon />,
    },
    {
      id: "horaires",
      label: "Horaires d'ouverture",
      icon: <ClockIcon />,
    },
    {
      id: "social",
      label: "Réseaux sociaux",
      icon: <GlobeAltIcon />,
    },
    {
      id: "finance",
      label: "Finance & Légal",
      icon: <BanknotesIcon />,
    },
    {
      id: "apparence",
      label: "Apparence",
      icon: <PaintBrushIcon />,
    },
    {
      id: "navigation",
      label: "Navigation",
      icon: <Squares2x2Icon />,
    },
    {
      id: "localisation",
      label: "Localisation",
      icon: <LanguageIcon />,
    },
  ];

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading && settings.length === 0) {
    return <LoadingSkeleton />;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <CogIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Param&egrave;tres
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            G&eacute;rez les informations et la configuration de votre club.
          </p>
        </div>
      </div>

      {/* ── Tab navigation ────────────────────────────────────────────────── */}
      <TabGroup
        variant="highlight"
        scrollable={true}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabId)}
      />

      {/* ── Section: Informations du club ─────────────────────────────────── */}
      {activeTab === "club" && (
        <div className="bg-white rounded-lg shadow p-6">
          <SectionHeader
            icon={<BuildingIcon className="h-6 w-6" />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            title="Informations du club"
            description="Coordonn&eacute;es et informations g&eacute;n&eacute;rales visibles par les membres."
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                label="Nom du club"
                id="club_name"
                value={clubForm.club_name}
                onChange={(v) => setClubForm((f) => ({ ...f, club_name: v }))}
                placeholder="Ex. Club Sportif de Paris"
              />
            </div>

            <div className="sm:col-span-2">
              <Field
                label="Adresse"
                id="club_address"
                value={clubForm.club_address}
                onChange={(v) =>
                  setClubForm((f) => ({ ...f, club_address: v }))
                }
                placeholder="Ex. 12 rue de la Paix, 75001 Paris"
              />
            </div>

            <Field
              label="T&eacute;l&eacute;phone"
              id="club_phone"
              type="tel"
              value={clubForm.club_phone}
              onChange={(v) => setClubForm((f) => ({ ...f, club_phone: v }))}
              placeholder="Ex. +33 1 23 45 67 89"
            />

            <Field
              label="Email de contact"
              id="club_email"
              type="email"
              value={clubForm.club_email}
              onChange={(v) => setClubForm((f) => ({ ...f, club_email: v }))}
              placeholder="contact@monclub.fr"
            />

            <div className="sm:col-span-2">
              <Field
                label="Site web"
                id="club_website"
                type="url"
                value={clubForm.club_website}
                onChange={(v) =>
                  setClubForm((f) => ({ ...f, club_website: v }))
                }
                placeholder="https://www.monclub.fr"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">
            <SaveButton onClick={handleSaveClub} isSaving={isSaving} />
          </div>
        </div>
      )}

      {/* ── Section: Horaires d'ouverture ─────────────────────────────────── */}
      {activeTab === "horaires" && (
        <div className="bg-white rounded-lg shadow p-6">
          <SectionHeader
            icon={<ClockIcon className="h-6 w-6" />}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            title="Horaires d'ouverture"
            description="D&eacute;finissez les horaires d'acc&egrave;s au club affich&eacute;s aux membres."
          />

          <TextAreaField
            label="Horaires"
            id="opening_hours"
            value={horairesForm.opening_hours}
            onChange={(v) => setHorairesForm({ opening_hours: v })}
            rows={9}
            placeholder={
              "Lundi - Vendredi : 09h00 - 21h00\nSamedi : 09h00 - 18h00\nDimanche : Ferm\u00e9"
            }
            hint="D\u00e9crivez les horaires d'ouverture en texte libre. Chaque ligne correspond \u00e0 un cr\u00e9neau."
          />

          <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">
            <SaveButton onClick={handleSaveHoraires} isSaving={isSaving} />
          </div>
        </div>
      )}

      {/* ── Section: Réseaux sociaux ──────────────────────────────────────── */}
      {activeTab === "social" && (
        <div className="bg-white rounded-lg shadow p-6">
          <SectionHeader
            icon={<GlobeAltIcon className="h-6 w-6" />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            title="R\u00e9seaux sociaux"
            description="Liens vers les profils officiels de votre club sur les r\u00e9seaux sociaux."
          />

          <div className="space-y-5">
            {/* Facebook */}
            <div className="flex items-start gap-3">
              <span className="mt-7 flex-shrink-0 text-[#1877F2]">
                <FacebookIcon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <Field
                  label="Facebook"
                  id="social_facebook"
                  type="url"
                  value={socialForm.social_facebook}
                  onChange={(v) =>
                    setSocialForm((f) => ({ ...f, social_facebook: v }))
                  }
                  placeholder="https://www.facebook.com/monclub"
                />
              </div>
            </div>

            {/* Instagram */}
            <div className="flex items-start gap-3">
              <span className="mt-7 flex-shrink-0 text-[#E4405F]">
                <InstagramIcon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <Field
                  label="Instagram"
                  id="social_instagram"
                  type="url"
                  value={socialForm.social_instagram}
                  onChange={(v) =>
                    setSocialForm((f) => ({ ...f, social_instagram: v }))
                  }
                  placeholder="https://www.instagram.com/monclub"
                />
              </div>
            </div>

            {/* Twitter / X */}
            <div className="flex items-start gap-3">
              <span className="mt-7 flex-shrink-0 text-gray-900">
                <TwitterXIcon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <Field
                  label="Twitter / X"
                  id="social_twitter"
                  type="url"
                  value={socialForm.social_twitter}
                  onChange={(v) =>
                    setSocialForm((f) => ({ ...f, social_twitter: v }))
                  }
                  placeholder="https://twitter.com/monclub"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">
            <SaveButton onClick={handleSaveSocial} isSaving={isSaving} />
          </div>
        </div>
      )}

      {/* ── Section: Finance & Légal ──────────────────────────────────────── */}
      {activeTab === "finance" && (
        <div className="bg-white rounded-lg shadow p-6">
          <SectionHeader
            icon={<BanknotesIcon className="h-6 w-6" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            title="Finance et informations l\u00e9gales"
            description="Coordonn\u00e9es bancaires et mentions l\u00e9gales de votre association."
          />

          <div className="space-y-5">
            <Field
              label="Compte bancaire (IBAN)"
              id="bank_account"
              value={financeForm.bank_account}
              onChange={(v) =>
                setFinanceForm((f) => ({ ...f, bank_account: v }))
              }
              placeholder="Ex. FR76 3000 6000 0112 3456 7890 189"
              hint="L'IBAN sera visible uniquement par les administrateurs."
            />

            <Field
              label="Num\u00e9ro de TVA"
              id="vat_number"
              value={financeForm.vat_number}
              onChange={(v) => setFinanceForm((f) => ({ ...f, vat_number: v }))}
              placeholder="Ex. FR12 345 678 901"
            />

            <TextAreaField
              label="Informations l\u00e9gales"
              id="legal_info"
              value={financeForm.legal_info}
              onChange={(v) => setFinanceForm((f) => ({ ...f, legal_info: v }))}
              rows={6}
              placeholder={
                "Association loi 1901\nSIRET : 123 456 789 00010\nSi\u00e8ge social : 12 rue de la Paix, 75001 Paris"
              }
              hint="Ces informations apparaissent dans les documents officiels g\u00e9n\u00e9r\u00e9s par l'application."
            />
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-100 pt-5">
            <SaveButton onClick={handleSaveFinance} isSaving={isSaving} />
          </div>
        </div>
      )}

      {/* ── Section: Apparence ────────────────────────────────────────────── */}
      {activeTab === "apparence" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <SectionHeader
            icon={<PaintBrushIcon className="h-6 w-6" />}
            iconBg="bg-pink-50"
            iconColor="text-pink-600"
            title="Apparence"
            description="Personnalisez l'interface de l'application."
          />
          <div className="space-y-4">
            <ColorField
              label="Couleur principale"
              value={apparenceForm.theme_primary_color}
              onChange={(v) =>
                setApparenceForm((f) => ({ ...f, theme_primary_color: v }))
              }
              description="Couleur utilisée pour les éléments actifs, boutons et accents de l'interface."
            />

            {/* Separator */}
            <div className="pt-2 pb-1 border-t border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Couleurs de la sidebar
              </p>
            </div>

            <ColorField
              label="Couleur secondaire"
              value={apparenceForm.theme_secondary_color}
              onChange={(v) =>
                setApparenceForm((f) => ({ ...f, theme_secondary_color: v }))
              }
              description="Utilisée pour les éléments d'accentuation secondaires (badges, indicateurs)."
            />
            <ColorField
              label="Fond de la sidebar"
              value={apparenceForm.theme_sidebar_bg}
              onChange={(v) =>
                setApparenceForm((f) => ({ ...f, theme_sidebar_bg: v }))
              }
              description="Couleur de fond de la barre de navigation latérale."
            />
            <ColorField
              label="Texte de la sidebar"
              value={apparenceForm.theme_sidebar_text}
              onChange={(v) =>
                setApparenceForm((f) => ({ ...f, theme_sidebar_text: v }))
              }
              description="Couleur du texte des éléments inactifs dans la sidebar."
            />

            <Field
              label="URL du logo du club"
              id="club_logo_url"
              value={apparenceForm.club_logo_url}
              onChange={(v) =>
                setApparenceForm((f) => ({ ...f, club_logo_url: v }))
              }
              placeholder="https://example.com/logo.png"
              hint="Affiché dans la barre de navigation latérale."
            />
            {apparenceForm.club_logo_url && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Aperçu :</p>
                <img
                  src={apparenceForm.club_logo_url}
                  alt="Logo aperçu"
                  className="h-12 w-auto object-contain border border-gray-200 rounded p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <Field
              label="Nom affiché dans la sidebar"
              id="navbar_name"
              value={apparenceForm.navbar_name}
              onChange={(v) =>
                setApparenceForm((f) => ({ ...f, navbar_name: v }))
              }
              placeholder="ClubManager"
              hint="Nom court affiché en haut de la barre de navigation. Si vide, le nom officiel du club est utilisé."
            />
          </div>
          <div className="flex justify-end border-t border-gray-100 pt-5">
            <SaveButton onClick={handleSaveApparence} isSaving={isSaving} />
          </div>
        </div>
      )}

      {/* ── Section: Navigation ───────────────────────────────────────────── */}
      {activeTab === "navigation" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <SectionHeader
            icon={<Squares2x2Icon className="h-6 w-6" />}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            title="Navigation"
            description="Choisissez les modules visibles dans la barre de navigation latérale."
          />
          <div className="bg-gray-50 rounded-lg px-4 divide-y divide-gray-100">
            <ModuleToggle
              label="Tableau de bord"
              moduleKey="dashboard"
              enabled={true}
              disabled={true}
              onChange={() => {}}
            />
            <ModuleToggle
              label="Cours"
              moduleKey="courses"
              enabled={activeModules["courses"] ?? true}
              onChange={(k, v) => setActiveModules((m) => ({ ...m, [k]: v }))}
            />
            <ModuleToggle
              label="Utilisateurs"
              moduleKey="users"
              enabled={activeModules["users"] ?? true}
              onChange={(k, v) => setActiveModules((m) => ({ ...m, [k]: v }))}
            />
            <ModuleToggle
              label="Famille"
              moduleKey="families"
              enabled={activeModules["families"] ?? true}
              onChange={(k, v) => setActiveModules((m) => ({ ...m, [k]: v }))}
            />
            <ModuleToggle
              label="Paiements"
              moduleKey="payments"
              enabled={activeModules["payments"] ?? true}
              onChange={(k, v) => setActiveModules((m) => ({ ...m, [k]: v }))}
            />
            <ModuleToggle
              label="Boutique"
              moduleKey="store"
              enabled={activeModules["store"] ?? true}
              onChange={(k, v) => setActiveModules((m) => ({ ...m, [k]: v }))}
            />
            <ModuleToggle
              label="Messages"
              moduleKey="messages"
              enabled={activeModules["messages"] ?? true}
              onChange={(k, v) => setActiveModules((m) => ({ ...m, [k]: v }))}
            />
            <ModuleToggle
              label="Statistiques"
              moduleKey="statistics"
              enabled={activeModules["statistics"] ?? true}
              onChange={(k, v) => setActiveModules((m) => ({ ...m, [k]: v }))}
            />
          </div>
          <div className="flex justify-end border-t border-gray-100 pt-5">
            <SaveButton onClick={handleSaveNavigation} isSaving={isSaving} />
          </div>
        </div>
      )}

      {/* ── Section: Localisation ─────────────────────────────────────────── */}
      {activeTab === "localisation" && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <SectionHeader
            icon={<LanguageIcon className="h-6 w-6" />}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
            title="Localisation"
            description="Configurez la langue et les formats d'affichage."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Langue de l'interface"
              value={localisationForm.app_language}
              onChange={(v) =>
                setLocalisationForm((f) => ({ ...f, app_language: v }))
              }
              options={[
                { value: "fr", label: "Français" },
                { value: "en", label: "English" },
              ]}
            />
            <SelectField
              label="Format de date"
              value={localisationForm.date_format}
              onChange={(v) =>
                setLocalisationForm((f) => ({ ...f, date_format: v }))
              }
              options={[
                { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
                { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
              ]}
            />
            <SelectField
              label="Format d'heure"
              value={localisationForm.time_format}
              onChange={(v) =>
                setLocalisationForm((f) => ({ ...f, time_format: v }))
              }
              options={[
                { value: "24h", label: "24h (14:30)" },
                { value: "12h", label: "12h (2:30 PM)" },
              ]}
            />
            <SelectField
              label="Fuseau horaire"
              value={localisationForm.timezone}
              onChange={(v) =>
                setLocalisationForm((f) => ({ ...f, timezone: v }))
              }
              options={[
                { value: "Europe/Paris", label: "Europe/Paris (UTC+1/+2)" },
                { value: "Europe/London", label: "Europe/London (UTC+0/+1)" },
                {
                  value: "Europe/Brussels",
                  label: "Europe/Brussels (UTC+1/+2)",
                },
                { value: "Europe/Zurich", label: "Europe/Zurich (UTC+1/+2)" },
                {
                  value: "America/New_York",
                  label: "America/New_York (UTC-5/-4)",
                },
                {
                  value: "America/Montreal",
                  label: "America/Montreal (UTC-5/-4)",
                },
                { value: "UTC", label: "UTC (UTC+0)" },
              ]}
            />
          </div>
          <div className="flex justify-end border-t border-gray-100 pt-5">
            <SaveButton onClick={handleSaveLocalisation} isSaving={isSaving} />
          </div>
        </div>
      )}
    </div>
  );
};
