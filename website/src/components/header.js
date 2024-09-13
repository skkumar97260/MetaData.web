import React, { useState } from "react";
import profile from "../images/profile3.jpg";
import { Link, useNavigate } from "react-router-dom";
import { clearStorage } from "../utils/Storage";
import { isAuthenticated } from "../utils/Auth";
import { toast } from "react-toastify";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated()); // Fixed initialization
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    clearStorage();
    setIsLoggedIn(false);
    toast.success("Logged out successfully");
    navigate('/');
  };

  return (
    <div className="sm:mx-4 lg:mx-8 p-3 bg-pink-600 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-white">MetaData</h1>
      </div>
      <div onClick={toggleDropdown} className="relative">
        <img
          src={profile}
          alt="profile"
          height={50}
          width={50}
          className="profile rounded-full cursor-pointer"
        />
        {isDropdownOpen && (
          <div className="dropdown-content menu bg-white rounded-box z-[1] w-40 p-2 shadow absolute right-0 mt-2">
            <ul>
              {isLoggedIn ? (
                <>
                  <li className="border-b-2 flex justify-center">
                    <a href="#">Profile</a>
                  </li>
                  <li className="border-b-2 flex justify-center" onClick={handleLogout}>
                    <a href="#">Logout</a>
                  </li>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <li className="border-b-2 flex justify-center">
                      <a href="#">Login</a>
                    </li>
                  </Link>
                  <Link to="/signup">
                    <li className="border-b-2 flex justify-center">
                      <a href="#">Signup</a>
                    </li>
                  </Link>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
