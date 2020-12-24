import styles from './index.module.scss'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import cn from 'classnames'

enum Statuses {
    SYNCED = 0,
    ADDING = 1,
    DELETING = 2
}

interface BaseItem {
    item: string
}
interface SyncedItem {
    status: Statuses.SYNCED
}
interface PendingItem {
    status: Statuses.ADDING | Statuses.DELETING,
    request: Promise<Response>
}

type Item = BaseItem & (SyncedItem | PendingItem)

function App() {
    const [list, setList] = useState<Array<Item>>([])
    const [newItem, setNewItem] = useState('')
    useEffect(() => {
        fetch('/api/list')
            .then(res => res.json())
            .then(res => {
                setList(res.map((item: string): Item => ({
                    item,
                    status: Statuses.SYNCED
                })))
            })
    }, [])
    useEffect(() => {
        let cancelled = false
        list.forEach(item => {
            if (item.status !== Statuses.SYNCED) {
                item.request.then(() => {
                    if (cancelled) {
                        return
                    }
                    setList(item.status === Statuses.ADDING
                        ? list.map(currentItem => {
                            if (currentItem.item === item.item) {
                                return {
                                    item: currentItem.item,
                                    status: Statuses.SYNCED
                                }
                            } else {
                                return { ...currentItem }
                            }
                        })
                        : list.filter(({ item: currentItem }) => currentItem !== item.item)
                    )
                })
            }
        })
        return () => {
            cancelled = true
        }
    }, [list])
    return <>
        <Head key="head">
            <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        </Head>
        <h1 key="hi">Hi</h1>
        <ul children={list.map(({ item, status }, index) =>
            <li key={index} className={status !== Statuses.ADDING ? styles.synced : styles.notSynced}>
                <div className={styles.item}>
                    {item}
                    {status !== Statuses.ADDING && <i className={cn(
                        "material-icons",
                        status === Statuses.SYNCED
                            ? styles.button
                            : styles.disabled,
                        status === Statuses.SYNCED
                            ? styles.synced
                            : styles.notSynced
                    )} onClick={status === Statuses.SYNCED
                        ? (() => {
                            setList(list.map(currentItem => {
                                if (currentItem.item === item) {
                                    return {
                                        item,
                                        status: Statuses.DELETING,
                                        request: fetch('/api/list', { method: 'DELETE', body: item })
                                    }
                                } else {
                                    return { ...currentItem }
                                }
                            }))
                        })
                        : undefined
                    }>delete</i>}
                </div>
            </li>)} />
        <form onSubmit={e => {
            e.preventDefault()
            setList([
                ...list,
                {
                    item: newItem,
                    status: Statuses.ADDING,
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
