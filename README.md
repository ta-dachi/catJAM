# catJAM

A chat client for twitch.

## Getting Started
Requires a Twtich Developer account. Create a Developer Application that provides a client_id, client_secret, and a redirect_uri

For AWS Amplify & CI/CD, requires a AWS Account. See the amplify.example.yml and replace the amplify.yml with that.

Example Twitch API envrionmental variables: 

* REACT_APP_CLIENT_ID=39nae8... 
* REACT_APP_SECRET=fkgit...
* REACT_REDIRECT_URI=https://192.168.1.14:3000/chat"

To develop, run:

```
  npm install
  ...
  ...
 HTTPS=true npm run start
```

## TODOS
* Hit Enter to send message
* Auto scroll to the latest message
* Click button to scroll to the latest message if mid-scroll
* Sort channels by joined (Leaves go to the top)
* Remove chat from MegaChat from channels user has left
## Resources 

* ionic-react
  * Good support for PWAs, mobile and desktop based apps.
  * https://ionicframework.com/docs/components
* tmi.js
  * Best twitch chat lib available for javascript. Has typescript types too.
  * https://tmijs.com/
* twurple
  * Javascript wrapper around Twitch's helix library
  * https://github.com/twurple/twurple
* tailwind
  * Setting up tailwind, a full css utility framework with ionic-react. Uses CRA underneath so this should work.  
https://tailwindcss.com/docs/guides/create-react-app
* react-virutoso 
  * Virtual scrolling to handle 1000s of messages.
  * https://virtuoso.dev/hello/
* mobx
  * Global State Management
  * https://mobx.js.org/README.html