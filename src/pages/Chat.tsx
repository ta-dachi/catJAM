import Main from "../components/Main"
import "./Chat.css"
import { useEffect } from "react"
import Container from "../components/Container"

const Chat: React.FC = () => {
  useEffect(() => {
    async function main() {
      console.log("Chat Component Rendered")
    }

    main()
  }, [])

  return (
    <section className="flex w-screen h-screen overflow-y-scroll">
        <div className="lg:w-52 lg:bg-white">
          <Container />
        </div>
        <div className="flex-grow">
          <Main />
        </div>
    </section>
  )
}

export default Chat
