import * as React from "react";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { StepIconProps } from "@mui/material/StepIcon";
import Image from "next/image";

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: "transparent",
      border: "1px dashed rgba(0, 144, 255, 1)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: "transparent",
      border: "1px dashed rgba(152, 34, 187, 1)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 1,
    border: "1px dashed #323546",
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({}) => ({
  backgroundColor: "transparent",
  zIndex: 1,
  width: 40,
  height: 40,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
}));

function ColorlibStepIcon(props: StepIconProps & { steps: any }) {
  const { active, completed, className, steps } = props;

  const icons: { [index: string]: React.ReactElement } = steps?.reduce(
    (acc, _, i) => ({
      ...acc,
      [i + 1]: (
        <>
          {active && (
            <span
              style={{ height: 30, width: 30 }}
              className="absolute inline-flex rounded-full opacity-75 animate-ping bg-sky-400"
            ></span>
          )}
          <Image
            src={`${_.logo}`}
            alt=""
            width={40}
            height={40}
            className="rounded-full "
          />
        </>
      ),
    }),
    {}
  );

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

interface Step {
  label: string;
  icon: number;
  logo: string;
  sublabel?: string;
}

export default function CustomizedSteppers({
  steps,
  activeStep,
}: {
  steps: Step[];
  activeStep: number;
}) {
  return (
    <div style={{ width: "100%", marginBottom: 24, marginTop: 50 }}>
      <Stack sx={{ width: "100%" }} spacing={4}>
        <Stepper
          alternativeLabel
          activeStep={activeStep}
          connector={<ColorlibConnector />}
        >
          {steps.map((label) => (
            <Step key={label.icon}>
              <StepLabel
                StepIconComponent={(e) =>
                  ColorlibStepIcon({ ...e, steps: steps })
                }
              >
                <p className="text-base font-semibold text-white">
                  {label.label}
                </p>
                {label.sublabel && (
                  <p className="text-xs text-white opacity-50">
                    Private Routing
                  </p>
                )}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Stack>
    </div>
  );
}
