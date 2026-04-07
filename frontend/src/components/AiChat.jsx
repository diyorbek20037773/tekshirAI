import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, Loader2 } from 'lucide-react'

export default function AiChat({ telegramId, submissionId, problemNumber, topic }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([
    "Bu mavzuni tushuntir",
    "Hayotiy misol ber",
    "Masala ber",
  ])
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const userInteracted = useRef(false)

  useEffect(() => {
    if (userInteracted.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [messages])

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return
    userInteracted.current = true

    const userMsg = { role: 'student', text: text.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
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
          history: updated.slice(-10),
          topic: topic || null,
        }),
      })

      const data = await res.json()
      setMessages([...updated, { role: 'ai', text: data.reply || 'Javob olib bo\'lmadi' }])
      if (data.suggestions?.length) setSuggestions(data.suggestions)
    } catch {
      setMessages([...updated, { role: 'ai', text: 'Server bilan aloqa yo\'q. Qayta urinib ko\'ring.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-primary-500 px-4 py-3 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-white" />
        <span className="text-sm font-semibold text-white">AI o'qituvchi</span>
      </div>

      {/* Xabarlar */}
      <div className="h-72 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🤖</div>
            <p className="text-sm text-gray-500">Savolingizni yozing</p>
            <p className="text-xs text-gray-400 mt-1">Masalan: "Kasrlarni tushuntir"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'student'
                ? 'bg-primary-500 text-white rounded-br-md'
                : 'bg-white border border-gray-200 text-gray-700 rounded-bl-md shadow-sm'
            }`}>
              {msg.role === 'ai' && <span className="text-[10px] text-primary-500 font-semibold block mb-1">🤖 AI o'qituvchi</span>}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
              <span className="text-xs text-gray-400">Javob tayyorlanmoqda...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Tezkor tugmalar */}
      <div className="px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-gray-100 bg-white">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => sendMessage(s)} disabled={loading}
            className="flex-shrink-0 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-medium hover:bg-primary-100 active:bg-primary-200 transition disabled:opacity-50 whitespace-nowrap">
            {s}
          </button>
        ))}
      </div>

      {/* Input — Telegram Mini App uchun optimallashtirilgan */}
      <div className="flex gap-2 p-3 border-t border-gray-100 bg-white">
        <input
          type="text"
          inputMode="text"
          enterKeyHint="send"
          autoComplete="off"
          autoCorrect="off"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }}}
          placeholder="Savolingizni yozing..."
          disabled={loading}
          className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50 appearance-none"
          style={{ fontSize: '16px' }}
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="px-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 active:bg-primary-700 transition disabled:opacity-40 flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
