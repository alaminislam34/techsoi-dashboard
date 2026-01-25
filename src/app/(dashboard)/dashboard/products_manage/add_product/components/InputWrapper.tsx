"use client";

import React from "react";

type Props = {
  label?: React.ReactNode;
  children: React.ReactNode;
};

export default function InputWrapper({ label, children }: Props) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[15px] font-medium text-[#64748b]">{label}</label>
      )}
      <div className="relative w-full">{children}</div>
    </div>
  );
}
