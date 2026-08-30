export function getTransitionBtnClass(couleur?: string): string {
  switch (couleur) {
    case "success":
    case "green":
      return "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-sm";
    case "danger":
    case "red":
      return "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm";
    case "warning":
    case "orange":
    case "yellow":
      return "text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400 shadow-sm";
    case "purple":
    case "violet":
      return "text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 shadow-sm";
    case "info":
    case "blue":
      return "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-sm";
    case "neutral":
    case "gray":
      return "text-white bg-gray-500 hover:bg-gray-600 focus:ring-gray-400 shadow-sm";
    default:
      return "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-sm";
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
