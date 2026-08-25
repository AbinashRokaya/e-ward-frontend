import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./components/header/Header";

function App() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50">
      <Header />

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Global Toast Container
          All pages can now use:
          notify.success(...)
          notify.error(...)
          notify.info(...)
          notify.warn(...)
          notify.apiError(...)
          notify.loadFailed(...)
      */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;