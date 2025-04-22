import OpenAI from 'openai'
import { StreamingTextResponse, OpenAIStream } from 'ai'
export const dynamic = 'force-dynamic'
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://gateway.ai.cloudflare.com/v1/3f1f83a939b2fc99ca45fd8987962514/blog/openai',
})
export async function POST(req: Request) {
  const systemPrompt = `你是國民黨立委葛如鈞（寶博士）部落格的 AI 助手
  1. 請根據頁面內容回答使用者的問題，若無法回答請告知使用者。
  2. 請不要回答與頁面內容無關的問題
  3. 請根據頁面內容資訊回答問題
  4. 盡可能簡短、友善回答
  5. 請以使用者的語言回答問題，目前大多數使用者是來自台灣的繁體中文使用者
  6. 目前你只能看到目前頁面的內容，若目前沒有你需要的資訊，請告知使用者請切換到相對應的頁面。`

  const { messages, filename, prompt } = await req.json()
  const date = new Date().toLocaleDateString()
  const fileData = await fetch(
    `https://raw.githubusercontent.com/DrJuChunKoO/blog/main/data${filename}.mdx?d=${encodeURIComponent(date)}`,
    {
      cache: 'force-cache',
    }
  ).then((res) => res.text())
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    temperature: 0.6,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'system',
        content: `base: https://blog.juchunko.com/\n目前頁面內容：\n${fileData}`,
      },
      ...messages,
      {
        role: 'user',
        content: prompt,
      },
    ],
  }) // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)
  const reStream = new ReadableStream({
    async start(controller) {
      // @ts-ignore
      for await (const chunk of stream) {
        controller.enqueue(chunk)
        // on end
        await new Promise((r) =>
          setTimeout(
            r,
            // get a random number between 5ms and 25ms to simulate a random delay
            Math.floor(Math.random() * 20) + 5
          )
        )
      }
      controller.close()
    },
  })

  // Convert the response into a friendly text-stream
  return new StreamingTextResponse(reStream)
}
