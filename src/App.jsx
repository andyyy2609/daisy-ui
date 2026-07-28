import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./components/home/home"
import HomeAD from "./components/home/HomeAD"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/home2" element={<HomeAD/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
