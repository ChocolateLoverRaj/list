import { FC, ReactNode } from 'react'
import PusherStatus from './PusherStatus'
// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import PulseDot from 'react-pulse-dot'

interface StatusOptions {
  message: ReactNode
  color: string
}

const pusherLink = <a href='https://pusher.com/'>Pusher</a>

const statusOptions: Record<PusherStatus, StatusOptions> = {
  [PusherStatus.CONNECTED]: {
    color: 'success',
    message: <>Connected to {pusherLink}</>
  },
  [PusherStatus.CONNECTING]: {
    color: 'info',
    message: <>Connecting to {pusherLink}</>
  },
  [PusherStatus.FAILED]: {
    color: 'danger',
    message: <>Failed to connect to {pusherLink}</>
  },
  [PusherStatus.UNAVAILABLE]: {
    color: 'warning',
    message: <>{pusherLink} unavailable</>
  }
}

export interface StatusProps {
  status: PusherStatus
}
const Status: FC<StatusProps> = props => {
  const { status } = props

  const { message, color } = statusOptions[status]

  return (
    <>
      <PulseDot {...{ color }} />
      {message}
    </>
  )
}

export default Status
