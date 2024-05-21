'use client'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'

import { useEffect, useState, useRef } from 'react'
import {
  BotMessageSquare,
  Minus,
  Bot,
  User,
  RotateCcw,
  MessageCircleQuestion,
  Send,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { useCompletion } from 'ai/react'
import { useLocalStorage } from 'usehooks-ts'
import Markdown from 'react-markdown'
import { usePathname } from 'next/navigation'
function Message({
  from,
  content,
  showCopy = true,
}: {
  from: 'me' | 'ai'
  content: string
  showCopy?: boolean
}) {
  const [copied, setCopied] = useState(false)
  async function copyToClipboard(text: string) {
    if ('clipboard' in navigator) {
      setCopied(true)
      await navigator.clipboard.writeText(text + '🤖')
      setTimeout(() => setCopied(false), 500)
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, x: from === 'me' ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: from === 'me' ? 50 : -50 }}
    >
      <div
        className={twMerge(
          'mb-2 flex w-full items-start gap-2',
          from === 'me' ? 'flex-row-reverse' : ''
        )}
      >
        <div
          className={twMerge(
            'group relative rounded-xl',
            from === 'me'
              ? 'rounded-br-sm border border-gray-200 text-gray-800 dark:border-gray-600' // from user
              : 'rounded-bl-sm bg-gray-50 text-gray-800 dark:bg-white/10 dark:text-white/90' // from bot
          )}
        >
          {from === 'ai' && showCopy && (
            <div className="flex items-center justify-between rounded-t-lg bg-gray-100 px-3 py-2 text-sm font-bold dark:bg-gray-600">
              <div className="flex items-center gap-2">
                <Bot size={16} />
                AI 小助手
              </div>
              <button
                onClick={() => copyToClipboard(content)}
                className="hover:opacity-75 active:opacity-100"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          )}
          <Markdown className="prose prose-sm break-all px-3 py-2 text-sm dark:prose-invert">
            {content}
          </Markdown>
        </div>
      </div>
    </motion.div>
  )
}
export default function GPTChat() {
  const filename = usePathname()
  const [show, setShow] = useState(false)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)

  const [messages, setMessages] = useLocalStorage<
    {
      content: string
      role: 'user' | 'assistant'
    }[]
  >(`speech-ai-messages-${filename}`, [])
  const { completion, input, setInput, isLoading, handleInputChange, handleSubmit } = useCompletion(
    {
      body: {
        filename,
        messages,
      },
    }
  )
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    setMessages(messages.concat({ role: 'user', content: input }))
    setInput('')
    return handleSubmit(e)
  }
  function sendDefaultMessage(message: string) {
    setInput(message)
    setTimeout(() => {
      submitButtonRef.current?.click()
    }, 100)
  }
  useEffect(() => {
    if (completion) {
      if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
        setMessages([...messages.slice(0, -1), { role: 'assistant', content: completion }])
      } else {
        setMessages([...messages, { role: 'assistant', content: completion }])
      }
    }
  }, [completion])
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages, show, isLoading])
  return show ? (
    <motion.div
      className="fixed bottom-4 right-4 w-[min(400px,calc(100vw-16px*2))] rounded-lg bg-gray-100 shadow-lg dark:bg-gray-700 dark:shadow-xl"
      key={1}
      layoutId="chat"
    >
      <motion.div className="flex items-center justify-between gap-4 p-1">
        <div className="flex items-center font-semibold">
          <motion.span className="p-2">
            <BotMessageSquare size={20} />
          </motion.span>
          AI 小助手
        </div>
        <div className="flex">
          <button
            className="rounded-full p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={() => setMessages([])}
          >
            <RotateCcw size={20} />
          </button>
          <button
            className="rounded-full p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={() => setShow(false)}
          >
            <Minus size={20} />
          </button>
        </div>
      </motion.div>
      <div
        className="h-[400px] overflow-y-scroll bg-white p-2 dark:bg-gray-800"
        ref={messageContainerRef}
      >
        <Message
          from="ai"
          content="你好，我是 AI 小助手，有什麼可以幫助你的嗎？"
          showCopy={false}
        />
        <AnimatePresence>
          {messages.map((m, index) => (
            <Message from={m.role === 'user' ? 'me' : 'ai'} content={m.content} key={index} />
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              className="flex flex-col gap-2 text-gray-800 dark:text-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {[
                `整理這頁的重點`,
                `提供相關的背景資訊`,
                `這頁的主要觀點是什麼`,
                '可以給我這個主題的詳細解釋嗎',
                '幫我生成一個這段內容的問答',
              ]
                .filter((x) => !messages.some((m) => m.content === x))
                .map((message, index) => (
                  <button
                    onClick={() => sendDefaultMessage(message)}
                    className="flex items-center gap-0.5 pl-3 text-left text-sm opacity-75 transition-all hover:gap-1 hover:opacity-100 active:opacity-50"
                    key={index}
                  >
                    {message}
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </button>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <form className="flex items-center justify-between gap-4" onSubmit={onSubmit}>
        <input
          className="w-full flex-1 border-transparent bg-transparent p-2 ring-0 focus:border-transparent focus:ring-transparent"
          value={input}
          onChange={handleInputChange}
          required
        />
        <button
          type="submit"
          className="mr-1 rounded-full p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
          ref={submitButtonRef}
        >
          <Send size={20} />
        </button>
      </form>
    </motion.div>
  ) : (
    <motion.button
      aria-label="Chat with AI"
      onClick={() => setShow(true)}
      key={0}
      className="rounded-full bg-gray-200 p-2 text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
      layoutId="chat"
    >
      <BotMessageSquare size={20} />
    </motion.button>
  )
}
