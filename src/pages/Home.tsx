import { IonContent, IonHeader, IonImg, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import Main from "../components/Main"
import "./Home.css"
import catJAM_gif from "../assets/catJAM.gif"

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="flex-row h-20 p-0">

            <IonImg className="h-20 w-20" src={catJAM_gif} />
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
          <IonTitle className="h-20">
            <IonImg className="h-20" src={catJAM_gif} />
          </IonTitle>
          </IonToolbar>
        </IonHeader>

        <Main />

      </IonContent>
    </IonPage>
  )
}

export default Home
