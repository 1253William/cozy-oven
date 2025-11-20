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

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import ProductQuickView from "./ProductQuickView";
import type { Product } from "../context/CartContext";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


type Category = "Banana Breads" | "Flight Box" | "Gift Box";

export default function Categories() {
  const [activeCategory, setActiveCategory] = useState<Category>("Banana Breads");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const router = useRouter();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const categories: Category[] = ["Banana Breads", "Flight Box", "Gift Box"];

  const allCards = {
    "Banana Breads": [
      {
        id: "bread-1",
        name: "Chocolate Chip Cookies",
        title: "Chocolate Chip Cookies",
        description: "Classic chocolate chip cookies with melted chocolate chunks.",
        button: "View Products",
        price: "GHS 25",
        image:
          "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=465",
        bgImage:
          "/nutty.png",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
        sizes: ["Family", "Regular", "Medium"],
      },
      {
        id: "cookie-2",
        name: "Oatmeal Raisin Cookies",
        title: "Oatmeal Raisin Cookies",
        description: "Hearty oatmeal cookies with sweet raisins and a hint of cinnamon.",
        button: "Try Now",
        price: "GHS 22",
        image:
          "https://images.unsplash.com/photo-1590080873009-ed6f23496bb7?auto=format&fit=crop&q=80&w=464",
        bgImage:
          "/fruity.png",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
        sizes: ["Family", "Regular", "Medium"],
      },
      {
        id: "cookie-3",
        name: "Sugar Cookies",
        title: "Sugar Cookies",
        description: "Soft and buttery sugar cookies perfect for any occasion.",
        button: "Shop Now",
        price: "GHS 20",
        image:
          "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?auto=format&fit=crop&q=80&w=387",
        bgImage:
     "/white-chocolate.png",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
        sizes: ["Family", "Regular", "Medium"],
      },
      {
        id: "cookie-4",
        name: "Peanut Butter Cookies",
        title: "Peanut Butter Cookies",
        description: "Rich and nutty peanut butter cookies with a crumbly texture.",
        button: "Explore Now",
        price: "GHS 24",
        image:
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=464",
        bgImage:
          "/coconut.png",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
        sizes: ["Family", "Regular", "Medium"],
      },
    ],
    "Gift Box": [
      {
        id: "brownie-1",
        name: "Flight Box",
        title: "Flight Box",
        description: "Can't decide which flavor to try first? Our flight box gives you the best of all worlds!",
        button: "View Products",
        price: "GHS 28",
        image:
          "/gift.png",
        bgImage:
          "/flightbox.png",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
        sizes: ["Family", "Regular", "Medium"],
      },
      // {
      //   id: "brownie-2",
      //   name: "Walnut Brownies",
      //   title: "Walnut Brownies",
      //   description: "Rich brownies studded with crunchy walnuts.",
      //   button: "Try Now",
      //   price: "GHS 30",
      //   image:
      //     "https://images.unsplash.com/photo-1607920591413-4ec007e70023?auto=format&fit=crop&q=80&w=387",
      //   bgImage:
      //     "https://images.unsplash.com/photo-1607920591413-4ec007e70023?auto=format&fit=crop&q=80&w=387",
      //   buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      //   sizes: ["Family", "Regular", "Medium"],
      // },
      // {
      //   id: "brownie-3",
      //   name: "Caramel Brownies",
      //   title: "Caramel Brownies",
      //   description: "Decadent brownies swirled with gooey caramel.",
      //   button: "Shop Now",
      //   price: "GHS 32",
      //   image:
      //     "https://images.unsplash.com/photo-1564355808853-07d7c6e5b433?auto=format&fit=crop&q=80&w=387",
      //   bgImage:
      //     "https://images.unsplash.com/photo-1564355808853-07d7c6e5b433?auto=format&fit=crop&q=80&w=387",
      //   buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      //   sizes: ["Family", "Regular", "Medium"],
      // },
      // {
      //   id: "brownie-4",
      //   name: "Mint Chocolate Brownies",
      //   title: "Mint Chocolate Brownies",
      //   description: "Chocolate brownies with a refreshing mint layer.",
      //   button: "Explore Now",
      //   price: "GHS 31",
      //   image:
      //     "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=480",
      //   bgImage:
      //     "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=480",
      //   buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      //   sizes: ["Family", "Regular", "Medium"],
      // },
      // {
      //   id: "brownie-5",
      //   name: "Mint Chocolate Brownies",
      //   title: "Mint Chocolate Brownies",
      //   description: "Chocolate brownies with a refreshing mint layer.",
      //   button: "Explore Now",
      //   price: "GHS 31",
      //   image:
      //     "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=480",
      //   bgImage:
      //     "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=480",
      //   buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      //   sizes: ["Family", "Regular", "Medium"],
      // },
    ],
    "Flight Box": [
      {
        id: "box-1",
        name: "Flight Box",
        title: "Flight Box",
        description: "Can't decide which flavor to try first? Our flight box gives you the best of all worlds!",
        button: "View Products",
        price: "GHS 45",
        image:
          "/flightbox.png",
        bgImage:
          "/flightbox.png",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
        sizes: ["Family", "Regular", "Medium"],
      },
      // {
      //   id: "cake-2",
      //   name: "Chocolate Cake",
      //   title: "Chocolate Cake",
      //   description: "Moist chocolate cake with rich chocolate ganache.",
      //   button: "Try Now",
      //   price: "GHS 48",
      //   image:
      //     "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&q=80&w=387",
      //   bgImage:
      //     "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&q=80&w=387",
      //   buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      //   sizes: ["Family", "Regular", "Medium"],
      // },
      // {
      //   id: "cake-3",
      //   name: "Red Velvet Cake",
      //   title: "Red Velvet Cake",
      //   description: "Classic red velvet cake with cream cheese frosting.",
      //   button: "Shop Now",
      //   price: "GHS 50",
      //   image:
      //     "https://images.unsplash.com/photo-1616690710400-a16d146927c5?auto=format&fit=crop&q=80&w=387",
      //   bgImage:
      //     "https://images.unsplash.com/photo-1616690710400-a16d146927c5?auto=format&fit=crop&q=80&w=387",
      //   buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      //   sizes: ["Family", "Regular", "Medium"],
      // },
      // {
      //   id: "cake-4",
      //   name: "Carrot Cake",
      //   title: "Carrot Cake",
      //   description: "Spiced carrot cake with walnuts and cream cheese frosting.",
      //   button: "Explore Now",
      //   price: "GHS 47",
      //   image:
      //     "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=436",
      //   bgImage:
      //     "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=436",
      //   buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      //   sizes: ["Family", "Regular", "Medium"],
      // },
    ],
  };

  const currentCards = allCards[activeCategory];

  const handleQuickView = (card: {
    id: string;
    name: string;
    title: string;
    description: string;
    button: string;
    price: string;
    image: string;
    bgImage: string;
    buttonColor: string;
    sizes: string[];
  }) => {
    const productData: Product = {
      id: card.id,
      name: card.name,
      price: card.price,
      image: card.image,
      description: card.description,
      sizes: card.sizes,
    };
    setQuickViewProduct(productData);
    setIsQuickViewOpen(true);
  };

  const handleCardClick = (cardId: string) => {
    router.push(`/product/${cardId}`);
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
          className="w-full max-w-7xl px-4 py-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex md:gap-8 gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`md:text-3xl text-2xl font-bold transition-colors relative ${
                  activeCategory === category
                    ? "text-[#2A2C22]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {category}
                {activeCategory === category && (
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

          {/* Cards Grid */}
          <motion.div
            key={activeCategory}   // ← THE FIX
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {currentCards.map((card) => (
              <motion.div
                key={card.id}
                variants={cardVariants}
                className="relative overflow-hidden rounded-4xl text-white h-[500px] group cursor-pointer"
                onClick={() => handleCardClick(card.id)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110 z-0"
                  style={{ backgroundImage: `url(${card.bgImage})` }}
                />
                <div className="absolute inset-0 bg-black/30 z-10" />

                <div className="relative z-20 p-8 h-full flex flex-col">
                  <div className="mb-auto">
                    <h2 className="text-4xl font-bold mb-4">{card.title}</h2>
                    <p className="text-gray-300 text-lg font-extralight">{card.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Button that slides up */}
                    <div className="flex-1 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      <button 
                        className="font-medium py-3 px-7 rounded-full bg-black shadow-sm hover:cursor-pointer w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(card.id);
                        }}
                      >
                        {card.button}
                      </button>
                    </div>
                    {/* Search icon that slides in from right */}
                    <div className="opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      <button 
                        className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickView(card);
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
