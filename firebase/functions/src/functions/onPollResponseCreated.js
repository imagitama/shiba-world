const functions = require('firebase-functions')
const {
  db,
  Operators,
  CollectionNames,
  PollsFieldNames,
  PollResponsesFieldNames,
  PollTalliesFieldNames,
} = require('../firebase')

async function createTally(pollId, answers) {
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

  const tally = answers.reduce(
    (tally, answer) => ({
      ...tally,
      [answer]: existingAnswerCountByAnswer[answer] || 0,
    }),
    {}
  )

  await db.doc(`${CollectionNames.PollTallies}/${pollId}`).create({
    [PollTalliesFieldNames.tally]: tally,
  })
}

async function addAnswerToTallyDoc(tallyDoc, answer) {
  const tallyRef = tallyDoc.ref
  const tallyData = tallyDoc.data()

  await tallyRef.update({
    [PollTalliesFieldNames.tally]: {
      ...tallyData[PollTalliesFieldNames.tally],
      [answer]: tallyData[PollTalliesFieldNames.tally][answer]
        ? tallyData[PollTalliesFieldNames.tally][answer] + 1
        : 1,
    },
  })
}

module.exports = functions.firestore
  .document(`${CollectionNames.PollResponses}/{id}`)
  .onCreate(async (doc) => {
    const docData = doc.data()

    const pollRef = docData[PollResponsesFieldNames.poll]

    const pollDoc = await pollRef.get()
    const pollData = pollDoc.data()
    const pollId = pollRef.id

    if (!pollDoc.exists) {
      console.log(
        `Cannot add response to tally: poll ${pollRef.path} does not exist`
      )
      return
    }

    if (pollData[PollsFieldNames.isClosed]) {
      console.log(
        `Cannot add response to tally: poll ${pollRef.path} is closed`
      )
      return
    }

    const existingTallyRef = db.doc(`${CollectionNames.PollTallies}/${pollId}`)
    const existingTallyDoc = await existingTallyRef.get()

    if (!existingTallyDoc.exists) {
      await createTally(pollId, pollData[PollsFieldNames.answers])
    } else {
      await addAnswerToTallyDoc(
        existingTallyDoc,
        docData[PollResponsesFieldNames.answer]
      )
    }
  })
