class Model {
	//currentSectionId = null;
	//currentPageId = 0;

	data = null;

	currentQuestionId = 0;
	questionType = "";
	userQuestionSet = {};
	userSaveData = {};

	//Initializes model data
	async init() {
		this.data = await this.loadMetadata();
	}

	//Loads the metadata file
	async loadMetadata() {
		const response = await fetch("data/metadata.json");
		return await response.json();
	}
	/* 
		all Getter are here
		getting data with JSON
	 */
	// Get all data
	get dataAll() {
		return this.data;
	}

	get getQuestionsIds() {
		// pushing all question IDs
		let IdsArray = [
			...new Set(
				Object.keys(this.getUserQuestionSet).map((item) => item)
			),
		];

		// number of questions are available to choose
		if (
			this.data.numberOfQuestions > 0 &&
			IdsArray.length > this.data.numberOfQuestions
		) {
			IdsArray = IdsArray.slice(0, this.data.numberOfQuestions);
		}

		// if random question is true will suffle all question ideas
		if(this.data.randomQuestion){
			IdsArray = utils.shuffleArray(IdsArray);
		}
		console.log(IdsArray)
		//this.userSaveData = IdsArray;
		return IdsArray;
	}

	// get random question from all category
	get getRandomQuestionFromAllCategory() {
		return this.data.randomQuestionFromAllCategory;
	}

	// get guestion from category id
	get getQuestionFromCategoryId() {
		return this.data.questionFromCategoryId;
	}

	// if random option on/off for questions
	get getRandomOption(){
		return this.data.randomOption;
	}

	/* 
		all getter and setter are below
	*/
	get getUserSavedData(){

	}

	set setUserSavedData(id){

	}
	// Set user question set
	set setUserQuestionSet(id) {
		// let userQuestionSet;
		let obj = {};

		if (this.getRandomQuestionFromAllCategory) {
			/* const tempArr = [];
			userQuestionSet = this.data.data.map((item) => {
				item.questions.map((i) => {
					tempArr.push(i);
				});
			});
			userQuestionSet = [...tempArr]; */
		} else {
			this.data.data[id].questions.map((item, index) => {
				obj[`c${id}q${item.questionId}`] = {
					...item,
					categoryId: id,
				};
				this.userQuestionSet = obj;
			});
		}
	}

	// Get user question set
	get getUserQuestionSet() {
		return this.userQuestionSet;
	}

	set setCurrentQuestionId(id) {
		this.currentQuestionId = this.getQuestionsIds[id];
	}

	get getCurrentQuestionId() {
		return this.currentQuestionId;
	}
}
