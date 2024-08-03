import React, { FC, useState } from "react";

const BAD_SRCS: { [tokenAddress: string]: true } = {};

export type LogoProps = {
  src: string;
  width?: string | number;
  height?: string | number;
  alt?: string;
  className?: string;
  style?: any;
};

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
const Logo: FC<LogoProps> = ({
  src,
  width,
  height,
  alt = "",
  className,
  style,
  ...rest
}) => {
  return (
    <div
      className="rounded"
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={src || "/images/unknown.webp"}
        // onError={() => {
        //   if (src) BAD_SRCS[src] = true
        //   refresh((i) => i + 1)
        // }}
        width={width}
        height={height}
        alt={alt}
        className={`rounded ${className}`}
        style={style}
      />
    </div>
  );
};

export default Logo;
