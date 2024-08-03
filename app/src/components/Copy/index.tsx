import { toast } from "react-toastify";
import { CopyAll } from "@mui/icons-material";

export const shortenText = (str: string, maxlength: number) => {
  return str.length > maxlength ? str.slice(0, maxlength - 1) + "…" : str;
};

interface CopyProps {
  text: any;
  address?: any;
}

const Copy = ({ text, address }: CopyProps) => {
  return (
    <div className="w-full flex justify-center items-center">
      <div className="lg:mx-auto py-2 rounded flex font-bold tracking-wide justify-between items-center text-xs lg:text-base">
        <span
          className="text-white cursor-pointer"
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(address);
              toast.success("Address copied");
            }
          }}
        >
          {/* {address ? (
            <a
              href={`https://rinkeby.etherscan.io/address/${address}`}
              target="_blank"
              rel="noreferrer"
            >
              {text}
            </a>
          ) : (
            )} */}
          <span>{text}</span>
        </span>
        <span
          className="ml-4 cursor-pointer"
          onClick={() => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(address);
              toast.success("Address copied");
            }
          }}
        >
          <CopyAll style={{ fill: "#fff" }} />
        </span>
      </div>
    </div>
  );
};

export default Copy;
