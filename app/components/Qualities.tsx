"use client";

import { Truck, ShieldCheck, CreditCard } from "lucide-react";

export default function Qualities() {
  const qualities = [
    { icon: Truck, title: "Quick Delivery" },
    { icon: ShieldCheck, title: "Satisfaction Guarantee" },
    { icon: CreditCard, title: "Secure Payments" },
  ];

  return (
    <section className="md:py-24 py-16">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {qualities.map((quality, index) => {
            const Icon = quality.icon;
            return (
              <div
                key={index}
                className="bg-[#2A2C22]/20 rounded-full py-2 shadow-sm transition-all duration-300 transform "
              >
                <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4">
                  <div className="bg-white p-2 sm:p-3 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#2A2C22]" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-black mb-0">
                    {quality.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
