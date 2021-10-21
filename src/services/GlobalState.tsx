import { ApiClient, HelixPrivilegedUser } from "@twurple/api/lib"
import { StaticAuthProvider } from "@twurple/auth/lib"
import { makeObservable, observable, action, autorun, makeAutoObservable } from "mobx"
import tmi from "tmi.js"
import { createContext } from "vm"

// Chat
export type Channels = {
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
  name: string | null
  connected: boolean

  // Auth
  access_token: string | null
  authProvider: StaticAuthProvider | null
  apiClient: ApiClient | null
  userMe: HelixPrivilegedUser | null
  follows: HelixCustomFollow[] | null

  // SideMenu
  showMenu: boolean
}

class GlobalState {
  client: tmi.Client | null = null
  store: IGlobalState = {
    // Chat
    joinedChannels: [],
    channels: {},
    token: {},
    name: null,
    connected: false,

    // Auth
    access_token: null,
    authProvider: null,
    apiClient: null,

    userMe: null,
    follows: null,

    // SideMenu
    showMenu: false,
  }

  constructor() {
    makeAutoObservable(this, {
      store: observable,
      update: action,
    })
    console.log('GlobalState created')
  }

  initializeTmiClient(username: string, password: string, channels: string[] = []) {
    this.client = new tmi.client({
      // @ts-ignore
      options: { debug: false, skipMembership: true },
      identity: {
        username: username,
        password: password,
      },
      channels: channels
    })

    this.client.setMaxListeners(1)
  }

  update(newStore: Partial<IGlobalState>) {
    this.store = {...this.store, ...newStore}
  }
}

export const globalState = new GlobalState()