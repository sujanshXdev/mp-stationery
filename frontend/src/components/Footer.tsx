import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaWhatsapp,
  FaInstagram,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import { FiBook, FiEdit3, FiGift, FiTarget } from "react-icons/fi";

interface FooterLink {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const categoryLinks: FooterLink[] = [
  { name: "Books", href: "/shop?category=Book", icon: FiBook },
  { name: "Stationery", href: "/shop?category=Stationery", icon: FiEdit3 },
  { name: "Gifts", href: "/shop?category=Gifts", icon: FiGift },
  { name: "Sports", href: "/shop?category=Sports", icon: FiTarget },
];

const infoLinks: FooterLink[] = [
  { name: "About Us", href: "/about-us" },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

const marqueeVariants: Variants = {
  animate: {
    x: ['0%', '-50%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 12,
        ease: 'linear',
      },
    },
  },
  paused: {
    x: 0,
    transition: { duration: 0 },
  },
};

const Footer: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <motion.footer
      className="bg-blue-900 py-16 relative border-t-4 border-amber-300/20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={sectionVariants}
      aria-label="Footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Marquee Section for Featured Categories */}
        <motion.div
          variants={itemVariants}
          className="mb-16 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          role="region"
          aria-label="Featured Categories Marquee"
        >
          <motion.div
            className="flex"
            variants={marqueeVariants}
            animate={isPaused || reducedMotion ? "paused" : "animate"}
            style={{ width: `${categoryLinks.length * 50}%` }}
          >
            {[...categoryLinks, ...categoryLinks].map((link, index) => (
              <motion.div
                key={`${link.name}-${index}`}
                variants={itemVariants}
                className="flex-shrink-0 w-48 mx-4"
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
              >
                <Link
                  to={link.href}
                  className="flex items-center space-x-2 p-3 bg-blue-800/30 backdrop-blur-lg rounded-xl text-white hover:bg-blue-700/50 transition-all duration-300 font-sans text-sm border border-blue-700/30 shadow-sm"
                >
                  {link.icon && <link.icon className="w-5 h-5 text-amber-300" />}
                  <span className="font-semibold">{link.name}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <motion.div variants={itemVariants} className="col-span-1">
            <h3 className="text-xl font-extrabold mb-5 font-sans text-white bg-gradient-to-r from-amber-300 to-white bg-clip-text text-transparent tracking-tight">
              MP Books & Stationery
            </h3>
            <p className="text-sm leading-relaxed mb-6 font-sans text-blue-100">
              Your premier destination for education and creativity in Bharatpur. 
              Providing quality stationery, books, and gifts since 2010.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-blue-100">
                <FaPhone className="w-4 h-4 mr-2 text-amber-300" />
                <a href="tel:+9855038599" className="hover:text-amber-300 transition-colors">
                  985-5038599
                </a>
                <span className="mx-2">|</span>
                <a href="tel:+056534129" className="hover:text-amber-300 transition-colors">
                  056-534129
                </a>
              </div>
              <div className="flex items-center text-sm text-blue-100">
                <FaEnvelope className="w-4 h-4 mr-2 text-amber-300" />
                <a href="mailto:info@mpbooks.com" className="hover:text-amber-300 transition-colors">
                  info@mpbooks.com
                </a>
              </div>
              <div className="flex items-center text-sm text-blue-100">
                <FaMapMarkerAlt className="w-4 h-4 mr-2 text-amber-300" />
                <a 
                  href="https://maps.google.com/?q=MCGP+37F,Bharatpur+44200" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors"
                >
                  MCGP+37F, Bharatpur 44200
                </a>
              </div>
              <div className="flex items-center text-sm text-blue-100">
                <FaClock className="w-4 h-4 mr-2 text-amber-300" />
                <span>Open daily: 6:00 AM–9:00 PM</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="col-span-1">
            <h3 className="text-xl font-extrabold mb-5 font-sans text-white bg-gradient-to-r from-amber-300 to-white bg-clip-text text-transparent tracking-tight">
              Shop Categories
            </h3>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <motion.li
                  key={link.name}
                  variants={itemVariants}
                  whileHover={reducedMotion ? {} : { x: 5 }}
                >
                  <Link
                    to={link.href}
                    className="text-sm text-blue-100 hover:text-amber-300 transition-colors duration-200 font-sans flex items-center gap-2"
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="col-span-1">
            <h3 className="text-xl font-extrabold mb-5 font-sans text-white bg-gradient-to-r from-amber-300 to-white bg-clip-text text-transparent tracking-tight">
              Information
            </h3>
            <ul className="space-y-3">
              {infoLinks.map((link) => (
                <motion.li
                  key={link.name}
                  variants={itemVariants}
                  whileHover={reducedMotion ? {} : { x: 5 }}
                >
                  <Link
                    to={link.href}
                    className="text-sm text-blue-100 hover:text-amber-300 transition-colors duration-200 font-sans"
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="col-span-1">
            <h3 className="text-xl font-extrabold mb-5 font-sans text-white bg-gradient-to-r from-amber-300 to-white bg-clip-text text-transparent tracking-tight">
              Connect With Us
            </h3>
            <div className="flex space-x-5 mb-6">
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                whileHover={reducedMotion ? {} : { scale: 1.2 }}
                className="text-blue-100 hover:text-amber-300 transition-colors duration-200"
                aria-label="Facebook"
              >
                <FaFacebook className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                whileHover={reducedMotion ? {} : { scale: 1.2 }}
                className="text-blue-100 hover:text-amber-300 transition-colors duration-200"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                whileHover={reducedMotion ? {} : { scale: 1.2 }}
                className="text-blue-100 hover:text-amber-300 transition-colors duration-200"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-10 pt-10 border-t border-blue-700/20 text-center"
        >
          <p className="text-sm text-blue-200 font-sans">
            © {new Date().getFullYear()} MP Books & Stationery. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;