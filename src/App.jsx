import React from "react";
import AppRouter from "./routes/AppRouter";
import Header from "./components/main/Header";


function App() {
  return (
    <div className="app-container">
      <Header></Header>
      <main className="main-container">
      <AppRouter/>
      </main>
    </div>
  );
}

export default App;