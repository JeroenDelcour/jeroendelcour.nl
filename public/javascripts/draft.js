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

publishButton.addEventListener('click', function(){
	var r = window.confirm('Are you sure you want to publish this draft?');
	if (!r) {
		return false;
	} else {
		sendArticle = {
			'title': articleTitle.value,
			'markdown': articleBody.value
		};
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4) {
				if (xhttp.status == 200) {
					console.log(xhttp.responseText);
				} else {
					window.alert(xhttp.responseText);
				}
			}
		}
		xhttp.open("POST", "/blog/draft/publish", true);
		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.send(JSON.stringify(sendArticle));
	}
});

saveButton.addEventListener('click', function(e){
	saveButton.innerHTML = 'Saving...';
	if (currentDraft == 'new') {
		drafts.push({
			'rowid': 'new',
			'created': new Date().getTime(),
			'title': articleTitle.value,
			'markdown': articleBody.value
		});
		console.log(articleTitle.vale);
		var option = document.createElement("option");
		option.value = drafts.length - 1;
		option.text = articleTitle.value;
		console.log(option.text);
		draftSelect.add(option);
		draftSelect.value = option.value;
		currentDraft = draftSelect.value;
	}
	sendDraft = {
		'rowid': drafts[currentDraft].rowid,
		'created': new Date().getTime(),
		'title': articleTitle.value,
		'markdown': articleBody.value
	};
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4) {
			if (xhttp.status == 200) {
				console.log(xhttp.responseText);
				if (currentDraft == 'new') {
					drafts[drafts.length-1].rowid = +xhttp.responseText;
				} else {
					drafts[currentDraft].title = sendDraft.title;
					drafts[currentDraft].markdown = sendDraft.markdown;
				}
				unsaved = false;
				saveButton.innerHTML = 'Saved.';
				setTimeout(function(){
					saveButton.innerHTML = 'Save';
				},2000);
			} else {
				saveButton.innerHTML = 'Save';
				window.alert(xhttp.responseText);
			}
		}
	}
	xhttp.open("POST", "/blog/draft/save", true);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify(sendDraft));
});

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


deleteButton.addEventListener('click', function(e){
	var r = window.confirm('Are you absolutely sure you want to delete this draft permanently?');
	if (!r) {
		return false;
	}
	
	deleteButton.innerHTML = 'Deleting...';
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4) {
			if (xhttp.status == 200) {

				delete drafts[currentDraft];
				draftSelect.remove(draftSelect.selectedIndex);
				
				unsaved = false;
				draftSelect.value = 'new';
				currentDraft = draftSelect.value;
				articleTitle.value = '';
				articleBody.value = '';
				calculateHeight(articleTitle);
				calculateHeight(articleBody);

				deleteButton.innerHTML = 'Deleted.';
				setTimeout(function(){
					deleteButton.innerHTML = 'Delete (!)';
				},2000);
			} else {
				deleteButton.innerHTML = 'Delete (!)';
				window.alert(xhttp.responseText);
			}
		}
	}
	xhttp.open("POST", "/blog/draft/delete", true);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify({'rowid': drafts[currentDraft].rowid}));
})




var calculateContentHeight = function( ta, scanAmount ) {
	var origHeight = ta.style.height,
		height = ta.offsetHeight,
		scrollHeight = ta.scrollHeight,
		overflow = ta.style.overflow;
	/// only bother if the ta is bigger than content
	if ( height >= scrollHeight ) {
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
	taHeight = calculateContentHeight(ta, taLineHeight),
	// calculate the number of lines
	numberOfLines = Math.ceil(taHeight / taLineHeight);
	ta.rows = numberOfLines;

	//- document.getElementById("lines").innerHTML = "there are " +
	//- 	numberOfLines + " lines in the text area";
};

taRows = articleBody.rows;
articleBody.addEventListener("input", calculateHeight, false);
articleTitle.addEventListener("input", calculateHeight, false);