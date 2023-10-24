import { useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import Main from './components/Main'
import { useReducer } from 'react'

const initialState = {
  questions: [],
  // 'loading', 'error', 'ready', 'active', 'finished'
  status: 'loading'
}

function reducer(state, action) {
  switch(action.type) {
    case 'dataReceived': 
      return {
        ...state, 
        questions: action.payload, 
        status: 'ready'
      };
    case 'dataFailed':
      return {
        ...state, 
        status: 'error'
      }
    default:
      throw new Error('Action unknown')
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // fetching data from our fake API with json-server package
  useEffect(function() {
    fetch('http://localhost:8000/questions')
      .then((res) => res.json())
      .then((data) => dispatch({type: 'dataReceived', payload: data})) //sending data to the reducer
      .catch((err) => dispatch({type: 'dataFailed'}));
  }, [])

  return (
    <div className='app'>
      <Header />

      <Main>
        <p>1/15</p>
        <p>Question?</p>
      </Main>
    </div>
  )
}