class App {
	isHelpOpened = false;
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
		this.questionSection = this.selector('.questionSection');
		this.title = this.selector(".quizHolder .title");
		this.description = this.selector(".quizHolder .description");
		this.question = this.selector("#ques");
		this.optionHolder = this.selector("#optionHolder");
		
		this.previousBtn = this.selector("#prevCTA");
		this.nextBtn = this.selector("#nextCTA");
		
		this.reviewSection = this.selector('.reviewSection');
		this.reviewBtn = this.selector("#reviewCTA");
		this.reviewHolder = this.selector("#reviewHolder");
		this.reviewQuestion = this.selector("#reviewHolder .reviewQuestionList");

		this.currentQuestionCount = this.selector(".currentQuestionCount");
		this.totalQuestionCount = this.selector(".totalQuestionCount");

		this.chapterTitle = this.selector('.chapter .title');
		this.chapterSubtitle = this.selector('.chapter .subtitle');
		this.userName = this.selector('.user .userName');
		this.userPhoto = this.selector('.user .userImage');

		this.intro = this.selector('.intro');
		this.ending = this.selector('.ending');

		// counter
		this.counter = 0;
		// setting default current index as 0
		// model.setCurrentQuestionSetId = this.counter;

		// initial question formation
		// this.titleAndDescriptionFormation();
		// this.questionFormation();
		// this.optionFormation();

		// re initiate
		// this.quizFormation();

		// some events added here
		this.previousBtn.on("click", "", this.previousClickHandler.bind(this));
		this.nextBtn.on("click", "", this.nextClickHandler.bind(this));
		this.reviewBtn.on("click", "", $this.reviewFormation.bind(this));
		this.reviewQuestion.on("click","LI", $this.reviewQuestionClickHandler.bind(this));
		// header dom
		this.chapterSubtitle.setHTML(model.dataAll.chapterSubtitle);
		this.chapterTitle.setHTML(model.dataAll.chapterTitle);
		this.userName.setHTML(model.dataAll.userData.name);
		this.userPhoto.setAttr('src', model.dataAll.userData.photo);
	}

	optionFormation() {
		model.getCurrentQuestionType === "tnf"
			? this.tnfFormation()
			: this.mmcqFormation();
	}

	reviewQuestionClickHandler(e) {
		this.counter = +e.getAttribute("data-index");
		this.quizFormation();
	}

	previousClickHandler() {
		this.counter = --this.counter;
		this.quizFormation();
	}

	nextClickHandler() {
		if(!this.intro.class('hide')){
			this.intro.addClass('hide');
			this.quizFormation();
		} else{
			this.counter = ++this.counter;
			this.quizFormation();
		}
	}

	quizFormation() {
		// this.titleAndDescriptionFormation();
		model.setCurrentQuestionSetId = this.counter;
		this.questionFormation();
		this.optionFormation();
		this.reviewSection.addClass("hide");
		this.questionSection.removeClass("hide");

		this.currentQuestionCount.setHTML(this.counter + 1);
		this.totalQuestionCount.setHTML(model.getUserQuestionsSetId.length);

		this.nextBtn.disabled = this.counter > model.getUserQuestionsSetId.length - 2;
		this.previousBtn.disabled = this.counter === 0;
	}

	reviewFormation() {
		this.question.setHTML("");
		this.optionHolder.setHTML("");
		this.reviewSection.removeClass("hide");
		this.questionSection.addClass("hide");
		this.intro.addClass('hide');
		this.reviewQuestion.setHTML(this.reviewQuestionList());

		this.nextBtn.disabled = true;
		this.previousBtn.disabled = true;
	}

	reviewQuestionList(id) {
		const attemptQuestion = (id) => {
			if(model.getUserAttemptQuestions[utils.getCategoryAndQuestionId(id)[0]] && 
				model.getUserAttemptQuestions[utils.getCategoryAndQuestionId(id)[0]][utils.getCategoryAndQuestionId(id)[1]]){
				return true;
			}

			return false;
		}

		let str = model.getUserQuestionsSetId
			.map(
				(item, index) =>
					`<li data-index="${index}">
						<div class="content">
							<svg width="25px" height="25px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="icomoon-ignore"></g><path d="M2.639 15.992c0 7.366 5.97 13.337 13.337 13.337s13.337-5.97 13.337-13.337-5.97-13.337-13.337-13.337-13.337 5.97-13.337 13.337zM28.245 15.992c0 6.765-5.504 12.27-12.27 12.27s-12.27-5.505-12.27-12.27 5.505-12.27 12.27-12.27c6.765 0 12.27 5.505 12.27 12.27z" fill="#000000"></path><path d="M19.159 16.754l0.754-0.754-6.035-6.035-0.754 0.754 5.281 5.281-5.256 5.256 0.754 0.754 3.013-3.013z" fill="#000000"></path></svg>
							${model.dataAll.set[utils.getCategoryAndQuestionId(item)[0]][utils.getCategoryAndQuestionId(item)[1]].question}
						</div>
						<div class="${attemptQuestion(item) ? 'answered' : 'unanswered'}">Unanswered</div>
					</li>`
			)
			.join("");
		
		return str = `<li class="header">
						<div class="content">Question</div>
						<div>Status</div>
					</li> ${str}`;
	}

	tnfFormation() {
		const $this = this;
		const options = model.getCurrentOptions;

		this.optionHolder.setHTML(`<div id="options">
			<button class="btn btnTF" id="btnTrue" uid="${options[0].optionId}" n="${options[0].isCorrect}">${options[0].option}</button>
			<button class="btn btnTF" id="btnFalse" uid="${options[1].optionId}" n="${options[1].isCorrect}">${options[1].option}</button>
		</div>`);
		
		// disabling / enabling cta as per selection
		if(model.getUserAttemptQuestions[model.getCurrentCategoryId] && model.getUserAttemptQuestions[model.getCurrentCategoryId][model.getCurrentQuestionId]){
			const activeOptions = model.getUserAttemptQuestions[model.getCurrentCategoryId][model.getCurrentQuestionId]
			$this.selector("#btnFalse").disabled = ($this.selector("#btnFalse").getAttribute('uid') === activeOptions[0])
			$this.selector("#btnTrue").disabled = ($this.selector("#btnTrue").getAttribute('uid') === activeOptions[0])
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
		const options = model.getCurrentOptions;
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
		
		let activeOptions = [];
		if(model.getUserAttemptQuestions[model.getCurrentCategoryId] && model.getUserAttemptQuestions[model.getCurrentCategoryId][model.getCurrentQuestionId]){
			activeOptions = model.getUserAttemptQuestions[model.getCurrentCategoryId][model.getCurrentQuestionId]
		}
		
		this.optionHolder.setHTML(
			options
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

	// TODO: currently on hold will take it further
	titleAndDescriptionFormation(str) {
		this.title.setHTML(
			utils.findAndReplaceString(
				this.data[model.getQuestionFromCategoryId].title
			)
		);
		this.description.setHTML(
			utils.findAndReplaceString(
				this.data[model.getQuestionFromCategoryId].description
			)
		);
	}

	// formation of the question
	questionFormation() {
		this.question.setHTML(
			`${model.getCurrentQuestion}`
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
		window.dispatchEvent(
			new CustomEvent("CHAPTER_COMPLETED", {
				bubbles: true,
				detail: { test: "test" },
			})
		);
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
