import { NextApiRequest, NextApiResponse } from 'next'

const list = [
    'apple',
    'banana'
]

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case 'GET':
            res.json(list)
            break
        case 'POST':
            const item = req.body.trim()
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
            await new Promise(resolve => {
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