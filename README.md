# Quiz App Server APIs

This repository contains the server APIs for the Quiz App project. The APIs are developed using ExpressJS and utilize a MongoDB database for data storage. The Quiz App serves as a platform to facilitate simple, login-less attempts on predefined content such as HTML, CSS, JS, or any other subject matter.

## Deployment

The Quiz App server APIs can be accessed at: [https://quiz-app-api-opyv.onrender.com/](https://quiz-app-api-opyv.onrender.com/)

## Usage

The Quiz App server APIs offer endpoints to start and complete quiz attempts. Below are the details for utilizing these endpoints.

### Start a New Attempt

#### Use-case
After reviewing information about the quiz, the user clicks on "Start the quiz".


#### Request
The client should send a POST request to the above endpoint.

#### Response
- The server will create a new attempt by selecting 10 random questions from the questions collection.
- The new attempt will be saved in the database, and the response will contain the attempt details. Note that the correct answers will not be provided along with the questions.

### Submit User's Answers & Finish Attempt

#### Use-case
After answering the questions in the quiz, the user clicks on "Submit your answers".


#### Request
The Quiz App should send a POST request to the above endpoint with the attempt's ID in the URL and the user's answers in the request body.

#### Response
- The server will retrieve the attempt with the specified ID.
- The user's answers will be stored for further processing.
- The score will be calculated by comparing the user's answers with the correct answers corresponding to each question (maximum score: 10).
- The appropriate scoreText will be determined based on the computed score.
- Re-scoring of a completed attempt will be prevented.

---

Feel free to explore and integrate these APIs into your Quiz App project. For detailed instructions on sending requests and handling responses, refer to the provided endpoint documentation. If you encounter any issues or have questions, please don't hesitate to reach out.

