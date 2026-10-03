// src/pages/MessagesPage.jsx — DMs. Conversation list on the left, live chat on the right. Owned by Person 1.
import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getConversations, listenToMessages, sendMessage } from '../firebase/api'
import { useUser } from './UserContext'

export default function MessagesPage() {
  const { userId } = useParams()        // the person I'm chatting with (if any)
  const [searchParams] = useSearchParams()
  const { user } = useUser()
  const [conversations, setConversations] = useState(null)
  const [chat, setChat] = useState({ userId: null, messages: [] })
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  // load the conversation list (and refresh it whenever we switch chats)
  useEffect(() => {
    getConversations().then(setConversations).catch((err) => setError(err.message))
  }, [userId])

  // live messages for the open chat
  useEffect(() => {
    if (!userId) return
    const unsubscribe = listenToMessages(userId, (msgs) => setChat({ userId, messages: msgs }))
    return unsubscribe
  }, [userId])

  // only show messages that belong to the chat that's open right now
  const messages = chat.userId === userId ? chat.messages : []

  // scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  const otherName =
    conversations?.find((c) => c.userId === userId)?.userName || searchParams.get('name') || 'Chat'

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim()) return
    setError('')
    const toSend = text
    setText('')
    try {
      await sendMessage(userId, toSend)
      // refresh the sidebar so a brand-new conversation shows up
      getConversations().then(setConversations).catch(() => {})
    } catch (err) {
      setError(err.message)
      setText(toSend)
    }
  }

  return (
    <div className="messages">
      <aside className="grove-card messages__list">
        <h2 className="grove-heading">Messages</h2>
        {!conversations && <p className="grove-muted">Loading…</p>}
        {conversations?.length === 0 && (
          <p className="grove-muted">No conversations yet. Open a project and click “Message owner”.</p>
        )}
        {conversations?.map((c) => (
          <Link
            key={c.userId}
            to={`/messages/${c.userId}`}
            className={`convo ${c.userId === userId ? 'is-active' : ''}`}
          >
            <strong>{c.userName}</strong>
            <span className="convo__last">{c.lastMessage}</span>
          </Link>
        ))}
      </aside>

      <section className="grove-card messages__chat">
        {!userId ? (
          <div className="empty">Pick a conversation to start chatting. 💬</div>
        ) : (
          <>
            <h2 className="grove-heading">{otherName}</h2>
            <div className="chat">
              {messages.length === 0 && <p className="grove-muted">Say hi! 👋</p>}
              {messages.map((m) => (
                <div key={m.id} className={`bubble ${m.fromId === user?.id ? 'bubble--me' : 'bubble--them'}`}>
                  {m.text}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form className="chat-form" onSubmit={handleSend}>
              <input
                className="grove-input"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="grove-button" type="submit" disabled={!text.trim()}>Send</button>
            </form>
          </>
        )}
        {error && <p className="grove-error">{error}</p>}
      </section>
    </div>
  )
}
