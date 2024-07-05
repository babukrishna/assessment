class Model {
	data = null;
	currentQuestionId = 0;
	categoryListArray = [];
	questionsId = [];
	userAttemptQuestions = {}
	//Initializes model data
	async init() {
		this.data = await this.loadMetadata();
		this.createCategoriesList();
		this.createQuestionsId();
		this.createUserAttemptQuestion();
	}

	//Loads the metadata file
	async loadMetadata() {
		const response = await fetch("data/metadata.json");
		return await response.json();
	}

	// Get all data
	get dataAll() {
		return this.data;
	}

	createUserAttemptQuestion(){
		if(Object.keys(this.data.userData.attemptQuestions).length !== 0){
			this.userAttemptQuestions = this.data.userData.attemptQuestions;
		}
	}	

	createCategoriesList(){
		this.categoryListArray = Object.keys(this.data.set);
	}

	/* createQuestionListFromCategory(cid){
		return Object.keys(this.data.set[cid]);
	} */

	createQuestionsId(){
		const json = this.data.set;

		// in case of already question id generated for specific user
		if(this.data.userData.userQuestionSet && this.data.userData.userQuestionSet.length !== 0){
			this.questionsId = this.data.userData.userQuestionSet;
			return false;
		}

		// if question set is not provided
		if(this.data.questionSetFromCategories.length !== 0){
			for(let i=0; i<this.data.questionSetFromCategories.length; i++){
				const tempArr = [];
				const parentKey = this.data.questionSetFromCategories[i].categoryId;
				const parentObj = json[parentKey];
				
				for (const childKey in parentObj) {
					tempArr.push(`${parentKey}${childKey}`);
				}

				if(this.data.questionSetFromCategories[i].random){
					tempArr = utils.shuffleArray(tempArr)
				}
				
				const numQuestions = this.data.questionSetFromCategories[i].numberOfQuestions;
				if(numQuestions > 0 && Object.keys(parentObj).length >= numQuestions){
					this.questionsId = [...this.questionsId, ...tempArr.splice(0, numQuestions)]
				}
			}
		} else {
			for (const parentKey in json) {
				const parentObj = json[parentKey];
				for (const childKey in parentObj) {
					this.questionsId.push(`${parentKey}${childKey}`);
				}
			}

			// just shuffling array randomly
			this.questionsId = utils.shuffleArray(this.questionsId);

			// number of questions are available to choose
			if (
				this.data.numberOfQuestions > 0 &&
				this.questionsId.length > this.data.numberOfQuestions
			) {
				this.questionsId = this.questionsId.slice(0, this.data.numberOfQuestions);
			}
		}
	}
	// get all categories list
	get getCategoriesList(){
		return this.categoryListArray;
	}
	// get all user questions set Id ['c2q0', 'c2q1', 'c1q0']
	get getUserQuestionsSetId(){
		return this.questionsId;
	}
	// set current question set id, id:number = 0
	set setCurrentQuestionSetId(id) {
		this.currentQuestionId = this.questionsId[id];
	}
	// get current question set ide 'c2q0'
	get getCurrentQuestionSetId() {
		return this.currentQuestionId;
	}
	// get current question id 'q0' it is coming from 'getCurrentQuestionSetId' 'c2q0'
	get getCurrentQuestionId(){
		return utils.getCategoryAndQuestionId(this.currentQuestionId)[1];
	}
	// get current category id 'c2' it is coming from 'getCurrentQuestionSetId' 'c2q0'
	get getCurrentCategoryId(){
		return utils.getCategoryAndQuestionId(this.currentQuestionId)[0];
	}
	// get current question as per current category and question id
	get getCurrentQuestion(){
		return this.data.set[this.getCurrentCategoryId][this.getCurrentQuestionId].question;
	}
	// get current question type as per current category and question id
	get getCurrentQuestionType(){
		return this.data.set[this.getCurrentCategoryId][this.getCurrentQuestionId].type;
	}
	// get current question options as per current category and question id
	get getCurrentOptions(){
		const options = this.data.set[this.getCurrentCategoryId][this.getCurrentQuestionId].options;
		return this.data.randomOption ? utils.shuffleArray(options) : options;
	}
	// seting up those question list attempt by user
	set setUserAttemptQuestions({cid, qid, oid}){
		if(Object.keys(this.data.userData.attemptQuestions).length === 0){
			if(!this.userAttemptQuestions[cid]){
				this.userAttemptQuestions[cid] = {};
			}
			this.userAttemptQuestions[cid][qid] = oid;
		}else{
			this.userAttemptQuestions = this.data.userData.attemptQuestions;
		}
	}
	// get questions attempt by user
	get getUserAttemptQuestions(){
		return this.userAttemptQuestions;
	}
}
