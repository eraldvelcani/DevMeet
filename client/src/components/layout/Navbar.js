import React from 'react'
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar bg-dark">
            <h1>
                <Link to="/">DevMeet</Link>
            </h1>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Register</Link></li>
            </ul>
    </nav>
  )
}

export default Navbar;