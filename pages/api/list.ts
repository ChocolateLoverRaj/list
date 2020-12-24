import { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient, Db } from 'mongodb'

const db = process.env.NODE_ENV === 'production' ? 'production' : 'dev'
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_DOMAIN}.mongodb.net/${db}`
let cachedDb: Db
const getDb = async () => {
    if (cachedDb) {
        return cachedDb
    }
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    await client.connect()
    cachedDb = client.db(db)
    return cachedDb
}

interface Item {
    item: string
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const db = await getDb()
    const collection = db.collection('list')
    const item = req.body.trim()
    switch (req.method) {
        case 'GET':
            const list = await collection.find<Item>().toArray()
            res.json(list.map(({ item }) => item))
            break
        case 'POST':
            if (!item) {
                res.status(400).end()
                break
            }
            if (await collection.findOne({ item })) {
                res.status(409).end()
                break
            }
            await collection.insertOne({ item })
            res.end()
            break
        case 'DELETE':
            if (!item) {
                res.status(400).end()
            }
            if (!(await collection.findOneAndDelete({ item })).value) {
                res.status(404).end()
            }
            res.end()
            break
        default:
            res.status(400).end()
    }
}