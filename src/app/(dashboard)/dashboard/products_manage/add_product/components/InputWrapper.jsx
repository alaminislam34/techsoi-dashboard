import React from "react";

const InputWrapper = ({ label, children }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label className="text-[15px] font-medium text-[#64748b]">{label}</label>
    )}
    <div className="relative w-full">{children}</div>
  </div>
);

export default InputWrapper;
