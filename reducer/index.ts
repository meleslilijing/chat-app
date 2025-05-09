
export const initState = {
  activedUserId: '' // 当前选中聊天对象
}

export default function reducer(state = initState, action) {
  if (action.type === 'update_actived_user') {
    return {
      ...state,
      activedUserId: action.payload
    }
  }
  
  return state
}