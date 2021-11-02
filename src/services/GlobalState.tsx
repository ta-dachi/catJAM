import { ApiClient, HelixPrivilegedUser } from "@twurple/api/lib"
import { StaticAuthProvider } from "@twurple/auth/lib"
import { makeObservable, observable, action, autorun, makeAutoObservable } from "mobx"
import { Layout } from "react-grid-layout"
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

  // Combined Mega Chat
  //** Combined messages of all channels joined */
  /** Megachat key */
  MEGACHAT: string
  megaMessages: { channel: string; message: string }[]

  /* React Grid Layout */
  layout: Layout[]

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

    // Combined Mega Chat
    //** Combined messages of all channels joined */
    MEGACHAT: "MegaChat",
    megaMessages: [],

    /* React Grid Layout */
    layout: [],

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
    console.log("GlobalState created")
  }

  initializeTmiClient(username: string, password: string, channels: string[] = []) {
    this.client = new tmi.client({
      // @ts-ignore
      options: { debug: false, skipMembership: true },
      identity: {
        username: username,
        password: password,
      },
      channels: channels,
    })

    this.client.setMaxListeners(1)
  }

  update(newStore: Partial<IGlobalState>) {
    this.store = { ...this.store, ...newStore }
  }

  /* React Grid Layout */
  createDefaultLayout(key: string): Layout {
    return { i: key, x: 0, y: 0, w: 4, h: 5 } as Layout
  }

  addToLayout(key: string) {
    const newLayout = [...this.store.layout, this.createDefaultLayout(key)]
    this.update({ layout: newLayout })
  }

  removeLayout(key: string) {
    // TODO
  }
}

export const globalState = new GlobalState()
