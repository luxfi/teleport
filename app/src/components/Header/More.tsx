import { Popover, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import Link from "next/link";

import { classNames } from "../../functions/styling";

// components
import DownArrowIcon from "components/Icons/DownArrowIcon";

export default function Menu() {
  return (
    <Popover className="relative ml-auto md:m-0 bg-black">
      {({ open }) => (
        <>
          <Popover.Button
            className={classNames(
              "focus:outline-none border border-navy-blue px-6 py-4 text-white rounded-full"
            )}
          >
            <div className="flex gap-2 items-center text-sm">
              EN <DownArrowIcon />
            </div>
          </Popover.Button>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              static
              className="absolute z-50 w-screen max-w-xs px-2 mt-3 transform -translate-x-full bottom-12 lg:top-12 left-full sm:px-0"
            >
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 bg-black ring-opacity-5">
                <div className="relative grid gap-6 px-5 py-6 bg-[#1B1E31] sm:gap-8 sm:p-8">
                  <Link href="/">
                    <a className="flex items-center justify-between -m-3 transition duration-150 text-white ease-in-out rounded-md hover:text-white cursor-pointer">
                      English
                      {/* <div className="ml-4 sm:ml-14">
                        <svg
                          width="31"
                          height="30"
                          viewBox="0 0 31 30"
                          className="h-5 w-5"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M24.2326 8.84315H6.07012V8.11665L22.0531 6.83801V8.11665H24.2326V5.93715C24.2326 4.33885 22.938 3.21713 21.3571 3.44235L6.76756 5.52595C5.18525 5.75262 3.89062 7.24485 3.89062 8.84315V23.3731C3.89063 24.1439 4.19679 24.883 4.74177 25.428C5.28675 25.973 6.02591 26.2791 6.79662 26.2791H24.2326C25.0033 26.2791 25.7425 25.973 26.2875 25.428C26.8325 24.883 27.1386 24.1439 27.1386 23.3731V11.7491C27.1386 10.9784 26.8325 10.2393 26.2875 9.6943C25.7425 9.14932 25.0033 8.84315 24.2326 8.84315V8.84315ZM22.0531 19.0229C21.7668 19.0228 21.4833 18.9663 21.2188 18.8566C20.9544 18.747 20.7141 18.5863 20.5117 18.3838C20.3093 18.1813 20.1488 17.9409 20.0393 17.6763C19.9298 17.4118 19.8735 17.1282 19.8736 16.8419C19.8737 16.5556 19.9302 16.2721 20.0399 16.0076C20.1495 15.7432 20.3102 15.5029 20.5127 15.3005C20.7152 15.0981 20.9556 14.9376 21.2202 14.8281C21.4847 14.7186 21.7683 14.6623 22.0546 14.6624C22.6328 14.6626 23.1873 14.8925 23.596 15.3015C24.0048 15.7105 24.2343 16.2651 24.2341 16.8434C24.2339 17.4216 24.004 17.9761 23.595 18.3848C23.186 18.7935 22.6314 19.0231 22.0531 19.0229Z"
                            fill="currentColor"
                          />
                        </svg>
                      </div> */}
                    </a>
                  </Link>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
