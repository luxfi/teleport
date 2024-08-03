import React from "react"

interface SettingsIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const SettingsIcon = ({width=24, height=24, color="white", ...rest}:SettingsIconProps) => (
  <svg
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...rest}
  >
    <path
      clipRule="evenodd"
      d="m21.12 7.86-.622-1.08a1.913 1.913 0 0 0-2.608-.705v0a1.904 1.904 0 0 1-2.61-.678 1.832 1.832 0 0 1-.255-.915v0a1.913 1.913 0 0 0-1.914-1.968h-1.254a1.904 1.904 0 0 0-1.903 1.913v0A1.913 1.913 0 0 1 8.04 6.313a1.83 1.83 0 0 1-.916-.256v0a1.913 1.913 0 0 0-2.609.704L3.848 7.86a1.913 1.913 0 0 0 .696 2.608v0a1.913 1.913 0 0 1 0 3.314v0a1.904 1.904 0 0 0-.696 2.6v0l.632 1.089a1.913 1.913 0 0 0 2.609.741v0a1.895 1.895 0 0 1 2.6.696c.164.277.252.593.255.915v0c0 1.057.857 1.913 1.913 1.913h1.255a1.913 1.913 0 0 0 1.912-1.904v0a1.904 1.904 0 0 1 1.914-1.913c.321.009.636.097.915.256v0a1.913 1.913 0 0 0 2.609-.695v0l.659-1.099a1.904 1.904 0 0 0-.696-2.608v0a1.904 1.904 0 0 1-.696-2.609c.166-.29.406-.53.696-.696v0a1.913 1.913 0 0 0 .696-2.6v0-.008Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx={12.489}
      cy={12.125}
      r={2.636}
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default SettingsIcon