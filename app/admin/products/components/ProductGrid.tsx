import { Edit2, Trash2, Package } from "lucide-react";
import { Product } from "../../../services/productService";

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export default function ProductGrid({ products, onEdit, onDelete }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Product Image */}
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
            {product.productThumbnail ? (
              <img
                src={product.productThumbnail}
                alt={product.productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-16 h-16 text-gray-400" />
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 flex-1">
                {product.productName}
              </h3>
              {product.stockQuantity !== undefined && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    product.stockQuantity > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{product.productCategory}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-[#2A2C22]">
                GHS {product.price.toFixed(2)}
              </span>
              {product.stockQuantity !== undefined && (
                <span className="text-sm text-gray-600">
                  Stock: {product.stockQuantity}
                </span>
              )}
            </div>
            {product.sku && (
              <p className="text-xs text-gray-500 mb-3">SKU: {product.sku}</p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(product)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(product)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
