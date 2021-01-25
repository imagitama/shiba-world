const functions = require('firebase-functions')
const {
  db,
  CollectionNames,
  PollResponsesFieldNames,
  PollTalliesFieldNames,
  Operators,
} = require('../firebase')

async function rebuildTally(pollId) {
  const { docs: responses } = await db
    .collection(CollectionNames.PollResponses)
    .where(
      PollResponsesFieldNames.poll,
      Operators.EQUALS,
      db.doc(`${CollectionNames.Polls}/${pollId}`)
    )
    .get()

  const existingAnswerCountByAnswer = responses.reduce((tally, response) => {
    const data = response.data()
    const answer = data[PollResponsesFieldNames.answer]

    return {
      ...tally,
      [answer]: tally[answer] ? tally[answer] + 1 : 1,
    }
  }, {})

  const tallyRef = db.doc(`${CollectionNames.PollTallies}/${pollId}`)
  const tallyDoc = await tallyRef.get()

  const newFields = {
    [PollTalliesFieldNames.tally]: existingAnswerCountByAnswer,
  }

  if (tallyDoc.exists) {
    await tallyRef.update(newFields)
  } else {
    await tallyRef.create(newFields)
  }
}

async function rebuildPollTallies() {
  const allPolls = await db.collection(CollectionNames.Polls).listDocuments()

  for (const poll of allPolls) {
    await rebuildTally(poll.id)
  }
}

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await rebuildPollTallies()
    res.status(200).send('Polls have been tallied')
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('failed-to-tally-polls', err.message)
  }
})
