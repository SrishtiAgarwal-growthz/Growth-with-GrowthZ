import { useState } from 'react';
import { Menu } from 'lucide-react';
import logo from '../assets/logo.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full bg-black h-24 flex items-center">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-8 w-full">
        {/* Logo - Responsive sizes */}
        <div className="flex items-center">
           <span className="relative">
            <img
              src={logo}
              alt="Logo"
              className="w-[140px] h-[35.24px] custom-md:w-[195px] custom-md:h-[45px]"
            />
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden custom-md:flex items-center space-x-14">
          <div className="flex space-x-8 text-xl">
            <a href="#products" className="text-white hover:text-blue-500 transition duration-300">
              Products
            </a>
            <a href="#clients" className="text-white hover:text-blue-500 transition duration-300">
              Clients
            </a>
            <a href="#partners" className="text-white hover:text-blue-500 transition duration-300">
              Partners
            </a>
            <a href="#solutions" className="text-white hover:text-blue-500 transition duration-300">
              Solutions
            </a>
            <a href="#resources" className="text-white hover:text-blue-500 transition duration-300">
              Resources
            </a>
          </div>
          <button className="bg-transparent text-white px-6 py-2 rounded-full border-2 border-blue-500 hover:bg-blue-500 hover:text-black transition duration-300">
            TRY ME
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="custom-md:hidden">
          <Menu className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="custom-md:hidden absolute top-24 left-0 right-0 mt-4 space-y-4 bg-black px-4">
          <a href="#products" className="block text-white hover:text-blue-500">Products</a>
          <a href="#clients" className="block text-white hover:text-blue-500">Clients</a>
          <a href="#partners" className="block text-white hover:text-blue-500">Partners</a>
          <a href="#solutions" className="block text-white hover:text-blue-500">Solutions</a>
          <a href="#resources" className="block text-white hover:text-blue-500">Resources</a>
          <button className="w-full bg-transparent text-white px-6 py-2 rounded-full border-2 border-blue-500 hover:bg-blue-500 hover:text-black transition duration-300">
            TRY ME
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;