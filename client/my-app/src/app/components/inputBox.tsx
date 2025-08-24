"use client";
import { Search } from "lucide-react";

interface InputBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function InputBox({ value, onChange, placeholder }: InputBoxProps) {
  return (
    <div className="flex items-center gap-2 border-2 border-blue-400 rounded-md px-3 py-2 bg-white shadow-sm 
    focus-within:ring-2 focus-within:ring-blue-400 w-full sm:w-[300px] h-[30px]">
      <Search size={18} className="text-blue-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search"}
        className="flex-1 outline-none bg-transparent text-blue-400 placeholder:text-blue-300"
      />
    </div>
  );
}