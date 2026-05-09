import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const IconGrid = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconMegaphone = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M3 11v2a2 2 0 0 0 2 2h1l3 4h2v-12H9L6 11H5a2 2 0 0 0-2 2" />
    <path d="M21 8v8" />
    <path d="M14 7l5-3v16l-5-3" />
  </svg>
);

export const IconLayers = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
    <path d="M3 17l9 5 9-5" />
  </svg>
);

export const IconTag = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M20 12l-8 8a2 2 0 0 1-2.8 0L3 13.8a2 2 0 0 1 0-2.8L11 3h8a1 1 0 0 1 1 1z" />
    <circle cx="15.5" cy="8.5" r="1.5" />
  </svg>
);

export const IconLink = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 1 0-7-7l-1 1" />
    <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 1 0 7 7l1-1" />
  </svg>
);

export const IconChart = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M3 20h18" />
    <path d="M6 16V9" />
    <path d="M11 16V5" />
    <path d="M16 16v-7" />
    <path d="M21 16v-4" />
  </svg>
);

export const IconBranch = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <circle cx="6" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="12" r="2" />
    <path d="M6 8v8" />
    <path d="M16 12H9a3 3 0 0 1-3-3V6" />
  </svg>
);

export const IconPlug = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M9 2v4" />
    <path d="M15 2v4" />
    <path d="M5 10h14" />
    <path d="M7 10v4a5 5 0 0 0 10 0v-4" />
    <path d="M12 19v3" />
  </svg>
);

export const IconSettings = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.18.39.31.8.41 1.2" />
  </svg>
);

export const IconCard = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

export const IconBell = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const IconFilter = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M3 5h18l-7 9v6l-4-2v-4z" />
  </svg>
);

export const IconCalendar = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4" />
    <path d="M8 3v4" />
    <path d="M3 11h18" />
  </svg>
);

export const IconDownload = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M12 4v12" />
    <path d="M7 11l5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);

export const IconRefresh = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 4v6h-6" />
  </svg>
);

export const IconChevronDown = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const IconArrowUp = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>
);

export const IconArrowDown = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M12 5v14" />
    <path d="M19 12l-7 7-7-7" />
  </svg>
);

export const IconCopy = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

export const IconHelp = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-1 .5-1.5 1-1.5 2" />
    <path d="M12 17h.01" />
  </svg>
);

export const IconInfo = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8h.01" />
    <path d="M11 12h1v4h1" />
  </svg>
);

export const IconBook = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M4 19V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v13" />
    <path d="M4 19a2 2 0 0 0 2 2h13" />
    <path d="M8 10h8" />
    <path d="M8 14h6" />
  </svg>
);

export const IconEdit = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

export const IconMore = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <circle cx="6" cy="12" r="1.4" />
    <circle cx="12" cy="12" r="1.4" />
    <circle cx="18" cy="12" r="1.4" />
  </svg>
);

export const IconTrend = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
);

export const IconTrash = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconLock = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const IconSun = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

export const IconMoon = (p: IconProps) => (
  <svg {...baseProps} {...p}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const IconLogo = (p: IconProps) => (
  <svg
    width={28}
    height={28}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...p}
  >
    <path
      d="M11 4C7 4 4 7 4 11v10c0 4 3 7 7 7h2v-9a4 4 0 1 1 8 0v9h2c4 0 7-3 7-7V11c0-4-3-7-7-7H11Z"
      fill="#2563eb"
    />
  </svg>
);
