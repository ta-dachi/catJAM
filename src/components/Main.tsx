import set from "lodash-es/set"
import { useRef, useEffect, useReducer, createContext } from "react"
import tmi from "tmi.js"
import { Virtuoso } from "react-virtuoso"
import { ClientCredentialsAuthProvider, StaticAuthProvider } from "@twurple/auth"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { useLocation } from "react-router"
import { ApiClient, HelixPrivilegedUser } from "@twurple/api"
import { globalState, HelixCustomFollow, IGlobalState } from "../services/GlobalState"
import { observer } from "mobx-react-lite"

//
const clientId: string = process.env.REACT_APP_CLIENT_ID as string
const clientSecret: string = process.env.REACT_APP_SECRET as string
const redirectUri: string = "https://192.168.1.14:3000/home"
const scopeUri: string = "chat%3Aread+user_read+user:read:follows"
const scope: string[] = ["chat:read", "user_read", "user:read:follows"]
//
const OAUTH_URL: string = "https://id.twitch.tv/oauth2/" // Change this if twitch's API changes
const OAUTH_REVOKE: string = "revoke"
const OAUTH_AUTHORIZE: string = "authorize"
const OAUTH_VALIDATE: string = "validate"
//
const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret)

function generateNonce(stringLength: any) {
  var randomString = "" // Empty value of the selective variable
  const allCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" // listing of all alpha-numeric letters
  while (stringLength--) {
    randomString += allCharacters.substr(Math.floor(Math.random() * allCharacters.length + 1), 1) // selecting any value from allCharacters varible by using Math.random()
  }
  return randomString // returns the generated alpha-numeric string
}

/**
 * Generate a Twitch login URL to get a access token.
 *
 * @param nonce
 */
function generateAccessTokenURL(nonce?: string) {
  return `${OAUTH_URL}${OAUTH_AUTHORIZE}
?client_id=${clientId}
&redirect_uri=${redirectUri}
&response_type=token
&scope=${scopeUri}
&nonce=${nonce}`
}

type Channels = {
  [key: string]: {
    messages: string[]
  }
}

// type GlobalStore = {
//   // Chat
//   joinedChannels: string[] | undefined
//   channels: Channels
//   token: {}
//   name: string
//   connected: boolean

//   // Auth
//   access_token: string
//   authProvider: StaticAuthProvider | null
//   apiClient: ApiClient | null
//   userMe: HelixPrivilegedUser | null
//   follows: HelixCustomFollow[] | null
// }

// const initialGlobalStore: GlobalStore = {
//   // Chat
//   joinedChannels: [],
//   channels: {},
//   token: {},
//   name: "",
//   connected: false,

//   access_token: "",
//   authProvider: null,
//   apiClient: null,
//   // Auth
//   userMe: null,
//   follows: null,
// }

// const globalState = createState(initialGlobalStore)
// const wrapState = (s: State<GlobalStore>) => ({
//   get: () => s,
//   mergeValue: (newValue: Partial<GlobalStore>) => s.merge(newValue)
// })

// // The following 2 functions can be exported now:
// export const accessGlobalState = () => wrapState(globalState)
// export const useGlobalState = () => wrapState(useState(globalState))

/** Gets streams followed by user, pass cursor to after for next */
const getStreamsFollowed = async (access_token: string, client_id: string, user_id: string, after: string = ""): Promise<AxiosResponse<{ data: HelixCustomFollow[]; pagination: any }>> => {
  const url = "https://api.twitch.tv/helix/streams/followed"
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Client-id": client_id,
    },
    params: {
      user_id: user_id,
      after: after,
    },
  }
  return axios.get(url, config)
}

function urlHash2Obj(hash: string): any {
  return hash
    .split("&")
    .map((v) => v.split("="))
    .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {})
}

const Main = observer(() => {
  // const client = useRef(
  //   new tmi.client({
  //     // @ts-ignore
  //     options: { debug: false, skipMembership: true },
  //     // channels: [...props.channels],
  //   })
  // )

  // const [bigStore, setBigStore] = useState(initialBigStore)
  // const [smallStore, setSmallStore] = useState(initialSmallStore)
  // const [authStore, setAuthStore] = useState(initialAuthStore)
  // const state = useState(globalState)

  // forceUpdate
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)
  // const messagesRefHook = useRef(messages)

  const hash = useLocation().hash.substr(1) // substr(1) removes the # from first element

  // componentDidMount()
  useEffect(() => {
    async function main() {
      try {
        console.log("Main Component Rendered")
 
        // queryparams
        if (hash) {
          let access_token = urlHash2Obj(hash)["access_token"] as string
          if (access_token.length <= 10) {
            access_token = globalState.store.access_token as string
          }
          const authProvider = new StaticAuthProvider(clientId, access_token)
          const apiClient = new ApiClient({ authProvider: authProvider })
          const userMe = await apiClient.users.getMe(false)
          const follows = (await getStreamsFollowed(access_token, clientId, userMe.id)).data.data

          globalState.update({ access_token: access_token, authProvider: authProvider, apiClient: apiClient, userMe: userMe, follows: follows })

          await globalState.client.connect()

          console.log("Connected!")

          globalState.update({connected: true})
        }

        globalState.client.removeAllListeners()

        globalState.client.addListener("message", (channel: string, tags, message: string, self) => {
          channel = channel.replace("#", "").toLowerCase()
          // const joinedChannels = state.value.joinedChannels

          if (globalState.store.joinedChannels?.includes(channel)) {
            message = `[${channel}] {${tags["display-name"]}}: ${message}`
            console.log(message)
            if (globalState.store.channels[channel]?.messages) {
              const length = globalState.store.channels[channel]?.messages.length
              // globalState.store.channels[channel].messages[length] = message
              // TODO Optimize this code
              let currentChannels = {...globalState.store.channels }
              // Set the message
              currentChannels[channel].messages[length] = message
              globalState.update({...currentChannels})
            } else {
              const newChannel: Channels = {}
              set(newChannel, [channel, "messages"], [])
              // const currentChannels = {...globalState.store.channels }
              globalState.update({channels: {...globalState.store.channels, ...newChannel}})
            }
          }
        })
      } catch (error) {
        console.error(error)
      }
    }

    main()
  }, [])



  return (
    <section>
      {globalState.store.name}
      <div className="mt-4">Connected {globalState.store.connected && globalState.store.access_token ? "Yes" : "No"}</div>

      {(!globalState.store.access_token) ? <a href={generateAccessTokenURL(generateNonce("Test"))}>Connect to Twitch</a> : ''}
      
      {/* <div className="mt-4">
        {globalState.store.follows?.map((follow, i: number) => {
          const html = !globalState.store.joinedChannels?.includes(follow.user_login) ? (
            <div key={i}>
              {follow.user_name}
              <span className="ml-4">{follow.viewer_count}</span>
              <button className="ml-4" onClick={() => join(follow.user_login)}>
                Join
              </button>
            </div>
          ) : (
            globalState.store.joinedChannels?.includes(follow.user_login) && (
              <div key={i}>
                {follow.user_name}
                <span className="ml-4">{follow.viewer_count}</span>
                <button className="ml-4" onClick={() => part(follow.user_login)}>
                  Leave
                </button>
              </div>
            )
          )
          return html
        })}
      </div> */}


      {/* View Multiple */}
      <div>
        {globalState.store.joinedChannels?.map((channel: string) => {
          return <ChatWindow key={channel} channel={channel} messages={globalState.store.channels[channel]?.messages ? globalState.store.channels[channel]?.messages : []} />
        })}
      </div>
    </section>
  )
})

export default Main

type ChatWindowProps = {
  channel: string
  messages: string[]
}

const ChatWindow = (props: ChatWindowProps) => {
  // const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)

  return (
    <section>
      {props.channel}
      <Virtuoso
        key={props.channel}
        style={{ height: "200px", backgroundColor: 'black' }}
        totalCount={props.messages?.length ? props.messages?.length : 0}
        itemContent={(index) => {
          return (
            <div key={index}>
              {index} {props.messages[index] && props.messages[index]}
            </div>
          )
        }}
      />
    </section>
  )
}
