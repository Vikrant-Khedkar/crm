import { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient, ObjectId } from 'mongodb'
import { auth } from '@clerk/nextjs/server'

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}

const client = new MongoClient(uri)

async function connectToDatabase() {
  await client.connect()
  return client.db('personal_nexus')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = auth(); // Call auth without arguments
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      const db = await connectToDatabase()
      const result = await db.collection('connections').deleteOne({ 
        _id: new ObjectId(id as string), 
        userId 
      })

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Connection not found or not authorized to delete' })
      }

      return res.status(200).json({ success: true })
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}