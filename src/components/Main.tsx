import set from "lodash-es/set"
import { useRef, useEffect, useReducer, createContext, useState } from "react"
import tmi from "tmi.js"
import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import { ClientCredentialsAuthProvider, StaticAuthProvider } from "@twurple/auth"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { useLocation } from "react-router"
import { ApiClient, HelixPrivilegedUser } from "@twurple/api"
import { BreakpointLayouts, globalState, HelixCustomFollow, IGlobalState } from "../services/GlobalState"
import { observer } from "mobx-react-lite"
/* React Grid Layout */
import GridLayout, { Layout, Responsive, WidthProvider } from "react-grid-layout"
import { generateAccessTokenURL, generateNonce, getStreamsFollowed } from "../services/TwitchAPI"
import { clientId } from "../environment/environment"
import { urlHash2Obj } from "../util/util"
import React from "react"
const ResponsiveReactGridLayout = WidthProvider(Responsive)

type Channels = {
  [key: string]: {
    messages: string[]
  }
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
              globalState.store.megaMessages.push({ channel: channel, message: message })

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

          // Initialize MegaChat
          globalState.addLayout(globalState.store.MEGACHAT)
        }
      } catch (error) {
        console.error(error)
      }
    }

    main()
  }, [])

  const onBreakpointChange = (breakpoint: any, cols: any) => {
    // globalState.update({cols: cols})
    console.log(breakpoint, cols)
  }

  const onLayoutChange = (layouts: any) => {
    // console.log(layouts)
    // globalState.update({layouts: layouts})
    console.log(globalState.store.layouts)
  }

  return (
    <section>
      {globalState.store.name}
      {!globalState.store.access_token ? <a href={generateAccessTokenURL(generateNonce(4))}>Connect to Twitch</a> : ""}

      {/* MegaChat */}
      {/* <div>{globalState.store.follows ? <MegaChatWindow megaMessages={globalState.store.megaMessages}></MegaChatWindow> : ""}</div> */}

      {/* React Grid Layout */}
      <div>
        <ResponsiveReactGridLayout className="layout" layouts={globalState.store.layouts} breakpoints={globalState.store.breakpoints} cols={globalState.store.cols} onBreakpointChange={onBreakpointChange} onLayoutChange={onLayoutChange}>
          {/* <div key={globalState.store.MEGACHAT}>{globalState.store.follows ? <MegaChatWindow megaMessages={globalState.store.megaMessages}></MegaChatWindow> : ""}</div> */}

          {globalState.store.joinedChannels?.map((channel: string, i) => {
            return (
              <div key={channel}>
                <ChatWindow channel={channel} messages={globalState.store.channels[channel]?.messages ? globalState.store.channels[channel]?.messages : []} />
                {/* <ChatInput channel={channel}></ChatInput> */}
              </div>
            )
            // return <ChatWindow key={channel} channel={channel} messages={globalState.store.channels[channel]?.messages ? globalState.store.channels[channel]?.messages : []} />
          })}
        </ResponsiveReactGridLayout>
      </div>

      {/* View Multiple */}
      {/* <div>
        {globalState.store.joinedChannels?.map((channel: string) => {
          return <section key={channel}>
            <ChatWindow channel={channel} messages={globalState.store.channels[channel]?.messages ? globalState.store.channels[channel]?.messages : []} />
            <ChatInput channel={channel}></ChatInput>
          </section>
          // return <ChatWindow key={channel} channel={channel} messages={globalState.store.channels[channel]?.messages ? globalState.store.channels[channel]?.messages : []} />
        })}
      </div> */}
    </section>
  )
})

export default Main

type ChatWindowProps = {
  channel: string
  messages: string[]
}

type MegaChatWindowProps = {
  megaMessages: { channel: string; message: string }[]
}

/** Has combined channels' chat */
const MegaChatWindow = (props: MegaChatWindowProps) => {

  return (
    <Virtuoso
      style={{ backgroundColor: "darkgrey" }}
      totalCount={props.megaMessages?.length ? props.megaMessages?.length : 0}
      itemContent={(index) => {
        return (
          <div key={index}>
            {index} {props.megaMessages[index].message}
          </div>
        )
      }}
    />
  )
}

/** Holds single channel's chat. */
const ChatWindow = (props: ChatWindowProps) => {
  const virtuoso = useRef<VirtuosoHandle>(null);

  useEffect(() => {

    if (virtuoso.current) {
      virtuoso.current.scrollToIndex({
        index: props.messages.length - 1,
        align: "end",
        behavior: "auto"
      });
    }

  }, [virtuoso, props])


  return (
    <div style={{ height: "100%" }}>
      {/* <div style={{ display: 'flex', position: "absolute", width: '100%', top: '90%', zIndex: 9999, backgroundColor: "blue" }}>
        <div style={{margin: 'auto'}}>scroll to bottom</div>
      </div> */}
      <Virtuoso
        key={props.channel}
        ref={virtuoso}
        style={{ backgroundColor: "darkgrey" }}
        totalCount={props.messages?.length ? props.messages?.length : 0}
        itemContent={(index) => {
          return (
            <div key={index}>
              {index} {props.messages[index]}
            </div>
          )
        }}
      />
    </div>
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
    setMessage("")
  }

  return (
    <section style={{ height: "100%", width: "100%" }} key={props.channel}>
      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}></input>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => say(props.channel, message)}>
        Chat
      </button>
    </section>
  )
}
