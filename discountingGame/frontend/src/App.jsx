import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Discounting from './discounting'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Discounting />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
