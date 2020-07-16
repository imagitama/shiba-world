import React, { Fragment } from 'react'
import { ResponsiveContainer, PieChart, Pie, Legend, Cell } from 'recharts'
import Paper from '../paper'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseQuery, {
  CollectionNames,
  PollResponsesFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useGuestUserRecord from '../../hooks/useGuestUserRecord'

import { createRef } from '../../utils'
import { handleError } from '../../error-handling'
import { getHasVotedInPoll, setHasVotedInPoll } from '../../polls'

import LoadingIndicator from '../loading-indicator'
import Button from '../button'

function Answers({ pollId, answers }) {
  const [, , user] = useUserRecord()
  const [, , guestUser] = useGuestUserRecord()
  const [isSaving, , , save] = useDatabaseSave(CollectionNames.PollResponses)

  const onAnswerClick = async answerText => {
    try {
      if (!user && !guestUser) {
        console.warn('No user or guest user - should never happen')
        return
      }

      // TODO: When user votes as guest THEN logs in, update their pollResponse to change from guest ID to logged in ID

      await save({
        poll: createRef(CollectionNames.Polls, pollId),
        answer: answerText,
        createdBy: user
          ? createRef(CollectionNames.Users, user.id)
          : createRef(CollectionNames.GuestUsers, guestUser.id),
        createdAt: new Date()
      })

      setHasVotedInPoll(pollId)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isSaving) {
    return <LoadingIndicator />
  }

  return answers.map(answerText => (
    <Fragment key={answerText}>
      <Answer answer={answerText} onClick={() => onAnswerClick(answerText)} />{' '}
    </Fragment>
  ))
}

function Answer({ answer, onClick }) {
  return (
    <Button onClick={onClick} color="default">
      {answer}
    </Button>
  )
}

// Source: https://sashamaps.net/docs/tools/20-colors/
const colors = [
  '#e6194b',
  '#3cb44b',
  '#ffe119',
  '#4363d8',
  '#f58231',
  '#911eb4',
  '#46f0f0',
  '#f032e6',
  '#bcf60c',
  '#fabebe',
  '#008080',
  '#e6beff',
  '#9a6324',
  '#fffac8',
  '#800000',
  '#aaffc3',
  '#808000',
  '#ffd8b1',
  '#000075',
  '#808080',
  '#ffffff',
  '#000000'
]

function PollResults({ pollId, answers }) {
  const [isLoadingResults, , results] = useDatabaseQuery(
    CollectionNames.PollResponses,
    [
      [
        PollResponsesFieldNames.poll,
        Operators.EQUALS,
        createRef(CollectionNames.Polls, pollId)
      ]
    ]
  )

  if (isLoadingResults || !results) {
    return <LoadingIndicator />
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
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          nameKey="name"
          dataKey="value"
          label={({ value, percent }) =>
            `${(percent * 100).toFixed(0)}% (${value})`
          }>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default ({ poll: { id: pollId, question, description, answers } }) => {
  const [isLoadingUser, , user] = useUserRecord()
  const [isLoadingGuest, , guestUser] = useGuestUserRecord()

  const hasVotedInPoll = getHasVotedInPoll(pollId)

  const [isLoadingVotes, , votesForUser] = useDatabaseQuery(
    CollectionNames.PollResponses,

    hasVotedInPoll
      ? false
      : [
          [
            PollResponsesFieldNames.createdBy,
            Operators.EQUALS,
            user
              ? createRef(CollectionNames.Users, user.id)
              : guestUser
              ? createRef(CollectionNames.GuestUsers, guestUser.id)
              : false
          ],
          [
            PollResponsesFieldNames.poll,
            Operators.EQUALS,
            createRef(CollectionNames.Polls, pollId)
          ]
        ]
  )

  function Results() {
    if (isLoadingUser || isLoadingGuest || isLoadingVotes) {
      return <LoadingIndicator />
    }

    if ((votesForUser && votesForUser.length) || hasVotedInPoll) {
      return <PollResults pollId={pollId} answers={answers} />
    }

    return <Answers pollId={pollId} answers={answers} />
  }

  return (
    <Paper>
      <strong>{question}</strong>
      <p>{description}</p>
      <Results />
    </Paper>
  )
}
