// export default function Footer() {
//   return (
//     <footer className="relative bg-black text-white py-16 px-6">
//       <img src="/breads-bg.jpg" className="absolute inset-0 w-full h-full object-cover opacity-30" />
//       <div className="relative z-10 grid md:grid-cols-3 gap-6">
//         <div>
//           <h3 className="font-bold text-xl mb-2">About Us</h3>
//           <p>We bake the best breads in Ghana, fresh every day.</p>
//         </div>
//         <div>
//           <h3 className="font-bold text-xl mb-2">Links</h3>
//           <ul>
//             <li>Home</li>
//             <li>Shop</li>
//             <li>Orders</li>
//             <li>Contact</li>
//           </ul>
//         </div>
//         <div>
//           <h3 className="font-bold text-xl mb-2">Payments</h3>
//           <p>We accept Visa, Mastercard, and Mobile Money</p>
//         </div>
//       </div>
//     </footer>
//   );
// }





// "use client";

// import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from "lucide-react";

// export default function Footer() {
//   const paymentMethods = [
//     { name: "Visa", icon: "💳" },
//     { name: "Mastercard", icon: "💳" },
//     { name: "Mobile Money", icon: "📱" },
//   ];

//   const links = {
//     shop: [
//       { name: "All Products", href: "/shop" },
//       { name: "Best Sellers", href: "/shop/best-sellers" },
//       { name: "New Arrivals", href: "/shop/new" },
//     ],
//     company: [
//       { name: "About Us", href: "/about" },
//       { name: "Contact", href: "/contact" },
//       { name: "Careers", href: "/careers" },
//     ],
//     support: [
//       { name: "FAQ", href: "/faq" },
//       { name: "Shipping Info", href: "/shipping" },
//       { name: "Returns", href: "/returns" },
//     ],
//   };

//   return (
//     <footer className="relative bg-gray-900 text-white overflow-hidden">
//       {/* Background gradient with overlay */}
//       <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-gray-900 to-gray-900"></div>

//       {/* Content */}
//       <div className="relative z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
//             {/* About Section */}
//             <div>
//               <h3 className="text-xl font-bold mb-4">About Cozy Ovens</h3>
//               <p className="text-gray-300 leading-relaxed mb-4">
//                 We&apos;re passionate about bringing you the finest freshly baked goods in Ghana. 
//                 From our signature banana bread to artisan pastries, every item is made with love and the finest ingredients.
//               </p>
//               <div className="flex gap-4">
//                 <a href="#" className="text-gray-300 hover:text-white transition-colors">
//                   <Facebook className="w-5 h-5" />
//                 </a>
//                 <a href="#" className="text-gray-300 hover:text-white transition-colors">
//                   <Instagram className="w-5 h-5" />
//                 </a>
//                 <a href="#" className="text-gray-300 hover:text-white transition-colors">
//                   <Twitter className="w-5 h-5" />
//                 </a>
//               </div>
//             </div>

//             {/* Quick Links - Shop */}
//             <div>
//               <h3 className="text-xl font-bold mb-4">Shop</h3>
//               <ul className="space-y-2">
//                 {links.shop.map((link) => (
//                   <li key={link.name}>
//                     <a href={link.href} className="text-gray-300 hover:text-white transition-colors">
//                       {link.name}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Quick Links - Company */}
//             <div>
//               <h3 className="text-xl font-bold mb-4">Company</h3>
//               <ul className="space-y-2">
//                 {links.company.map((link) => (
//                   <li key={link.name}>
//                     <a href={link.href} className="text-gray-300 hover:text-white transition-colors">
//                       {link.name}
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Contact Info */}
//             <div>
//               <h3 className="text-xl font-bold mb-4">Contact Us</h3>
//               <ul className="space-y-3">
//                 <li className="flex items-start gap-2">
//                   <MapPin className="w-5 h-5 flex-shrink-0 mt-1" />
//                   <span className="text-gray-300">Accra, Ghana</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <Phone className="w-5 h-5 flex-shrink-0 mt-1" />
//                   <span className="text-gray-300">+233 XX XXX XXXX</span>
//                 </li>
//                 <li className="flex items-start gap-2">
//                   <Mail className="w-5 h-5 flex-shrink-0 mt-1" />
//                   <span className="text-gray-300">hello@cozyovens.com</span>
//                 </li>
//               </ul>
//             </div>
//           </div>

//           {/* Payment Methods & Copyright */}
//           <div className="border-t border-gray-700 pt-8">
//             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//               <div>
//                 <p className="text-gray-400 text-sm mb-2 md:mb-0">
//                   © 2024 Cozy Ovens. All rights reserved.
//                 </p>
//               </div>
//               <div className="flex items-center gap-4">
//                 <span className="text-gray-400 text-sm">We Accept:</span>
//                 <div className="flex gap-3">
//                   {paymentMethods.map((method) => (
//                     <div
//                       key={method.name}
//                       className="bg-white/10 px-3 py-2 rounded text-2xl"
//                       title={method.name}
//                     >
//                       {method.icon}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }


"use client";

import { ArrowRight, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-900">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          
          {/* Newsletter Section */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-3">Want tips on how to make these tasty delicacies???</h2>
            {/* <p className="text-gray-600 mb-4">Be the first to know about new collections and exclusive offers.</p> */}
            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 bg-gray-100 px-4 py-3 text-sm focus:outline-none rounded-l-full"
              />
              <button className="bg-[#2A2C22]/80 px-4 py-3  transition-colors rounded-r-full hover:cursor-pointer">
                <ArrowRight className="w-5 h-5 text-white hover:transform hover:translate-x-2 transition-transform duration-200" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              By subscribing you agree to the <a href="#" className="underline hover:no-underline">Terms of Use</a> & <a href="#" className="underline hover:no-underline">Privacy Policy</a>.
            </p>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">About</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a></li>
              <li><a href="/faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a></li>
              <li><a href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">Our Story</a></li>
              <li><a href="/shipping" className="text-gray-600 hover:text-gray-900 transition-colors">Shipping Policy</a></li>
              <li><a href="/returns" className="text-gray-600 hover:text-gray-900 transition-colors">Refund Policy</a></li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Customer Service</h3>
            <ul className="space-y-3">
              <li><a href="mailto:hello@cozyovens.com" className="text-gray-600 hover:text-gray-900 transition-colors">hello@cozyovens.com</a></li>
              <li><p className="text-gray-600">8:00am - 3:00pm, Mon to Fri</p></li>
              <li><a href="/locations" className="text-gray-600 hover:text-gray-900 transition-colors">Store Locations</a></li>
            </ul>
          </div>

          {/* Info Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Info</h3>
            <ul className="space-y-3">
              <li><a href="/careers" className="text-gray-600 hover:text-gray-900 transition-colors">Jobs</a></li>
              <li><a href="/community" className="text-gray-600 hover:text-gray-900 transition-colors">Community</a></li>
              <li><a href="/sustainability" className="text-gray-600 hover:text-gray-900 transition-colors">Sustainability</a></li>
              <li><a href="/press" className="text-gray-600 hover:text-gray-900 transition-colors">Press</a></li>
              <li><a href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Left: Currency & Copyright */}
            <div className="flex flex-col gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <span className="text-lg">🇬🇭</span>
                <span className="text-sm">Ghana (GHS ₵)</span>
              </button>
             
            </div>

            {/* Right: Social & Payment Methods */}
            <div className="flex flex-col gap-6 md:items-end">
              <div className="flex gap-4">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 text-xs font-medium rounded">Apple Pay</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 text-xs font-medium rounded">Google Pay</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 text-xs font-medium rounded">Mastercard</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 text-xs font-medium rounded">Shop Pay</span>
                <span className="px-2 py-1 bg-gray-50 border border-gray-200 text-xs font-medium rounded">Visa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
