marked.setOptions({
	highlight: function (code) {
		return hljs.highlightAuto(code).value;
	}
});

function preview() {
	var inputEl = document.getElementById('editArticleBody');
	var formattedEl = document.getElementById('formatted');
	var previewButton = document.getElementById('previewButton');
	if (inputEl.style.display == 'block' && formattedEl.style.display == 'none') {
		formattedEl.innerHTML = marked(inputEl.value);
		inputEl.style.display = 'none';
		formattedEl.style.display = 'block';
		previewButton.innerHTML = 'Edit';
	} else if (inputEl.style.display == 'none' && formattedEl.style.display == 'block') {
		inputEl.style.display = 'block';
		formattedEl.style.display = 'none';
		previewButton.innerHTML = 'Preview';
	}
}

var articleTitle = document.getElementById('editArticleTitle');
var articleBody = document.getElementById('editArticleBody');
var draftSelect = document.getElementById('draftSelect');

var currentDraft = draftSelect.value;
var unsaved = false;
articleBody.addEventListener('input', function(){
	unsaved = true;
});
articleTitle.addEventListener('input', function(){
	unsaved = true;
});
var saveButton = document.getElementById('saveButton');
var deleteButton = document.getElementById('deleteButton');
var publishButton = document.getElementById('publishButton');

draftSelect.addEventListener('change', function(e) {
	if (unsaved) {
		var r = window.confirm('There are unsaved changes, are you sure you want to continue?');
		if (!r) {
			draftSelect.value = currentDraft;
			return false;
		}
	}
	unsaved = false;
	currentDraft = draftSelect.value;
	if (e.target.value == 'new') {
		articleTitle.value = '';
		articleBody.value = '';
	} else {
		articleTitle.value = drafts[e.target.value].title;
		articleBody.value = drafts[e.target.value].markdown;
	}
	calculateHeight(articleTitle);
	calculateHeight(articleBody);
});

var calculateContentHeight = function( ta, scanAmount ) {
	var origHeight = ta.style.height,
		height = ta.offsetHeight,
		scrollHeight = ta.scrollHeight,
		overflow = ta.style.overflow;
	/// only bother if not empty and  the ta is bigger than content
	if ( ta.value.length > 0 && height >= scrollHeight ) {
		/// check that our browser supports changing dimension
		/// calculations mid-way through a function call...
		ta.style.height = (height + scanAmount) + 'px';
		/// because the scrollbar can cause calculation problems
		ta.style.overflow = 'hidden';
		/// by checking that scrollHeight has updated
		if ( scrollHeight < ta.scrollHeight ) {
			/// now try and scan the ta's height downwards
			/// until scrollHeight becomes larger than height
			while (ta.offsetHeight >= ta.scrollHeight) {
				ta.style.height = (height -= scanAmount)+'px';
			}
			/// be more specific to get the exact height
			while (ta.offsetHeight < ta.scrollHeight) {
				ta.style.height = (height++)+'px';
			}
			/// reset the ta back to it's original height
			ta.style.height = origHeight;
			/// put the overflow back
			ta.style.overflow = overflow;
			return height;
		}
	} else {
		return scrollHeight;
	}
}

var calculateHeight = function(el) {
	if (el.target) { var ta = this; } else { var ta = el; }
	var style = (window.getComputedStyle) ?
		window.getComputedStyle(ta) : ta.currentStyle,

	// This will get the line-height only if it is set in the css,
	// otherwise it's "normal"
	taLineHeight = parseInt(style.lineHeight, 10),
	// Get the scroll height of the textarea
	taHeight = calculateContentHeight(ta, taLineHeight);
	// calculate the number of lines
	if (ta.value.length > 0){
		numberOfLines = Math.ceil(taHeight / taLineHeight);
	} else {
		numberOfLines = 1;
	}
	ta.rows = numberOfLines;
};

taRows = articleBody.rows;
articleBody.addEventListener("input", calculateHeight, false);
articleTitle.addEventListener("input", calculateHeight, false);

// fire select event so the default selection loads
var event = new Event('change');  // (*)
draftSelect.dispatchEvent(event);
