// import '@hookstate/devtools'
//
import { Redirect, Route, Switch } from "react-router-dom"
import { IonApp, IonRouterOutlet } from "@ionic/react"
import { IonReactRouter } from "@ionic/react-router"
import Chat from "./pages/Chat"
import "./theme/tailwind.css"

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css"

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css"
import "@ionic/react/css/structure.css"
import "@ionic/react/css/typography.css"

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css"
import "@ionic/react/css/float-elements.css"
import "@ionic/react/css/text-alignment.css"
import "@ionic/react/css/text-transformation.css"
import "@ionic/react/css/flex-utils.css"
import "@ionic/react/css/display.css"

/* Theme variables */
import "./theme/variables.css"
import Login from "./pages/Login/Login"
import { useEffect } from "react"

const App: React.FC = () => {
  // componentDidMount()
  useEffect(() => {
    async function main() {
      console.log("App Component")
    }

    main()
  }, [])

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Switch>
            <Route exact path="/chat">
              <Chat />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/test">
              Test
            </Route>
            <Route path="">
              <Redirect to="/chat" />
            </Route>
            <Route path="*">
              {/* <div>404</div> */}
              <Redirect to="/chat" />
            </Route>
          </Switch>
        </IonRouterOutlet>

        {/* <IonTabs>
          <IonTabBar slot="top">
            <IonTabButton tab="" href="/">
              <IonLabel>Chat</IonLabel>
            </IonTabButton>

            <IonTabButton tab="test" href="/test">
              <IonLabel>test</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs> */}
      </IonReactRouter>
    </IonApp>
  )
}

export default App
