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
		this.title = this.selector(".quizHolder .title");
		this.description = this.selector(".quizHolder .description");
		this.question = this.selector("#ques");
		this.optionHolder = this.selector("#optionHolder");
		this.previousBtn = this.selector("#prevCTA");
		this.nextBtn = this.selector("#nextCTA");
		this.reviewBtn = this.selector("#reviewCTA");
		this.reviewHolder = this.selector("#reviewHolder");
		this.reviewQuestion = this.selector("#reviewHolder .reviewQuestionList");

		// counter
		this.counter = 0;
		// create user question set
		model.setUserQuestionSet = model.getQuestionFromCategoryId;
		// setting default current index as 0
		model.setCurrentQuestionId = this.counter;

		// initial question formation
		// this.titleAndDescriptionFormation();
		this.questionFormation();
		this.optionFormation();

		// some events added here
		this.previousBtn.on("click", "", this.previousClickHandler.bind(this));
		this.nextBtn.on("click", "", this.nextClickHandler.bind(this));
		this.reviewBtn.on("click", "", $this.reviewFormation.bind(this));
		this.reviewQuestion.on('click',"LI", $this.reviewQuestionClickHandler.bind(this));
	}

	optionFormation() {
		model.getUserQuestionSet[model.getCurrentQuestionId].type === "tnf"
			? this.tnfFormation()
			: this.mmcqFormation();
	}

	reviewQuestionClickHandler(e){
		this.counter = +e.getAttribute('data-index');
		this.reinit();
	}

	previousClickHandler() {
		this.counter = --this.counter;
		this.reinit();
	}

	nextClickHandler() {
		this.counter = ++this.counter;
		this.reinit();
	}

	reinit() {
		model.setCurrentQuestionId = this.counter;
		this.questionFormation();
		this.optionFormation();
		this.reviewHolder.addClass('hide');

		this.nextBtn.disabled = this.counter > model.getQuestionsIds.length - 2;
		this.previousBtn.disabled = this.counter === 0;
	}

	reviewFormation() {
		this.question.setHTML("");
		this.optionHolder.setHTML("");
		this.reviewHolder.removeClass('hide');
		this.reviewQuestion.setHTML(this.reviewQuestionList());

		this.nextBtn.disabled = true;
		this.previousBtn.disabled = true
	}

	reviewQuestionList() {
		return model.getQuestionsIds.map(
			(item, index) =>
				`<li data-index="${index}"><div><strong>#${index + 1}</strong> - ${model.getUserQuestionSet[item].type}</div><div class="unanswered">Unanswered</div></li>`
		).join("");
	}

	tnfFormation() {
		const $this = this;
		const data =
			model.getUserQuestionSet[model.getCurrentQuestionId].options;

		this.optionHolder.setHTML(`<div id="options">
			<button class="btn btnTF" id="btnTrue" uid="0" aid="${data[0].isCorrect}">${data[0].option}</button>
			<button class="btn btnTF" id="btnFalse" uid="1" aid="${data[1].isCorrect}">${data[1].option}</button>
		</div>`);
		
		this.selector("#btnTrue").on("click", "", function (elm) {
			elm.disabled = true;
			$this.selector("#btnFalse").disabled = false;
		});

		this.selector("#btnFalse").on("click", "", function (elm) {
			$this.selector("#btnTrue").disabled = false;
			elm.disabled = true;
		});
	}

	mmcqFormation() {
		const $this = this;
		const alphbetArray = ["A", "B", "C", "D", "E"];
		let options =
			model.getUserQuestionSet[model.getCurrentQuestionId].options;

		if(!this.optionHolder.getAttribute('listener')){
			this.optionHolder.setAttr('listener', 'true');
			this.optionHolder.on("click", "LI", function (elm) {
				// twice click remove active class
				if (elm.class("active")) {
					elm.removeClass("active");
				} else {
					if (model.getUserQuestionSet[model.getCurrentQuestionId].type === "mmcq") {
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
			});
		}
		
		// randomize the option of the questions
		if(model.getRandomOption){
			options = utils.shuffleArray(options);
		}

		this.optionHolder.setHTML(
			options
				.map(
					(item, index) => `<li uid="${index}" n="${item.isCorrect}">
							<span class="bullet">${alphbetArray[index]}</span>
							<p class="option">${item.option}</p>
						</li>`
				)
				.join("")
		);
	}

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

	questionFormation() {
		this.question.setHTML(
			`<strong>#${
				this.counter + 1
			} : </strong> ${utils.findAndReplaceString(
				model.getUserQuestionSet[model.getCurrentQuestionId].question
			)}<br/><br/>`
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

	//TODO: for demo only
	/* async loadManifest() {
		const response = await fetch("data/manifest.json");
		return await response.json();
	} */

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
