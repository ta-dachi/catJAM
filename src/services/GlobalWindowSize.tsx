import { action, autorun, makeAutoObservable, observable } from "mobx";

// UI
export type Breakpoint = 'sm' | 'md' | 'lg'  ;

const BreakpointSM: number = 375;
const BreakpointMD: number = 768;
// const BreakpointLG: number = 1024;

const getSizeAsBreakpoint = (size: number) => {
  if (size <= BreakpointSM) {
    return 'small';
  } else if (size <= BreakpointMD) {
    return 'medium';
  }
  return 'large';
};

class GlobalWindowSize {
  windowSize = {
    size: '',
    width: 0,
    height: 0
  }

  constructor() {
    makeAutoObservable(this, {
      windowSize: observable,
      getWindowSize: action
    })
    window.addEventListener('resize', this.handleResize);
    console.log('GlobalWindowSize created')
  }

  private handleResize = () => {
    this.windowSize.width = window.innerWidth
    this.windowSize.height = window.innerHeight
    const newSize = getSizeAsBreakpoint(window.innerWidth);
    if (!this.windowSize.size || this.windowSize.size !== newSize) {
      this.windowSize.size = newSize;
      console.log('Updating size to:', this.windowSize.size);
    }
  };

  getWindowSize() {
    return this.windowSize
  }
}

export const globalWindowSize = new GlobalWindowSize()
// export const GlobalStateContext = createContext<GlobalState>()

// Debug GlobalState on any changes
autorun(() => {
  console.log(globalWindowSize)
})
