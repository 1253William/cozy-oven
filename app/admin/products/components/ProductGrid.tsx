import {
  Delete02Icon,
  Package01Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import AdminIcon from "../../components/AdminIcon";
import Image from "next/image";
import { Product } from "../../../services/productService";
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggleAvailable?: (product: Product) => void;
}

const CyclingImage = ({ images, defaultImage, alt }: { images?: string[], defaultImage: string, alt: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allImages = useMemo(() => {
    if (images && images.length > 0) return images;
    return [defaultImage || "/placeholder.svg"];
  }, [images, defaultImage]);

  useEffect(() => {
    if (allImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [allImages]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <Image
          src={allImages[currentIndex] || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default function ProductGrid({ products, onEdit, onDelete, onToggleAvailable }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-[#faf9f5] rounded-xl shadow-sm border border-[#b9aca2]/40 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Product Image */}
          <div className="w-full h-48 bg-[#b9aca2] flex items-center justify-center overflow-hidden relative">
            <CyclingImage images={product.images} defaultImage={product.thumbnail} alt={product.productName} />
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-[#222222] flex-1">
                {product.productName}
              </h3>
            </div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-sm text-[#5d6043]">{product.productCategory}</p>
              {product.productType === "package" && (
                <span className="text-xs font-semibold text-[#5d6043] bg-[#b9aca2] px-2 py-1 rounded-full">
                  Package01Icon
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-[#5d6043]">
                GHS {product?.price?.toFixed(2)}
              </span>
              {product.stockQuantity !== undefined && (
                <span className="text-sm text-[#5d6043]">
                  Stock: {product.stockQuantity}
                </span>
              )}
            </div>
            {product.sku && (
              <p className="text-xs text-[#5d6043] mb-3">SKU: {product.sku}</p>
            )}

            {/* Availability Toggle */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-[#5d6043]">Status:</span>
              <button
                type="button"
                onClick={() => onToggleAvailable?.(product)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  product.isAvailable !== false ? "bg-green-500" : "bg-[#b9aca2]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-[#faf9f5] transition-transform ${
                    product.isAvailable !== false ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${product.isAvailable !== false ? "text-green-600" : "text-red-600"}`}>
                {product.isAvailable !== false ? "Available" : "Unavailable"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(product)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#b9aca2] rounded-lg hover:bg-[#faf9f5] transition-colors"
              >
                <AdminIcon icon={PencilEdit02Icon} size={16} />
                Edit
              </button>
     
              <button
                onClick={() => onDelete?.(product)}
                className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <AdminIcon icon={Delete02Icon} size={16} />
              </button>
 
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
