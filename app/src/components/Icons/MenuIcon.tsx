import React from "react";

const MenuIcon = (props: any) => {
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 12h18M3 6h18M3 18h18"
        stroke="#4F46E5"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MenuIcon;
