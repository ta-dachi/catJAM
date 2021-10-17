import { ApiClient, HelixPrivilegedUser } from "@twurple/api/lib"
import { StaticAuthProvider } from "@twurple/auth/lib"
import { makeObservable, observable, action, autorun, makeAutoObservable } from "mobx"
import tmi from "tmi.js"

type Channels = {
  [key: string]: {
    messages: string[]
  }
}

export interface HelixCustomFollow {
  id: string
  user_id: string
  user_login: string
  user_name: string
  game_id: string
  game_name: string
  type: string
  title: string
  viewer_count: number
  started_at: Date
  language: string
  thumbnail_url: string
  tag_ids: string[]
  is_mature: boolean
}

export type IGlobalState = {
  // Chat
  joinedChannels: string[] | undefined
  channels: Channels
  token: {}
  name: string
  connected: boolean

  // Auth
  access_token: string
  authProvider: StaticAuthProvider | null
  apiClient: ApiClient | null
  userMe: HelixPrivilegedUser | null
  follows: HelixCustomFollow[] | null

  // Container
  showMenu: boolean
}

class GlobalState {
  client = new tmi.client({
    // @ts-ignore
    options: { debug: false, skipMembership: true },
    // channels: [...props.channels],
  })
  
  store: IGlobalState = {
    // Chat
    joinedChannels: [],
    channels: {},
    token: {},
    name: "",
    connected: false,

    // Auth
    access_token: "",
    authProvider: null,
    apiClient: null,

    userMe: null,
    follows: null,

    // Container
    showMenu: false,
  }

  constructor() {
    makeAutoObservable(this, {
      store: observable,
      update: action,
    })
  }

  update(newStore: Partial<IGlobalState>) {
    this.store = {...this.store, ...newStore}
  }
}

export const globalState = new GlobalState()
// export const GlobalStateContext = createContext<GlobalState>()

// Debug GlobalState on any changes
autorun(() => {
  console.log(globalState)
})
