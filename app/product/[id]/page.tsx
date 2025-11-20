"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, ArrowLeft, ShoppingCart } from "lucide-react";
import { motion, useInView } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import QuantitySelector from "../../components/QuantitySelector";
import SizeSelector from "../../components/SizeSelector";
import ProductTabs from "../../components/ProductTabs";
import { useCart } from "../../context/CartContext";

// Product data (in a real app, this would come from an API or database)
const products = [
  {
    id: "bread-1",
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
    id: "bread-2",
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
    id: "bread-3",
    name: "Walnut Banana Bread",
    price: "GHS 28",
    image: "https://images.unsplash.com/photo-1673961020718-ac4698e08aa8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
    rating: 4.6,
    reviews: 78,
    description: "Banana bread with crunchy walnuts for added texture.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Our walnut banana bread combines the moistness of banana bread with the crunch of fresh California walnuts, creating a perfect balance of texture and flavor."
  },
  // Cookie products
  {
    id: "cookie-1",
    name: "Chocolate Chip Cookies",
    price: "GHS 25",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=465",
    rating: 4.8,
    reviews: 156,
    description: "Classic chocolate chip cookies with melted chocolate chunks.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Our chocolate chip cookies are baked to perfection with premium chocolate chunks and a secret ingredient that makes them irresistibly soft and chewy."
  },
  {
    id: "cookie-2",
    name: "Oatmeal Raisin Cookies",
    price: "GHS 22",
    image: "https://images.unsplash.com/photo-1590080873009-ed6f23496bb7?auto=format&fit=crop&q=80&w=464",
    rating: 4.5,
    reviews: 98,
    description: "Hearty oatmeal cookies with sweet raisins and a hint of cinnamon.",
    sizes: ["Family", "Regular", "Medium"],
    details: "These wholesome oatmeal raisin cookies are packed with rolled oats, plump raisins, and warm spices for a classic taste."
  },
  {
    id: "cookie-3",
    name: "Sugar Cookies",
    price: "GHS 20",
    image: "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?auto=format&fit=crop&q=80&w=387",
    rating: 4.7,
    reviews: 134,
    description: "Soft and buttery sugar cookies perfect for any occasion.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Simple yet delicious, our sugar cookies are made with real butter and vanilla for a melt-in-your-mouth experience."
  },
  {
    id: "cookie-4",
    name: "Peanut Butter Cookies",
    price: "GHS 24",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=464",
    rating: 4.6,
    reviews: 112,
    description: "Rich and nutty peanut butter cookies with a crumbly texture.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Made with natural peanut butter and just the right amount of sweetness, these cookies are a peanut butter lover's dream."
  },
  // Brownie products
  {
    id: "brownie-1",
    name: "Fudgy Brownies",
    price: "GHS 28",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=387",
    rating: 4.9,
    reviews: 201,
    description: "Dense and fudgy chocolate brownies with a crackly top.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Our signature fudgy brownies are rich, decadent, and intensely chocolatey. Made with premium cocoa and dark chocolate for the ultimate brownie experience."
  },
  {
    id: "brownie-2",
    name: "Walnut Brownies",
    price: "GHS 30",
    image: "https://images.unsplash.com/photo-1607920591413-4ec007e70023?auto=format&fit=crop&q=80&w=387",
    rating: 4.7,
    reviews: 167,
    description: "Rich brownies studded with crunchy walnuts.",
    sizes: ["Family", "Regular", "Medium"],
    details: "These brownies combine fudgy chocolate goodness with the crunch of premium walnuts for a perfect texture contrast."
  },
  {
    id: "brownie-3",
    name: "Caramel Brownies",
    price: "GHS 32",
    image: "https://images.unsplash.com/photo-1564355808853-07d7c6e5b433?auto=format&fit=crop&q=80&w=387",
    rating: 4.8,
    reviews: 189,
    description: "Decadent brownies swirled with gooey caramel.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Indulge in layers of rich chocolate brownie swirled with house-made salted caramel for a truly decadent treat."
  },
  {
    id: "brownie-4",
    name: "Mint Chocolate Brownies",
    price: "GHS 31",
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=480",
    rating: 4.6,
    reviews: 145,
    description: "Chocolate brownies with a refreshing mint layer.",
    sizes: ["Family", "Regular", "Medium"],
    details: "A refreshing twist on classic brownies with a cool mint layer that perfectly complements the rich chocolate base."
  },
  {
    id: "brownie-5",
    name: "Mint Chocolate Brownies",
    price: "GHS 31",
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=480",
    rating: 4.6,
    reviews: 145,
    description: "Chocolate brownies with a refreshing mint layer.",
    sizes: ["Family", "Regular", "Medium"],
    details: "A refreshing twist on classic brownies with a cool mint layer that perfectly complements the rich chocolate base."
  },
  // Cake products
  {
    id: "box-1",
    name: "Vanilla Cake",
    price: "GHS 45",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=464",
    rating: 4.7,
    reviews: 178,
    description: "Light and fluffy vanilla cake with buttercream frosting.",
    sizes: ["Family", "Regular", "Medium"],
    details: "Our classic vanilla cake is light, moist, and perfectly sweet. Topped with smooth vanilla buttercream frosting."
  },
  // {
  //   id: "cake-2",
  //   name: "Chocolate Cake",
  //   price: "GHS 48",
  //   image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&q=80&w=387",
  //   rating: 4.9,
  //   reviews: 234,
  //   description: "Moist chocolate cake with rich chocolate ganache.",
  //   sizes: ["Family", "Regular", "Medium"],
  //   details: "Indulgent layers of moist chocolate cake covered in silky chocolate ganache. A chocolate lover's paradise."
  // },
  // {
  //   id: "cake-3",
  //   name: "Red Velvet Cake",
  //   price: "GHS 50",
  //   image: "https://images.unsplash.com/photo-1616690710400-a16d146927c5?auto=format&fit=crop&q=80&w=387",
  //   rating: 4.8,
  //   reviews: 198,
  //   description: "Classic red velvet cake with cream cheese frosting.",
  //   sizes: ["Family", "Regular", "Medium"],
  //   details: "Our red velvet cake features the perfect balance of cocoa and vanilla, topped with tangy cream cheese frosting."
  // },
  // {
  //   id: "cake-4",
  //   name: "Carrot Cake",
  //   price: "GHS 47",
  //   image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=436",
  //   rating: 4.7,
  //   reviews: 156,
  //   description: "Spiced carrot cake with walnuts and cream cheese frosting.",
  //   sizes: ["Family", "Regular", "Medium"],
  //   details: "Moist carrot cake loaded with fresh carrots, walnuts, and warm spices, all covered in luscious cream cheese frosting."
  // },
];

// export default function ProductDetails() {
//   const params = useParams();
//   const router = useRouter();
//   const { addToCart } = useCart();
//   const [quantity, setQuantity] = useState(1);
//   const [selectedSize, setSelectedSize] = useState("Regular");
  
//   const imageRef = useRef(null);
//   const detailsRef = useRef(null);
//   const tabsRef = useRef(null);
//   const isImageInView = useInView(imageRef, { once: true, amount: 0.3 });
//   const isDetailsInView = useInView(detailsRef, { once: true, amount: 0.3 });
//   const isTabsInView = useInView(tabsRef, { once: true, amount: 0.3 });

//   const productId = params.id as string;
//   const product = products.find((p) => p.id === productId);

//   if (!product) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold mb-4">Product not found</h1>
//           <button
//             onClick={() => router.push("/")}
//             className="text-orange-500 hover:text-orange-600"
//           >
//             Return to home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const renderStars = (rating: number) => {
//     return (
//       <div className="flex gap-1 items-center">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <Star
//             key={star}
//             className={`w-5 h-5 ${
//               star <= Math.floor(rating)
//                 ? "fill-yellow-400 text-yellow-400"
//                 : star - 0.5 <= rating
//                 ? "fill-yellow-400/50 text-yellow-400"
//                 : "text-gray-300"
//             }`}
//           />
//         ))}
//         <span className="ml-2 text-sm text-gray-600">
//           {rating} ({product.reviews} reviews)
//         </span>
//       </div>
//     );
//   };

//   const handleAddToCart = () => {
//     addToCart(product, quantity, selectedSize);
//     // Optional: Show a success message or navigate
//   };

//   return (
//     <>
//       <Navbar />
//       <main className="min-h-screen pt-20 pb-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {/* Back button */}
//           <motion.button
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.5 }}
//             onClick={() => router.back()}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             <span>Back</span>
//           </motion.button>

//           {/* Product details grid */}
//           <div className="grid md:grid-cols-2 gap-12">
//             {/* Left: Image */}
//             <motion.div
//               ref={imageRef}
//               initial={{ opacity: 0, x: -50 }}
//               animate={isImageInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
//               transition={{ duration: 0.6 }}
//               className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
//             >
//               <Image
//                 src={product.image}
//                 alt={product.name}
//                 fill
//                 className="object-cover"
//                 priority
//               />
//             </motion.div>

//             {/* Right: Product info */}
//             <motion.div 
//               ref={detailsRef}
//               initial={{ opacity: 0, x: 50 }}
//               animate={isDetailsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
//               transition={{ duration: 0.6 }}
//               className="flex flex-col"
//             >
//               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//                 {product.name}
//               </h1>

//               {/* Rating */}
//               <div className="mb-4">{renderStars(product.rating)}</div>

//               {/* Price */}
//               <p className="text-3xl font-bold text-orange-500 mb-6">
//                 {product.price}
//               </p>

//               {/* Description */}
//               <p className="text-gray-700 mb-6">{product.description}</p>

//               {/* Size selector */}
//               <div className="mb-6">
//                 <label className="block text-sm font-semibold text-gray-700 mb-3">
//                   Size
//                 </label>
//                 <SizeSelector
//                   sizes={product.sizes || []}
//                   selectedSize={selectedSize}
//                   onSizeChange={setSelectedSize}
//                 />
//               </div>

//               {/* Quantity selector */}
//               <div className="mb-6">
//                 <label className="block text-sm font-semibold text-gray-700 mb-3">
//                   Quantity
//                 </label>
//                 <QuantitySelector
//                   quantity={quantity}
//                   onQuantityChange={setQuantity}
//                 />
//               </div>

//               {/* Add to cart button */}
//               <button
//                 onClick={handleAddToCart}
//                 className="flex items-center justify-center gap-3 bg-[#2A2C22] hover:bg-[#2A2C22] text-white font-bold text-lg py-4 px-8 rounded-full transition-colors duration-200"
//               >
//                 <ShoppingCart className="w-6 h-6" />
//                 Add to Cart
//               </button>
//             </motion.div>
//           </div>

//           {/* Tabs section */}
//           <motion.div 
//             ref={tabsRef}
//             initial={{ opacity: 0, y: 50 }}
//             animate={isTabsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
//             transition={{ duration: 0.6 }}
//             className="mt-16"
//           >
//             <ProductTabs details={product.details || ""} />
//           </motion.div>
//         </div>
//       </main>
//       <Footer />
//     </>
//   );
// }

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Regular");

  const imageRef = useRef(null);
  const detailsRef = useRef(null);
  const tabsRef = useRef(null);
  const isImageInView = useInView(imageRef, { once: true, amount: 0.3 });
  const isDetailsInView = useInView(detailsRef, { once: true, amount: 0.3 });
  const isTabsInView = useInView(tabsRef, { once: true, amount: 0.3 });

  const productId = params.id as string;

  // SPECIAL LAYOUT FOR "box-1"
  if (productId === "box-1") {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </motion.button>

            {/* CUSTOM GRID FOR BOX-1 */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-2">Special Box Item A</h2>
                <p className="text-gray-600">Custom card layout for box-1.</p>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-2">Special Box Item B</h2>
                <p className="text-gray-600">Add whatever content you want.</p>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-2">Special Box Item C</h2>
                <p className="text-gray-600">This layout replaces product details.</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // NORMAL PRODUCT LOGIC
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <button
            onClick={() => router.push("/")}
            className="text-orange-500 hover:text-orange-600"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : star - 0.5 <= rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating} ({product.reviews} reviews)
        </span>
      </div>
    );
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </motion.button>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              ref={imageRef}
              initial={{ opacity: 0, x: -50 }}
              animate={isImageInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
            >
              <Image src={product.image} alt={product.name} fill className="object-cover" priority />
            </motion.div>

            <motion.div
              ref={detailsRef}
              initial={{ opacity: 0, x: 50 }}
              animate={isDetailsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="mb-4">{renderStars(product.rating)}</div>

              <p className="text-3xl font-bold text-orange-500 mb-6">{product.price}</p>

              <p className="text-gray-700 mb-6">{product.description}</p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Size</label>
                <SizeSelector sizes={product.sizes || []} selectedSize={selectedSize} onSizeChange={setSelectedSize} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />
              </div>

              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-3 bg-[#2A2C22] hover:bg-[#2A2C22] text-white font-bold text-lg py-4 px-8 rounded-full transition-colors duration-200"
              >
                <ShoppingCart className="w-6 h-6" /> Add to Cart
              </button>
            </motion.div>
          </div>

          <motion.div
            ref={tabsRef}
            initial={{ opacity: 0, y: 50 }}
            animate={isTabsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
            className="mt-16"
          >
            <ProductTabs details={product.details || ""} />
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

