import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Legend, Cell } from 'recharts'
import { makeStyles } from '@material-ui/core/styles'

import Paper from '../paper'

import useDatabaseQuery, {
  CollectionNames,
  PollResponsesFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useGuestUserRecord from '../../hooks/useGuestUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { createRef } from '../../utils'
import { getHasVotedInPoll } from '../../polls'
import { mediaQueryForMobiles } from '../../media-queries'

import LoadingIndicator from '../loading-indicator'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    marginBottom: '1rem',
    [mediaQueryForMobiles]: {
      flexWrap: 'wrap',
      flexDirection: 'column'
    }
  },
  col: {
    width: '100%'
  },
  pieChart: {
    fontSize: '75%'
  },
  answerBtn: {
    marginBottom: '0.25rem'
  }
})

const ANSWER_TEXT_OTHER = 'Other'

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

function PollResults({ pollId, answers, isOtherAllowed }) {
  const userId = useFirebaseUserId()
  const classes = useStyles()
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

  const loggedInUsersPollResponse = results.find(
    result => result[PollResponsesFieldNames.createdBy].id === userId
  )

  const chartData = answers
    .concat(isOtherAllowed ? [ANSWER_TEXT_OTHER] : [])
    .map(answerText => ({
      name: `${answerText}${
        loggedInUsersPollResponse &&
        loggedInUsersPollResponse[PollResponsesFieldNames.answer] === answerText
          ? '*'
          : ''
      }`,
      value: answerTally[answerText] || 0
    }))

  return (
    <ResponsiveContainer width="100%" height={200} className={classes.pieChart}>
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

export default ({
  poll: { id: pollId, question, description, answers, isOtherAllowed }
}) => {
  const classes = useStyles()
  const [isLoadingUser, , user] = useUserRecord()
  const [isLoadingGuest, , guestUser] = useGuestUserRecord()

  const hasVotedInPoll = getHasVotedInPoll(pollId)

  const [isLoadingVotes] = useDatabaseQuery(
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

  return (
    <Paper className={classes.root}>
      <div className={classes.col}>
        <strong>{question}</strong>
        <p>{description}</p>
      </div>
      <div className={classes.col}>
        {isLoadingUser || isLoadingGuest || isLoadingVotes ? (
          <LoadingIndicator />
        ) : (
          <PollResults
            pollId={pollId}
            answers={answers}
            isOtherAllowed={isOtherAllowed}
          />
        )}
      </div>
    </Paper>
  )
}
