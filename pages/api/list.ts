import { NextApiRequest, NextApiResponse } from 'next'

const list = [
    'apple',
    'banana'
]

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const item = req.body.trim()
    switch (req.method) {
        case 'GET':
            res.json(list)
            break
        case 'POST':
            if (!item) {
                res.status(400).end()
                break
            }
            if (list.includes(item)) {
                res.status(409).end()
                break
            }
            list.push(item)
            // Extra delay
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve()
                }, 2000)
            })
            res.end()
            break
        case 'DELETE':
            if (!item) {
                res.status(400).end()
            }
            if (!list.includes(item)) {
                res.status(404).end()
            }
            list.splice(list.indexOf(item), 1)
            // Extra delay
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve()
                }, 2000)
            })
            res.end()
            break
        default:
            res.status(400).end()
    }
}