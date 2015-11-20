<html lang="en">
<head>
	<meta charset="utf-8" />
	<?php
		include("../../head.php");
	?>
	<title>Writer</title>
	<link rel="stylesheet" href="style.css" />
</head>
<?php include("../../header.php"); ?>
<main>
	<article>
		<button id="previewButton" onclick="preview()">Preview</button>
		<form action="publish.php" method="post" onsubmit="publish(); return false;">
			<h1><input type="text" id="title" placeholder="Title" required></h1>
			
			<!-- <time datetime="<?php echo date('Y-m-d'); ?>" pubdate="pubdate"><?php echo date($settings['dateformat']); ?></time> -->
			
			<textarea id="input" rows="5" style="display: block;" placeholder="PUNCH the keys, for God's sake! (Markdown formatting)" required></textarea>
			<div id="formatted" style="display: none;"></div>
			<input id="publishButton" type="submit" value="Publish">
		</form>
	</article>

</main>

<script src="marked.min.js"></script>
<script>
	function preview() {
		var inputEl = document.getElementById('input');
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

	function publish() {
		var titleEl = document.getElementById('title');
	    var inputEl = document.getElementById('input');
	    var formData = new FormData(); 
	    formData.set("title", titleEl.value);
	    formData.set('content', marked(inputEl.value));
	    var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            	window.location = xmlHttp.responseText;
            }
        }
        xmlHttp.open("post", "publish.php"); 
        xmlHttp.send(formData);
	}
</script>

</body>
</html>