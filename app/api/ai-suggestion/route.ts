import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    console.log('API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set')
    
    const { context } = await request.json()
    console.log('Received context:', context)
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that provides suggestions for maintaining and improving personal relationships." },
        { role: "user", content: `Based on this information about a connection: ${context}, provide a brief suggestion for maintaining or improving the relationship. Give me a list of few bullet point call to actions ` }
      ],
    });

    const suggestion = completion.choices[0].message.content;

    if (!suggestion) {
      throw new Error('No suggestion received from OpenAI')
    }

    console.log('Suggestion received:', suggestion)
    return Response.json({ suggestion })
  } catch (error) {
    console.error('Error getting AI suggestion:', error)
    return Response.json({ error: 'Failed to get AI suggestion', details: error.message, stack: error.stack }, { status: 500 })
  }
}