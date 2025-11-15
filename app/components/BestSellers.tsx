// // apps/client/components/BestSelling.jsx
// const bestSelling = [
//   { name: 'Banana Bread', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872' },
//   { name: 'Chocolate Cake', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872' },
//   { name: 'Croissants', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872' },
//   { name: 'Muffins', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872' },
//   { name: 'Donuts', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872' },
//   { name: 'Baguette', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872' },
// ];

// export default function BestSelling() {
//   return (
//     <section className="py-16 px-6 scrollbar-hide">
//       <h2 className="text-3xl font-bold mb-6">Best Selling Breads</h2>
//       <div className="flex gap-4 overflow-x-auto">
//         {bestSelling.map(item => (
//           <div key={item.name} className="relative h-[300px] w-[300px] rounded-xl overflow-hidden flex-shrink-0 hover:scale-95 transition">
//             <img src={item.img} alt={item.name} className="object-cover w-full h-full" />
//             <div className="absolute bottom-0 w-full bg-black/40 text-white p-2 text-center">{item.name}</div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }


"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function BestSellers() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  const products = [
    {
      id: "1",
      name: "Classic Banana Bread",
      price: "GHS 25",
      image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      rating: 4.5,
      reviews: 120,
      description: "Moist and delicious banana bread made with ripe bananas and a hint of vanilla.",
      sizes: ["Family", "Regular", "Medium"],
      details: "Our classic banana bread is baked fresh daily using only the finest ingredients. Made with ripe bananas, premium flour, and a touch of cinnamon for that perfect flavor."
    },
    {
      id: "2",
      name: "Chocolate Chip Banana Bread",
      price: "GHS 30",
      image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      rating: 4.8,
      reviews: 95,
      description: "Rich banana bread studded with premium chocolate chips.",
      sizes: ["Family", "Regular", "Medium"],
      details: "Indulge in our chocolate chip banana bread, featuring generous amounts of Belgian chocolate chips mixed into our classic banana bread recipe."
    },
    {
      id: "3",
      name: "Walnut Banana Bread",
      price: "GHS 28",
      image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      rating: 4.6,
      reviews: 78,
      description: "Banana bread with crunchy walnuts for added texture.",
      sizes: ["Family", "Regular", "Medium"],
      details: "Our walnut banana bread combines the moistness of banana bread with the crunch of fresh California walnuts, creating a perfect balance of texture and flavor."
    },
    {
      id: "4",
      name: "Blueberry Muffins",
      price: "GHS 20",
      image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      rating: 4.7,
      reviews: 145,
      description: "Fluffy muffins bursting with fresh blueberries.",
      sizes: ["Family", "Regular", "Medium"],
      details: "Our blueberry muffins are made with fresh, plump blueberries and have a tender, moist crumb that melts in your mouth."
    },
    {
      id: "5",
      name: "Cinnamon Rolls",
      price: "GHS 35",
      image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      rating: 4.9,
      reviews: 203,
      description: "Warm, gooey cinnamon rolls with cream cheese frosting.",
      sizes: ["Family", "Regular", "Medium"],
      details: "Our signature cinnamon rolls are hand-rolled and baked to perfection, topped with our house-made cream cheese frosting."
    },
    {
      id: "6",
      name: "Sourdough Loaf",
      price: "GHS 22",
      image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
      rating: 4.8,
      reviews: 167,
      description: "Artisan sourdough bread with a crispy crust and chewy interior.",
      sizes: ["Family", "Regular", "Medium"],
      details: "Our sourdough is made with a natural starter that's been cultivated for years, resulting in a complex flavor and perfect texture."
    },
  ];

  const handleAddToCart = (e: React.MouseEvent, product: typeof products[0]) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <section className="py-16 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
          Best Sellers
        </h2>
        
 <div
  ref={scrollRef}
  className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
>
  {products.map((product, index) => (
    <Link
      key={index}
      href={`/product/${product.id}`}
      className="relative flex-shrink-0 w-[280px] h-[320px] rounded-2xl overflow-hidden cursor-pointer group snap-start bg-white transition-shadow duration-300"
    >
      {/* Image fills card */}
      <Image
             src={`${product.image}`}
             alt={product.name}
             fill
             className="object-cover"
             priority
           />

      {/* Blurred overlay with text and button */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-md flex flex-col justify-end p-5">
        <h3 className="text-white text-md font-bold mb-1">{product.name}</h3>
        <p className="text-white/90 text-md font-semibold mb-3">{product.price}</p>
        
        {/* Add to Cart Button - slides up on hover */}
        <button
          onClick={(e) => handleAddToCart(e, product)}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </Link>
  ))}
</div>

      </div>
    </section>
  );
}
