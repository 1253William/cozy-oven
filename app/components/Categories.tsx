// "use client";
// import { motion } from 'framer-motion';

// const categories = [
//   { name: 'Banana Bread', img: 'https://plus.unsplash.com/premium_photo-1695932833115-646289d0885b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2058' },
//   { name: 'Chocolate Cake', img: 'https://plus.unsplash.com/premium_photo-1695932833115-646289d0885b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2058' },
//   { name: 'Croissants', img: 'https://plus.unsplash.com/premium_photo-1695932833115-646289d0885b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2058' },
//   { name: 'Muffins', img: 'https://plus.unsplash.com/premium_photo-1695932833115-646289d0885b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2058' },
// ];

// export default function Categories() {
//   return (
//     <section className="py-16 px-6">
//       <h2 className="text-3xl font-bold mb-6">Categories</h2>
//       <div className="flex gap-8 overflow-x-auto scrollbar-hide">
//         {categories.map(cat => (
//           <motion.div
//             key={cat.name}
//             className="relative h-[500px] w-[350px] rounded-xl overflow-hidden flex-shrink-0"
//           >
//             <img src={cat.img} alt={cat.name} className="absolute top-0 left-0 w-full h-full object-cover transform scale-100 transition-transform duration-500" />
//             <div className="absolute bottom-0 w-full bg-black/40 text-white p-2 text-center">{cat.name}</div>
//           </motion.div>
//         ))}
//       </div>
//     </section>
//   );
// }


"use client";

import { useState } from "react";

type Category = "Cookies" | "Brownies" | "Cakes";

export default function Categories() {
  const [activeCategory, setActiveCategory] = useState<Category>("Cookies");

  const categories: Category[] = ["Cookies", "Brownies", "Cakes"];

  const allCards = {
    Cookies: [
      {
        id: "cookie-1",
        title: "Chocolate Chip Cookies",
        description: "Classic chocolate chip cookies with melted chocolate chunks.",
        button: "View Products",
        bgImage:
          "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=465",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
      {
        id: "cookie-2",
        title: "Oatmeal Raisin Cookies",
        description: "Hearty oatmeal cookies with sweet raisins and a hint of cinnamon.",
        button: "Try Now",
        bgImage:
          "https://images.unsplash.com/photo-1590080873009-ed6f23496bb7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=464",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
      {
        id: "cookie-3",
        title: "Sugar Cookies",
        description: "Soft and buttery sugar cookies perfect for any occasion.",
        button: "Shop Now",
        bgImage:
          "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
      {
        id: "cookie-4",
        title: "Peanut Butter Cookies",
        description: "Rich and nutty peanut butter cookies with a crumbly texture.",
        button: "Explore Now",
        bgImage:
          "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=464",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
    ],
    Brownies: [
      {
        id: "brownie-1",
        title: "Fudgy Brownies",
        description: "Dense and fudgy chocolate brownies with a crackly top.",
        button: "View Products",
        bgImage:
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
      {
        id: "brownie-2",
        title: "Walnut Brownies",
        description: "Rich brownies studded with crunchy walnuts.",
        button: "Try Now",
        bgImage:
          "https://images.unsplash.com/photo-1607920591413-4ec007e70023?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
      {
        id: "brownie-3",
        title: "Caramel Brownies",
        description: "Decadent brownies swirled with gooey caramel.",
        button: "Shop Now",
        bgImage:
          "https://images.unsplash.com/photo-1564355808853-07d7c6e5b433?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
      {
        id: "brownie-4",
        title: "Mint Chocolate Brownies",
        description: "Chocolate brownies with a refreshing mint layer.",
        button: "Explore Now",
        bgImage:
          "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=480",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
    ],
    Cakes: [
      {
        id: "cake-1",
        title: "Vanilla Cake",
        description: "Light and fluffy vanilla cake with buttercream frosting.",
        button: "View Products",
        bgImage:
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=464",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
      {
        id: "cake-2",
        title: "Chocolate Cake",
        description: "Moist chocolate cake with rich chocolate ganache.",
        button: "Try Now",
        bgImage:
          "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
      {
        id: "cake-3",
        title: "Red Velvet Cake",
        description: "Classic red velvet cake with cream cheese frosting.",
        button: "Shop Now",
        bgImage:
          "https://images.unsplash.com/photo-1616690710400-a16d146927c5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
      {
        id: "cake-4",
        title: "Carrot Cake",
        description: "Spiced carrot cake with walnuts and cream cheese frosting.",
        button: "Explore Now",
        bgImage:
          "https://images.unsplash.com/photo-1621303837174-89787a7d4729?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=436",
        buttonColor: "bg-[#E9F9F1] hover:bg-[#d8f0e3] text-black",
      },
    ],
  };

  const currentCards = allCards[activeCategory];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-[Euclid-Circular-B]">
      <div className="w-full max-w-7xl px-4 py-8">
        {/* Category Tabs */}
        <div className="flex gap-6 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`text-2xl font-bold transition-colors relative ${
                activeCategory === category
                  ? "text-orange-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {category}
              {activeCategory === category && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-orange-600 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentCards.map((card) => (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-xl text-white h-[500px] group"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110 z-0"
                style={{ backgroundImage: `url(${card.bgImage})` }}
              ></div>
              <div className="absolute inset-0 bg-black/50 z-10"></div>

              <div className="relative z-20 p-8 h-full flex flex-col">
                <div className="mb-auto">
                  <h2 className="text-4xl font-bold mb-4">{card.title}</h2>
                  <p className="text-gray-300 text-lg">{card.description}</p>
                </div>
                <div className="mb-4">
                  <button
                    className={`${card.buttonColor} font-medium py-3 px-6 rounded-md`}
                  >
                    {card.button}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
