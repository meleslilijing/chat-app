import {State, Action} from '@/types'

export const initState: State = {
  toUserId: '', // 当前选中聊天对象
  messages: [],
  unreadMessages: [],
}

export default function reducer(state: State = initState, action: Action) {
  switch (action.type) {
    case 'update_touser_id':
      if (action.payload === state.toUserId) {
        return state;
      }
      return {
        ...state,
        toUserId: action.payload,
        messages: [] // 切换用户时清空消息列表，等待加载新消息
      };

    case 'send_message':
      // 确保添加新消息时保留现有消息
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };

    case 'update_messages':
      // 用于加载历史消息或更新消息状态
      return {
        ...state,
        messages: [...action.payload]
      };

    case 'set_unreadMessages':
      return {
        ...state,
        unreadMessages: action.payload
      };

    case 'add_unread_message':
      return {
        ...state,
        unreadMessages: [...state.unreadMessages, action.payload]
      };

    case 'clear_unread_messages':
      return {
        ...state,
        unreadMessages: state.unreadMessages.filter(
          (message) => message.sender !== action.payload
        )
      }

    default:
      return state;
  }
}