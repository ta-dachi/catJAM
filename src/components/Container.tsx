import { set } from "lodash-es"
import { useEffect, useRef, useState } from "react"
import { Channels, globalState } from "../services/GlobalState"
// import { MenuSolid } from "@graywolfai/react-heroicons" // or
// import { accessGlobalState } from "./Main"

// type State = {
//   //
//   showMenu: boolean
// }

// const initialState: State = {
//   showMenu: false,
// }

const Container = () => {
  // const timeout = useRef(null)
  // const [state, setState] = useState(initialState)

  useEffect(() => {
    async function main() {
      console.log("Container Rendered")

      // if (timeout.current) {
      //   clearTimeout(timeout.current)
      //   timeout.current = undefined
      // }

      // timeout.current = setInterval(() => {
      //   console.log(accessGlobalState().get())
      // }, 3000)
    }

    main()
  }, [])

  const join = async (channel: string) => {
    try {
      channel = channel.replace("#", "").toLowerCase()
      console.log(channel)
      if (globalState.store.joinedChannels?.includes(channel)) {
        return
      }

      await globalState.client.join(channel)

      let channels: Channels = globalState.store.channels
      let joinedChannels = globalState.client.getChannels() ? globalState.client.getChannels() : []

      if (channels.messages) {
        set(channels, [channel, "messages"], [])
      }

      joinedChannels = joinedChannels
        .map((chan: string) => {
          chan = chan.replace("#", "").toLowerCase()
          return chan
        })
        .sort()

      globalState.update({joinedChannels: joinedChannels})

      // forceUpdate()
    } catch (error) {
      console.error(error)
    }
  }

  const part = async (channel: string) => {
    try {
      await globalState.client.part(channel)

      let joinedChannels = globalState.client.getChannels() ? globalState.client.getChannels() : []

      joinedChannels = joinedChannels
        .map((chan: string) => {
          chan = chan.replace("#", "").toLowerCase()
          return chan
        })
        .sort()

      globalState.update({joinedChannels: joinedChannels})
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className="flex lg:flex-row lg:w-60 lg:h-screen lg:bg-gray-500">
      <div className="mt-4">
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
      </div>
      </div>
    </div>
  )
}

export default Container
