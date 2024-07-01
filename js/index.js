const utils = new Utils();
const model = new Model();
const app = new App();
app.init();


window.addEventListener("CHAPTER_COMPLETED", this.chapterCompletedHandler.bind(this));

function chapterCompletedHandler(event) {
    console.log("event.detail: ", event.detail);
}


/* 
"time": 0, //not implemented yet
"score": 0, //not implemented yet
"numberOfQuestions": 10, //if number of questions are greater then given numbers

"randomQuestionFromAllCategory": false, 
//choose random question from all given categories. Currently question are capturing from single category with the given category id


"questionFromCategoryId": 0,
// in case of 'randomQuestionFromAllCategory' is 'false' it pick from given index and get all questions from single category.

"randomQuestion": false, // randomized the question from user question set
"randomOption": false, //randomized options for questions
"passingScore": 80, //not implemented yet
"userSaveData": {}, //not implemented yet

"userQuestionSet": [], 
// generate question set for users
*/