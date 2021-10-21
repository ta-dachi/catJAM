# catJAM

A chat client for twitch.

## Getting Started
To develop, run:

```
  npm install
  ...
  ...
  npm run start
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
https://ionicframework.com/docs/components
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