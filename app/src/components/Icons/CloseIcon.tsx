import React from "react";

const CloseIcon = (props:any) => {
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.59 12l4.454-4.453a1.126 1.126 0 00-1.59-1.594L12 10.406 7.547 5.953a1.127 1.127 0 00-1.594 1.594L10.406 12l-4.453 4.453a1.127 1.127 0 001.594 1.594L12 13.594l4.453 4.453a1.127 1.127 0 001.594-1.594L13.59 12z"
        fill="#fff"
      />
    </svg>
  );
};

export default CloseIcon;
