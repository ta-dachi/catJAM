import { IonPage, IonContent } from "@ionic/react"
import { useEffect } from "react"
import { Link } from "react-router-dom"

const Login: React.FC = () => {
  useEffect(() => {
    async function main() {
      console.log("test")
    }

    main()
  }, [])

  return (
    <IonPage>
      <IonContent fullscreen>
        <div>
          <Link to="/">Login</Link>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Login
