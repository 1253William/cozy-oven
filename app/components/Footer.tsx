"use client";

import { ArrowRight, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="relative bg-cover bg-center bg-no-repeat text-gray-900"
      style={{ backgroundImage: "url('/cozy4.png')" }} 
    >
      {/* Overlay to keep text readable */}
      <div className="absolute inset-0 bg-[#2A2C22]/20" />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Newsletter Section */}
          <div className="md:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold mb-3">
              Want tips on how to make these tasty delicacies???
            </h2>

            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 bg-gray-100 px-4 py-3 text-sm focus:outline-none rounded-l-full"
              />
              <button className="bg-[#2A2C22]/80 px-4 py-3 transition-colors rounded-r-full hover:cursor-pointer">
                <ArrowRight className="w-5 h-5 text-white hover:translate-x-2 transition-transform duration-200" />
              </button>
            </div>

            <p className="text-xs text-gray-700 mt-4">
              By subscribing you agree to the{" "}
              <a href="#" className="underline hover:no-underline">
                Terms of Use
              </a>{" "}
              &{" "}
              <a href="#" className="underline hover:no-underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">About</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/about"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Our Story
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@cozyovens.com"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  info@cozyoven.store
                </a>
              </li>
              <li>
                <a
                  href="/locations"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Location: Tema community 22 Nhmf Estates
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-4">
              <a className="text-gray-700 hover:text-gray-900 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a className="text-gray-700 hover:text-gray-900 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a className="text-gray-700 hover:text-gray-900 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
