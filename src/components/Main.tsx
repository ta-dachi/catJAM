import set from "lodash-es/set"
import { useRef, useEffect, useReducer, createContext, useState } from "react"
import tmi from "tmi.js"
import { Virtuoso } from "react-virtuoso"
import { ClientCredentialsAuthProvider, StaticAuthProvider } from "@twurple/auth"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { useLocation } from "react-router"
import { ApiClient, HelixPrivilegedUser } from "@twurple/api"
import { globalState, HelixCustomFollow, IGlobalState } from "../services/GlobalState"
import { observer } from "mobx-react-lite"
/* React Grid Layout */
import GridLayout from 'react-grid-layout';

//
const clientId: string = process.env.REACT_APP_CLIENT_ID as string
// const clientSecret: string = process.env.REACT_APP_SECRET as string
// const redirectUri: string = "https://192.168.1.14:3000/chat"
const redirectUri: string = process.env.REACT_APP_REDIRECT_URI as string
// const scope: string[] = ["chat:read", "user_read", "user:read:follows"]
// const scopeUri: string = "chat%3Aread+user_read+user:read:follows+chat:edit"
const scopeUri: string = process.env.REACT_APP_SCOPE_URI as string
console.log(scopeUri)
console.log(redirectUri)
//
const OAUTH_URL: string = "https://id.twitch.tv/oauth2/" // Change this if twitch's API changes
// const OAUTH_REVOKE: string = "revoke"
const OAUTH_AUTHORIZE: string = "authorize"
// const OAUTH_VALIDATE: string = "validate"
//
// const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret)

function generateNonce(stringLength: number) {
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

const layout = [
  {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
  {i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
  {i: 'c', x: 4, y: 0, w: 1, h: 2}
];

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
  // forceUpdate
  // const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)

  const hash = useLocation().hash.substr(1) // substr(1) removes the # from first element

  // componentDidMount()
  useEffect(() => {})

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

          globalState.initializeTmiClient(userMe.name, access_token)
          await globalState.client?.connect()

          console.log("Connected!")

          globalState.update({ connected: true })

          // DEBUG Leave all channels when restarting for debugging purposes
          globalState.client?.getChannels().map((channel) => {
            globalState.client?.part(channel)
          })

          globalState.client?.removeAllListeners()

          globalState.client?.addListener("message", (channel: string, tags, message: string) => {
            channel = channel.replace("#", "").toLowerCase()
            
            if (globalState.store.joinedChannels?.includes(channel)) {
              message = `[${channel}] {${tags["display-name"]}}: ${message}`

              // Add message to combined channel store
              globalState.store.megaMessages.push({channel: channel, message: message})

              // Add message to existing channel
              if (globalState.store.channels[channel]?.messages) {
                const length = globalState.store.channels[channel]?.messages.length
                // globalState.store.channels[channel].messages[length] = message
                // TODO Optimize this code
                let currentChannels = { ...globalState.store.channels }
                // Set the message
                currentChannels[channel].messages[length] = message
                globalState.update({ ...currentChannels })
              
              // Make a new key/value for channel
              } else {
                const newChannel: Channels = {}
                set(newChannel, [channel, "messages"], [message])
                // const currentChannels = {...globalState.store.channels }
                globalState.update({ channels: { ...globalState.store.channels, ...newChannel } })
              }
            }
          })
        }
      } catch (error) {
        console.error(error)
      }
    }

    main()
  }, [])

  return (
    <section>
      {globalState.store.name}
      {!globalState.store.access_token ? <a href={generateAccessTokenURL(generateNonce(4))}>Connect to Twitch</a> : ""}

      {/* MegaChat */}
      <div>
        {globalState.store.follows ? <MegaChatWindow megaMessages={globalState.store.megaMessages}></MegaChatWindow> : ''}
      </div>

      {/* React Grid Layout */}
      <div>
        <GridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
          <div style={{backgroundColor: 'red'}} key="a">a</div>
          <div style={{backgroundColor: 'blue'}} key="b">b</div>
          <div style={{backgroundColor: 'yellow'}}key="c">c</div>
        </GridLayout>
      </div>

      {/* View Multiple */}
      <div>
        {globalState.store.joinedChannels?.map((channel: string) => {
          return <section key={channel}>
            <ChatWindow channel={channel} messages={globalState.store.channels[channel]?.messages ? globalState.store.channels[channel]?.messages : []} />
            <ChatInput channel={channel}></ChatInput>
          </section>
          // return <ChatWindow key={channel} channel={channel} messages={globalState.store.channels[channel]?.messages ? globalState.store.channels[channel]?.messages : []} />
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

type MegaChatWindowProps = {
  megaMessages: {channel: string, message:string}[]
}

/** Has combined channels' chat */
const MegaChatWindow = (props: MegaChatWindowProps) => {
  return (
    <section>
      <Virtuoso
        style={{ height: "200px", backgroundColor: "turquoise", margin: "8px" }}
        totalCount={props.megaMessages?.length ? props.megaMessages?.length : 0}
        itemContent={(index) => {
          return (
            <div key={index}>
              {index} {props.megaMessages[index].message}
            </div>
          )
        }}
      />
    </section>
  )
}

/** Holds single channel's chat. */
const ChatWindow = (props: ChatWindowProps) => {
  // const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)

  return (
    <section>
      {props.channel}
      <Virtuoso
        key={props.channel}
        style={{ height: "200px", backgroundColor: "black" }}
        totalCount={props.messages?.length ? props.messages?.length : 0}
        itemContent={(index) => {
          return (
            <div key={index}>
              {index} {props.messages[index]}
            </div>
          )
        }}
      />
    </section>
  )
}

type ChatInputProps = {
  channel: string
}

/** Send chat to channel */
const ChatInput = (props: ChatInputProps) => {
  const [message, setMessage] = useState("")

  const say = async (channel: string, message: string) => {
    await globalState.client?.say(channel, message)
    setMessage('')
  }

  return (
    <section key={props.channel}>
      {props.channel}
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}></input>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => say(props.channel, message)}>Chat</button>
    </section>
  )
}
