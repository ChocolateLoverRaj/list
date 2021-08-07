import { FC, useEffect } from 'react'
import { List, Input, Button, Form, Result, FormProps, Spin, Tooltip, Alert, Menu } from 'antd'
import Head from 'next/head'
import { PlusOutlined, DeleteOutlined, SyncOutlined, CloseCircleOutlined, GithubOutlined } from '@ant-design/icons'
import usePromise from 'react-use-promise'
import axios from 'axios'
import { useSetAsState } from 'use-set-as-state'
import { useMapState } from 'rooks'
import packageJson from '../package.json'

const IndexPage: FC = () => {
  const [initialItems, error] = usePromise<string[]>(async () => (await axios('/api/list')).data, [])
  const items = useSetAsState(new Set<string>())
  useEffect(() => initialItems?.forEach(item => items.add(item)), [initialItems])
  const deletePromises = useMapState<string, Promise<void>>(new Map())
  const deleteErrors = useMapState<string, Error>(new Map())
  useEffect(() => {
    [...deletePromises].forEach(([item, addPromise]) => {
      addPromise
        .then(() => items.delete(item), e => deleteErrors.set(item, e))
        .finally(() => deletePromises.delete(item))
    })
  }, [deletePromises, deleteErrors, items])
  const [form] = Form.useForm()

  useEffect(console.log.bind(error), [error])

  const handleDelete = (item: string): void => deletePromises.set(item, axios.delete('/api/list', { params: { item } }))
  const addPromises = useMapState<string, Promise<void>>(new Map())
  const addErrors = useMapState<string, Error>(new Map())
  useEffect(() => {
    [...addPromises].forEach(([item, addPromise]) => {
      addPromise.then(() => {
        addPromises.delete(item)
        items.add(item)
      }, e => {
        addPromises.delete(item)
        addErrors.set(item, e)
      })
    })
  }, [addPromises])

  const handleAdd = (item: string): void => {
    addErrors.delete(item)
    addPromises.set(item, axios.post('/api/list', item, {
      headers: { 'Content-Type': 'text/plain' }
    }))
  }

  const handleFinish: FormProps['onFinish'] = ({ item }) => {
    form.setFieldsValue({ item: '' })
    handleAdd(item)
  }

  const handleAddCancel = (item: string): void => addErrors.delete(item)
  const handleDeleteCancel = (item: string): void => deleteErrors.delete(item)

  return (
    <>
      <Head>
        <title>Next.js List</title>
      </Head>
      <Menu>
        <Menu.Item key='GitHub' icon={<GithubOutlined />}>
          <a href={packageJson.homepage}>GitHub</a>
        </Menu.Item>
      </Menu>
      {error === undefined
        ? (
          <>
            <List
              header={<h1>List</h1>}
              dataSource={[...items, ...addPromises.keys(), ...addErrors.keys()]}
              loading={initialItems === undefined && { tip: 'Loading Items' }}
              renderItem={item =>
                <Spin tip='Deleting Item' spinning={deletePromises.has(item)} key={item}>
                  {addPromises.has(item) || addErrors.has(item)
                    ? (
                      <List.Item
                        extra={
                          addPromises.has(item)
                            ? <Tooltip title='Adding Item'><SyncOutlined spin /></Tooltip>
                            : <Alert
                                showIcon
                                type='error'
                                message='Error Adding Item'
                                icon={<CloseCircleOutlined />}
                                closable
                                onClose={handleAddCancel.bind(undefined, item)}
                                action={
                                  <Button
                                    type='text'
                                    size='small'
                                    onClick={handleAdd.bind(undefined, item)}
                                  >
                                    Retry
                                  </Button>
                                }
                              />
                        }
                      >
                        {item}
                      </List.Item>)
                    : (
                      <List.Item
                        actions={!deleteErrors.has(item)
                          ? [
                            <Button
                              disabled={deletePromises.has(item)}
                              key='delete'
                              icon={<DeleteOutlined />}
                              danger
                              onClick={() => handleDelete(item)}
                            />
                            ]
                          : undefined}
                        extra={deleteErrors.has(item)
                          ? <Alert
                              showIcon
                              type='error'
                              message='Error Deleting Item'
                              icon={<CloseCircleOutlined />}
                              closable
                              onClose={handleDeleteCancel.bind(undefined, item)}
                              action={
                                <Button
                                  type='text'
                                  size='small'
                                  onClick={handleDelete.bind(undefined, item)}
                                >
                                  Retry
                                </Button>
                          }
                            />
                          : undefined}
                      >
                        {item}
                      </List.Item>)}
                </Spin>}
              bordered
            />
            <Form layout='inline' onFinish={handleFinish} form={form}>
              <Form.Item
                name='item'
                rules={[
                  { required: true },
                  {
                    validator: async (_, value: string) => {
                      const item = value.trim()
                      if (items.has(item)) throw new Error('That item is already in the list')
                      if (addPromises.has(item)) {
                        throw new Error('That item is already being added to the list')
                      }
                    }
                  }
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button
                  icon={<PlusOutlined />}
                  htmlType='submit'
                  type='primary'
                  disabled={initialItems === undefined}
                >
                  Add Item
                </Button>
              </Form.Item>
            </Form>
          </>
          )
        : <Result status='error' title='Error Loading Items' />}
    </>
  )
}

export default IndexPage
