import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import menuIcon from "../assets/Hamburger.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 h-[5.125rem] md:h-[6rem] flex items-center transition-colors duration-300 ${
        hasScrolled
          ? "bg-black/60 backdrop-blur-xl" // When scrolled
          : "bg-black" // At the top (no scroll)
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-[2rem] w-full h-full">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center"
        >
          <img
            src={logo}
            alt="Logo"
            className="w-[7.5rem] h-[2.015rem] md:w-[11.5625rem] md:h-[2.5rem]"
          />
        </button>

        {/* Desktop Menu */}
        <div className="hidden custom-md:flex items-center space-x-[3.5rem]">
          <div className="flex space-x-[2rem] text-[1rem]">
            <a
              href="#products"
              className="text-white hover:text-blue-500 transition duration-300"
            >
              Products
            </a>
            <a
              href="#clients"
              className="text-white hover:text-blue-500 transition duration-300"
            >
              Clients
            </a>
            <a
              href="#partners"
              className="text-white hover:text-blue-500 transition duration-300"
            >
              Partners
            </a>
            <a
              href="#solutions"
              className="text-white hover:text-blue-500 transition duration-300"
            >
              Solutions
            </a>
            <a
              href="#resources"
              className="text-white hover:text-blue-500 transition duration-300"
            >
              Resources
            </a>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="bg-transparent text-white px-[1.5rem] py-[0.5rem] rounded-full border-2 border-blue-500 hover:bg-blue-500 hover:text-black transition duration-300"
          >
            TRY ME
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="custom-md:hidden flex items-center justify-center"
        >
          <img
            src={menuIcon}
            alt={isOpen ? "Close menu" : "Open menu"}
            className="w-[2rem] h-[2rem] object-contain"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-[5.125rem] left-0 right-0 bg-black transition-all duration-300 ease-in-out ${
          isOpen ? "h-auto opacity-100" : "h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-[2rem] py-[1rem] space-y-[1rem]">
          <a
            href="#products"
            className="block text-white hover:text-blue-500 py-[0.5rem]"
          >
            Products
          </a>
          <a
            href="#clients"
            className="block text-white hover:text-blue-500 py-[0.5rem]"
          >
            Clients
          </a>
          <a
            href="#partners"
            className="block text-white hover:text-blue-500 py-[0.5rem]"
          >
            Partners
          </a>
          <a
            href="#solutions"
            className="block text-white hover:text-blue-500 py-[0.5rem]"
          >
            Solutions
          </a>
          <a
            href="#resources"
            className="block text-white hover:text-blue-500 py-[0.5rem]"
          >
            Resources
          </a>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-transparent text-white px-[1.5rem] py-[0.5rem] rounded-full border-2 border-blue-500 hover:bg-blue-500 hover:text-black transition duration-300"
          >
            TRY ME
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;