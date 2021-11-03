import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { clientId, OAUTH_AUTHORIZE, OAUTH_URL, redirectUri, scopeUri } from "../environment/environment"
import { HelixCustomFollow } from "./GlobalState"

/** Gets streams followed by user, pass cursor to after for next */
export const getStreamsFollowed = async (access_token: string, client_id: string, user_id: string, after: string = ""): Promise<AxiosResponse<{ data: HelixCustomFollow[]; pagination: any }>> => {
  const url = "https://api.twitch.tv/helix/streams/followed"
  const config: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Client-id": client_id,
    },
    params: {
      user_id: user_id,
      after: after,
    },
  }
  return axios.get(url, config)
}

/**
 * Generate a Twitch login URL to get a access token.
 *
 * @param nonce
 */
export function generateAccessTokenURL(nonce?: string) {
  return `${OAUTH_URL}${OAUTH_AUTHORIZE}
?client_id=${clientId}
&redirect_uri=${redirectUri}
&response_type=token
&scope=${scopeUri}
&nonce=${nonce}`
}

export function generateNonce(stringLength: number) {
  var randomString = "" // Empty value of the selective variable
  const allCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" // listing of all alpha-numeric letters
  while (stringLength--) {
    randomString += allCharacters.substr(Math.floor(Math.random() * allCharacters.length + 1), 1) // selecting any value from allCharacters varible by using Math.random()
  }
  return randomString // returns the generated alpha-numeric string
}

