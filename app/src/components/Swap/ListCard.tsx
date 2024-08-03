import Image from "next/image";

interface ListCardProps {
  label?: string;
  fee?: string;
  amount?: string;
  className?: string;
  background?: string;
}

const ListCard = ({
  label,
  fee,
  amount,
  className,
  background,
}: ListCardProps) => {
  return (
    <div
      className={`flex-1 px-4 py-5 ${
        background ?? "bg-accent"
      } mt-8 rounded-xl relative ${className && className}`}
    >
      <h1 className="text-xl text-white">{amount}</h1>
      <div className="flex items-center gap-x-3">
        <h1 className="text-sm text-white">Est. gas fee ={fee}</h1>
        <button className="outline-none flex items-center">
          <Image src="/icons/info.svg" alt="" width={20} height={20} />
        </button>
      </div>

      <div className="px-2 py-1 absolute -top-3 left-5 bg-black">
        <h1 className="text-sm text-white">{label}</h1>
      </div>
    </div>
  );
};

export default ListCard;
