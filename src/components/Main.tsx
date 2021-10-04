import set from "lodash-es/set"
import { useRef, useState, useEffect, useReducer } from "react"
import tmi from "tmi.js"

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
  followedChannels: ["retrogradetom", "veryDave"],
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
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
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
        console.log(`[${channel}] {${tags["display-name"]}}: ${message}`)
        console.log(bigStore.joinedChannels.includes(channel))
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

      newBigStore.joinedChannels = newBigStore.joinedChannels.map((chan) => {
        chan = chan.replace("#", "").toLowerCase()
        return chan
      }).sort()

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

      newBigStore.joinedChannels = newBigStore.joinedChannels.map((chan) => {
        chan = chan.replace("#", "").toLowerCase()
        return chan
      }).sort()

      // setMessages([])

      setBigStore(() => newBigStore)

      console.log(newBigStore)

      forceUpdate()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className="mt-4">Connected {smallStore.connected ? "Yes" : "No"}</div>

      <div className="mt-4">
        {bigStore.followedChannels.map((channel: string, i: number) => {
          return (
            <div key={i}>
              {channel}
              <button className="ml-4" onClick={() => join(channel)}>
                Join
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-4">
        {bigStore.joinedChannels.map((channel: string, i: number) => {
          return (
            <div key={i}>
              {channel}
              <button className="ml-4" onClick={() => part(channel)}>
                Leave
              </button>
            </div>
          )
        })}
      </div>

      {/* <div className="mt-4">
        {messages.map((message: string, i: number) => {
          return <div key={i}>{message}</div>
        })}
      </div> */}

      <div className="mt-4">
        {Object.keys(bigStore.channels).map((channel) => {
          return bigStore.channels[channel]?.messages.map((message, i) => {
            if (bigStore.joinedChannels.includes(channel)) {
              return <div key={i}>{message}</div>
            }
          })
        })}
      </div>
    </div>
  )
}

export default Main
