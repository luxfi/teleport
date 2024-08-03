import useMatchBreakpoints from "../../hooks/useMatchBreakpoints";
import React, { Fragment, useRef } from "react";
// import { isMobile } from "react-device-detect";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
interface ModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  minHeight?: number;
  maxHeight?: number;
  initialFocusRef?: React.RefObject<any>;
  children?: React.ReactNode;
  padding?: number;
  maxWidth?: number;
  className?: string;
  isMax?: boolean;
  isFullWidth?: boolean;
  backgroundColor?: string;
  scrollable?: boolean;
  noPadding?: boolean;
}

export default function Modal({
  isOpen,
  onDismiss,
  minHeight = 0,
  maxHeight = 90,
  initialFocusRef,
  children,
  padding = 5,
  maxWidth = 420,
  isMax,
  isFullWidth,
  backgroundColor,
  scrollable,
  noPadding,
  className,
}: ModalProps) {
  let refDiv = useRef(null);
  const { isXl } = useMatchBreakpoints();
  const isMobile = isXl === false;
  return (
    <>
      <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={onDismiss}
        aria-describedby="alert-dialog-slide-description"
        style={{
          backdropFilter: "blur(10px)",
        }}
        PaperProps={{
          style: {
            backgroundColor: backgroundColor || "transparent",
            color: "#fff",
            backdropFilter: "blur(50px)",
          },
        }}
      >
        <DialogContent
          style={{
            padding: 0,
            backgroundColor: "rgb(19 18 36)",
            borderRadius: "1.5rem",
            backdropFilter: "blur(50px)",
          }}
        >
          <div
            className={`transition-all transform ${isMax && "h-full z-50"}`}
            style={{
              width: isMobile
                ? `100%`
                : isFullWidth || isMax
                ? "100vw"
                : "65vw",
              maxWidth: isFullWidth || isMax ? "100%" : `${maxWidth}px`,
            }}
          >
            <div
              className={` ${isMax ? "h-full" : "p-px"}  w-full rounded-3xl ${
                !noPadding && ""
              }`}
            >
              <div
                className={`${
                  !isMax && !noPadding && "rounded-3xl p-6"
                } flex flex-col w-full h-full  overflow-y-hidden bg-primary`}
                style={{ backgroundColor }}
              >
                <div
                  style={{
                    // minHeight: isMax ? "100vh" : `${minHeight}vh`,
                    minHeight: `${minHeight}vh`,
                    maxHeight: scrollable ? "auto" : `${maxHeight}vh`,
                  }}
                >
                  {children}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
