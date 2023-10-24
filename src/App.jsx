import './App.css'
import { useEffect, useReducer } from 'react'
import Error from './components/Error'
import Header from './components/Header'
import Loader from './components/Loader'
import Main from './components/Main'
import NextButton from './components/NextButton'
import Progress from './components/Progress'
import Question from './components/Question'
import StartScreen from './components/StartScreen'

const initialState = {
  questions: [],
  // 'loading', 'error', 'ready', 'active', 'finished'
  status: 'loading',
  index: 0, // index of current question
  answer: null, // no answer initially
  points: 0, // starting points at 0
}

function reducer(state, action) {
  const question = state.questions.at(state.index); // get the current question by index 

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
    case 'start':
      return {
        ...state,
        status: 'active'
      }
    case 'newAnswer':
      return {
        ...state,
        answer: action.payload,
        points: action.payload === question.correctOption ? state.points + question.points : state.points,
      }
    case 'nextQuestion':
      return {...state, index: state.index + 1, answer: null}
    default:
      throw new Error('Action unknown')
  }
}

export default function App() {
  // we destructure state in questions, status and index
  const [{questions, status, index, answer, points}, dispatch] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce((prev, cur) => prev + cur.points, 0);

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
       {status === 'loading' && <Loader />}
       {status === 'error' && <Error />}
       {status === 'ready' && <StartScreen numQuestions={numQuestions} dispatch={dispatch} />}
       {status === 'active' && (
          <>
            <Progress 
              index={index} 
              numQuestions={numQuestions} 
              points={points} 
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question 
                question={questions[index]} 
                dispatch={dispatch} 
                answer={answer} 
            />
            <NextButton dispatch={dispatch} answer={answer} />
          </>
        )}
      </Main>
    </div>
  )
}