/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface SidebarProps {
  isOpen: boolean;
  onDismiss: () => void;
  children?: React.ReactNode;
}

export default function Sidebar({ children, isOpen, onDismiss }: SidebarProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden z-[100]"
        onClose={onDismiss}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
          </Transition.Child>
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative w-screen max-w-md pointer-events-auto">
                <div className="flex flex-col h-full overflow-y-scroll bg-white shadow-xl">
                  <> {children}</>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
