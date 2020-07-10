import React from 'react'
import { BarChart, XAxis, YAxis, Bar } from 'recharts'
import Paper from '../paper'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseQuery, {
  CollectionNames,
  PollResponsesFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import { createRef } from '../../utils'
import { handleError } from '../../error-handling'

import LoadingIndicator from '../loading-indicator'

function Answers({ pollId, answers }) {
  const [, , user] = useUserRecord()
  const [, , , save] = useDatabaseSave(CollectionNames.PollResponses)

  const onAnswerClick = async answerText => {
    try {
      if (!user) {
        throw new Error('Cannot answer poll: not logged in!')
      }

      await save({
        poll: createRef(CollectionNames.Polls, pollId),
        answer: answerText,
        createdBy: createRef(CollectionNames.Users, user.id),
        createdAt: new Date()
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return answers.map(answerText => (
    <Answer
      key={answerText}
      answer={answerText}
      onClick={() => onAnswerClick(answerText)}
    />
  ))
}

function Answer({ answer, onClick }) {
  return <div onClick={onClick}>{answer}</div>
}

function PollResults({ pollId, answers }) {
  const [, , user] = useUserRecord()
  const [, , results] = useDatabaseQuery(
    CollectionNames.PollResponses,
    user
      ? [
          [
            PollResponsesFieldNames.poll,
            Operators.EQUALS,
            createRef(CollectionNames.Polls, pollId)
          ]
        ]
      : false
  )

  if (!results || !results.length) {
    return null
  }

  const answerTally = results.reduce(
    (currentTally, pollResponse) => ({
      ...currentTally,
      [pollResponse[PollResponsesFieldNames.answer]]: currentTally[
        pollResponse[PollResponsesFieldNames.answer]
      ]
        ? currentTally[pollResponse[PollResponsesFieldNames.answer]] + 1
        : 1
    }),
    {}
  )

  const chartData = answers.map(answerText => ({
    name: answerText,
    value: answerTally[answerText] || 0
  }))

  return (
    <div>
      <BarChart
        width={500}
        height={200}
        data={chartData}
        margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
        <XAxis dataKey="name" />
        <YAxis dataKey="value" allowDecimals={false} />
        <Bar dataKey="value" fill="#FFFFFF" />
      </BarChart>
    </div>
  )
}

export default ({ poll: { id: pollId, question, description, answers } }) => {
  const [, , user] = useUserRecord()
  const [, , results] = useDatabaseQuery(
    CollectionNames.PollResponses,
    user
      ? [
          [
            PollResponsesFieldNames.createdBy,
            Operators.EQUALS,
            createRef(CollectionNames.Users, user.id)
          ]
        ]
      : false
  )

  return (
    <Paper>
      <strong>{question}</strong>
      <p>{description}</p>
      <br />
      {results ? (
        results.length ? (
          <PollResults pollId={pollId} answers={answers} />
        ) : (
          <Answers pollId={pollId} answers={answers} />
        )
      ) : (
        <LoadingIndicator />
      )}
    </Paper>
  )
}
