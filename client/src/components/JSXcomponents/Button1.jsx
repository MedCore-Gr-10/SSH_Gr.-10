import React from 'react';
import "./../CSScomponents/Button1.css";

function Button1({ text, onClick }) {
  return (
    <button 
      className="button1" 
      onClick={onClick} // This "plugs" your function into the click event
    >
      {text}
    </button>
  );
}
export default Button1;