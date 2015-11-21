<footer>
	
<a href="<?php echo $settings['baseurl'];?>/blog">&larr; back to blog</a>

<hr>

<section class="comments">
	<h3>Comments</h3>
	<?php
		try {
			$db = new PDO("sqlite:comments/comments.db"); // open database
			$db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION ); // set error reporting mode


			// get comments for this post (based on post url)
			$sth = $db->query('SELECT post, date, name, website, comment from comments where post = :post');
			$data = array( 'post' => str_replace('.php', '', basename($_SERVER['PHP_SELF'])) );
			$sth->execute($data);
			$sth->setFetchMode(PDO::FETCH_ASSOC); // setting the fetch mode to return an associative array
			$result = $sth->fetchAll();

			if (count($result) >= 1) {
				foreach ($result as $row) {
					?>
					<div class="comment">
						<?php if ($row['website'] != '') { ?>
							<a class="name" href="<?php echo $row['website']; ?>"><?php echo $row['name']; ?></a>
						<?php } else { ?>
							<span class="name"><?php echo $row['name']; ?></span>
						<?php } ?>
						&bullet;
						<time><?php echo date("M j, Y, H:i", $row['date']); ?></time>
						<p><?php echo $row['comment']; ?></p>
					</div>
					<?php
				}
			} else {
				echo '<p>No comments.</p>';
			}
		}

		catch(PDOException $e) {
			echo "Database error.";
			file_put_contents('comments/database_errors.log', date('Y-m-d H:i:s').': '.$e->getMessage()."\r\n", FILE_APPEND);
		}

		// close the database
		$db = null;
	?>

	<form action="../comments/insert.php" method="post" onsubmit="submitComment(); return false;">
		<input class="commentFormVal" type="text" name="name" placeholder="Name" required>
		<input class="commentFormVal" type="url" name="website" placeholder="Website (optional)">
		<textarea class="commentFormVal" name="comment" placeholder="Comment" required></textarea>
		<input style="display: none;" class="commentFormVal" type="email" name="email" placeholder="Please leave me empty" autocomplete=off>
		<input style="display: none;" class="commentFormVal" type="text" name="post" value="<?php echo str_replace('.php', '', basename($_SERVER['PHP_SELF'])); ?>" autocomplete=off>
		<input id="submit_comment" type="submit" value="Submit"/>
	</form>
</section>


</footer>

<script src="<?php echo $settings['baseurl']; ?>/lib/prism/prism.js"></script>

<script>
	function submitComment() {
		document.getElementById("submit_comment").value = 'Just a sec...';

	    var elements = document.getElementsByClassName("commentFormVal");
	    var formData = new FormData(); 
	    for(var i=0; i<elements.length; i++) {
	        formData.append(elements[i].name, elements[i].value);
	    }
	    var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            	location.reload();
            }
        }
        xmlHttp.open("post", "../comments/insert.php"); 
        xmlHttp.send(formData);
	}
</script>