// Tailwind can only pick up class names it can see literally in source, so
// `bg-${color}-700` in a template string will NOT work in production builds.
// Add a row here for every `color` value used in certificateTypes.js.
export const COLOR_CLASSES = {
  blue: {
    activeTab: "bg-blue-900 text-white",
    activeFilter: "bg-blue-900 text-white",
    accentText: "text-blue-900",
    accentBorder: "border-blue-900",
    ring: "focus:ring-blue-900 focus:border-blue-900",
    cardBorder: "hover:border-blue-300",
    badge: "bg-blue-50 text-blue-700",
  },
  red: {
    activeTab: "bg-red-800 text-white",
    activeFilter: "bg-red-800 text-white",
    accentText: "text-red-800",
    accentBorder: "border-red-800",
    ring: "focus:ring-red-800 focus:border-red-800",
    cardBorder: "hover:border-red-300",
    badge: "bg-red-50 text-red-700",
  },
  violet: {
    activeTab: "bg-violet-800 text-white",
    activeFilter: "bg-violet-800 text-white",
    accentText: "text-violet-800",
    accentBorder: "border-violet-800",
    ring: "focus:ring-violet-800 focus:border-violet-800",
    cardBorder: "hover:border-violet-300",
    badge: "bg-violet-50 text-violet-700",
  },
  green: {
    activeTab: "bg-green-800 text-white",
    activeFilter: "bg-green-800 text-white",
    accentText: "text-green-800",
    accentBorder: "border-green-800",
    ring: "focus:ring-green-800 focus:border-green-800",
    cardBorder: "hover:border-green-300",
    badge: "bg-green-50 text-green-700",
  },
};

export function colorsFor(colorName) {
  return COLOR_CLASSES[colorName] || COLOR_CLASSES.blue;
}
