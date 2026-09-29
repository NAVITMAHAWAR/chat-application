import Left from "../left/Left"
import LogOut from "../left/left1/LogOut"
import Right from "../right/Right"

const Home = () => {
  return (
    <div className="flex h-screen">
      <LogOut />
      <Left />
      <Right />
    </div>
  )
}

export default Home