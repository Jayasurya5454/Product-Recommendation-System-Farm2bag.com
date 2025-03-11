import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, Send } from "lucide-react";

// Replace with your actual logo import
import logo from "../assets/Logo_with_text.webp";

const Footer = () => {
  return (
    <footer className="bg-white pt-10 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="mb-6">
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="Farm2Bag Logo" className="h-10" />
            </Link>
            <p className="text-gray-600 mb-4">
              Farm2Bag connects you directly with farmers, delivering fresh, healthy, and
              preservative-free food straight from farm to your bag.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/farm2bag" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-emerald-600">
                <Facebook size={20} />
              </a>
              <a href="https://x.com/farm2bag" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-emerald-600">
                <Twitter size={20} />
              </a>
              <a href="https://www.instagram.com/farm2bag/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-emerald-600">
                <Instagram size={20} />
              </a>
              <a href="https://youtube.com/@farm2bag?si=1U_FvBs8rRMrm8wa" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-emerald-600">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* About Us */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4">About Us</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  About team
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4">Our Information</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Privacy policy update
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Terms & conditions
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  Site Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4">Subscribe Now</h3>
            <p className="text-gray-600 mb-4">
              Subscribe your email for newsletter and featured news based on your interest
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Write your email here"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:border-emerald-500"
              />
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-r-md hover:bg-emerald-700 transition-colors">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-6 text-center border-t mt-8">
          <p className="text-gray-800">© Copyright {new Date().getFullYear()} Farm2Bag. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;