import { Link, useLocation, useNavigate } from "react-router-dom";
import { BsSearch } from 'react-icons/bs';
import { FaBars } from 'react-icons/fa';
import { useContext, useState } from "react";
import Menu from "./Menu";
import { UserContext } from "../context/UserContext";
import { BsPencilSquare } from "react-icons/bs";

const Navbar = () => {
  const [prompt, setPrompt] = useState("");
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const path = useLocation().pathname;

  const showMenu = () => {
    setMenu(!menu);
  };

  const { user } = useContext(UserContext);

  return (
    <div className="flex items-center justify-between px-6 md:px-[200px] py-4 bg-white shadow-md">
      {/* Logo and Title */}
      <div className="flex items-center space-x-2">
        <BsPencilSquare className="text-xl" />
        <h1 className="text-lg md:text-xl font-extrabold">
          <Link to="/">Blog It!</Link>
        </h1>
      </div>

      {/* User Actions and Search Bar */}
      <div className="flex items-center space-x-4">
        {path === "/" && (
          <div className="relative flex items-center">
            <input
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full md:w-auto pl-4 pr-10 py-2 border border-gray-300 rounded-full shadow-sm bg-gray-100 outline-none focus:bg-white focus:border-gray-400 focus:shadow-md transition-all duration-200 ease-in-out"
              placeholder="Search a post"
              type="text"
            />
            <BsSearch
              onClick={() => navigate(prompt ? "?search=" + prompt : navigate("/"))}
              className="absolute right-3 text-gray-600 hover:text-black transition-colors duration-200 cursor-pointer"
            />
          </div>
        )}

        {user ? (
          <h3><Link to="/write">Write</Link></h3>
        ) : (
          <h3 className="font-bold" ><Link to="/login">Login</Link></h3>
        )}
        {user ? (
          <div onClick={showMenu}>
            <p className="cursor-pointer relative"><FaBars /></p>
            {menu && <Menu />}
          </div>
        ) : (
          <h3 className="font-bold"><Link to="/register">Register</Link></h3>
        )}
      </div>

      {/* Mobile Menu Icon */}
      <div onClick={showMenu} className="md:hidden text-lg">
        <p className="cursor-pointer relative"><FaBars /></p>
        {menu && <Menu />}
      </div>
    </div>
  );
};

export default Navbar;
