import React from "react";
import PhotoTagging from "./components/PhotoTag/PhotoTagging";
import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>
        {" "}
        <img src="./waldo_image.png" alt="logo" />
      </h1>
      <PhotoTagging />
    </div>
  );
}

export default App;
