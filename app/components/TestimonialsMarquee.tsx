"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

interface Testimonial {
  id: string;
  message: string;
}

interface TestimonialsMarqueeProps {
  testimonials: Testimonial[];
  speed?: number;
}

export default function TestimonialsMarquee({ 
  testimonials, 
  speed = 30 
}: TestimonialsMarqueeProps) {
  // Duplicate testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];
  
  // Calculate total width for animation
  const cardWidth = 288; // w-72 = 288px (matching BestSellers)
  const gap = 24; // Gap between cards
  const totalWidth = (cardWidth + gap) * testimonials.length;

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Section Header */}
      <div className="text-center mb-16 px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#222222] mb-4">
          What Our Customers Say
        </h2>
        <p className="text-lg text-[#5d6043] max-w-2xl mx-auto">
          Real reviews from real customers who love our banana bread
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Marquee Wrapper */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{
              x: [0, -totalWidth],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: speed,
                ease: "linear",
              },
            }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${index}`}
                className="relative flex-shrink-0 w-72 h-80 rounded-3xl overflow-hidden cursor-pointer group snap-start bg-white border border-gray-200 shadow-sm"
              >
                {/* Content */}
                <div className="absolute inset-0 flex flex-col p-6">
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 opacity-10">
                    <Quote className="w-12 h-12 text-[#bd6325]" />
                  </div>

                  {/* Message */}
                  <div className="flex-1 flex items-center">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-6 group-hover:line-clamp-none transition-all">
                      {testimonial.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
