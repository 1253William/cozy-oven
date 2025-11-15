// // apps/client/components/Navbar.jsx
// "use client";

// import { useState } from 'react';
// import { Coffee, Menu, X, MapPin } from 'lucide-react';


// const navLinks = [
//   { name: 'Home', icon: <Coffee /> },
//   { name: 'Shop', icon: <Menu /> },
//   { name: 'Orders', icon: <X /> },
//   { name: 'Contact', icon: <MapPin /> },
// ];

// export default function Navbar() {
//   const [menuOpen, setMenuOpen] = useState(false);

//   return (
//     <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-white/30 backdrop-blur-md shadow-md flex justify-between items-center">
//       <div className="text-2xl font-bold">Cozy Oven</div>
      
//       {/* Desktop */}
//       <ul className="hidden md:flex gap-4">
//         {navLinks.map(link => (
//           <li key={link.name} className="flex items-center gap-1 px-4 py-2 rounded-full hover:bg-white/40 transition">
//             {link.icon} {link.name}
//           </li>
//         ))}
//       </ul>

//       {/* Mobile Hamburger */}
//       <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
//         <span className="block w-6 h-0.5 bg-black mb-1"></span>
//         <span className="block w-6 h-0.5 bg-black mb-1"></span>
//         <span className="block w-6 h-0.5 bg-black"></span>
//       </button>

//       {menuOpen && (
//         <ul className="absolute top-full right-0 mt-2 bg-white/30 backdrop-blur-md rounded-xl shadow-lg py-2 w-40 flex flex-col">
//           {navLinks.map(link => (
//             <li key={link.name} className="flex items-center gap-2 px-4 py-2 hover:bg-white/40 rounded-lg">
//               {link.icon} {link.name}
//             </li>
//           ))}
//         </ul>
//       )}
//     </nav>
//   );
// }


"use client";

import { useState } from "react";
import { Menu, MapPin, X, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Orders", href: "/orders" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const handleCartClick = () => {
    if (cartCount > 0) {
      setCartDrawerOpen(true);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-4 md:px-8 py-6 backdrop-blur-lg bg-white/80 shadow-sm">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <span className="text-base md:text-lg font-semibold text-gray-800">Cozy Ovens</span>
          </Link>
        </div>

        {/* Middle: Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-gray-700 hover:text-gray-900 transition-colors group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#2A2C22] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Right: Location + Cart + Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Location pill */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-100/80 backdrop-blur-sm text-gray-700 rounded-full px-3 md:px-4 py-1 text-xs md:text-sm hover:bg-gray-200/80 transition">
            <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
            <span className="hidden md:inline">Accra, Ghana</span>
            <span className="md:hidden">Accra</span>
          </div>

          {/* Cart icon with counter */}
          <button
            onClick={handleCartClick}
            className="relative p-2 rounded-full hover:bg-gray-100/80 transition"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#2A2C22] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-full hover:bg-gray-100/80 transition"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Menu dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-gray-100/80 transition"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-lg border rounded-lg shadow-lg text-sm overflow-hidden z-50">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50">View Cart</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50">Place Order</button>
                <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-white flex flex-col items-center justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-2xl font-semibold text-gray-800 py-4 hover:text-[#2A2C22]-500 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-8 flex flex-col gap-4">
            <button className="text-lg px-6 py-2 hover:bg-gray-50 rounded">View Cart</button>
            <button className="text-lg px-6 py-2 hover:bg-gray-50 rounded">Place Order</button>
            <button className="text-lg px-6 py-2 text-red-600 hover:bg-gray-50 rounded">Sign Out</button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  );
}