import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./home/Home"
import Login from "./components/Login"
import Register from "./components/Register"
import { useAuth } from "./context/authContext"

const App = () => {
  const [authUser] = useAuth()
  return (
    <Routes>
     <Route path="/" element={authUser ?  <Home/>: <Navigate to={"/login"}/> } />
     <Route path="/login" element={authUser? <Navigate to={"/"} /> : <Login/> }/> 
     <Route path="/register" element={authUser? <Navigate to={"/"} /> : <Register/> }/>
   
    </Routes>
  )
}

export default App