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
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { useCompletion } from 'ai/react'
import { useLocalStorage } from 'usehooks-ts'
import Markdown from 'react-markdown'
import { usePathname } from 'next/navigation'
function Message({ from, content }: { from: 'me' | 'ai'; content: string }) {
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
      exit={{ opacity: 0, x: from === 'me' ? 50 : -50, height: 0 }}
    >
      <div
        className={twMerge(
          'mb-2 flex w-full items-start gap-2',
          from === 'me' ? 'flex-row-reverse' : ''
        )}
      >
        {from === 'me' && (
          <div
            className={twMerge(
              'rounded-full p-2',
              from === 'me'
                ? 'bg-gray-100 text-gray-500 shadow-inner' // from user
                : 'bg-gray-50 text-gray-500 dark:bg-white/10 dark:text-white/90' // from bot
            )}
          >
            {from === 'me' ? <User /> : <Bot />}
          </div>
        )}
        <div
          className={twMerge(
            'rounded-lg',
            from === 'me'
              ? 'bg-gray-200 text-gray-800' // from user
              : 'bg-gray-50 text-gray-800 dark:bg-white/10 dark:text-white/90' // from bot
          )}
        >
          {from === 'ai' && (
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
          <Markdown
            className={twMerge(
              'prose prose-sm break-all px-3 py-2 text-sm',
              from === 'me' ? '' : 'dark:prose-invert'
            )}
          >
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
      className="fixed bottom-4 right-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-[min(400px,calc(100vw-16px*2))] shadow-lg dark:shadow-xl"
      key={1}
      layoutId="chat"
    >
      <motion.div className="p-1 flex justify-between items-center gap-4">
        <div className="flex items-center font-semibold">
          <motion.span className="p-2">
            <BotMessageSquare size={20} />
          </motion.span>
          AI 小助手
        </div>
        <div className="flex">
          <button
            className="text-gray-500 p-2 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full"
            onClick={() => setMessages([])}
          >
            <RotateCcw size={20} />
          </button>
          <button
            className="text-gray-500 p-2 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full"
            onClick={() => setShow(false)}
          >
            <Minus size={20} />
          </button>
        </div>
      </motion.div>
      <div
        className="bg-white dark:bg-gray-800 p-2 h-[400px] overflow-y-scroll"
        ref={messageContainerRef}
      >
        <Message from="ai" content="你好，我是 AI 小助手，有什麼可以幫助你的嗎？" />
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
                `這頁的主要觀點是什麼？`,
                '可以給我這個主題的詳細解釋嗎？',
                '幫我生成一個這段內容的問答',
              ]
                .filter((x) => !messages.some((m) => m.content === x))
                .map((message, index) => (
                  <button
                    onClick={() => sendDefaultMessage(message)}
                    className="flex items-center gap-2 text-left text-sm hover:opacity-75 active:opacity-50 pl-3"
                    key={index}
                  >
                    <MessageCircleQuestion size={20} />
                    {message}
                  </button>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <form className="flex justify-between items-center gap-4" onSubmit={onSubmit}>
        <input
          className="flex-1 bg-transparent w-full ring-0 border-transparent focus:border-transparent focus:ring-transparent p-2"
          value={input}
          onChange={handleInputChange}
          required
        />
        <button
          type="submit"
          className="text-gray-500 p-2 mr-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full"
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