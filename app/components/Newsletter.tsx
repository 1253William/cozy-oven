// export default function Newsletter() {
//   return (
//     <section className="py-16 px-6 text-center">
//       <h2 className="text-3xl font-bold mb-4">Want tips on how to make these tasty delicacies???</h2>
//       <p className="mb-6">Subscribe to our newsletter and never miss a recipe!</p>
//       <div className="flex justify-center gap-2">
//         <input type="email" placeholder="Enter your email" className="p-3 rounded-l-xl border-0 w-80" />
//         <button className="px-6 py-3 bg-yellow-500 rounded-r-xl hover:bg-yellow-400 transition">Subscribe</button>
//       </div>
//     </section>
//   );
// }


"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Email submitted:", email);
  };

  return (
    <section className="py-16 md:py-16 ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Want tips on how to make these tasty delicacies???
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Subscribe to our newsletter and get exclusive baking tips, recipes, and special offers delivered straight to your inbox!
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-6 py-4 rounded-full border-2 border-gray-300 focus:border-amber-500 focus:outline-none text-gray-900"
            required
          />
          <button
            type="submit"
            className="bg-[#2A2C22] text-white px-8 py-4 rounded-full font-semibold hover:bg-[2A2C22] transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}