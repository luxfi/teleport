import { useState, useEffect } from "react";

const getWindowDimension = () => {
  const { innerWidth: width, innerHeight: height } = window;

  return { width, height };
};

const useDimension = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimension()
  );

  const handleResize = () => {
    setWindowDimensions(getWindowDimension());
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
};

export default useDimension;
