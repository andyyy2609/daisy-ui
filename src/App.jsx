import React from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Page1 from "./components/home/Page1"
import Page2 from "./components/home/Page2"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Page1/>}/>
        <Route path="/page2" element={<Page2/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
