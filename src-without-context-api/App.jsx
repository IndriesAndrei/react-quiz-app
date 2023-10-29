import './App.css'
import { useEffect, useReducer } from 'react'
import Error from './components/Error'
import FinishScreen from './components/FinishScreen'
import Footer from './components/Footer'
import Header from './components/Header'
import Loader from './components/Loader'
import Main from './components/Main'
import NextButton from './components/NextButton'
import Progress from './components/Progress'
import Question from './components/Question'
import StartScreen from './components/StartScreen'
import Timer from './components/Timer'

const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],
  // 'loading', 'error', 'ready', 'active', 'finished'
  status: 'loading',
  index: 0, // index of current question
  answer: null, // no answer initially
  points: 0, // starting points at 0
  highscore: 0,
  secondsRemaining: null,
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
        status: 'active',
        secondsRemaining: state.questions.length * SECS_PER_QUESTION,
      }
    case 'newAnswer':
      return {
        ...state,
        answer: action.payload,
        points: action.payload === question.correctOption ? state.points + question.points : state.points,
      }
    case 'nextQuestion':
      return {...state, index: state.index + 1, answer: null}
    case 'finish':
      return {...state, status: 'finished', highscore: state.points > state.highscore ? state.points : state.highscore}
    case 'retake':
      return {...initialState, questions: state.questions, status: 'ready'}
    case 'tick':
      return {...state, secondsRemaining: state.secondsRemaining - 1, status: state.secondsRemaining === 0 ? 'finished' : state.status}
    default:
      throw new Error('Action unknown')
  }
}

export default function App() {
  // we destructure state in questions, status and index
  const [{questions, status, index, answer, points, highscore, secondsRemaining}, dispatch] = useReducer(reducer, initialState);

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
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton 
                dispatch={dispatch} 
                answer={answer} 
                numQuestions={numQuestions} 
                index={index} />
            </Footer>
          </>
        )}
        {status === 'finished' && <FinishScreen 
                                    points={points} 
                                    maxPossiblePoints={maxPossiblePoints} 
                                    highscore={highscore}
                                    dispatch={dispatch}
                                  />}
      </Main>
    </div>
  )
}