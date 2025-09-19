import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import LandingPage from './components/pages/LandingPage';
import SignUpPage from './components/authPages/SignupPage';
import React from 'react';
import LogInPage from './components/authPages/LogInPage';
import UserDashboard from './components/userPages/UserDashboard';
import ProductPage from './components/pages/ProductPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={ <LandingPage/>}></Route>
        <Route  path='signup' element={<SignUpPage/>}></Route>
        <Route  path='signup/login' element={<LogInPage/>}></Route>
        <Route path='productpage' element={<ProductPage/>}></Route>
        <Route path='userdashboard' element={<UserDashboard/>}></Route>
        {/* <Route path="/forgot" element={<ForgotPasswordPage />} /> */}

     </Routes>
     
     <h1 className="text-3xl font-bold underline">
   
    </h1>
    </div>
  );
}

export default App;
