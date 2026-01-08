"use client";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSizeChange: (size: string) => void;
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
}: SizeSelectorProps) {
  return (
    <div className="flex gap-3">
      {sizes.map((size) => (
        <button
          key={size}
          onClick={() => onSizeChange(size)}
          className={`px-6 py-2 rounded-full border-2 font-semibold transition-all ${
            selectedSize === size
              ? "border-[#bd6325] bg-[#bd6325] text-white"
              : "border-gray-300 bg-white text-gray-700 hover:border-[#bd6325]"
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
