import React, { useEffect, useState } from "react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface AlertProps {}

const Alert = (props: AlertProps) => {
  const [message, setMessage] = useState("");

  const notify = (msg: {} | null | undefined | any) => toast(msg);

  useEffect(() => {
    setTimeout(() => {
      if (message !== "") {
        notify(message);
        setMessage("");
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <ToastContainer />
    </div>
  );
};

export default Alert;
