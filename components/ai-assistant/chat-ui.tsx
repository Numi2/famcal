"use client"

import { useState, useRef, useEffect } from "react"
import { Heart, Send, X, Loader2, ChevronUp, ChevronDown, Sparkles } from "lucide-react"
import { useChat } from "ai/react"

export default function FamilyCalendarAssistant({ familyId }: { familyId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/agent",
    body: {
      familyId,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi there! I'm your family calendar assistant! 👨‍👩‍👧‍👦 I'm here to help make your family life easier and more organized. I can help with scheduling events, finding free time slots, managing your family calendar, and so much more. What would you like to know about your family's schedule today?",
      },
    ],
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Quick action buttons for common calendar tasks
  const quickActions = [
    { label: "Today's Events", action: "What events do we have scheduled for today?" },
    { label: "Find Free Time", action: "Can you find a 2-hour free slot this week for a family activity?" },
    { label: "Schedule Event", action: "Help me schedule a dentist appointment for next week" },
    { label: "Week Overview", action: "Show me all our events for this week" },
  ]

  const handleQuickAction = (action: string) => {
    handleInputChange({ target: { value: action } } as any)
    handleSubmit({ preventDefault: () => {} } as any)
  }

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-8 right-8 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          <Heart className="h-7 w-7" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 z-20 w-[450px] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out">
          {/* Chat header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <h3 className="font-medium">Family Assistant</h3>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleExpand} className="p-1 hover:bg-white/20 rounded">
                {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </button>
              <button onClick={toggleChat} className="p-1 hover:bg-white/20 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick actions */}
          {isExpanded && (
            <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-100">
              <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="text-xs px-3 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left border border-gray-200"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {isExpanded && (
            <div className="h-[400px] overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium text-purple-600">Family AI</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white border border-gray-200 text-gray-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span className="text-xs font-medium text-purple-600">Family AI</span>
                    </div>
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Chat input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask about your family's schedule, meals, activities..."
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white disabled:from-gray-300 disabled:to-gray-400 hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Try asking: "Schedule a meeting for tomorrow at 2pm" or "Find free time this week"
            </p>
          </form>
        </div>
      )}
    </>
  )
}
