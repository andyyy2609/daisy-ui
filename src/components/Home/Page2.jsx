import React, { useState } from "react";
import InputRange from "../Input/InputRange";
import Card from "../Card/Card";
import Phone from "../Phone/Phone";
import FloatingActionButton from "../Button/FAB";
import Navbar from "../Nav/Navbar";

const IMAGES = [
  "https://i.pinimg.com/1200x/10/22/48/1022487a9d9175c4f4dece7532d37a7a.jpg",
  "https://i.pinimg.com/736x/b9/24/06/b92406b7bb850876d3f5a753aea4c740.jpg",
  "https://i.pinimg.com/736x/46/cd/f5/46cdf5a229120175ea28f10e05fa4db7.jpg",
  "https://i.pinimg.com/736x/88/2f/94/882f94d8e6e1c7986307cc4c3fec2154.jpg",
  "https://i.pinimg.com/736x/eb/75/ae/eb75aea33f18917ff3f4a1ca78a9d075.jpg",
  "https://i.pinimg.com/736x/b8/7e/ed/b87eed3fa78f8560892f2b824e8fb4d1.jpg",
  "https://i.pinimg.com/736x/f6/cd/9b/f6cd9b9c7e655de1c0b49be9637d15c4.jpg",
  "https://i.pinimg.com/736x/f6/cd/9b/f6cd9b9c7e655de1c0b49be9637d15c4.jpg",
];

export default function Page2() {
  // one opacity value per card, all starting at 100
  const [opacities, setOpacities] = useState(IMAGES.map(() => 100));

  // navbar keeps its own separate value if you still want a "global" control
  const [navOp, setNavOp] = useState(100);

  const updateOpacity = (index, newValue) => {
    setOpacities((prev) => {
      const next = [...prev];
      next[index] = newValue;
      return next;
    });
  };

  const increment = (index) => {
    updateOpacity(index, opacities[index] < 100 ? opacities[index] + 10 : 100);
  };

  const decrement = (index) => {
    updateOpacity(index, opacities[index] > 0 ? opacities[index] - 10 : 0);
  };

  return (
    <div>
      <div>
        <Navbar
          opacityvalue={navOp / 100}
          action={() => setNavOp(navOp < 100 ? navOp + 10 : 100)}
          disable={navOp === 100}
        />
      </div>
      <div className="mx-[100px]">
        <div className="flex flex-wrap justify-center gap-4 px-[100px] mt-5">
          {IMAGES.map((url, index) => {
            const op = opacities[index];
            const color = op < 30 ? "error" : "success";
            return (
              <div key={index}>
                <Card
                  slot={
                    <div>
                      <span className={`badge bagde-${color} mb-2 ms-auto`}>
                        {op < 0 ? 0 : op}%
                      </span>
                      <InputRange
                        classname={`range=${color}`}
                        value={op}
                        action={(e) => updateOpacity(index, Number(e.target.value))}
                      />
                    </div>
                  }
                  imageUrl={url}
                  opacityvalue={op / 100}
                  action={() => decrement(index)}
                  disable={op === 0}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center">
        <Phone />
      </div>
      <FloatingActionButton />
    </div>
  );
}