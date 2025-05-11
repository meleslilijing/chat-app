interface IAction {
  type: string
  [props: string]: any
}

interface IMessage {
  type: 'private'
  sender: string
  to: string
  content: string
}

interface IState {
  activedUserId: string
  messages: IMessage[]
}

export const initState = {
  activedUserId: '', // 当前选中聊天对象
  messages: []
}

export default function reducer(state = initState, action: IAction) {
  // 当前聊天目标用户
  if (action.type === 'update_actived_user') {
    return {
      ...state,
      activedUserId: action.payload,
      messages: []
    }
  }

  if (action.type === 'send_message') {
    return {
      ...state,
      messages: [...state.messages, action.payload]
    }
  }

  if (action.type === 'update_messages') {
    return {
      ...state,
      messages: [...action.payload]
    }
  }
  
  return state
}