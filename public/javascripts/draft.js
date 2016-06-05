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