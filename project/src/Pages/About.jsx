// src/Pages/About.jsx
import React from "react";

export default function About() {
  return (
    <div className="bg-[#F5F0E1] text-[#5C362C]">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-r from-[#7B4B3A] to-[#D2B48C] pt-32 pb-24 text-center shadow-md">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#F5F0E1] mb-4">
            Welcome to <span className="text-[#FFF0D1]">LIORA JEWELS</span>
          </h1>
          <p className="text-lg text-[#F5F0E1] opacity-90">
            Discover the beauty of timeless jewelry, crafted with elegance and passion.
            At Liora, every piece tells a story of grace and individuality.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-[#FAF4E6] shadow-lg">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#7B4B3A] mb-4">Our Story</h2>
          <p className="text-lg leading-relaxed text-[#5C362C]">
            Liora Jewels began with a dream — to create jewelry that celebrates every
            woman's unique beauty. From delicate necklaces to statement earrings, our
            collection is inspired by modern elegance and classic charm. We believe
            that every piece should make you feel confident, radiant, and truly yourself.
          </p>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-[#F5F0E1]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#7B4B3A] mb-10">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FAF4E6] p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-[#7B4B3A]">Craftsmanship</h3>
              <p>
                Each piece is meticulously handcrafted by skilled artisans to ensure
                quality, precision, and a touch of artistry in every detail.
              </p>
            </div>
            <div className="bg-[#FAF4E6] p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-[#7B4B3A]">Elegance</h3>
              <p>
                We believe in understated beauty — designs that radiate confidence,
                sophistication, and timeless appeal.
              </p>
            </div>
            <div className="bg-[#FAF4E6] p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-[#7B4B3A]">Integrity</h3>
              <p>
                From design to delivery, we ensure ethical sourcing and honest
                craftsmanship — jewelry that shines inside and out.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}