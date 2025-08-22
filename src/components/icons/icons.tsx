import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

// Default icon size
const DEFAULT_ICON_SIZE = 26;
const DEFAULT_COLOR = '#000000';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

// Navigation Tab Icons
export function HomeIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function PerformanceIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function SettingsIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
        stroke={color}
        strokeWidth={2}
      />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

// Action Icons
export function PlusIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = '#FFFFFF' }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function CloseIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function CheckmarkIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function CheckmarkCircleIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

// Error/Issue Icon (Circled X)
export function CircledXIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
        fill={color}
      />
    </Svg>
  );
}

export function CheckmarkSmallIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="m4.5 12.75 6 6 9-13.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Media Icons
export function UploadIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
    </Svg>
  );
}

export function VideoIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </Svg>
  );
}

// Settings Category Icons
export function PersonIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function LanguageIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function UnitsIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        d="M12 2.25a.75.75 0 0 1 .75.75v.756a49.106 49.106 0 0 1 9.152 1 .75.75 0 0 1-.152 1.485h-1.918l2.474 10.124a.75.75 0 0 1-.375.84A6.723 6.723 0 0 1 18.75 18a6.723 6.723 0 0 1-3.181-.795.75.75 0 0 1-.375-.84l2.474-10.124H12.75v13.28c1.293.076 2.534.343 3.697.776a.75.75 0 0 1-.262 1.453h-8.37a.75.75 0 0 1-.262-1.453c1.162-.433 2.404-.7 3.697-.775V6.24H6.332l2.474 10.124a.75.75 0 0 1-.375.84A6.723 6.723 0 0 1 5.25 18a6.723 6.723 0 0 1-3.181-.795.75.75 0 0 1-.375-.84L4.168 6.241H2.25a.75.75 0 0 1-.152-1.485 49.105 49.105 0 0 1 9.152-1V3a.75.75 0 0 1 .75-.75Zm4.878 13.543 1.872-7.662 1.872 7.662h-3.744Zm-9.756 0L5.25 8.131l-1.872 7.662h3.744Z"
        clipRule="evenodd"
        fill={color}
      />
    </Svg>
  );
}

export function ReferFriendIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function AppearanceIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15 11.25 1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 1 0-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25l-8.47 8.47c-.34.34-.8.53-1.28.53s-.94.19-1.28.53l-.97.97-.75-.75.97-.97c.34-.34.53-.8.53-1.28s.19-.94.53-1.28L12.75 9M15 11.25 12.75 9"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function TermsIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function PrivacyIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function EmailIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function DeleteAccountIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function LogoutIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

// Library/Sort Icons
export function ClockIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function SortUpIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function SortDownIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function FilterIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function EditIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"
        fill={color}
      />
    </Svg>
  );
}

export function BackIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 19.5 8.25 12l7.5-7.5"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function ForwardIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function ChevronUpIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 15.75l7.5-7.5 7.5 7.5"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function ChevronDownIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function ChevronRightIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.25 4.5 7.5 7.5-7.5 7.5"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

// Premium Icons
export function TrendingUpwardsIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.22 6.268a.75.75 0 0 1 .968-.431l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.94a.75.75 0 1 1-1.4-.537l1.63-4.251-1.086.484a11.2 11.2 0 0 0-5.45 5.173.75.75 0 0 1-1.199.19L9 12.312l-6.22 6.22a.75.75 0 0 1-1.06-1.061l6.75-6.75a.75.75 0 0 1 1.06 0l3.606 3.606a12.695 12.695 0 0 1 5.68-4.974l1.086-.483-4.251-1.632a.75.75 0 0 1-.432-.97Z"
        fill={color}
      />
    </Svg>
  );
}

// Notification Icon
export function NotificationIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Checkmark with Circle for onboarding
export function CheckmarkWithCircleIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="12" fill="#34C759" />
      <Path 
        d="M9 12L11 14L15 10" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Arrow Icons for Performance Stats
export function ArrowUpIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function ArrowDownIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

// More Action Icons
export function MoreHorizontalIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function ShareIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.935-2.186 2.25 2.25 0 0 0-3.935 2.186Z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function StarIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        stroke={color}
        strokeWidth={1.5}
        fill={filled ? color : "none"}
      />
    </Svg>
  );
}

export function HeartIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        stroke={color}
        strokeWidth={1.5}
        fill={filled ? color : "none"}
      />
    </Svg>
  );
}

export function PlayIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
        stroke={color}
        strokeWidth={1.5}
        fill={color}
      />
    </Svg>
  );
}

export function InfoIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function TrashIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function CopyIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function UnlockIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

export function BellIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
        stroke={color}
        strokeWidth={2}
      />
    </Svg>
  );
}

// Circular Progress Chart Components
interface CircularProgressProps extends IconProps {
  percentage: number;
  progressColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  radius?: number;
}

export function CircularProgressChart({ 
  width = 120, 
  height = 120, 
  percentage, 
  progressColor = DEFAULT_COLOR, 
  backgroundColor = "#E5E5E5",
  strokeWidth = 8,
  radius = 48
}: CircularProgressProps) {
  const centerX = width / 2;
  const centerY = height / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);
  
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Background circle */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle - percentage filled */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        stroke={progressColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${centerX} ${centerY})`}
      />
      {/* Inner circle */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius - strokeWidth - 8}
        fill="#FFFFFF"
      />
    </Svg>
  );
}

export function CircularProgressChartWithCustomInner({ 
  width = 120, 
  height = 120, 
  percentage, 
  progressColor = DEFAULT_COLOR, 
  backgroundColor = "#E5E5E5",
  strokeWidth = 8,
  radius = 36,
  innerRadius = 28
}: CircularProgressProps & { innerRadius?: number }) {
  const centerX = width / 2;
  const centerY = height / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);
  
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Background circle */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle - percentage filled */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={radius}
        stroke={progressColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${centerX} ${centerY})`}
      />
      {/* Inner circle */}
      <Circle
        cx={centerX}
        cy={centerY}
        r={innerRadius}
        fill="#FFFFFF"
      />
    </Svg>
  );
} 

export function QuestionMarkCircleIcon({ width = DEFAULT_ICON_SIZE, height = DEFAULT_ICON_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 0 1-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 0 1-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 0 1-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584ZM12 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
        clipRule="evenodd"
        fill={color}
      />
    </Svg>
  );
} 