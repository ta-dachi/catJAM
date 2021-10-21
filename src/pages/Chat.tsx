import Main from "../components/Main"
import "./Chat.css"
import { useEffect } from "react"
import SideMenu from "../components/SideMenu"

const Chat: React.FC = () => {
  useEffect(() => {
    async function main() {
      console.log("Chat Component Rendered")
    }

    main()
  }, [])

  return (
    <section className="flex w-screen h-screen overflow-y-scroll">
        <div className="lg:w-60 lg:bg-white">
          <SideMenu />
        </div>
        <div className="flex-grow">
          <Main />
        </div>
    </section>
  )
}

export default Chat
