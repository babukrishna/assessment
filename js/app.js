class App {
	constructor() {}

	//Initializes scorm and model
	async init() {
		scoData.initialize();
		await model.init();
		this.addListeners();
		this.formation(model.dataAll);
	}

	formation(data) {
		const $this = this;
		// dom value formation
		
		this.title = this.selector(".quizHolder .title");
		this.description = this.selector(".quizHolder .description");
		this.question = this.selector("#ques");
		this.optionHolder = this.selector("#optionHolder");
		this.timer = this.selector('#timer');
		// CTAs
		this.previousBtn = this.selector("#prevCTA");
		this.nextBtn = this.selector("#nextCTA");
		this.submitTest = this.selector('#submitTest');
		// review
		this.reviewBtn = this.selector("#reviewCTA");
		this.reviewHolder = this.selector("#reviewHolder");
		this.reviewQuestion = this.selector("#reviewHolder .reviewQuestionList");
		// end screen
		this.endQuestionList = this.selector('.endQuestionList');
		// question counter
		this.currentQuestionCount = this.selector(".currentQuestionCount");
		this.totalQuestionCount = this.selector(".totalQuestionCount");
		// chapter
		this.chapterTitle = this.selector('.chapter .title');
		this.chapterSubtitle = this.selector('.chapter .subtitle');
		this.userName = this.selector('.user .userName');
		this.score = this.selector('#score');
		this.pass = this.selector('.pass');
		this.fail = this.selector('.fail');
		// all sections
		this.introSection = this.selector('.introSection');
		this.endingSection = this.selector('.endSection');
		this.questionSection = this.selector('.questionSection');
		this.reviewSection = this.selector('.reviewSection');
		this.instructionSection = this.selector('.instructionSection');
		// counter
		this.counter = 0;
		//this.tempCounter = -1;
		this.currentScreen = model.getUserData('bookmark').split('&')[0].toUpperCase();
		if(model.getUserData('bookmark').split('&').length === 2){
			this.counter = Number(model.getUserData('bookmark').split('&')[1])
		}
		
		// some events added here
		this.previousBtn.on("click", "", this.previousClickHandler.bind(this));
		this.nextBtn.on("click", "", this.nextClickHandler.bind(this));
		this.reviewBtn.on("click", "", this.reviewFormation.bind(this));
		this.reviewQuestion.on("click","LI", $this.reviewQuestionClickHandler.bind(this));
		this.endQuestionList.on("click","LI", $this.reviewQuestionClickHandler.bind(this));
		this.submitTest.on("click", "", this.endScreenFormation.bind(this));
		// header dom
		this.chapterSubtitle.setHTML(model.dataAll.chapterSubtitle);
		this.chapterTitle.setHTML(model.dataAll.chapterTitle);
		this.userName.setHTML(model.dataAll.userData.name);

		this.isOptionClickable = true;
		this.pageLoader();
	}

	timeManager(){
		if(!this.isTimerStart){
			this.isTimerStart = true;
			let time = Number(model.dataAll.time);
			this.timer.setHTML(utils.convertMinutesToHours(time));
			const $this = this;

			const timeInterval = setInterval(function(){
				time = --time;
				$this.timer.setHTML(utils.convertMinutesToHours(time))
				model.setUserData('remainTime', time);

				if(time === 0){
					$this.currentScreen = 'END_SCREEN';
					$this.pageLoader();
					clearInterval(timeInterval);
				}
			}, 10000)
		}
	}
	
	pageLoader(){
		this.introSection.addClass('hide');
		this.questionSection.addClass('hide');
		this.reviewSection.addClass('hide');
		this.endingSection.addClass('hide');
		this.instructionSection.addClass('hide');

		this.nextBtn.disabled = true;
		this.previousBtn.disabled = true;
		this.reviewBtn.disabled = true;

		switch (this.currentScreen) {
			case 'QUIZ_SCREEN':
				model.setCurrentQuestionSetId = this.counter;
				this.currentQuestionCount.setHTML(this.counter + 1);
				this.totalQuestionCount.setHTML(model.getUserQuestionsSetId.length);
				this.questionSection.removeClass('hide');

				this.optionHolder.removeClass('matching');
				this.isOptionClickable = true;
				if(model.getCurrentQuestionType === "tnf"){
					this.tnfFormation();
				}else if(model.getCurrentQuestionType === "matching"){
					this.isOptionClickable = false;
					this.matchingFormation();
				}else{
					this.mmcqFormation();
				}

				this.question.setHTML(model.getCurrentQuestion);
				this.timeManager();
				this.nextBtn.disabled = false;
				this.previousBtn.disabled = false;
				this.reviewBtn.disabled = false;
				break;
			case 'REVIEW_SCREEN':
				this.reviewSection.removeClass('hide');
				this.reviewQuestion.setHTML(this.reviewQuestionList());
				this.nextBtn.disabled = true;
				this.previousBtn.disabled = false;
				break;
			case 'END_SCREEN':
				this.endingSection.removeClass('hide');
				this.endQuestionList.setHTML(this.reviewQuestionList());

				this.pass.removeClass('hide');
				model.setUserData('status', 'completed');
				
				const scoreSum = model.dataAll.userData.questionScore.reduce((sum, x) => sum + x);
				const scorePercentage = scoreSum * 100 / Number(model.getUserQuestionsSetId.length);
				model.setUserData('score', scorePercentage);
				this.score.setHTML(scorePercentage);

				break;
			case 'INSTRUCTION_SCREEN':
				this.instructionSection.removeClass('hide');
				this.nextBtn.disabled = false;
				this.previousBtn.disabled = false;
				break;
			default:
				this.introSection.removeClass('hide');
				this.nextBtn.disabled = false;
				break;
		}

		model.setUserData('bookmark', (this.currentScreen === 'QUIZ_SCREEN') ? `${this.currentScreen}&${this.counter}` : this.currentScreen);
		this.setSCOData(); // update data on LMS
	}

	reviewQuestionClickHandler(e) {
		if(this.currentScreen === 'END_SCREEN'){
			const target = e.querySelector('.optionHolder');
			const question = e.querySelector('.question');
			const contentHolder = e.querySelector('.contentHolder');

			// reset all selected LIs
			this.selector('.endQuestionList li').forEach(function(item){
				item.querySelector('.contentHolder')?.removeClass('open')
				item.querySelector('.optionHolder')?.addClass('hide')
			})

			if(contentHolder.class('open')){
				contentHolder.removeClass('open')
			}else{
				contentHolder.addClass('open')
			}

			if(target.class('hide')){
				target.removeClass('hide')
				question.removeClass('hide')
			}else{
				target.addClass('hide')
				question.addClass('hide')
			}
		} else {
			this.counter = +e.getAttribute("data-index");
			this.currentScreen = 'QUIZ_SCREEN';
			this.pageLoader();
		}
	}

	previousClickHandler() {
		if(this.currentScreen === 'INSTRUCTION_SCREEN'){
			this.currentScreen = 'INTRO_SCREEN';
			this.pageLoader();
			return false;
		}
		
		if((this.counter === 0) && this.currentScreen === 'QUIZ_SCREEN'){
			this.currentScreen = 'INSTRUCTION_SCREEN';
			this.pageLoader();
			return false;
		}

		if(this.currentScreen === 'REVIEW_SCREEN'){
			this.counter = Number(model.getUserData('previousScreen'))
		} else {
			this.counter = --this.counter;
		}
		
		this.currentScreen = 'QUIZ_SCREEN';
		this.pageLoader();
	}

	nextClickHandler() {
		if(this.currentScreen === 'INTRO_SCREEN'){
			this.currentScreen = 'INSTRUCTION_SCREEN';
			this.pageLoader();
			return false;
		}

		if(this.currentScreen === 'INSTRUCTION_SCREEN'){
			this.currentScreen = 'QUIZ_SCREEN';
			this.pageLoader();
			return false;
		}

		if(this.currentScreen === 'QUIZ_SCREEN'){
			if(this.counter > model.getUserQuestionsSetId.length - 2){
				model.setUserData('previousScreen', this.counter);
				this.currentScreen = 'REVIEW_SCREEN';
			}else{
				this.counter = ++this.counter;
			}
			
			this.pageLoader();
			return false;
		}

		if(this.currentScreen === 'REVIEW_SCREEN'){
			this.currentScreen = 'END_SCREEN';
			this.pageLoader();
			return false;
		}
	}

	endScreenFormation(){
		this.currentScreen = 'END_SCREEN';
		this.pageLoader();
	}

	reviewFormation() {
		model.setUserData('previousScreen', this.counter);
		this.currentScreen = 'REVIEW_SCREEN';
		this.pageLoader();
	}
	
	reviewQuestionList() {
		const svg = `<svg width="25px" height="25px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="icomoon-ignore"></g><path d="M2.639 15.992c0 7.366 5.97 13.337 13.337 13.337s13.337-5.97 13.337-13.337-5.97-13.337-13.337-13.337-13.337 5.97-13.337 13.337zM28.245 15.992c0 6.765-5.504 12.27-12.27 12.27s-12.27-5.505-12.27-12.27 5.505-12.27 12.27-12.27c6.765 0 12.27 5.505 12.27 12.27z" fill="#000000"></path><path d="M19.159 16.754l0.754-0.754-6.035-6.035-0.754 0.754 5.281 5.281-5.256 5.256 0.754 0.754 3.013-3.013z" fill="#000000"></path></svg>`

		let str = model.getUserQuestionsSetId
			.map(
				(item, index) =>{
					const data = model.dataAll.set[utils.getCategoryId(item)][utils.getQuestionId(item)];
					const isQuestionAttempt = this.getAttemptQuestion(item);
					const isCorrectAnswer = this.getListLabel(isQuestionAttempt, index, Number(data.weightage));

					return (`<li data-index="${index}">
						<div class="content ${isCorrectAnswer.toLocaleLowerCase() === 'correct' ? 'hideResultInnerHolder':''}">
							<div class="contentHolder">
								${svg} ${index+1}. <div>${data.question}</div>
							</div>
							<div class="question hide">${data.question}</div>
							${this.getQuestionOptionsFormation(item)}
						</div>
						<div class="${isQuestionAttempt ? 'answered' : 'unanswered'}">
							${isCorrectAnswer}
						</div>
					</li>`)
				}
			)
			.join("");
		
		return str = `<li class="header">
						<div class="content">Question</div>
						<div>Status</div>
					</li> ${str}`;
	}

	getQuestionOptionsFormation(id){
		if(this.currentScreen !== 'END_SCREEN'){
			return '';
		}

		const alphbetArray = ["A", "B", "C", "D", "E"];

		const categoryID = utils.getCategoryId(id);
		const questionID = utils.getQuestionId(id);

		const tempCid = model.getUserAttemptQuestions[categoryID];
		const tempQid = tempCid && tempCid[questionID];
		const options = model.dataAll.set[categoryID][questionID].options;
		const type = model.dataAll.set[categoryID][questionID].type.toLowerCase();
		const dropdown = model.dataAll.set[categoryID][questionID].dropdown;
		console.log(tempQid)
		return `<ul class="optionHolder hide">
			${options
				.map(
					(item, index) => {
						const userSelectedItems = this.userSelected(item, tempQid, type);

						return(`<li 
							uid="${item.optionId}" 
							n="${item.isCorrect}" 
							class="${(type !== 'matching') && (item.isCorrect === 1) ? 'correct' : ''} ${userSelectedItems ? 'active' : ''} ${(userSelectedItems && (type === 'matching')) ? 'correct' : ''}  ${type === 'matching' ? 'matching':''}">
						<div class="optionInnerHolder">
							<span class="bullet">${alphbetArray[index]}</span>
							<p class="option">
								${item.option}
								</p>
						</div>
						<div class="resultInnerHolder">
							<span class="correctAnswer">Correct Answer ${(type === 'matching') ? `: <i>(${dropdown[item.isCorrect]})</i>` : '' }</span>
							<span class="yourAnswer">Your Answer ${(type === 'matching') ? `: <i>(${dropdown[tempQid[index]]})</i>` : '' }</span>
						</div>
					</li>`)}
				)
				.join("")
			}
		</ul>`
	}

	userSelected(item, tempQid, type){
		let isSelected = false;

		if(tempQid){
			if(type === 'matching' && item){
				isSelected = (+tempQid[item.optionId] === item.isCorrect)
			} else {
				tempQid.map( i => {
					isSelected = (item.optionId === Number(i))
				})
			}
		}
		
		return isSelected;
	}

	getAttemptQuestion(id){
		let isMatched = false;
		let tempBoolean = true;
		const categoryID = utils.getCategoryId(id);
		const questionID = utils.getQuestionId(id);

		const tempCid = model.getUserAttemptQuestions[categoryID];
		const tempQid = tempCid && tempCid[questionID];
		
		if(this.currentScreen === 'REVIEW_SCREEN'){
			isMatched = (tempCid && tempQid);
		} else {
			if(tempCid && tempQid){
				model.dataAll.set[categoryID][questionID].options.map( item => {
					if(model.dataAll.set[categoryID][questionID].type.toLowerCase() === 'matching'){
						if(tempBoolean){
							isMatched = (Number(tempQid[item.optionId]) === Number(item.isCorrect));
							tempBoolean = isMatched;
						}
					} else {
						for(let i=0; i < tempQid.length; i++){
							if(Number(item.optionId) === Number(tempQid[i]) && tempBoolean){
								isMatched = (item.isCorrect === 1);
								tempBoolean = isMatched;
							}
						}
					}
				})
			}
		}
		return isMatched;
	}
	
	getListLabel(value, index, weightage){
		if(value){
			if(this.currentScreen === 'END_SCREEN'){
				const score = (weightage > 0) ? weightage : 1;
				model.setScore(index, score);
			}
			return (this.currentScreen === 'REVIEW_SCREEN') ? 'Answered': 'Correct';
		} else {
			return (this.currentScreen === 'REVIEW_SCREEN') ? 'Unanswered': 'Incorrect';
		}
	}

	matchingFormation(){
		const $this = this;
		this.optionHolder.addClass('matching');
		const alphbetArray = model.dataAll.set[model.getCurrentCategoryId][model.getCurrentQuestionId].bulletPoint;
		const numberArray = [0, 1, 2, 3, 5, 6, 7];
		const dropdown = model.dataAll.set[model.getCurrentCategoryId][model.getCurrentQuestionId].dropdown;
		this.selectedOption = new Array(model.getCurrentOptions.length).fill(null);

		// enable / disable as per previous selection
		const tempCid = model.getUserAttemptQuestions[model.getCurrentCategoryId];
		const activeOptions = (tempCid && tempCid[model.getCurrentQuestionId]) ? tempCid[model.getCurrentQuestionId] : [];
		this.selectedOption = (activeOptions.length !== 0) ? activeOptions : this.selectedOption;

		this.optionHolder.setHTML(
			model.getCurrentOptions
				.map(
					(item, index) => `<li>
						<div class="selectBoxHolder">
							<select uid="${item.optionId}">
								${((activeOptions[index] === null) || (activeOptions.length === 0)) && `<option>Select</option>`}
								${dropdown.map((item, i) => 
									`<option ${((+activeOptions[index] === numberArray[i]) && (activeOptions[index] !== null)) && 'selected'} value="${numberArray[i]}">${dropdown[i]}</option>`).join("")}
							</select>
						</div>
						<div class="selectLabel" sid="">
							<img src="./img/warning-svgrepo-com.svg" />
							${alphbetArray[index]}. ${item.option}
						</div>
					</li>`
				).join("")
		);

		const selectionArr = [];
		this.selector('#optionHolder .selectBoxHolder select').forEach( item => {
			selectionArr.push(null)
			item.addEventListener('change', function(e){
				const targetValue = e.currentTarget.value;
				// removing first option on change
				let firstOption = e.currentTarget.querySelector('option');
				if (firstOption && firstOption.textContent === 'Select') {
					firstOption.remove();
				}

				// check duplicate selection
				$this.selectedOption[e.currentTarget.getAttribute('uid')] = targetValue;
				selectionArr[Number(e.currentTarget.getAttribute('uid'))] = targetValue === "" ? null : targetValue;
				document.querySelectorAll('#optionHolder li').forEach(function(elm){elm.removeClass('conflict')});

				const duplicateArr = utils.findDuplicateIndexes(selectionArr);
				Object.keys(duplicateArr).map( i => {
					if(i !== 'null'){
						duplicateArr[i].map( j => {
							document.querySelectorAll('#optionHolder li')[j].addClass('conflict');
						});
					}
				})

				e.currentTarget.parentNode.parentNode.querySelector('.selectLabel').setAttr('sid', e.currentTarget.value)
				$this.setUserAttemptQuestions(selectionArr);
			})
		})

		activeOptions.map( (item, index) => {
			if(item !== null){
				document.querySelectorAll('#optionHolder select')[index].dispatchEvent(new Event('change'))
			}
		})
	}

	setUserAttemptQuestions(oid){
		model.setUserAttemptQuestions = { 
			"cid": model.getCurrentCategoryId, 
			"qid": model.getCurrentQuestionId, 
			"oid": oid
		}
	}

	tnfFormation() {
		const $this = this;
		const options = model.getCurrentOptions;

		this.optionHolder.setHTML(`<div id="options">
				<button class="btn btnTF" id="btnTrue" uid="${options[0].optionId}" n="${options[0].isCorrect}">${options[0].option}</button>
				<button class="btn btnTF" id="btnFalse" uid="${options[1].optionId}" n="${options[1].isCorrect}">${options[1].option}</button>
			</div>`);
		
		// disabling / enabling cta as per selection
		const tempCid = model.getUserAttemptQuestions[model.getCurrentCategoryId];
		if(tempCid && tempCid[model.getCurrentQuestionId]){
			const tempQid = tempCid[model.getCurrentQuestionId];
			$this.selector("#btnFalse").disabled = ($this.selector("#btnFalse").getAttribute('uid') === tempQid[0])
			$this.selector("#btnTrue").disabled = ($this.selector("#btnTrue").getAttribute('uid') === tempQid[0])
		}

		this.selector("#btnTrue").on("click", "", function (elm) {
			elm.disabled = true;
			$this.selector("#btnFalse").disabled = false;
			$this.setUserAttemptQuestions([elm.getAttribute('uid')]);
		});

		this.selector("#btnFalse").on("click", "", function (elm) {
			$this.selector("#btnTrue").disabled = false;
			elm.disabled = true;
			$this.setUserAttemptQuestions([elm.getAttribute('uid')]);
		});
	}

	mmcqFormation() {
		const $this = this;
		const alphbetArray = ["A", "B", "C", "D", "E"];
		$this.selectedOption = [];

		if (!this.optionHolder.getAttribute("listener")) {
			this.optionHolder.setAttr("listener", "true");
			this.optionHolder.on("click", "LI", function (elm) {
				if(!$this.isOptionClickable){
					return false;
				}
				// twice click remove active class
				if (elm.class("active")) {
					elm.removeClass("active");
				} else {
					if (model.getCurrentQuestionType === "mmcq") {
						elm.addClass("active");

						if (elm.class("active")) {
							$this.selectedOption.push(elm.getAttribute('uid'))
						} else {
							$this.selectedOption = $this.selectedOption.filter(item => item !== elm.getAttribute('uid'))
						}
					} else {
						$this
							.selector("#optionHolder li")
							.forEach(function (elmLi) {
								elmLi.removeClass("active");
							});
						elm.addClass("active");
						$this.selectedOption = [elm.getAttribute('uid')]
					}
				}
				
				$this.setUserAttemptQuestions($this.selectedOption)
			});
		}
		
		// enable / disable as per previous selection
		const tempCid = model.getUserAttemptQuestions[model.getCurrentCategoryId];
		const activeOptions = (tempCid && tempCid[model.getCurrentQuestionId]) ? tempCid[model.getCurrentQuestionId] : [];
		
		this.optionHolder.setHTML(
			model.getCurrentOptions
				.map(
					(item, index) => `<li uid="${item.optionId}" n="${item.isCorrect}" 
							class="${(String(activeOptions).match(item.optionId) !== null) ? 'active' : ''}">
						<span class="bullet">${alphbetArray[index]}</span>
						<p class="option">${item.option}</p>
					</li>`
				).join("")
		);
	}

	// providing selected dom
	selector(str) {
		if (document.querySelectorAll(str).length === 1) {
			return document.querySelectorAll(str)[0];
		}

		if (document.querySelectorAll(str).length > 1) {
			return document.querySelectorAll(str);
		}
	}

	//TODO: for demo only will claer later
	addListeners() {
		/* window.dispatchEvent(
			new CustomEvent("CHAPTER_COMPLETED", {
				bubbles: true,
				detail: { test: "test" },
			})
		); */
	}

	setSCOData() {
		if (scoData.trackingMode != null) {
			scoData.setValue("lessonLocation", JSON.stringify(model.data.userData.bookmark));
			scoData.setValue("suspendData", JSON.stringify(model.data.userData));
			scoData.setValue("lessonStatus", model.data.userData.status);
			scoData.setValue("score", model.data.userData.score);
			scoData.commit();
		}
	}
}

//-------------------------------------------------------------
// Utility function to add a class
Element.prototype.addClass = function (className) {
	this.classList.add(className);
	return this; // Return the element to allow chaining
};

// Utility function to add a class
Element.prototype.class = function (className) {
	return this.classList.contains(className); // Return the element to allow chaining
};

// Utility function to remove a class
Element.prototype.removeClass = function (className) {
	this.classList.remove(className);
	return this; // Return the element to allow chaining
};

// Utility function to toggle a class
Element.prototype.toggleClass = function (className) {
	this.classList.toggle(className);
	return this; // Return the element to allow chaining
};

// Utility function to set an attribute
Element.prototype.setAttr = function (attrName, attrValue) {
	this.setAttribute(attrName, attrValue);
	return this; // Return the element to allow chaining
};

// Utility function to get an attribute
Element.prototype.getAttr = function (attrName) {
	this.getAttribute(attrName);
	return this; // Return the element to allow chaining
};

// Utility function to set innerHTML
Element.prototype.setHTML = function (html) {
	this.innerHTML = html;
	return this; // Return the element to allow chaining
};

// Utility function for add event listener
Element.prototype.on = function (event, target, fn) {
	if (!target) {
		this.addEventListener(event, function (evt) {
			fn(evt.currentTarget);
		});
	} else {
		this.addEventListener(event, function (evt) {
			// Traverse up the DOM tree to find the LI element
			let clickedElement = evt.target;
			while (clickedElement && clickedElement !== evt.currentTarget) {
				if (clickedElement.tagName === target) {
					fn(clickedElement);
					break;
				}
				clickedElement = clickedElement.parentNode;
			}
		});
	}

	return this; // Return the element to allow chaining
};
