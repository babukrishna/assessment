{
	"time": 0,
    // not implemented yet
	
	byWeightage": false,
	//if false then 1 point for each correct number.
	//in case of true should be pick weightage by assigned value in question
	
	"score": 0,
    // not implemented yet

	"numberOfQuestions": 10,
    // in case of "questionSetFromCategories" is "null" it will pick the number of question randomly

	"questionSetFromCategories": [{"categoryId": "c0", "numberOfQuestions": 20, "random": true}],
    // will pick questions from given configuration

    "questionSetFromCategories": null,
    // in this case it will pick questions from all categories and make random set of questions

	"randomOption": false,
    // to make options generate randomly

	"passingScore": 80,
    // not yet implemented

	"chapterTitle": "Engineering",
    // chapter title

	"chapterSubtitle": "Module 1: Engineering",
    // chapter sub title

	"userData": {
		"name": "Krishna Babu",
        // user name with first and last

		"photo": "./img/profilePic.jpg",
        // user photo url

		"userQuestionSet": ["c1q3","c1q18","c1q4","c1q20","c1q9","c1q13","c1q10","c1q1","c1q6","c1q16","c1q8","c1q12","c1q0","c1q15","c1q5","c1q7","c1q17","c1q11","c1q19","c1q2"],
        // question set generated for the user for first time.

		"attemptQuestions": {"c0":{"q1":["2"],"q3":["3"],"q2":["2","3"]},"c1":{"q3":["2","3"],"q0":["2"]},"c2":{"q0":["2","1"]}}
        // attempt questions from generated question set

		"bookmark": "QUIZ_SCREEN&2"
		// QUIZ_SCREEN&2 - quiz bookmars would be with index id
		// REVIEW_SCREEN
		// INTRO_SCREEN
	},
	"otherPages": {
		"introductionPage": {
			"content": "",
			"imagePath": ""
		},
		"endPage": {
			"content": "",
			"imagePath": ""
		}
	},
	"categories": {
		"c0": {
			"title": "",
			"description": ""
		}
	},
	"set": {
		"c0": {
			"q0": {
				"type": "mcq",
				"question": "What is the purpose of conducting a site evaluation?",
				"weightage": 0,
				"options": [
					{
						"optionId": 0,
						"isCorrect": 0,
						"option": "Determine best layout of solar array"
					},
					{
						"optionId": 1,
						"isCorrect": 0,
						"option": "Check on any shading issues"
					},
					{
						"optionId": 2,
						"isCorrect": 0,
						"option": "Determine electrical layout"
					},
					{
						"optionId": 3,
						"isCorrect": 1,
						"option": "All of the above"
					}
				]
			},
			"q1": {
				"type": "mmcq",
				"question": "Solar array should be pointed at what degrees to south?",
				"weightage": 0,
				"options": [
					{
						"optionId": 0,
						"isCorrect": 0,
						"option": "360 degrees"
					},
					{
						"optionId": 1,
						"isCorrect": 0,
						"option": "0 degrees"
					},
					{
						"optionId": 2,
						"isCorrect": 1,
						"option": "180 degrees"
					},
					{
						"optionId": 3,
						"isCorrect": 0,
						"option": "260 degrees"
					}
				]
			},
			"q2": {
				"type": "tnf",
				"question": "Magnetic declination is where a magnetic field interferes with a solar array?",
				"weightage": 0,
				"options": [
					{
						"optionId": 0,
						"isCorrect": 0,
						"option": "True"
					},
					{
						"optionId": 1,
						"isCorrect": 1,
						"option": "False"
					}
				]
			}
		}
	}
}