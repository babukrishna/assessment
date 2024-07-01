
const model = new Model();
const app = new App();
app.init();

window.addEventListener("CHAPTER_COMPLETED", this.chapterCompletedHandler.bind(this));

function chapterCompletedHandler(event) {
    console.log("event.detail: ", event.detail);
}