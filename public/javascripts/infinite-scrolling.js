var infiniteScrolling = {
	requestsSent: 0,
	blocked: false,
	scrollFunction: function(){
		if (!infiniteScrolling.blocked){
			document.getElementById("loading").innerHTML = 'Loading more...<div id="arrow">↓</div>';
			var margin = 50;
			if (document.documentElement.scrollTop || document.body.scrollTop >= document.body.scrollHeight - window.innerHeight - margin) {
				// you're at the bottom of the page
				xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (xhttp.readyState == 4 && xhttp.status == 200) {
						document.getElementsByClassName("feed")[0].innerHTML += xhttp.responseText;
						infiniteScrolling.requestsSent += 1;
						infiniteScrolling.blocked = false;
					}
				};
				xhttp.open("POST", "/blog", true);
				xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhttp.send("requestNumber="+(infiniteScrolling.requestsSent+1));
				infiniteScrolling.blocked = true;
				document.getElementById("loading").innerHTML = '';
			}
		}
	}
}

window.onscroll = function() {infiniteScrolling.scrollFunction();};
