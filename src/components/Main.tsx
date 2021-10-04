import set from "lodash-es/set"
import { useRef, useState, useEffect, useReducer } from "react"
import tmi from "tmi.js"
import { Virtuoso } from "react-virtuoso"

type BigStore = {
  //
  followedChannels: string[]
  joinedChannels: string[]
  channels: {
    [key: string]: {
      messages: string[]
    }
  }
}

type SmallStore = {
  //
  name: string
  connected: boolean
}

const initialBigStore: BigStore = {
  followedChannels: ["goati_", "werster"],
  joinedChannels: [],
  channels: {},
}

const initialSmallStore: SmallStore = {
  name: "kaurtube",
  connected: false,
}

const Main = () => {
  const client = useRef(
    new tmi.client({
      // @ts-ignore
      options: { debug: false, skipMembership: true },
      // channels: [...props.channels],
    })
  )
  // let messages: string[] = []
  // const [name, setName] = useState("")
  // const [client, setClient] = useState(undefined)
  // const [messages, setMessages] = useState(new Array<string>())
  const [bigStore, setBigStore] = useState(initialBigStore)
  const [smallStore, setSmallStore] = useState(initialSmallStore)
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)
  // const messagesRefHook = useRef(messages)

  // componentDidMount()
  useEffect(() => {
    async function main() {
      // await client.current.disconnect()
      await client.current.connect()

      let newSmallStore = smallStore
      smallStore.connected = true
      setSmallStore(() => newSmallStore)

      // setSmallStore({ name: "kaurtube" })
      client.current?.removeAllListeners()

      client.current?.addListener("message", (channel: string, tags, message: string, self) => {
        channel = channel.replace("#", "").toLowerCase()

        if (bigStore.joinedChannels.includes(channel)) {
          // console.log(message)
          // channel = channel.replace("#", "").toLowerCase()
          message = `[${channel}] {${tags["display-name"]}}: ${message}`

          console.log(message)
          let newBigStore = bigStore
          if (newBigStore.channels[channel]?.messages) {
            newBigStore.channels[channel].messages = [...newBigStore.channels[channel].messages, message]
          } else {
            set(newBigStore.channels, [channel, "messages"], [])
            newBigStore.channels[channel].messages = [...newBigStore.channels[channel].messages, message]
          }

          // let newMessages = messages
          // newMessages.push(message)
          // setMessages(() => newMessages)
          console.log(newBigStore)
          // setMessages(() => [...messages, message])
          setBigStore(() => newBigStore)

          forceUpdate()
        }
      })

      forceUpdate()
    }

    main()
  }, [])

  useEffect(() => {
    // client?.current.once("message", (channel: string, tags, message: string, self) => {
    //   channel = channel.replace("#", "")
    //   console.log(message)
    //   // messagesRefHook.current = [...messages, message]
    //   // console.log(messagesRefHook.current)
    //   // if (messagesRefHook.current) {
    //   //   console.log(messagesRefHook)
    //   //   console.log(messagesRefHook.current)
    //   //   // messages = [...messages, message]
    //   setMessages((messages) => [...messages, message])
    //   console.log(messages)
    //   // } else {
    //   //   //
    //   //   console.log(messagesRefHook)
    //   //   console.log(messagesRefHook.current)
    //   // }
    // })
    // client.current?.once("message", (channel: string, tags, message: string, self) => {
    //   // console.log(message)
    //   channel = channel.replace("#", "")
    //   message = `[${channel}] {${tags["display-name"]}}: ${message}`
    //   console.log(message)
    //   if (bigStore.channels[channel]?.messages) {
    //     bigStore.channels[channel].messages.push(message)
    //   } else {
    //     set(bigStore.channels, [channel, "messages"], [])
    //     bigStore.channels[channel].messages.push(message)
    //   }
    //   setMessages((messages) => [...messages, message])
    // })
  }, [])

  const join = async (channel: string) => {
    try {
      channel = channel.replace("#", "").toLowerCase()
      console.log(channel)
      if (bigStore.joinedChannels.includes(channel)) {
        return
      }

      await client?.current.join(channel)

      let newBigStore = bigStore

      newBigStore.joinedChannels = client?.current.getChannels() ? client?.current.getChannels() : []

      if (!newBigStore.channels[channel]?.messages) {
        set(newBigStore.channels, [channel, "messages"], [])
      }

      newBigStore.joinedChannels = newBigStore.joinedChannels
        .map((chan) => {
          chan = chan.replace("#", "").toLowerCase()
          return chan
        })
        .sort()

      console.log(newBigStore)
      setBigStore(() => newBigStore)

      forceUpdate()
    } catch (error) {
      console.error(error)
    }
  }

  const part = async (channel: string) => {
    try {
      console.log(bigStore)
      await client?.current.part(channel)

      let newBigStore = bigStore

      newBigStore.joinedChannels = client?.current.getChannels() ? client?.current.getChannels() : []

      newBigStore.joinedChannels = newBigStore.joinedChannels
        .map((chan) => {
          chan = chan.replace("#", "").toLowerCase()
          return chan
        })
        .sort()

      setBigStore(() => newBigStore)

      console.log(newBigStore)

      forceUpdate()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <section>
      <div className="mt-4">Connected {smallStore.connected ? "Yes" : "No"}</div>

      <div className="mt-4">
        {bigStore.followedChannels.map((channel: string, i: number) => {
          const html = !bigStore.joinedChannels.includes(channel) ? (
            <div key={i}>
              {channel}
              <button className="ml-4" onClick={() => join(channel)}>
                Join
              </button>
            </div>
          ) : (
            bigStore.joinedChannels.includes(channel) && (
              <div key={i}>
                {channel}
                <button className="ml-4" onClick={() => part(channel)}>
                  Leave
                </button>
              </div>
            )
          )
          return html
        })}
      </div>

      {/* <div className="mt-4">
        {Object.keys(bigStore.channels).map((channel) => {
          return bigStore.channels[channel]?.messages.map((message, i) => {
            if (bigStore.joinedChannels.includes(channel)) {
              return <div key={i}>{message}</div>
            }
          })
        })}
      </div> */}

      {/* View chosen */}

      {/* View Multiple */}
      {/* <div>
        {Object.keys(bigStore.channels).map((channel) => {
          return (
            <Virtuoso
              key={channel}
              style={{ height: "200px" }}
              totalCount={bigStore.channels[channel]?.messages.length}
              itemContent={(index) => {
                return (
                  <div key={index}>
                    {index} {bigStore.channels[channel].messages[index]}
                  </div>
                )
                // return bigStore.channels[channel]?.messages.map((message, i) => {
                //   if (bigStore.joinedChannels.includes(channel)) {

                //   }
                // })
              }}
            />
          )
        })}
      </div> */}

      <div>
        {Object.keys(bigStore.channels).map((channel) => {
          return (
            <ChatWindow key={channel} channel={channel} messages={bigStore.channels[channel].messages}/>
          )
        })}
      </div>
    </section>
  )
}

export default Main

type ChatWindowProps = {
  channel: string
  messages: string[]
}

const ChatWindow = (props: ChatWindowProps) => {
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0)

  return (
    <section>
      <Virtuoso
        key={props.channel}
        style={{ height: "200px" }}
        totalCount={props.messages.length}
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
