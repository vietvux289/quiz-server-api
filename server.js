const express = require('express');
const mongodb = require('mongodb');
const { ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');

//URL for connection with DB on local
// const DB_NAME = 'wpr-quiz';
// const MONGO_URL = `mongodb://127.0.0.1:27017/${DB_NAME}`;

// URL connect to MongoDB Atlas
const MONGO_URL = "mongodb+srv://vietvux:vuviet@cluster0.nj5zyfd.mongodb.net/wpr-quiz?retryWrites=true&w=majority";

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let database = null;
let questionsCollection = null;
let attemptsCollection = null;
let resultsCollection = null;

//START SERVER
async function startServer() {
  try {
      const clients = await mongodb.MongoClient.connect(MONGO_URL);
      database = clients.db();
      questionsCollection = database.collection('questions');
      attemptsCollection = database.collection('attempts');
      resultsCollection = database.collection('results');
      console.log('Connected to the database successfully!');

      app.listen(3000, function () {
          console.log('Listening on port 3000!');
      });
  } catch (error) {
      console.error('An error occurred while starting the server:', error);
  }
}
startServer();

//START NEW ATTEMPT
app.post('/attempts', async function (req, res) {
  const questionsArray = await questionsCollection.aggregate([{ $sample: { size: 10 } }]).toArray();
  const correctAns = {};
  //hide correct answer on client side
  for (const question of questionsArray) {
    correctAns[question._id] = question.correctAnswer;
    delete question.correctAnswer;
  }
  const currentTime = new Date();

  const newAttempt = {
    questions: questionsArray,
    completed: false,
    correctAnswers: correctAns,
    startedTime: currentTime,
    __v: 0,
  };

  //insert attempt to the collection attempt
  const { insertedId } = await attemptsCollection.insertOne(newAttempt);

  const attemptResponse = {
    questions: questionsArray,
    completed: false, //by default
    score: 0,
    _id: insertedId,
    startedAt: currentTime,
    __v: 0
  };
  res.status(201).json(attemptResponse);
});

//SUBMIT AND FINISH ATTEMPT
app.post('/attempts/:id/submit', async function (req, res) {
  const attrID = req.params.id;
  const finishedAttempt = await resultsCollection.findOne({ _id: ObjectId(attrID) });

  //check if user have already finish attempt
  if (finishedAttempt) {
    res.json(finishedAttempt);
    console.log('Sorry! You have already finished your attempt before!');
  } else {
    const completedAttempt = await attemptsCollection.findOne({ _id: ObjectId(attrID) });

    //count user score
    const userSelectedAnswers = req.body.userAnswers;
    let userScore = 0;
    for (const answer in userSelectedAnswers) {
      if (completedAttempt.correctAnswers[answer] == userSelectedAnswers[answer]) {
        userScore++;
      }
    }

    //display corresponding score rule based on user's score.
    let scoreRule = '';
    if (userScore >= 9) {
      scoreRule = 'Perfect!!';
    } else if (userScore >= 7) {
      scoreRule = 'Well done!';
    } else if (userScore >= 5) {
      scoreRule = 'Good, keep up!';
    } else {
      scoreRule = 'Practice more to improve it :D';
    }

    const resultResponse = {
      ...completedAttempt,
      completed: true,
      score: userScore,
      userAnswers: userSelectedAnswers,
      scoreText: scoreRule,
    };
    //insert result to the collection result
    await resultsCollection.insertOne(resultResponse);
    res.json(resultResponse);
    console.log('Congratulations! You have finished your attempt!');
  }
});

// // GET method to fetch questions
app.get('/', async (req, res) => {
  try {
    // get all questions from db, and hide "correctAnswer" to the client
    const questionsWithoutCorrectAnswer = await questionsCollection.find({}, { projection: { correctAnswer: 0 } }).toArray();
    res.json({
      message: "You are accessing to API of WPR Quiz App!",
      questions: questionsWithoutCorrectAnswer
    });
  } catch (error) {
    console.error('An error occurred while fetching questions:', error);
    res.status(500).json({ error: 'An error occurred while fetching questions!' });
  }
});