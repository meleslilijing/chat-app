import {State, Action} from '@/types'

export const initState: State = {
  toUserId: '', // 当前选中聊天对象
  messages: []
}

export default function reducer(state: State = initState, action: Action) {
  // 当前聊天目标用户
  if (action.type === 'update_touser_id') {
    return {
      ...state,
      toUserId: action.payload,
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