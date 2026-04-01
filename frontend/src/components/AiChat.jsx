import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, Loader2 } from 'lucide-react'

/**
 * AI Chat komponenti — o'quvchi masala/mavzu haqida AI bilan suhbatlashadi.
 * Props:
 *   telegramId — o'quvchining telegram ID
 *   submissionId — (ixtiyoriy) oxirgi submission ID
 *   problemNumber — (ixtiyoriy) masala raqami
 *   topic — (ixtiyoriy) mavzu nomi
 *   initialMessage — (ixtiyoriy) boshlang'ich xabar
 */
export default function AiChat({ telegramId, submissionId, problemNumber, topic, initialMessage }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([
    "Bu mavzuni tushuntir",
    "Hayotiy misol ber",
    "Shunga o'xshash masala ber",
  ])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return

    const userMsg = { role: 'student', text: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: Number(telegramId) || 0,
          submission_id: submissionId || null,
          problem_number: problemNumber || null,
          message: text.trim(),
          history: newMessages.slice(-10), // Oxirgi 10 ta xabar
          topic: topic || null,
        }),
      })

      const data = await res.json()
      const aiMsg = { role: 'ai', text: data.reply || 'Javob olib bo\'lmadi' }
      setMessages([...newMessages, aiMsg])

      if (data.suggestions) {
        setSuggestions(data.suggestions)
      }
    } catch (err) {
      setMessages([...newMessages, {
        role: 'ai',
        text: 'Server bilan aloqa yo\'q. Qayta urinib ko\'ring.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-primary-500 px-4 py-3 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-white" />
        <h3 className="text-sm font-semibold text-white">AI o'qituvchi</h3>
        <span className="text-[10px] text-primary-100 ml-auto">Savolingizni bering</span>
      </div>

      {/* Xabarlar */}
      <div className="h-64 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400">Savolingizni yozing yoki tezkor tugmalardan foydalaning</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
              msg.role === 'student'
                ? 'bg-primary-500 text-white rounded-br-sm'
                : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm'
            }`}>
              {msg.role === 'ai' && <span className="text-xs text-primary-500 font-medium block mb-1">🤖 AI</span>}
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl rounded-bl-sm">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Tezkor tugmalar */}
      <div className="px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-gray-100">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => sendMessage(s)} disabled={loading}
            className="flex-shrink-0 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-medium hover:bg-primary-100 transition disabled:opacity-50">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-gray-100">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Savolingizni yozing..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:opacity-50"
        />
        <button type="submit" disabled={!input.trim() || loading}
          className="px-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition disabled:opacity-40">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
