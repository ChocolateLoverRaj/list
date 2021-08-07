import { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient, Db } from 'mongodb'

const db = process.env.NODE_ENV === 'production' ? 'production' : 'dev'
// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_DOMAIN}.mongodb.net/${db}`
let cachedDb: Db
const getDb = async (): Promise<Db> => {
  if (cachedDb !== undefined) {
    return cachedDb
  }
  const client = new MongoClient(uri)
  await client.connect()
  cachedDb = client.db(db)
  return cachedDb
}

interface Item {
  item: string
}

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const db = await getDb()
  const collection = db.collection('list')
  if (req.method === 'GET') {
    const list = await collection.find<Item>({}, {}).toArray()
    res.json(list.map(({ item }) => item))
  } else if (req.method === 'POST') {
    if (typeof req.body !== 'string') {
      res.status(400).end()
      return
    }
    const item = req.body.trim()
    if (item.length === 0) {
      res.status(400).end()
      return
    }
    const result = await collection.updateOne({ item }, { $setOnInsert: { item } }, { upsert: true })
    res.status(result.upsertedCount === 1 ? 201 : 409).end()
  } else if (req.method === 'DELETE') {
    if (typeof req.query.item !== 'string') {
      res.status(400)
      return
    }
    const item = req.query.item.trim()
    if (item.length === 0) {
      res.status(400).end()
    }
    if ((await collection.deleteOne({ item })).deletedCount !== 1) res.status(404)
    res.end()
  } else res.status(405).end()
}
