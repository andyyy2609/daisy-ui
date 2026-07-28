import React, { useState } from "react";
import InputRange from "../Input/InputRange";
import Card from "../Card/Card";
import Phone from "../Phone/Phone";
import FloatingActionButton from "../Button/FAB";
import Navbar from "../Nav/Navbar";
import HomeAD from "./Page2";
import { useNavigate } from "react-router-dom";

export default function Page1() {
  const [op, setOp] = useState(100);
  const color = op < 30 ? "error" : "success";
  const navigate = useNavigate();
  
  return (
    <div>
      <div>
        <Navbar
          opacityvalue={op / 100}
          action={() => setOp(op < 100 ? op + 10 : 100)}
          disable={op === 100 ? true : false}
        />
      </div>
    <div className="mx-[100px]">
      <div className="flex flex-wrap justify-around gap-4 px-[100px] mt-5">
        <div>
          <Card
            slot={
              <div>
                <span className={`badge bagde-${color} mb-2 ms-auto`}>
                  {op < 0 ? 0 : op}%
                </span>
                <InputRange
                  classname={`range=${color}`}
                  value={op}
                  action={(e) => setOp(e.target.value)}
                />
              </div>
            }
            imageUrl={"https://i.pinimg.com/1200x/10/22/48/1022487a9d9175c4f4dece7532d37a7a.jpg"}
            opacityvalue={op / 100}
            action={() => setOp(op > 0 ? op - 10 : 0)}
            disable={op === 0 ? true : false}
          />
        </div>
        <div>
          <Card
            slot={
              <div>
                <span className={`badge bagde-${color} mb-2 ms-auto`}>
                  {op < 0 ? 0 : op}%
                </span>
                <InputRange
                  classname={`range=${color}`}
                  value={op}
                  action={(e) => setOp(e.target.value)}
                />
              </div>
            }
            imageUrl={"https://i.pinimg.com/736x/b9/24/06/b92406b7bb850876d3f5a753aea4c740.jpg"}
            opacityvalue={op / 100}
            action={() => setOp(op > 0 ? op - 10 : 0)}
            disable={op === 0 ? true : false}
          />
        </div>
        <div>
          <Card
            slot={
              <div>
                <span className={`badge bagde-${color} mb-2 ms-auto`}>
                  {op < 0 ? 0 : op}%
                </span>
                <InputRange
                  classname={`range=${color}`}
                  value={op}
                  action={(e) => setOp(e.target.value)}
                />
              </div>
            }
            imageUrl={"https://i.pinimg.com/736x/46/cd/f5/46cdf5a229120175ea28f10e05fa4db7.jpg"}
            opacityvalue={op / 100}
            action={() => setOp(op > 0 ? op - 10 : 0)}
            disable={op === 0 ? true : false}
          />
        </div>
        <div>
          <Card
            slot={
              <div>
                <span className={`badge bagde-${color} mb-2 ms-auto`}>
                  {op < 0 ? 0 : op}%
                </span>
                <InputRange
                  classname={`range=${color}`}
                  value={op}
                  action={(e) => setOp(e.target.value)}
                />
              </div>
            }
            imageUrl={"https://i.pinimg.com/736x/88/2f/94/882f94d8e6e1c7986307cc4c3fec2154.jpg"}
            opacityvalue={op / 100}
            action={() => setOp(op > 0 ? op - 10 : 0)}
            disable={op === 0 ? true : false}
          />
        </div>
        <div>
          <Card
            slot={
              <div>
                <span className={`badge bagde-${color} mb-2 ms-auto`}>
                  {op < 0 ? 0 : op}%
                </span>
                <InputRange
                  classname={`range=${color}`}
                  value={op}
                  action={(e) => setOp(e.target.value)}
                />
              </div>
            }
            imageUrl={"https://i.pinimg.com/736x/eb/75/ae/eb75aea33f18917ff3f4a1ca78a9d075.jpg"}
            opacityvalue={op / 100}
            action={() => setOp(op > 0 ? op - 10 : 0)}
            disable={op === 0 ? true : false}
          />
        </div>
        <div>
          <Card
            slot={
              <div>
                <span className={`badge bagde-${color} mb-2 ms-auto`}>
                  {op < 0 ? 0 : op}%
                </span>
                <InputRange
                  classname={`range=${color}`}
                  value={op}
                  action={(e) => setOp(e.target.value)}
                />
              </div>
            }
            imageUrl={"https://i.pinimg.com/736x/b8/7e/ed/b87eed3fa78f8560892f2b824e8fb4d1.jpg"}
            opacityvalue={op / 100}
            action={() => setOp(op > 0 ? op - 10 : 0)}
            disable={op === 0 ? true : false}
          />
        </div>
        <div>
          <Card
            slot={
              <div>
                <span className={`badge bagde-${color} mb-2 ms-auto`}>
                  {op < 0 ? 0 : op}%
                </span>
                <InputRange
                  classname={`range=${color}`}
                  value={op}
                  action={(e) => setOp(e.target.value)}
                />
              </div>
            }
            imageUrl={"https://i.pinimg.com/736x/f6/cd/9b/f6cd9b9c7e655de1c0b49be9637d15c4.jpg"}
            opacityvalue={op / 100}
            action={() => setOp(op > 0 ? op - 10 : 0)}
            disable={op === 0 ? true : false}
          />
        </div>
        <div>
          <Card
            slot={
              <div>
                <span className={`badge bagde-${color} mb-2 ms-auto`}>
                  {op < 0 ? 0 : op}%
                </span>
                <InputRange
                  classname={`range=${color}`}
                  value={op}
                  action={(e) => setOp(e.target.value)}
                />
              </div>
            }
            imageUrl={"https://i.pinimg.com/736x/f6/cd/9b/f6cd9b9c7e655de1c0b49be9637d15c4.jpg"}
            opacityvalue={op / 100}
            action={() => setOp(op > 0 ? op - 10 : 0)}
            disable={op === 0 ? true : false}
          />
        </div>
      </div>
    </div>
    <div className="flex justify-center">
      <div>

      <button
              className="btn btn-neutral"
              opacityvalue={op / 100}
              onClick={() => setOp(op < 100 ? op + 10 : 100)}
              disabled={op === 100 ? true : false}
              >
              Increase Opacity
      </button>
                </div>
                <div>
      <Phone/>
                </div>
                <div>

      <div className="tooltip tooltip-bottom tooltip-warning" data-tip="Page 2.0">
        <button className="btn btn-primary" onClick={()=>navigate("/page2")}>Next</button>
                </div>
      </div>
      </div>
      <FloatingActionButton/>
    </div>
  );
}
