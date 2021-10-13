import { IonBadge, IonContent, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonMenu, IonPage, IonTabBar, IonTabButton, IonTabs, IonTitle, IonToolbar } from "@ionic/react"
import Main from "../components/Main"
import "./Chat.css"
import catJAM_gif from "../assets/catJAM.gif"
import { map } from "lodash-es"
import { useEffect } from "react"
import Container from "../components/Container"

const Chat: React.FC = () => {
  useEffect(() => {
    async function main() {
      console.log("test")
    }

    main()
  }, [])

  return (
    <div>
      <div className="flex lg:flex-row lg:h-scree">
        <div className="lg:w-52 lg:bg-white">
          <Container />

        </div>
        <div>
        <Main />
        </div>
      </div>
    </div>
  )
}

export default Chat
