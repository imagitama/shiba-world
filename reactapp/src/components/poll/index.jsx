import React, { Fragment } from 'react'
import { BarChart, XAxis, YAxis, Bar } from 'recharts'
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

function PollResults({ pollId, answers }) {
  const [, , results] = useDatabaseQuery(CollectionNames.PollResponses, [
    [
      PollResponsesFieldNames.poll,
      Operators.EQUALS,
      createRef(CollectionNames.Polls, pollId)
    ]
  ])

  if (!results || !results.length) {
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
