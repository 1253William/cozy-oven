"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingCart, User, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartDrawer from "./CartDrawer";
import AuthModal from "./AuthModal";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import logo from "@/public/cozy3.png";
import { customerProductService } from "../services/customerProductService";
import { Product } from "../services/productService";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Orders", href: "/account/orders" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const { getCartCount } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  // Only enable dynamic values on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search with abort controller to prevent race conditions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const abortController = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await customerProductService.searchProducts(searchQuery);
        if (response.success && !abortController.signal.aborted) {
          setSearchResults(response.data);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [searchQuery]);

  const cartCount = isMounted ? getCartCount() : 0;

  const handleCartClick = () => {
    if (cartCount > 0) setCartDrawerOpen(true);
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

  const handleSearchResultClick = (productId: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/product/${productId}`);
  };

  return (
    <>
      <nav className="fixed top-[2.5rem] left-0 right-0 z-40 w-full flex items-center justify-between px-4 md:px-8 py-6 backdrop-blur-lg bg-white/80 shadow-sm">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image 
              src={logo} 
              width={80} 
              height={80} 
              alt="Logo" 
            />
          </Link>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-gray-700 hover:text-gray-900 transition-colors group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#bd6325] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Right side: Search + Cart + Profile + Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-gray-100/80 transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-[calc(100vw-8rem)] sm:w-96 md:w-80 bg-white/95 backdrop-blur-lg border-gray-200 border rounded-lg shadow-lg overflow-hidden z-50"
              >
                <div className="p-3 border-b border-gray-200">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent text-sm"
                    autoFocus
                  />
                </div>

                {searchLoading && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Searching...
                  </div>
                )}

                {!searchLoading && searchQuery && searchResults?.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No products found
                  </div>
                )}

                {!searchLoading && searchResults?.length > 0 && (
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product._id}
                        onClick={() => handleSearchResultClick(product._id)}
                        className="w-full p-3 hover:bg-gray-50 text-left flex items-center gap-3 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
                          {product.productThumbnail && (
                            <Image
                              src={product.productThumbnail}
                              alt={product.productName}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.productName}
                          </h4>
                          <p className="text-xs text-gray-500">
                            GHS {product.price.toFixed(2)} • {product.productCategory}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Cart */}
          {isMounted && (
            <button
              onClick={handleCartClick}
              className="relative p-2 rounded-full hover:bg-gray-100/80 transition"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#bd6325] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Profile dropdown */}
          {isMounted && (
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
                      <Link href="/account/orders" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-50 text-gray-700">My Orders</Link>
                      <Link href="/account/details" onClick={() => setProfileMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-50 text-gray-700">Account Settings</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button onClick={handleAuthClick} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Sign In / Sign Up</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mobile menu toggle */}
          <button onClick={toggleMenu} className="md:hidden p-2 rounded-full hover:bg-gray-100/80 transition" aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMounted && menuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              key="panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-8 pt-12 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center w-full gap-6">
                {navLinks.map((link, i) => (
                  <motion.div key={link.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ delay: i * 0.08 }}>
                    <Link href={link.href} className="text-2xl font-semibold text-gray-900 hover:text-[#bd6325] transition-colors" onClick={() => setMenuOpen(false)}>
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="mt-6 flex flex-col w-full gap-4">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 bg-gray-100 rounded-xl">
                        <p className="font-semibold text-gray-900">{user?.fullName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <motion.button onClick={() => { router.push("/account/orders"); setMenuOpen(false); }} className="text-lg py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition">My Orders</motion.button>
                      <motion.button onClick={() => { router.push("/account/details"); setMenuOpen(false); }} className="text-lg py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition">Account Settings</motion.button>
                      <motion.button onClick={handleLogout} className="text-lg py-3 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition flex items-center justify-center gap-2">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </motion.button>
                    </>
                  ) : (
                    <motion.button onClick={handleAuthClick} className="text-lg py-3 rounded-xl bg-[#bd6325] text-white hover:bg-[#a8551f] transition">Sign In / Sign Up</motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer & Auth Modal */}
      {isMounted && (
        <>
          <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
          <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
        </>
      )}
    </>
  );
}
