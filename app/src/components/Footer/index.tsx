import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SocialIcon from "components/SocialIcon";
import FooterOptions from "./Options";
import optionFooterData from "./footerOptions.json";

const Footer = () => {
  const [email, setEmail] = useState("");
  const url: string = process.env.NEXT_PUBLIC_MAILCHIMP_KEY || "";

  return (
    <footer className="w-full px-4 sm:px-16 lg:px-24 ">
      <div className="px-4 py-4 mx-auto ">
        <div className="flex flex-col py-12 lg:flex-row lg:justify-between">
          <div className="lg:mr-24">
            <div className="logo">
              <Link href="/" passHref>
                <Image
                  src="/images/logo2.svg"
                  width={110}
                  height={96}
                  alt="Lux logo"
                />
              </Link>
            </div>
            <div className="flex gap-4 mt-4">
              <SocialIcon
                link={"https://twitter.com/spacecoinpro"}
                image={"/images/twitter.svg"}
              />
              <SocialIcon
                link={"https://www.instagram.com/spacecoin_project"}
                image={"/images/instagram.svg"}
              />
              <SocialIcon
                link={"https://facebook.com/spacecoinproject"}
                image={"/images/facebook.svg"}
              />
              <SocialIcon
                link={"https://discord.gg/spacecoinproject"}
                image={"/images/discord.svg"}
              />
              <SocialIcon
                link={"https://www.medium.com/@spacecoinproject"}
                image={"/images/medium.svg"}
              />
              <SocialIcon
                link={"https://www.linkedin.com/company/space-coin-project/"}
                image={"/images/linkedin.svg"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 bg-red-100 lg:gap-2 lg:mr-8 lg:w-2/5">
            {optionFooterData.data.map((data) => (
              <div key={data.title}>
                <FooterOptions title={data.title} options={data.options} />
              </div>
            ))}
          </div>

          <div className="mt-5 sm:mt-8 lg:mt-0">
            <p className="mb-4 text-lg font-thin">Subscribe to Newsletter</p>
          </div>
        </div>

        <div className="flex flex-col items-center py-6 border-t border-white lg:flex-row lg:justify-between border-opacity-10">
          <p className="text-[#ccc] text-center font-thin">
            &copy; {new Date().getFullYear()} by Lux. All rights reserved
          </p>
          <div className="flex gap-4 mt-8 font-thin lg:mt-0">
            <Link href="https://www.spacecoinproject.com/terms-and-conditions">
              <a className="text-white">Terms &amp; Conditions</a>
            </Link>
            <Link href="https://www.spacecoinproject.com/privacy-policy">
              <a className="text-white">Privacy Policy</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
