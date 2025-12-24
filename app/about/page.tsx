"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutPage() {
  const heroRef = useRef(null);
  const howItStartedRef = useRef(null);
  const whyCozyRef = useRef(null);
  const visionRef = useRef(null);
  const taglineRef = useRef(null);
  const bakerRef = useRef(null);

  const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const isHowItStartedInView = useInView(howItStartedRef, { once: true, amount: 0.2 });
  const isWhyCozyInView = useInView(whyCozyRef, { once: true, amount: 0.3 });
  const isVisionInView = useInView(visionRef, { once: true, amount: 0.2 });
  const isTaglineInView = useInView(taglineRef, { once: true, amount: 0.3 });
  const isBakerInView = useInView(bakerRef, { once: true, amount: 0.3 });

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section - "We're so glad you're here" */}
        <section 
          ref={heroRef}
          className="relative h-screen md:h-screen flex items-center justify-center px-4"
          style={{
            backgroundImage: "url('/cozy2.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 max-w-3xl mx-auto text-center shadow-2xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#2A2C22] mb-6"
            >
              We&apos;re so glad you&apos;re here.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-4"
            >
              Cozy Oven is built by a small but passionate team—warm, creative, and committed to giving you fresh, comforting baked goodness that truly makes your day better.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed"
            >
              Every loaf, every mini, every moment with Cozy Oven is crafted with one goal in mind: to bring comfort, joy, and quality you can taste.
            </motion.p>
          </motion.div>
        </section>

        {/* How It Started Section - Text right (75%), Image left (25%) */}
        <section ref={howItStartedRef} className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-stretch">
              {/* Image - Left side (25% on desktop) */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isHowItStartedInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/4 relative h-64 md:h-auto rounded-2xl overflow-hidden"
              >
                <Image
                  src="/cozy3.png"
                  alt="How it started"
                  fill
                  className="object-contain"
                />
              </motion.div>

              {/* Text - Right side (75% on desktop) */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isHowItStartedInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full md:w-3/4 flex flex-col justify-center"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2A2C22] mb-6">
                  How It Started
                </h2>
                <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                  <p>
                    Cozy Oven was born in a season that tested everything.
                  </p>
                  <p>
                    During a time of change and uncertainty, when life felt overwhelming and plans seemed to fall apart, I found myself leaning deeper into prayer and quieting my heart to hear God&apos;s direction.
                  </p>
                  <p>
                    In that stillness, the idea of Cozy Oven came to life—simple, comforting, nourishing banana bread that warms homes and hearts. It didn&apos;t feel forced; it felt like purpose. Like something I was being gently guided into.
                  </p>
                  <p>
                    What started as a small home baking project soon became a way to bring joy, convenience and comfort to families, students, parents, and dessert lovers across Ghana.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why "Cozy"? - Full-width Banner */}
        <section ref={whyCozyRef} className="py-16 md:py-20 bg-[#2A2C22] text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isWhyCozyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            >
              Why &ldquo;Cozy&rdquo;?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={isWhyCozyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl mb-8"
            >
              Because comfort is powerful.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isWhyCozyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-left md:text-center space-y-3 text-base sm:text-lg md:text-xl"
            >
              <p>Cozy Oven represents that feeling of:</p>
              <p>Warmth after a long day</p>
              <p>A sweet treat that lifts your mood</p>
              <p>Something familiar, trustworthy, and made with love</p>
              <p>A reminder that God knows how to use simple things to bless others</p>
              <p className="mt-6 pt-6 border-t border-white/20">
                Every loaf is a small piece of comfort—fresh, wholesome, and thoughtfully made.
              </p>
            </motion.div>
          </div>
        </section>

        {/* The Vision Section - Text left (75%), Image right (25%) */}
        <section ref={visionRef} className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row-reverse gap-8 items-stretch">
              {/* Image - Right side (25% on desktop) */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isVisionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8 }}
                className="w-full md:w-1/4 relative h-64 md:h-96 rounded-2xl overflow-hidden"
              >
                <Image
                  src="/cozy2.png"
                  alt="The vision"
                  height={400}
                  width={300}
                  className="object-cover h-96"
                />
              </motion.div>

              {/* Text - Left side (75% on desktop) */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isVisionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full md:w-3/4 flex flex-col justify-center"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2A2C22] mb-6">
                  The Vision
                </h2>
                <div className="space-y-4 text-gray-700 text-base sm:text-lg leading-relaxed">
                  <p className="font-semibold">Our mission is simple:</p>
                  <p>
                    To bring comfort, ease, and joy to your everyday moments through high-quality, delicious banana bread.
                  </p>
                  <p>
                    Whether you&apos;re hosting guests, treating your family, sending a gift, or grabbing a snack on the go, Cozy Oven is here to make life a little easier and a lot sweeter.
                  </p>
                  <div className="mt-6 space-y-2">
                    <p className="font-semibold">We believe in:</p>
                    <p>Excellence</p>
                    <p>Simplicity</p>
                    <p>Thoughtfulness</p>
                    <p>God-led creativity</p>
                    <p>Serving our customers with joy</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tagline Banner - "Purposefully Baked. Thoughtfully Shared." */}
        <section ref={taglineRef} className="py-16 md:py-20 bg-orange-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isTaglineInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#2A2C22] mb-8 italic"
            >
              Purposefully Baked. Thoughtfully Shared.
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isTaglineInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-4 text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed"
            >
              <p>
                Cozy Oven was designed to help you pause, enjoy, and savour the little things.
              </p>
              <p>
                There is a peace that comes from slowing down and letting God order your steps—and even in something as simple as baking, we see His goodness.
              </p>
              <p>
                Our hope is that every bite brings you comfort, perspective, and a moment to breathe.
              </p>
            </motion.div>
          </div>
        </section>

        {/* From the Baker - Unique Section */}
        <section ref={bakerRef} className="py-20 md:py-32 bg-gradient-to-b from-white to-orange-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isBakerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 1 }}
              className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#2A2C22]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-200/30 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={isBakerInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="relative z-10"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2A2C22] mb-8 text-center">
                  From the Baker
                </h2>
                
                <div className="space-y-6 text-gray-700 text-base sm:text-lg leading-relaxed">
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={isBakerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    Thank you for being here.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={isBakerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  >
                    Thank you for choosing Cozy Oven.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={isBakerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  >
                    And thank you for letting our little bakery become a part of your home and your story.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={isBakerInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                    className="pt-6 border-t border-gray-200"
                  >
                    May every loaf remind you of God&apos;s love, His provision, and His ability to use even the simplest ingredients to create something beautiful.
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isBakerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 1.3 }}
                  className="mt-10 pt-8 border-t border-gray-200 text-center"
                >
                  <p className="text-xl font-semibold text-[#2A2C22] mb-2">
                    With love & gratitude,
                  </p>
                  <p className="text-2xl font-bold text-[#2A2C22] mb-1">
                    Anita
                  </p>
                  <p className="text-gray-600 italic">
                    Creator of Cozy Oven
                  </p>
                </motion.div>

                {/* Heart decoration */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isBakerInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.5, delay: 1.5, type: "spring" }}
                  className="mt-6 flex justify-center"
                >
                  <div className="text-5xl">❤️</div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
