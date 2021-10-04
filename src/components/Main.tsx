import set from "lodash-es/set"
import { useRef, useState, useEffect } from "react"
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
}

const initialBigStore: BigStore = {
  followedChannels: ["retrogradetom"],
  joinedChannels: [],
  channels: {},
}

const initialSmallStore: SmallStore = {
  name: "kaurtube",
}

const Main = () => {
  const client = useRef(
    new tmi.client({
      options: { debug: false },
      // channels: [...props.channels],
    })
  )
  // let messages: string[] = []
  // const [name, setName] = useState("")
  // const [client, setClient] = useState(undefined)
  const [messages, setMessages] = useState(new Array<string>())
  const [bigStore, setBigStore] = useState(initialBigStore)
  const [smallStore, setSmallStore] = useState(initialSmallStore)

  // const messagesRefHook = useRef(messages)

  useEffect(() => {
    async function main() {
      await client.current.connect()

      console.log("Connected!")

      // setSmallStore({ name: "kaurtube" })

      client.current?.removeAllListeners()

      client.current?.addListener("message", (channel: string, tags, message: string, self) => {
        // console.log(message)
        channel = channel.replace("#", "")
        message = `[${channel}] {${tags["display-name"]}}: ${message}`

        console.log(message)

        if (bigStore.channels[channel]?.messages) {
          bigStore.channels[channel].messages.push(message)
        } else {
          set(bigStore.channels, [channel, "messages"], [])
          bigStore.channels[channel].messages.push(message)
        }

        setMessages((messages) => [...messages, message])
      })

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

  }, [messages])

  const join = async (channel: string) => {
    try {
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
        chan = chan.replace("#", "")
        return chan
      })
      console.log(newBigStore)
      setBigStore(newBigStore)
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

      newBigStore.joinedChannels = newBigStore.joinedChannels.map((channel) => {
        channel.replace("#", "")
        return channel
      })

      setMessages([])

      setBigStore(newBigStore)

      console.log(newBigStore)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      {/* <div>
        <label>
          First Name:
          <input className="ml-4" type="text" value={smallStore.name} onChange={(e) => setSmallStore({ name: e.target.value as string })} />
        </label>
        <button className="ml-4" onClick={() => join(smallStore.name)} value="Join">
          Join
        </button>
        <button className="ml-4" onClick={() => part(smallStore.name)} value="Leave">
          Leave
        </button>
      </div> */}

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

      <div className="mt-4">
        {messages.map((message: string, i: number) => {
          return <div key={i}>{message}</div>
        })}
      </div>
    </div>
  )
}

export default Main