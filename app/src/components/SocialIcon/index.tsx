import Image from "next/image";
import React, { FC } from "react";

interface SocialIconProps {
  link: string;
  image: string;
}

const SocialIcon: FC<SocialIconProps> = ({ link, image }) => {
  return (
    <div>
      <a href={link} target="_blank" rel="noreferrer">
        <Image src={image} width={24} height={24} alt="twitter logo" />
      </a>
    </div>
  );
};

export default SocialIcon;
