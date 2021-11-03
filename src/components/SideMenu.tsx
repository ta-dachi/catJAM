import { set } from "lodash-es"
import { autorun } from "mobx"
import { observer } from "mobx-react-lite"
import { useContext, useEffect, useReducer, useRef, useState } from "react"
import { Channels, globalState, HelixCustomFollow } from "../services/GlobalState"

const SideMenu = observer(() => {
  const [, forceRender] = useReducer((x) => (x + 1) % 2, 0)

  useEffect(() => {
    async function main() {
      console.log("SideMenu Rendered")
    }

    // autorun(() => {
    //   console.log("inside autorun", globalState.store.follows);
    // });

    main()
  }, [])

  const join = async (channel: string) => {
    try {
      channel = channel.replace("#", "").toLowerCase()
      console.log(channel)
      if (globalState.store.joinedChannels?.includes(channel)) {
        return
      }

      await globalState.client?.join(channel)

      let channels: Channels = globalState.store.channels
      let joinedChannels = globalState.client?.getChannels() ? globalState.client?.getChannels() : []

      if (channels.messages) {
        set(channels, [channel, "messages"], [])
      }

      joinedChannels = joinedChannels
        .map((chan: string) => {
          chan = chan.replace("#", "").toLowerCase()
          return chan
        })
        .sort()
      console.log(channel)
      globalState.addLayout(channel)
      setTimeout(() => {
        globalState.update({ joinedChannels: joinedChannels })
      }, 200)

      console.log(globalState.store.layouts)
    } catch (error) {
      console.error(error)
    }
  }

  const part = async (channel: string) => {
    try {
      await globalState.client?.part(channel)

      let joinedChannels = globalState.client?.getChannels() ? globalState.client?.getChannels() : []

      joinedChannels = joinedChannels
        .map((chan: string) => {
          chan = chan.replace("#", "").toLowerCase()
          return chan
        })
        .sort()

      globalState.removeLayout(channel)
      setTimeout(() => {
        globalState.update({ joinedChannels: joinedChannels })
      }, 200)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <div className="mt-4">
        <div>Connected {globalState.store.connected && globalState.store.access_token ? "Yes" : "No"}</div>
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
                <button className="ml-4" key={follow.user_login} onClick={() => part(follow.user_login)}>
                  Leave
                </button>
              </div>
            )
          )
          return html
        })}
      </div>
    </div>
  )
})

export default SideMenu
