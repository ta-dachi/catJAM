import { ApiClient, HelixPrivilegedUser } from "@twurple/api/lib"
import { StaticAuthProvider } from "@twurple/auth/lib"
import { makeObservable, observable, action, autorun, makeAutoObservable } from "mobx"
import { Layout } from "react-grid-layout"
import tmi from "tmi.js"
import { createContext } from "vm"
import { clientId } from "../environment/environment"
import { getStreamsFollowed } from "./TwitchAPI"

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

export type BreakpointLayouts = {
  lg: Layout[]
  md: Layout[]
  sm: Layout[]
  xs: Layout[]
  xxs: Layout[]
}

export type IGlobalState = {
  // Chat
  joinedChannels: string[] | undefined
  channels: Channels
  token: {}
  name: string | null
  connected: boolean

  // Twitch
  getFollowsInterval: NodeJS.Timeout | null

  // Combined Mega Chat
  //** Combined messages of all channels joined */
  /** Megachat key */
  MEGACHAT: string
  megaMessages: { channel: string; message: string }[]

  /* React Grid Layout */
  layouts: BreakpointLayouts
  breakpoints: { lg: 1200; md: 996; sm: 768; xs: 480; xxs: 0 }
  cols: { lg: 12; md: 10; sm: 6; xs: 4; xxs: 2 }
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

    // Twitch
    getFollowsInterval: null,

    // Combined Mega Chat
    //** Combined messages of all channels joined */
    MEGACHAT: "MegaChat",
    megaMessages: [],

    /* React Grid Layout */
    layouts: {
      lg: [],
      md: [],
      sm: [],
      xs: [],
      xxs: [],
    },
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },

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

    this.store.getFollowsInterval = setInterval(async () => {
      const follows = (await getStreamsFollowed(this.store.access_token ?? "", clientId ?? "", this.store.userMe?.id ?? "")).data.data
      this.update({ follows: follows })
    }, 5000)

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
  createDefaultLayout(key: string, breakpoint: "lg" | "md" | "sm" | "xs" | "xxs"): Layout {
    return {
      i: key,
      x: this.store.layouts[breakpoint].length % (this.store.cols[breakpoint] || 12),
      y: Infinity,
      // minH: 6,
      // minW: 6,
      // x: 0,
      // y: 0,
      w: 2,
      h: 2,
    } as Layout
  }

  createDefaultLayoutAllBreakpoints(key: string): BreakpointLayouts {
    const layouts = {
      lg: [...this.store.layouts.lg, this.createDefaultLayout(key, "lg")],
      md: [...this.store.layouts.md, this.createDefaultLayout(key, "md")],
      sm: [...this.store.layouts.sm, this.createDefaultLayout(key, "sm")],
      xs: [...this.store.layouts.xs, this.createDefaultLayout(key, "xs")],
      xxs: [...this.store.layouts.xxs, this.createDefaultLayout(key, "xxs")],
    }

    return layouts
  }

  addLayout(key: string) {
    const newLayouts = this.createDefaultLayoutAllBreakpoints(key)
    this.update({ layouts: newLayouts })
  }

  removeLayout(key: string) {
    const lg = this.store.layouts.lg.filter((layout) => layout.i !== key)
    const md = this.store.layouts.md.filter((layout) => layout.i !== key)
    const sm = this.store.layouts.sm.filter((layout) => layout.i !== key)
    const xs = this.store.layouts.xs.filter((layout) => layout.i !== key)
    const xxs = this.store.layouts.xxs.filter((layout) => layout.i !== key)

    // TODO
    const newLayout = {
      lg: lg,
      md: md,
      sm: sm,
      xs: xs,
      xxs: xxs,
    }
    this.update({ layouts: newLayout })
  }
}

export const globalState = new GlobalState()
