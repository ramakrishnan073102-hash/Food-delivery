import { useReducer } from "react"

const reducer = (state,action)=>{

  switch(action.type){

    case "ADD":
      return [...state, action.payload]

    case "REMOVE":
      return state.filter(item=>item.id !== action.payload)

    default:
      return state

  }

}

export const useCartReducer = ()=>{

  const [cart,dispatch] = useReducer(reducer,[])

  return {cart,dispatch}

}