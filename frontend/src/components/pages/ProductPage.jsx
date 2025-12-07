import React from 'react'
import { Link, NavLink } from "react-router-dom";
import Navbar from './Navbar';


const ProductPage = () => {
  return (
    <>
    <Navbar/>
    <div className='productpage'>
        <h1 className='header'>Wel Come to ProductPage </h1>
        <h1 className='header'>Hii Guys please wait </h1>
        <h1 className='red'>Products coming soon ! WORK IN PROGRESS</h1>
        <h1>    THANK YOU </h1>
        <NavLink>
                   <Link to="userdashboard" className="link1" >Order Start Now</Link>
                  </NavLink>
    </div>
    </>
  )
}

export default ProductPage