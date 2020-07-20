import React from 'react'
import useDatabaseQuery, {
  CollectionNames,
  PollsFieldNames,
  Operators,
  PollResponsesFieldNames,
  GuestUsersFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'
import { createRef } from '../../utils'

function Responses({ pollId }) {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.PollResponses,
    [
      [
        PollResponsesFieldNames.poll,
        Operators.EQUALS,
        createRef(CollectionNames.Polls, pollId)
      ]
    ]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Error!</ErrorMessage>
  }

  if (!results) {
    return <ErrorMessage>No votes yet!</ErrorMessage>
  }

  return (
    <table>
      <tbody>
        {results.map(({ id, createdBy, answer, otherText }) => (
          <tr key={id}>
            <td>{id}</td>
            <td>
              {createdBy[GuestUsersFieldNames.ipAddress]
                ? createdBy[GuestUsersFieldNames.ipAddress]
                : createdBy[UserFieldNames.username]}
            </td>
            <td>
              {answer}
              {otherText ? ` - ${otherText}` : ''}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default () => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Polls,
    [[PollsFieldNames.isClosed, Operators.EQUALS, false]]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Error!</ErrorMessage>
  }

  if (!results) {
    return <ErrorMessage>No open polls</ErrorMessage>
  }

  const firstPoll = results[0]

  const { id, question, answers } = firstPoll

  return (
    <>
      Question: {question}
      <br />
      Answers: {answers.join(', ')}
      <br />
      <Responses pollId={id} />
    </>
  )
}
