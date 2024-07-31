import { NextResponse } from 'next/server';
import { MongoClient, ObjectId, Db } from 'mongodb';
import { auth } from '@clerk/nextjs/server';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

const client = new MongoClient(uri);

async function connectToDatabase(): Promise<Db> {
  await client.connect();
  return client.db('personal_nexus');
}

// Define a type for the connection
interface Connection {
  _id?: string | ObjectId;
  name: string;
  relationship: string;
  lastContact: string;
  nextContact: string;
  notes: string;
  importance: string;
  lastConversation: string;
  ctos: string;
  futureTalkingPoints: string[];
  userId?: string;
}

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectToDatabase();
  const connections = await db.collection<Connection>('connections').find({ userId }).toArray();
  return NextResponse.json(connections);
}

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connection: Connection = await request.json();
  const db = await connectToDatabase();
  const result = await db.collection<Connection>('connections').insertOne({ ...connection, userId });
  return NextResponse.json(result);
}

export async function PUT(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connection: Connection = await request.json();
  const { _id, ...updateData } = connection;
  
  // Ensure _id is defined and create an ObjectId
  if (!_id) {
    return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
  }
  
  const db = await connectToDatabase();
  const result = await db.collection<Connection>('connections').updateOne(
    { _id: typeof _id === 'string' ? new ObjectId(_id) : _id, userId },
    { $set: updateData }
  );
  
  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
  }

  try {
    const db = await connectToDatabase();
    const result = await db.collection<Connection>('connections').deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Connection not found or not authorized to delete' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
