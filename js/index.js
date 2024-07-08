const utils = new Utils();
const model = new Model();
const app = new App();
app.init();

/* window.addEventListener("CHAPTER_COMPLETED", this.chapterCompletedHandler.bind(this));
function chapterCompletedHandler(event) {
    console.log("event.detail: ", event.detail);
} */

// screen adopter
var $el = document.querySelector("#container");
var $wrapper = document.querySelector("body");

function resizeContainer() {
    var elHeight = $el.clientHeight;
    var elWidth = $el.clientWidth;

    var scale = Math.min(
        $wrapper.clientWidth / elWidth,
        $wrapper.clientHeight / elHeight
    );

    document.querySelector("#container").style.transform = 'none';
    document.querySelector("#container").style.transform = "translate(0, 0) " + "scale(" + scale + ")";
}

if (!utils.deviceDetector.isMobile && !utils.mobileAndTabletCheck()) {
    window.addEventListener('resize', resizeContainer, true);
    resizeContainer();
}else{
    // adding mobile specific css on mobile device only
    var tag = document.createElement("link");
    tag.rel = "stylesheet";
    tag.href = 'css/stylesheet-mobile.css';
    document.head.appendChild(tag);
}