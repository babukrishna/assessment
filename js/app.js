class App {
	constructor() {}

	//Initializes scorm and model
	async init() {
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
		// 
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
		// all sections
		this.introSection = this.selector('.introSection');
		this.endingSection = this.selector('.endSection');
		this.questionSection = this.selector('.questionSection');
		this.reviewSection = this.selector('.reviewSection');
		this.instructionSection = this.selector('.instructionSection');
		// counter
		this.counter = 0;
		this.currentScreen = 'END_SCREEN';

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

		this.pageLoader();
	}
	
	pageLoader(){
		this.introSection.addClass('hide');
		this.questionSection.addClass('hide');
		this.reviewSection.addClass('hide');
		this.endingSection.addClass('hide');
		this.instructionSection.addClass('hide');

		switch (this.currentScreen) {
			case 'QUIZ_SCREEN':
				model.setCurrentQuestionSetId = this.counter;
				this.currentQuestionCount.setHTML(this.counter + 1);
				this.totalQuestionCount.setHTML(model.getUserQuestionsSetId.length);
				this.questionSection.removeClass('hide');

				this.optionHolder.removeClass('matching');
				if(model.getCurrentQuestionType === "tnf"){
					this.tnfFormation();
				}else if(model.getCurrentQuestionType === "matching"){
					this.matchingFormation();
				}else{
					this.mmcqFormation();
				}

				this.question.setHTML(model.getCurrentQuestion);
				this.nextBtn.disabled = this.counter > model.getUserQuestionsSetId.length - 2;
				this.previousBtn.disabled = this.counter === 0;
				this.reviewBtn.disabled = false;
				break;
			case 'REVIEW_SCREEN':
				this.reviewSection.removeClass('hide');
				this.reviewQuestion.setHTML(this.reviewQuestionList());
				
				this.nextBtn.disabled = true;
				this.previousBtn.disabled = true;
				this.reviewBtn.disabled = true;
				break;
			case 'END_SCREEN':
				this.endingSection.removeClass('hide');
				this.endQuestionList.setHTML(this.reviewQuestionList());
				break;
			case 'INSTRUCTION_SCREEN':
				this.instructionSection.removeClass('hide');
				break;
			default:
				this.introSection.removeClass('hide');
				break;
		}
	}

	reviewQuestionClickHandler(e) {
		if(this.currentScreen === 'END_SCREEN'){
			console.log(+e.getAttribute("data-index"))
		} else {
			this.counter = +e.getAttribute("data-index");
			this.currentScreen = 'QUIZ_SCREEN';
			this.pageLoader();
		}
	}

	previousClickHandler() {
		this.counter = --this.counter;
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
			this.counter = ++this.counter;
			this.pageLoader();
		}
	}

	endScreenFormation(){
		this.currentScreen = 'END_SCREEN';
		this.pageLoader();
	}

	reviewFormation() {
		this.currentScreen = 'REVIEW_SCREEN';
		this.pageLoader();
	}
	
	reviewQuestionList() {
		const attemptQuestion = (id) => {
			let isMatched = false;
			let tempBoolean = true;
			const categoryID = utils.getCategoryAndQuestionId(id)[0];
			const questionID = utils.getCategoryAndQuestionId(id)[1];

			const tempCid = model.getUserAttemptQuestions[categoryID];
			const tempQid = tempCid && tempCid[questionID];
			
			if(this.currentScreen === 'REVIEW_SCREEN'){
				isMatched = (tempCid && tempQid);
			} else {
				if(tempCid && tempQid){
					model.dataAll.set[categoryID][questionID].options.map( item => {
						if(model.dataAll.set[categoryID][questionID].type === 'matching'){
							if(tempBoolean){
								isMatched = (tempQid[item.optionId] === item.isCorrect);
								tempBoolean = isMatched;
							}
						} else {
							for(let i=0; i < tempQid.length; i++){
								if(item.optionId === Number(tempQid[i]) && tempBoolean){
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

		const questionOptions = (id) => {
			const alphbetArray = ["A", "B", "C", "D", "E"];

			const categoryID = utils.getCategoryAndQuestionId(id)[0];
			const questionID = utils.getCategoryAndQuestionId(id)[1];

			const tempCid = model.getUserAttemptQuestions[categoryID];
			const tempQid = tempCid && tempCid[questionID];
			const options = model.dataAll.set[categoryID][questionID].options;
			console.log(tempQid)

			const isCorrect = (item) => {
				
			}

			return `<ul id="optionHolder" class="optionHolder">
				${options
					.map(
						(item, index) => `<li 
								uid="${item.optionId}" 
								n="${item.isCorrect}" 
								class="${item.isCorrect === 1 ? 'correct' : ''} ${isCorrect(item) ? 'active' : ''}">
							<span class="bullet">${alphbetArray[index]}</span>
							<p class="option">${item.option}</p>
						</li>`
					)
					.join("")
				}
			</ul>`
		}
		
		let str = model.getUserQuestionsSetId
			.map(
				(item, index) =>
					`<li data-index="${index}">
						<div class="content">
							<div class="contentHolder">
								<svg width="25px" height="25px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="icomoon-ignore"></g><path d="M2.639 15.992c0 7.366 5.97 13.337 13.337 13.337s13.337-5.97 13.337-13.337-5.97-13.337-13.337-13.337-13.337 5.97-13.337 13.337zM28.245 15.992c0 6.765-5.504 12.27-12.27 12.27s-12.27-5.505-12.27-12.27 5.505-12.27 12.27-12.27c6.765 0 12.27 5.505 12.27 12.27z" fill="#000000"></path><path d="M19.159 16.754l0.754-0.754-6.035-6.035-0.754 0.754 5.281 5.281-5.256 5.256 0.754 0.754 3.013-3.013z" fill="#000000"></path></svg>
								${index+1}. ${model.dataAll.set[utils.getCategoryAndQuestionId(item)[0]][utils.getCategoryAndQuestionId(item)[1]].question}
							</div>
							${questionOptions(item)}
						</div>
						<div class="${attemptQuestion(item) ? 'answered' : 'unanswered'}">
							${attemptQuestion(item) ? 
								`${(this.currentScreen === 'REVIEW_SCREEN') ? 'Answered': 'Correct'}` : 
								`${(this.currentScreen === 'REVIEW_SCREEN') ? 'Unanswered': 'Incorrect'}`}
						</div>
					</li>`
			)
			.join("");
		
		return str = `<li class="header">
						<div class="content">Question</div>
						<div>Status</div>
					</li> ${str}`;
	}

	matchingFormation(){
		const $this = this;
		this.optionHolder.addClass('matching');
		const alphbetArray = ["A", "B", "C", "D", "E"];
		const alphbetArraySmall = ["a", "b", "c", "d", "e"];
		this.selectedOption = new Array(model.getCurrentOptions.length).fill(null);

		// enable / disable as per previous selection
		const tempCid = model.getUserAttemptQuestions[model.getCurrentCategoryId];
		const activeOptions = (tempCid && tempCid[model.getCurrentQuestionId]) ? tempCid[model.getCurrentQuestionId] : [];
		
		this.optionHolder.setHTML(
			model.getCurrentOptions
				.map(
					(item, index) => `<li>
						<div class="selectBoxHolder">
							<select uid="${item.optionId}">
								${activeOptions.length === 0 && `<option>Select</option>`}
								${item.dropdown.map((item, i) => `<option ${activeOptions[index] === alphbetArraySmall[i] && 'selected'} value="${alphbetArraySmall[i]}">${item}</option>`).join("")}
							</select>
						</div>
						<div class="selectLabel">${alphbetArray[index]}. ${item.option}</div>
					</li>`
				)
				.join("")
		);

		

		this.selector('#optionHolder .selectBoxHolder select').forEach( item => {
			item.addEventListener('change', function(e){
				let firstOption = e.currentTarget.querySelector('option');
				if (firstOption && firstOption.textContent === 'Select') {
					firstOption.remove();
				}

				$this.selectedOption[e.currentTarget.getAttribute('uid')] = e.currentTarget.value;

				model.setUserAttemptQuestions = { 
					"cid": model.getCurrentCategoryId, 
					"qid": model.getCurrentQuestionId, 
					"oid": $this.selectedOption
				}
			})
		})
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

			model.setUserAttemptQuestions = { 
				"cid": model.getCurrentCategoryId, 
				"qid": model.getCurrentQuestionId, 
				"oid": [elm.getAttribute('uid')]
			}
		});

		this.selector("#btnFalse").on("click", "", function (elm) {
			$this.selector("#btnTrue").disabled = false;
			elm.disabled = true;

			model.setUserAttemptQuestions = { 
				"cid": model.getCurrentCategoryId, 
				"qid": model.getCurrentQuestionId, 
				"oid": [elm.getAttribute('uid')]
			}
		});
	}

	mmcqFormation() {
		const $this = this;
		const alphbetArray = ["A", "B", "C", "D", "E"];
		$this.selectedOption = [];

		if (!this.optionHolder.getAttribute("listener")) {
			this.optionHolder.setAttr("listener", "true");
			this.optionHolder.on("click", "LI", function (elm) {
				// twice click remove active class
				if (elm.class("active")) {
					elm.removeClass("active");
				} else {
					if (model.getCurrentQuestionType === "mmcq") {
						elm.addClass("active");
					} else {
						$this
							.selector("#optionHolder li")
							.forEach(function (elmLi) {
								elmLi.removeClass("active");
							});
						elm.addClass("active");
					}
				}

				if (model.getCurrentQuestionType === "mmcq") {
					if (elm.class("active")) {
						$this.selectedOption.push(elm.getAttribute('uid'))
					} else {
						$this.selectedOption = $this.selectedOption.filter(item => item !== elm.getAttribute('uid'))
					}
				} else {
					$this.selectedOption = [elm.getAttribute('uid')]
				}
				
				model.setUserAttemptQuestions = { 
					"cid": model.getCurrentCategoryId, 
					"qid": model.getCurrentQuestionId, 
					"oid": $this.selectedOption
				}
			});
		}
		
		// enable / disable as per previous selection
		const tempCid = model.getUserAttemptQuestions[model.getCurrentCategoryId];
		const activeOptions = (tempCid && tempCid[model.getCurrentQuestionId]) ? tempCid[model.getCurrentQuestionId] : [];
		
		this.optionHolder.setHTML(
			model.getCurrentOptions
				.map(
					(item, index) => `<li 
							uid="${item.optionId}" 
							n="${item.isCorrect}" 
							class="${(String(activeOptions).match(item.optionId) !== null) ? 'active' : ''}">
						<span class="bullet">${alphbetArray[index]}</span>
						<p class="option">${item.option}</p>
					</li>`
				)
				.join("")
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
	/* async loadManifest() {
		const response = await fetch("data/manifest.json");
		return await response.json();
	} */

	//TODO: for demo only will claer later
	addListeners() {
		/* window.dispatchEvent(
			new CustomEvent("CHAPTER_COMPLETED", {
				bubbles: true,
				detail: { test: "test" },
			})
		); */
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
