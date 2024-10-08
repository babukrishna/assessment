class Model {
	data = null;
	currentQuestionId = 0;
	categoryListArray = [];
	//Initializes model data
	async init() {
		this.data = await this.loadMetadata();
		
		if (scoData.trackingMode != null) {
			this.data.userData = {
				...this.data.userData,
				name: scoData.getValue("name"),
			};

			if (scoData.getValue("lessonStatus") != "not attempted" && scoData.getValue("lessonStatus") != "unknown") {
				this.data.userData = JSON.parse(scoData.getValue("suspendData"));

				this.data.userData = {
					...this.data.userData,
					name: scoData.getValue("name"),
				};
			}
		}
		this.createCategoriesList();
		this.createQuestionsId();
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

	//Returns user data
	getUserData(k) {
		return (k) ? this.data.userData[k] : this.data.userData;
	}

	//Sets user data
	setUserData(k, v) {
		this.data.userData[k] = v;
	}

	//Returns user data
	setUserDataAll(v) {
		this.data.userData = v;
	}

	createCategoriesList(){
		this.categoryListArray = Object.keys(this.data.set);
	}

	createQuestionsId(){
		const json = this.data.set;
		let questionsId = [];
		// in case of already question id generated for specific user
		if(this.data.userData.userQuestionSet && this.data.userData.userQuestionSet.length !== 0){
			return false;
		}

		// if question set is not provided
		if(this.data.questionSetFromCategories.length !== 0){
			for(let i=0; i<this.data.questionSetFromCategories.length; i++){
				let tempArr = [];
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
					questionsId = [...questionsId, ...tempArr.splice(0, numQuestions)]
				}
			}
		} else {
			for (const parentKey in json) {
				const parentObj = json[parentKey];
				for (const childKey in parentObj) {
					questionsId.push(`${parentKey}${childKey}`);
				}
			}

			// just shuffling array randomly
			questionsId = utils.shuffleArray(questionsId);

			// number of questions are available to choose
			if (
				this.data.numberOfQuestions > 0 &&
				questionsId.length > this.data.numberOfQuestions
			) {
				questionsId = questionsId.slice(0, this.data.numberOfQuestions);
			}
		}

		this.data.userData.questionScore = new Array(questionsId.length).fill(0);
		this.data.userData.userQuestionSet = questionsId;
	}
	// get all categories list
	get getCategoriesList(){
		return this.categoryListArray;
	}
	// get all user questions set Id ['c2q0', 'c2q1', 'c1q0']
	get getUserQuestionsSetId(){
		return this.data.userData.userQuestionSet;
	}
	// set current question set id, id:number = 0
	set setCurrentQuestionSetId(id) {
		this.currentQuestionId = this.data.userData.userQuestionSet[id];
	}
	// get current question set ide 'c2q0'
	get getCurrentQuestionSetId() {
		return this.currentQuestionId;
	}
	// get current question id 'q0' it is coming from 'getCurrentQuestionSetId' 'c2q0'
	get getCurrentQuestionId(){
		return utils.getQuestionId(this.currentQuestionId);
	}
	// get current category id 'c2' it is coming from 'getCurrentQuestionSetId' 'c2q0'
	get getCurrentCategoryId(){
		return utils.getCategoryId(this.currentQuestionId);
	}
	// get current question as per current category and question id
	get getCurrentQuestion(){
		return this.data.set[this.getCurrentCategoryId][this.getCurrentQuestionId].question;
	}
	// get current question type as per current category and question id
	get getCurrentQuestionType(){
		return this.data.set[this.getCurrentCategoryId][this.getCurrentQuestionId].type.toLowerCase();
	}
	// get current question options as per current category and question id
	get getCurrentOptions(){
		const options = this.data.set[this.getCurrentCategoryId][this.getCurrentQuestionId].options;
		return this.data.randomOption ? utils.shuffleArray(options) : options;
	}
	// seting up those question list attempt by user
	set setUserAttemptQuestions({cid, qid, oid}){
		if(!this.data.userData.attemptQuestions[cid]){
			this.data.userData.attemptQuestions[cid] = {};
		}
		this.data.userData.attemptQuestions[cid][qid] = oid;
	}
	// get questions attempt by user
	get getUserAttemptQuestions(){
		return this.data.userData.attemptQuestions;
	}

	setScore(i, v){
		this.data.userData.questionScore[i] = v;
	}
}
