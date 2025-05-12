export type State = {
  toUserId: string
  messages: Message[]
  unreadMessages: Message[]
}

export interface Action {
  type: string
  [props: string]: any
}


export interface User {
  id: string;
  email: string;
  username: string;
}


export interface Message {
  type: 'private'
  sender: string
  to: string
  content: string
  readBy: string[]
  createdAt: string;
}
