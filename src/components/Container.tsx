import { useEffect, useRef, useState } from "react"
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

  return (
    <div>
      <div className="flex lg:flex-row lg:w-52 lg:h-screen lg:bg-white">Container</div>
    </div>
  )
}

export default Container
