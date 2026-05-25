import { create } from 'zustand'

const useChatStore = create((set, get) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  
  addMessage: (msg) => set({ messages: [...get().messages, msg] }),
  updateLastMessage: (text) => {
    const msgs = [...get().messages]
    if (msgs.length > 0) {
      msgs[msgs.length - 1] = {
        ...msgs[msgs.length - 1],
        content: msgs[msgs.length - 1].content + text,
      }
      set({ messages: msgs })
    }
  },
  setLoading: (bool) => set({ isLoading: bool }),
  toggleOpen: () => set({ isOpen: !get().isOpen }),
  reset: () => set({ messages: [], isOpen: false, isLoading: false }),
}))

export default useChatStore
