import { useEffect, useState } from "react"
import styles from './index.module.scss'

interface Item {
    item: string
    request: Promise<Response> | true
}

function App() {
    const [list, setList] = useState<Array<Item>>([])
    const [newItem, setNewItem] = useState('')
    useEffect(() => {
        fetch('/api/list')
            .then(res => res.json())
            .then(res => {
                setList(res.map((item: string): Item => ({ item, request: true })))
            })
    }, [])
    useEffect(() => {
        let cancelled = false
        list.forEach(item => {
            if (item.request !== true) {
                item.request.then(() => {
                    if (cancelled) {
                        return
                    }
                    setList(list.map(({ item: currentItem, request }) => {
                        if (currentItem === item.item) {
                            return {
                                item: currentItem,
                                request: true
                            }
                        } else {
                            return {
                                item: currentItem,
                                request
                            }
                        }
                    }))
                })
            }
        })
        return () => {
            cancelled = true
        }
    }, [list])
    return <>
        <h1 key="hi">Hi</h1>
        <ul children={list.map(({ item, request }, index) =>
            <li key={index} className={request === true ? styles.synced : styles.notSynced}>{item}</li>)} />
        <form onSubmit={e => {
            e.preventDefault()
            setList([
                ...list,
                {
                    item: newItem,
                    request: fetch('/api/list', { method: 'POST', body: newItem })
                }
            ])
            setNewItem('')
        }}>
            <input key="input" required value={newItem} onChange={e => {
                const value = e.target.value
                setNewItem(value)
                if (list.find(({ item }) => {
                    return item === value
                }) === undefined) {
                    e.target.setCustomValidity('')
                } else {
                    e.target.setCustomValidity('Items in the list must be unique.')
                }
            }} />
            <button key="button">Add Item</button>
        </form>
    </>
}

export default App
