//
export const clientId: string = process.env.REACT_APP_CLIENT_ID as string
// const clientSecret: string = process.env.REACT_APP_SECRET as string
// const redirectUri: string = "https://192.168.1.14:3000/chat"
export const redirectUri: string = process.env.REACT_APP_REDIRECT_URI as string
// const scope: string[] = ["chat:read", "user_read", "user:read:follows"]
// const scopeUri: string = "chat%3Aread+user_read+user:read:follows+chat:edit"
export const scopeUri: string = process.env.REACT_APP_SCOPE_URI as string

export const OAUTH_URL: string = "https://id.twitch.tv/oauth2/" // Change this if twitch's API changes
// const OAUTH_REVOKE: string = "revoke"
export const OAUTH_AUTHORIZE: string = "authorize"