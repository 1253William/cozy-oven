// "use client";

// import { useState } from "react";

// type Category = "Cookies" | "Brownies" | "Cakes";

// export default function Categories() {
//   const [activeCategory, setActiveCategory] = useState<Category>("Cookies");

//   const categories: Category[] = ["Cookies", "Brownies", "Cakes"];

//   const allCards = {
//     Cookies: [
//       {
//         id: "cookie-1",
//         title: "Chocolate Chip Cookies",
//         description: "Classic chocolate chip cookies with melted chocolate chunks.",
//         button: "View Products",
//         bgImage:
//           "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=465",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//       {
//         id: "cookie-2",
//         title: "Oatmeal Raisin Cookies",
//         description: "Hearty oatmeal cookies with sweet raisins and a hint of cinnamon.",
//         button: "Try Now",
//         bgImage:
//           "https://images.unsplash.com/photo-1590080873009-ed6f23496bb7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=464",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//       {
//         id: "cookie-3",
//         title: "Sugar Cookies",
//         description: "Soft and buttery sugar cookies perfect for any occasion.",
//         button: "Shop Now",
//         bgImage:
//           "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//       {
//         id: "cookie-4",
//         title: "Peanut Butter Cookies",
//         description: "Rich and nutty peanut butter cookies with a crumbly texture.",
//         button: "Explore Now",
//         bgImage:
//           "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=464",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//     ],
//     Brownies: [
//       {
//         id: "brownie-1",
//         title: "Fudgy Brownies",
//         description: "Dense and fudgy chocolate brownies with a crackly top.",
//         button: "View Products",
//         bgImage:
//           "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//       {
//         id: "brownie-2",
//         title: "Walnut Brownies",
//         description: "Rich brownies studded with crunchy walnuts.",
//         button: "Try Now",
//         bgImage:
//           "https://images.unsplash.com/photo-1607920591413-4ec007e70023?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//       {
//         id: "brownie-3",
//         title: "Caramel Brownies",
//         description: "Decadent brownies swirled with gooey caramel.",
//         button: "Shop Now",
//         bgImage:
//           "https://images.unsplash.com/photo-1564355808853-07d7c6e5b433?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//       {
//         id: "brownie-4",
//         title: "Mint Chocolate Brownies",
//         description: "Chocolate brownies with a refreshing mint layer.",
//         button: "Explore Now",
//         bgImage:
//           "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=480",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//     ],
//     Cakes: [
//       {
//         id: "cake-1",
//         title: "Vanilla Cake",
//         description: "Light and fluffy vanilla cake with buttercream frosting.",
//         button: "View Products",
//         bgImage:
//           "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=464",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//       {
//         id: "cake-2",
//         title: "Chocolate Cake",
//         description: "Moist chocolate cake with rich chocolate ganache.",
//         button: "Try Now",
//         bgImage:
//           "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//       {
//         id: "cake-3",
//         title: "Red Velvet Cake",
//         description: "Classic red velvet cake with cream cheese frosting.",
//         button: "Shop Now",
//         bgImage:
//           "https://images.unsplash.com/photo-1616690710400-a16d146927c5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//       {
//         id: "cake-4",
//         title: "Carrot Cake",
//         description: "Spiced carrot cake with walnuts and cream cheese frosting.",
//         button: "Explore Now",
//         bgImage:
//           "https://images.unsplash.com/photo-1621303837174-89787a7d4729?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=436",
//         buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
//       },
//     ],
//   };

//   const currentCards = allCards[activeCategory];

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen font-[Euclid-Circular-B]">
//       <div className="w-full max-w-7xl px-4 py-8">
//         {/* Category Tabs */}
//         <div className="flex gap-6 mb-8">
//           {categories.map((category) => (
//             <button
//               key={category}
//               onClick={() => setActiveCategory(category)}
//               className={`text-2xl font-bold transition-colors relative ${
//                 activeCategory === category
//                   ? "text-orange-600"
//                   : "text-gray-400 hover:text-gray-600"
//               }`}
//             >
//               {category}
//               {activeCategory === category && (
//                 <span className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-full"></span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {currentCards.map((card) => (
//             <div
//               key={card.id}
//               className="relative overflow-hidden rounded-xl text-white h-[500px] group"
//             >
//               <div
//                 className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110 z-0"
//                 style={{ backgroundImage: `url(${card.bgImage})` }}
//               ></div>
//               <div className="absolute inset-0 bg-black/50 z-10"></div>

//               <div className="relative z-20 p-8 h-full flex flex-col">
//                 <div className="mb-auto">
//                   <h2 className="text-4xl font-bold mb-4">{card.title}</h2>
//                   <p className="text-gray-300 text-lg">{card.description}</p>
//                 </div>
//                 <div className="mb-4">
//                   <button
//                     className={`${card.buttonColor} font-medium py-3 px-6 rounded-md`}
//                   >
//                     {card.button}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductQuickView from "./ProductQuickView";
import type { Product } from "../context/CartContext";
import useCustomerProducts from "../hooks/useCustomerProducts";
import 'react-loading-skeleton/dist/skeleton.css'


export default function Categories() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const router = useRouter();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  // Fetch products from backend
  const { products: allProducts, loading } = useCustomerProducts({ limit: 100 });

  // Get unique categories dynamically from products
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    allProducts.forEach(product => {
      if (product.productCategory) {
        categoriesSet.add(product.productCategory);
      }
    });
    return Array.from(categoriesSet).sort();
  }, [allProducts]);

  const [activeCategory, setActiveCategory] = useState<string>("");

  // Use first available category if active category is empty
  const effectiveActiveCategory = activeCategory || (availableCategories.length > 0 ? availableCategories[0] : "");

  // Filter products by category
  const getProductsByCategory = (category: string) => {
    return allProducts.filter(product => product.productCategory === category);
  };

  const currentProducts = effectiveActiveCategory ? getProductsByCategory(effectiveActiveCategory) : [];

  const handleQuickView = (product: typeof allProducts[0]) => {
    const productData: Product = {
      id: product._id,
      name: product.productName,
      price: `GHS ${product.price}`,
      image: product.productThumbnail,
      description: product.productDetails,
      sizes: product.selectOptions?.map(opt => opt.label) || [],
    };
    setQuickViewProduct(productData);
    setIsQuickViewOpen(true);
  };

  const handleCardClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <>
      <div ref={sectionRef} className="flex flex-col items-center justify-center min-h-screen font-[Euclid-Circular-B] mt-12">
        <motion.div 
          className="w-full max-w-7xl px-4 md:py-8 "
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          {/* Only show category tabs if there are categories with products */}
          {availableCategories.length > 0 && (
            <div className="flex md:gap-8 gap-4 mb-8 overflow-x-auto pb-2">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`md:text-3xl text-xl font-bold transition-colors relative whitespace-nowrap ${
                    effectiveActiveCategory === category
                      ? "text-[#2A2C22]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {category}
                  {effectiveActiveCategory === category && (
                  <motion.span
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#2A2C22] rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                )}

                </button> 
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#2A2C22] border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          )}

          {/* Cards Grid */}
          {!loading && (
            <motion.div
              key={activeCategory}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={cardVariants}
                  className="relative overflow-hidden rounded-4xl text-white h-[400px] sm:h-[450px] md:h-[500px] group"
                  onClick={() => handleCardClick(product._id)}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110 z-0"
                    style={{ backgroundImage: `url(${product.productThumbnail})` }}
                  />
                  <div className="absolute inset-0 bg-black/30 z-10" />

                  <div className="relative z-20 p-8 h-full flex flex-col">
                    <div className="mb-auto">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
                        {product.productName}
                      </h2>
                      <p className="text-gray-300 text-sm sm:text-base md:text-lg font-extralight line-clamp-3">
                        {product.productDetails}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Button that slides up */}
                      <div className="flex-1 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        <button 
                          className="font-medium py-3 px-7 rounded-full bg-black shadow-sm w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(product._id);
                          }}
                        >
                          View Product
                        </button>
                      </div>
                      {/* Search icon that slides in from right */}
                      <div className="opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                        <button 
                          className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickView(product);
                          }}
                          aria-label="Quick view"
                        >
                          <Search className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && currentProducts.length === 0 && availableCategories.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found in this category.</p>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Product Quick View Drawer */}
      <ProductQuickView 
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        product={quickViewProduct}
      />
    </>
  );
}
