class Utils {
	findAndReplaceString(str) {
		var tempStr = str
			.replace(/bld-/g, "<strong>")
			.replace(/-bld/g, "</strong>")
			.replace(/itl-/g, "<i>")
			.replace(/-itl/g, "</i>")
			.replace(/uli-/g, "<u>")
			.replace(/-uli/g, "</u>")
			.replace(/br-/g, "<br/>");
		return tempStr;
	}

	shuffleArray(array) {
		// Start from the last element and swap with a random element
		for (let i = array.length - 1; i > 0; i--) {
			// Generate a random index between 0 and i
			const j = Math.floor(Math.random() * (i + 1));
			// Swap elements array[i] and array[j]
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}
}
