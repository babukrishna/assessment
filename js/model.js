class Model {
	currentSectionId = null;
	currentPageId = 0;
	response = null;
	data = null;

	//Initializes model data
	async init() {
		this.data = await this.loadMetadata();
    }

	//Loads the metadata file
	async loadMetadata() {
		this.response = await fetch("data/metadata.json");
		return await this.response.json();
	}

    
	//Get all data
	get dataAll() {
		return this.data;
	}
}