import { useState, useRef, useEffect } from 'react'
import { Send, Pizza, Loader2, RotateCcw, X, MessageCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import useChatStore from '@/store/chat.store'
import { streamChatMessage } from '@/services/chat'
import { cn } from '@/lib/utils'

const ChatWidget = () => {
  const {
    messages,
    isOpen,
    isLoading,
    addMessage,
    updateLastMessage,
    setLoading,
    toggleOpen,
    reset,
  } = useChatStore()
  const [input, setInput] = useState('')
  const [showGreeting, setShowGreeting] = useState(false)
  const messagesEndRef = useRef(null)

  // Show greeting bubble after a short delay (once per session)
  useEffect(() => {
    if (sessionStorage.getItem('pierush-chat-greeted')) return
    const timer = setTimeout(() => {
      setShowGreeting(true)
      sessionStorage.setItem('pierush-chat-greeted', '1')
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Hide greeting when chat opens
  useEffect(() => {
    if (isOpen) setShowGreeting(false)
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      // small delay so the DOM renders before scrolling
      setTimeout(scrollToBottom, 50)
    }
  }, [messages, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    addMessage(userMessage)
    setInput('')
    setLoading(true)

    // Add an empty assistant message that we'll stream into
    addMessage({ role: 'assistant', content: '' })

    try {
      const conversation = [...messages, userMessage]
      for await (const chunk of streamChatMessage(conversation)) {
        updateLastMessage(chunk)
      }
    } catch (error) {
      console.error('Chat error:', error)
      // If the assistant message is still empty, replace it
      const currentMessages = useChatStore.getState().messages
      const lastMsg = currentMessages[currentMessages.length - 1]
      if (lastMsg?.role === 'assistant' && !lastMsg.content) {
        updateLastMessage(
          "Sorry, I'm having trouble right now. Please try again in a moment!"
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Greeting bubble ──────────────────────────────── */}
      {showGreeting && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex items-end gap-3 animate-in fade-in slide-in-from-bottom-5 zoom-in-95 duration-500">
          <div
            className="relative cursor-pointer rounded-2xl border border-border bg-card px-5 py-4 shadow-2xl w-[300px]"
            onClick={() => {
              setShowGreeting(false)
              toggleOpen()
            }}
          >
            <p className="text-base font-semibold text-foreground leading-snug">
              Hey! 🍕 Craving something delicious?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask me about our menu, today's deals, or get help with your order!
            </p>
            {/* tail */}
            <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-border bg-card" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowGreeting(false)
            }}
            className="mb-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* ── Floating trigger button ───────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* pulsing ring to draw the eye (only when greeting is visible) */}
        {showGreeting && !isOpen && (
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        )}
        <Button
          onClick={toggleOpen}
          size="icon"
          className={cn(
            'relative h-14 w-14 rounded-full shadow-lg transition-transform duration-200 hover:scale-105',
            isOpen && 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          {isOpen ? (
            <X className="size-6" />
          ) : (
            <MessageCircle className="size-6" />
          )}
        </Button>
      </div>

      {/* ── Chat popup ────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[370px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20 ring-2 ring-primary-foreground/30">
                <Pizza className="size-5 text-primary-foreground" />
              </span>
              <div className="leading-tight">
                <p className="font-semibold text-primary-foreground">PieRush</p>
                <p className="text-xs text-primary-foreground/70">
                  {isLoading ? 'Typing…' : 'Online'}
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="rounded-md p-1.5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              title="New conversation"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex h-[380px] flex-col gap-4 overflow-y-auto p-4">
            {/* Welcome message (always visible) */}
            {messages.length === 0 && (
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Pizza className="size-3.5 text-primary" />
                </span>
                <p className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
                  Hey there! 👋 I'm the PieRush assistant. Ask me about our
                  menu, prices, or anything pizza-related!
                </p>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user'
              // Skip rendering empty assistant message (shown as loading below)
              if (!isUser && !msg.content && isLoading) return null
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex gap-3',
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {!isUser && (
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
                      <Pizza className="size-3.5 text-primary" />
                    </span>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      isUser
                        ? 'rounded-tr-sm bg-primary text-primary-foreground whitespace-pre-wrap'
                        : 'rounded-tl-sm bg-muted text-foreground chat-markdown'
                    )}
                  >
                    {isUser ? (
                      msg.content
                    ) : (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && messages[messages.length - 1]?.content === '' && (
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Pizza className="size-3.5 text-primary" />
                </span>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Thinking…
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border bg-background px-3 py-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask about our menu…"
              className="flex-1 bg-transparent px-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon-sm"
              disabled={isLoading || !input.trim()}
              className="shrink-0 rounded-full"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatWidget
