import { useEffect, useState } from "react"
import { MenuSolid } from "@graywolfai/react-heroicons" // or

type State = {
  //
  showMenu: boolean
}

const initialState: State = {
  showMenu: false,
}

const Container = () => {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    async function main() {
      console.log("test")
    }

    main()
  }, [])

  return (
    <div>
      <div className="flex lg:flex-row lg:w-52 lg:h-screen lg:bg-white">
        asfasd
      </div>
    </div>
  )
}

export default Container
