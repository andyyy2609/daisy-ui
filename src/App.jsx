import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [value, setValue] = useState(0)

  return (
    <>
    <div className='m-20'>
      <input type="range" min={0} max="100" value="40" value={value} onChange={(e) => setValue(e.target.value)} className="range range-primary" />
    </div>
    </>
  )
}

export default App
