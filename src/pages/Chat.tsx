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
    <section className="flex w-screen h-screen">
        <div className="flex lg:w-80 bg-gray-500 overflow-y-scroll">
          <SideMenu />
        </div>
        <div className="flex-grow overflow-y-scroll">
          <Main />
        </div>
    </section>
  )
}

export default Chat
