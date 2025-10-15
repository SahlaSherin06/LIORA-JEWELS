// src/Pages/Contact.jsx
import React, { useState, useEffect } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaInstagram, FaFacebook, FaTwitter, FaPaperPlane } from "react-icons/fa";
import { toast } from 'react-toastify';

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('contactFormData');
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('contactFormData', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save contact message to localStorage
      const contactMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      const newMessage = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...formData,
        status: 'pending'
      };
      
      contactMessages.unshift(newMessage);
      localStorage.setItem('contactMessages', JSON.stringify(contactMessages));

      // Also save to API if available
      try {
        const response = await fetch("http://localhost:5000/contactMessages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newMessage),
        });

        if (!response.ok) throw new Error("Failed to save to API");
      } catch (apiError) {
        console.warn("API save failed, but message saved locally:", apiError);
      }

      // Show success message
      toast.success("Thank you for your message! We'll get back to you soon.", {
        position: "top-right",
        autoClose: 5000,
      });

      // Clear form data from localStorage and state
      localStorage.removeItem('contactFormData');
      setFormData({ name: "", email: "", subject: "", message: "" });

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("There was an error sending your message. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    localStorage.removeItem('contactFormData');
    setFormData({ name: "", email: "", subject: "", message: "" });
    toast.info("Form cleared!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F2] to-[#F8F1E4] pt-32 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="w-20 h-1 bg-gradient-to-r from-[#8B5E3C] to-[#C19A6B] rounded-full mx-auto"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#8B5E3C] mb-4">
            Get In Touch
          </h1>
          <p className="text-lg text-[#6D4C41] max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#8B5E3C] mb-6 relative inline-block">
                Contact Information
                <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-gradient-to-r from-[#8B5E3C] to-transparent rounded-full"></div>
              </h2>
              <p className="text-[#6D4C41] text-lg leading-relaxed">
                Have questions about our jewelry collection? Need assistance with your order? 
                We're here to help you find the perfect piece that speaks to your style.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 bg-white/70 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-x-2 border border-white">
                <div className="bg-gradient-to-br from-[#8B5E3C] to-[#C19A6B] p-3 rounded-full shadow-lg">
                  <FaPhone className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#8B5E3C] text-lg">Phone</h3>
                  <p className="text-[#6D4C41] font-medium">+1 (555) 123-4567</p>
                  <p className="text-sm text-[#6D4C41] opacity-80">Mon-Fri from 9am to 6pm</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white/70 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-x-2 border border-white">
                <div className="bg-gradient-to-br from-[#8B5E3C] to-[#C19A6B] p-3 rounded-full shadow-lg">
                  <FaEnvelope className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#8B5E3C] text-lg">Email</h3>
                  <p className="text-[#6D4C41] font-medium">info@liorajewels.com</p>
                  <p className="text-sm text-[#6D4C41] opacity-80">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white/70 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-x-2 border border-white">
                <div className="bg-gradient-to-br from-[#8B5E3C] to-[#C19A6B] p-3 rounded-full shadow-lg">
                  <FaMapMarkerAlt className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#8B5E3C] text-lg">Store Location</h3>
                  <p className="text-[#6D4C41] font-medium">123 Jewelry Street</p>
                  <p className="text-[#6D4C41] font-medium">Fashion District, NY 10001</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white/70 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-x-2 border border-white">
                <div className="bg-gradient-to-br from-[#8B5E3C] to-[#C19A6B] p-3 rounded-full shadow-lg">
                  <FaClock className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#8B5E3C] text-lg">Business Hours</h3>
                  <p className="text-[#6D4C41] font-medium">Monday - Friday: 9:00 AM - 7:00 PM</p>
                  <p className="text-[#6D4C41] font-medium">Saturday: 10:00 AM - 6:00 PM</p>
                  <p className="text-[#6D4C41] font-medium">Sunday: 11:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="pt-6">
              <h3 className="font-semibold text-[#8B5E3C] text-lg mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-[#8B5E3C] to-[#C19A6B] p-3 rounded-full text-white hover:shadow-lg transform hover:scale-110 transition-all duration-300 shadow-md">
                  <FaInstagram size={20} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-[#8B5E3C] to-[#C19A6B] p-3 rounded-full text-white hover:shadow-lg transform hover:scale-110 transition-all duration-300 shadow-md">
                  <FaFacebook size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-[#8B5E3C] to-[#C19A6B] p-3 rounded-full text-white hover:shadow-lg transform hover:scale-110 transition-all duration-300 shadow-md">
                  <FaTwitter size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#F0E6D8] relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#8B5E3C]/10 to-[#C19A6B]/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-[#8B5E3C]/5 to-[#C19A6B]/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-3xl font-bold text-[#8B5E3C]">Send us a Message</h2>
                {Object.values(formData).some(value => value) && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="text-sm text-[#8B5E3C] hover:text-[#6D4C41] transition-colors duration-200"
                  >
                    Clear Form
                  </button>
                )}
              </div>
              <p className="text-[#6D4C41] mb-6">Fill out the form below and we'll get back to you soon.</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#8B5E3C] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-[#E0CFC1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-transparent bg-white text-[#6D4C41] placeholder-[#A1887F] transition-all duration-300"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#8B5E3C] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-[#E0CFC1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-transparent bg-white text-[#6D4C41] placeholder-[#A1887F] transition-all duration-300"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#8B5E3C] mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-[#E0CFC1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-transparent bg-white text-[#6D4C41] placeholder-[#A1887F] transition-all duration-300"
                    placeholder="What is this regarding?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#8B5E3C] mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-[#E0CFC1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-transparent bg-white text-[#6D4C41] placeholder-[#A1887F] resize-none transition-all duration-300"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-[#8B5E3C] to-[#C19A6B] text-white py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#8B5E3C] mb-4">Frequently Asked Questions</h2>
            <p className="text-[#6D4C41] max-w-2xl mx-auto">Quick answers to common questions about our services and policies.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "Do you offer custom jewelry designs?",
                answer: "Yes, we specialize in custom jewelry designs. Contact us with your ideas and we'll bring them to life."
              },
              {
                question: "What is your return policy?",
                answer: "We offer a 30-day return policy for all unworn items in original condition with tags attached."
              },
              {
                question: "Do you provide jewelry cleaning services?",
                answer: "Yes, we offer complimentary jewelry cleaning for items purchased from Liora Jewels."
              },
              {
                question: "How long does shipping take?",
                answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="bg-white/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-white group hover:bg-white"
              >
                <h3 className="font-semibold text-[#8B5E3C] text-lg mb-3 group-hover:text-[#6D4C41] transition-colors duration-300">
                  {faq.question}
                </h3>
                <p className="text-[#6D4C41] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;