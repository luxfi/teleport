import React from "react";

interface FooterOptions {
  title: string;
  options: any;
}

const FooterOptions = ({ title, options }) => {
  return (
    <div>
      <div className="flex flex-col mt-5 lg:mt-0">
        <p className="mt-8 mb-4 text-xl font-thin lg:mt-0">{title}</p>
        <div className="flex flex-col space-y-4 text-sm font-thin">
          {options.map((data) => (
            <div key={data.sub_title}>
              <a
                target={data.pdf ? "_blank" : "_parent"}
                rel="noreferrer noopener"
                href={data.link}
              >
                {data.sub_title}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FooterOptions;
