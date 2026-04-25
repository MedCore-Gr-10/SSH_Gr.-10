// import { Routes, Route } from "react-router-dom";
// import Header from "../../components/layout/Header.jsx";
// import Footer from "../../components/layout/Footer.jsx";
// import Home from "./Home.jsx";
// import About from "./About.jsx";
// import Contact from "./Contact.jsx";

// function App() {
//   return (
//     <div className="App">
//       <Header />

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/contact" element={<Contact />} />
//       </Routes>

//       <Footer />
//     </div>

//   )
// }

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../auth/login";
import Register from "../auth/register";
import Dashboard from "../patient/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

// export default App
