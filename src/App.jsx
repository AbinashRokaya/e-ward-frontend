import { Outlet } from "react-router-dom";
import Header from "./components/header/Header";
import { ToastContainer } from "react-toastify";
import Footer from "./components/footer/ Footer";
// import BirthRegistration from "./pages/birth-registration.jsx";

function App() {
  return (
    <>
      <Header />
      <Outlet />
      <ToastContainer />
      {/* <Footer /> */}
    </>
  );
}

export default App;
