/**
 * Helpers - Fonctions utilitaires diverses
 * ClubManager V3
 *
 * Utilitaires génériques pour faciliter le développement.
 * Fonctions couramment utilisées pour manipuler des données, des tableaux, des objets, etc.
 *
 * @module shared/utils/helpers
 */

// ═══════════════════════════════════════════════════════════════════════════
// MANIPULATION DE TABLEAUX
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Supprime les doublons d'un tableau
 *
 * @param array - Tableau à dédupliquer
 * @returns Nouveau tableau sans doublons
 *
 * @example
 * removeDuplicates([1, 2, 2, 3, 4, 4, 5]) // [1, 2, 3, 4, 5]
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Supprime les doublons d'un tableau d'objets basé sur une clé
 *
 * @param array - Tableau d'objets
 * @param key - Clé pour identifier les doublons
 * @returns Nouveau tableau sans doublons
 *
 * @example
 * removeDuplicatesByKey([{id: 1}, {id: 2}, {id: 1}], 'id') // [{id: 1}, {id: 2}]
 */
export function removeDuplicatesByKey<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Divise un tableau en chunks de taille donnée
 *
 * @param array - Tableau à diviser
 * @param size - Taille de chaque chunk
 * @returns Tableau de chunks
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Mélange un tableau aléatoirement
 *
 * @param array - Tableau à mélanger
 * @returns Nouveau tableau mélangé
 *
 * @example
 * shuffle([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4]
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Groupe un tableau d'objets par une clé
 *
 * @param array - Tableau d'objets
 * @param key - Clé pour le groupement
 * @returns Objet avec les groupes
 *
 * @example
 * groupBy([{type: 'a', val: 1}, {type: 'b', val: 2}, {type: 'a', val: 3}], 'type')
 * // { a: [{type: 'a', val: 1}, {type: 'a', val: 3}], b: [{type: 'b', val: 2}] }
 */
export function groupBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Trie un tableau d'objets par une clé
 *
 * @param array - Tableau d'objets
 * @param key - Clé pour le tri
 * @param order - Ordre de tri ('asc' ou 'desc')
 * @returns Nouveau tableau trié
 *
 * @example
 * sortBy([{age: 30}, {age: 20}, {age: 25}], 'age', 'asc') // [{age: 20}, {age: 25}, {age: 30}]
 */
export function sortBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Trouve le premier élément qui match une condition
 *
 * @param array - Tableau à parcourir
 * @param predicate - Fonction de test
 * @returns Premier élément trouvé ou undefined
 */
export function findFirst<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
  return array.find(predicate);
}

/**
 * Trouve le dernier élément qui match une condition
 *
 * @param array - Tableau à parcourir
 * @param predicate - Fonction de test
 * @returns Dernier élément trouvé ou undefined
 */
export function findLast<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) return array[i];
  }
  return undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// MANIPULATION D'OBJETS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Supprime les propriétés undefined/null d'un objet
 *
 * @param obj - Objet à nettoyer
 * @returns Nouvel objet sans valeurs undefined/null
 *
 * @example
 * removeEmpty({a: 1, b: null, c: undefined, d: 2}) // {a: 1, d: 2}
 */
export function removeEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined)
  ) as Partial<T>;
}

/**
 * Sélectionne certaines propriétés d'un objet
 *
 * @param obj - Objet source
 * @param keys - Clés à sélectionner
 * @returns Nouvel objet avec seulement les clés demandées
 *
 * @example
 * pick({a: 1, b: 2, c: 3}, ['a', 'c']) // {a: 1, c: 3}
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * Exclut certaines propriétés d'un objet
 *
 * @param obj - Objet source
 * @param keys - Clés à exclure
 * @returns Nouvel objet sans les clés exclues
 *
 * @example
 * omit({a: 1, b: 2, c: 3}, ['b']) // {a: 1, c: 3}
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * Vérifie si un objet est vide
 *
 * @param obj - Objet à vérifier
 * @returns true si l'objet est vide
 *
 * @example
 * isEmpty({}) // true
 * isEmpty({a: 1}) // false
 */
export function isEmpty(obj: Record<string, any> | null | undefined): boolean {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
}

/**
 * Clone profond d'un objet
 *
 * @param obj - Objet à cloner
 * @returns Clone de l'objet
 *
 * @example
 * deepClone({a: {b: 1}}) // {a: {b: 1}} (nouvelle référence)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ═══════════════════════════════════════════════════════════════════════════
// CLASSES CSS (TAILWIND)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Combine des classes CSS conditionnellement
 *
 * @param classes - Classes CSS (string, objet, ou tableau)
 * @returns String de classes combinées
 *
 * @example
 * cn('btn', 'btn-primary', { active: true, disabled: false })
 * // "btn btn-primary active"
 */
export function cn(...classes: (string | Record<string, boolean> | undefined | null | false)[]): string {
  return classes
    .map(cls => {
      if (!cls) return '';
      if (typeof cls === 'string') return cls;
      return Object.entries(cls)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(' ');
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Alias pour cn (convention naming)
 */
export const classNames = cn;

// ═══════════════════════════════════════════════════════════════════════════
// DEBOUNCE & THROTTLE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Crée une fonction debounced
 *
 * @param func - Fonction à debounce
 * @param delay - Délai en ms
 * @returns Fonction debounced
 *
 * @example
 * const search = debounce((query) => api.search(query), 300);
 * search('test'); // Sera exécuté 300ms après le dernier appel
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Crée une fonction throttled
 *
 * @param func - Fonction à throttle
 * @param limit - Limite en ms
 * @returns Fonction throttled
 *
 * @example
 * const onScroll = throttle(() => console.log('scroll'), 100);
 * window.addEventListener('scroll', onScroll);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GÉNÉRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Génère un ID unique
 *
 * @returns ID unique (string)
 *
 * @example
 * generateId() // "abc123def456"
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Génère une couleur hexadécimale aléatoire
 *
 * @returns Couleur hex (#RRGGBB)
 *
 * @example
 * generateColor() // "#3A7BD5"
 */
export function generateColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Génère des initiales depuis un nom complet
 *
 * @param name - Nom complet
 * @returns Initiales (max 2 lettres)
 *
 * @example
 * getInitials("Jean Dupont") // "JD"
 * getInitials("Marie-Claire Martin") // "MM"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════════════
// ATTENTE & RETRY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Attend un certain temps (Promise)
 *
 * @param ms - Temps d'attente en millisecondes
 * @returns Promise qui se résout après le délai
 *
 * @example
 * await sleep(1000); // Attend 1 seconde
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Réessaye une fonction jusqu'à ce qu'elle réussisse
 *
 * @param fn - Fonction à exécuter
 * @param maxRetries - Nombre max de tentatives
 * @param delay - Délai entre les tentatives (ms)
 * @returns Résultat de la fonction
 *
 * @example
 * const data = await retry(() => api.fetchData(), 3, 1000);
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION & URL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse les query params d'une URL
 *
 * @param url - URL à parser
 * @returns Objet avec les paramètres
 *
 * @example
 * parseQueryParams("?page=1&sort=name") // {page: "1", sort: "name"}
 */
export function parseQueryParams(url: string): Record<string, string> {
  const params = new URLSearchParams(url.split('?')[1] || '');
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Construit une query string depuis un objet
 *
 * @param params - Objet de paramètres
 * @returns Query string
 *
 * @example
 * buildQueryString({page: 1, sort: 'name'}) // "page=1&sort=name"
 */
export function buildQueryString(params: Record<string, any>): string {
  const cleanParams = removeEmpty(params);
  const searchParams = new URLSearchParams();

  Object.entries(cleanParams).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return searchParams.toString();
}

// ═══════════════════════════════════════════════════════════════════════════
// STOCKAGE LOCAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sauvegarde dans localStorage avec gestion d'erreur
 *
 * @param key - Clé de stockage
 * @param value - Valeur à stocker
 * @returns true si succès
 */
export function setLocalStorage(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

/**
 * Récupère depuis localStorage avec gestion d'erreur
 *
 * @param key - Clé de stockage
 * @param defaultValue - Valeur par défaut si erreur
 * @returns Valeur récupérée ou valeur par défaut
 */
export function getLocalStorage<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Supprime du localStorage
 *
 * @param key - Clé à supprimer
 * @returns true si succès
 */
export function removeLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLIPBOARD
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Copie du texte dans le presse-papiers
 *
 * @param text - Texte à copier
 * @returns Promise<boolean> - true si succès
 *
 * @example
 * await copyToClipboard("Hello World");
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback pour navigateurs anciens
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CALCULS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcule la moyenne d'un tableau de nombres
 *
 * @param numbers - Tableau de nombres
 * @returns Moyenne
 *
 * @example
 * average([1, 2, 3, 4, 5]) // 3
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calcule la somme d'un tableau de nombres
 *
 * @param numbers - Tableau de nombres
 * @returns Somme
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

/**
 * Trouve le minimum d'un tableau
 *
 * @param numbers - Tableau de nombres
 * @returns Valeur minimale
 */
export function min(numbers: number[]): number {
  return Math.min(...numbers);
}

/**
 * Trouve le maximum d'un tableau
 *
 * @param numbers - Tableau de nombres
 * @returns Valeur maximale
 */
export function max(numbers: number[]): number {
  return Math.max(...numbers);
}

/**
 * Arrondit un nombre à N décimales
 *
 * @param num - Nombre à arrondir
 * @param decimals - Nombre de décimales
 * @returns Nombre arrondi
 *
 * @example
 * round(3.14159, 2) // 3.14
 */
export function round(num: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Clamp un nombre entre min et max
 *
 * @param num - Nombre à clamper
 * @param min - Valeur minimale
 * @param max - Valeur maximale
 * @returns Nombre clampé
 *
 * @example
 * clamp(15, 0, 10) // 10
 * clamp(-5, 0, 10) // 0
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

// ═══════════════════════════════════════════════════════════════════════════
// DÉTECTION NAVIGATEUR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vérifie si on est sur mobile
 *
 * @returns true si mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Vérifie si on est sur iOS
 *
 * @returns true si iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Vérifie si on est sur Android
 *
 * @returns true si Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

// ═══════════════════════════════════════════════════════════════════════════
// DIVERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Télécharge un fichier côté client
 *
 * @param data - Données du fichier
 * @param filename - Nom du fichier
 * @param type - Type MIME
 *
 * @example
 * downloadFile("Hello World", "hello.txt", "text/plain");
 */
export function downloadFile(data: BlobPart, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Scroll vers un élément
 *
 * @param elementId - ID de l'élément
 * @param behavior - Comportement du scroll
 */
export function scrollToElement(
  elementId: string,
  behavior: ScrollBehavior = 'smooth'
): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior, block: 'start' });
  }
}

/**
 * Vérifie si une valeur est définie (pas null/undefined)
 *
 * @param value - Valeur à vérifier
 * @returns true si définie
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Retourne une valeur par défaut si la valeur est null/undefined
 *
 * @param value - Valeur à vérifier
 * @param defaultValue - Valeur par défaut
 * @returns Valeur ou défaut
 */
export function defaultTo<T>(value: T | null | undefined, defaultValue: T): T {
  return isDefined(value) ? value : defaultValue;
}
