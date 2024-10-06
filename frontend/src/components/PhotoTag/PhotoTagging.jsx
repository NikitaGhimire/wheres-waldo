import React, { useState } from "react";
import "./PhotoTagging.css";

const PhotoTagging = () => {
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [isTargeting, setisTargeting] = useState(false);

  //to handle click of the image
  const handleClick = (event) => {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    console.log(`Clicked at: X=${x}, Y=${y}`); //debugging log

    setClickPosition({ x, y });
    setisTargeting(true);
  };

  //to handle outside click, hides targeting box
  const handleOutsideClick = (event) => {
    // If the click is outside the target box, hide it
    if (!event.target.closest('.target-box')) {
      setisTargeting(false);
    }
  };

  return (
    <div className="photo-container" onClick={handleOutsideClick}>
      <img 
        src='./waldo.jpg'
        alt="Where's Waldo"
        className="waldo-photo"
        onClick={handleClick}
      />

      {isTargeting && (
        <div
          className="target-box"
          style={{
            top: `${clickPosition.y}px`,
            left: `${clickPosition.x}px`,
          }}
          onClick={(event) => event.stopPropagation()}  // Stop the click from closing the box
        >
          <select>
            <option value="">Select a character</option>
            <option value="waldo">Waldo</option>
            <option value="wizard">Wizard</option>
            <option value="wilma">Wilma</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default PhotoTagging;
