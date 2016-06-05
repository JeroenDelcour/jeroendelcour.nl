saveButton.addEventListener('click', function(e){
	var r = window.confirm('Are you sure you want to change this already published article?');
	if (!r) {
		return false;
	}

	saveButton.innerHTML = 'Publishing...';
	sendDraft = {
		'rowid': drafts[currentDraft].rowid,
		'title': articleTitle.value,
		'markdown': articleBody.value
	};
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4) {
			if (xhttp.status == 200) {
				unsaved = false;
				saveButton.innerHTML = 'Published.';
				setTimeout(function(){
					saveButton.innerHTML = 'Publish changes';
				},2000);
				window.alert('Changes published.')
			} else {
				saveButton.innerHTML = 'Publish changes';
				window.alert(xhttp.responseText);
			}
		}
	}
	xhttp.open("POST", "/blog/edit", true);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(JSON.stringify(sendDraft));
});