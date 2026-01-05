




import React, { useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Admin from "./Admin";
import Dashboard from "./Dashboard";
import EditProperty from "./EditProperty";
import GetForm from "./DataAddAdmin/GetForm";
import AdminSetForm from "./DataAddAdmin/AdminSetForm";
import Plan from "./Plan";
import Detail from "./Detail";
import GetBuyerAssistance from "./GetBuyerAssistance";
import PropertyAssistance from "./PropertyAssistance";
 
import { useDispatch } from 'react-redux';
import { setName } from './redux/adminSlice';
import { setRole } from './redux/adminSlice';





const App = () => {

  
  const dispatch = useDispatch();


  useEffect(() => {
    const name = localStorage.getItem('name');
    const role = localStorage.getItem('role');
  
    if (name) {
      dispatch(setName(name));
    }
    if (role) {
      dispatch(setRole(role));
    }
  }, [dispatch]);
  


  
  return (
   

    <Router basename="/process">
      <ToastContainer position="top-right" autoClose={5000} />
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
    </Router>
    
  );
};

export default App;



















