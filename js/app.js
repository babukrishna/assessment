class App {
	isHelpOpened = false;
	constructor() { }

	//Initializes scorm and model
	async init() {
		await model.init();
		this.addListeners();
        console.log(model.dataAll)
	}

	async loadManifest() {
		const response = await fetch("data/manifest.json");
		return await response.json();
	}2
    addListeners() {
        window.dispatchEvent(
            new CustomEvent("CHAPTER_COMPLETED", { bubbles: true, detail: { test: "test" } })
        );
    }

}