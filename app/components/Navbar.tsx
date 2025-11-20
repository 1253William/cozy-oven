"use client";

import { useState } from "react";
import { Menu, MapPin, X, ShoppingCart, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartDrawer from "./CartDrawer";
import AuthModal from "./AuthModal";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import logo from "@/public/cozy3.png"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Orders", href: "/account/orders" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const { getCartCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const cartCount = getCartCount();

  const handleCartClick = () => {
    if (cartCount > 0) {
      setCartDrawerOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    setMenuOpen(false);
  };

  const handleAuthClick = () => {
    setAuthModalOpen(true);
    setProfileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-4 md:px-8 py-6 backdrop-blur-lg bg-white/80 shadow-sm">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link href="/">
          <Image src={logo} width={100} height={100} alt="Logo" />
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

        {/* Right: Location + Cart + Profile + Menu */}
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

          {/* Profile icon with dropdown (Desktop) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100/80 transition"
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg border rounded-lg shadow-lg text-sm overflow-hidden z-50">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/account/orders"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account/details"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAuthClick}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700"
                  >
                    Sign In / Sign Up
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-full hover:bg-gray-100/80 transition"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Full-Screen Menu */}
      {/* {menuOpen && (
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
      )} */}
       (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          {/* Menu Panel */}
          <motion.div
            key="panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-8 pt-12 shadow-xl"
            onClick={(e) => e.stopPropagation()} // prevent closing on content click
          >
            {/* Links */}
            <div className="flex flex-col items-center w-full gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={link.href}
                    className="text-2xl font-semibold text-gray-900 hover:text-[#2A2C22] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Actions */}
              <div className="mt-6 flex flex-col w-full gap-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 bg-gray-100 rounded-xl">
                      <p className="font-semibold text-gray-900">{user?.fullName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: navLinks.length * 0.08 + 0.1 }}
                      onClick={() => {
                        router.push("/account/orders");
                        setMenuOpen(false);
                      }}
                      className="text-lg py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                    >
                      My Orders
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: navLinks.length * 0.08 + 0.15 }}
                      onClick={() => {
                        router.push("/account/details");
                        setMenuOpen(false);
                      }}
                      className="text-lg py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
                    >
                      Account Settings
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: navLinks.length * 0.08 + 0.2 }}
                      onClick={handleLogout}
                      className="text-lg py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: navLinks.length * 0.08 + 0.1 }}
                    onClick={handleAuthClick}
                    className="text-lg py-3 rounded-xl bg-[#2A2C22] text-white hover:bg-[#1a1c12] transition"
                  >
                    Sign In / Sign Up
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
      
      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}