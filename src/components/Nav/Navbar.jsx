import React from "react";

export default function Navbar({ disable, action, opacityvalue }) {
  return (
    <div>
      <div className="p-[10px] bg-secondary">
        <div className="flex justify-between">
          <div className="self-center">
            <img
              className="w-[50px]"
              src="https://img.magnific.com/premium-vector/cute-watermelon-vector-illustration_1128655-147.jpg?w=360"
              alt=""
            />
          </div>
          <span className="text-rotate text-7xl">
            <span className="justify-items-center">
              <span>DESIGN</span>
              <span>DEVELOP</span>
              <span>DEPLOY</span>
              <span>SCALE</span>
              <span>MAINTAIN</span>
              <span>REPEAT</span>
            </span>
          </span>
          <div className="aura self-center">
            <button
              disabled={disable}
              className="btn btn-neutral"
              onClick={action}
            >
              Increase Opacity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}