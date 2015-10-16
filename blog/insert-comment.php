<?php
	
	$db = "../comments.sqlite";
	// $dbh = new PDO('sqlite:/localhost/site/comments.db', '', '', array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,));
	$handle = sqlite_open($db) or die("Could not open database");
	$query = "SELECT * FROM comments";
	$result = sqlite_query($handle, $query) or die("Error in query: ".sqlite_error_string(sqlite_last_error($handle)));
	if (sqlite_num_rows($result) > 0) {
		while($obj = sqlite_fetch_object($result)) {
			echo $obj->id;
			echo "<br>";
			echo $obj->article;
			echo "<br>";
			echo $obj->name;
			echo "<br>";
			echo $obj->comment;
			echo "<br>";
			echo $obj->datetime;
			echo "<br>";
			echo $obj->email;
			echo "<br>";
			echo $obj->website;
			echo "<br>";
			echo $obj->ip;
		}
	}
	
	// $file = "../comments.sqlite";
	// $db = new SQLiteDatabase($file) or die("Could not open databse");
	// $query = "SELECT * FROM comments";
	// $result = $db->query($query) or die("Error in query");
	// if ($result->numRows() > 0) {
	// 	while($obj = sqlite_fetch_object($result)) {
	// 		echo $obj->id;
	// 		echo "<br>";
	// 		echo $obj->article;
	// 		echo "<br>";
	// 		echo $obj->name;
	// 		echo "<br>";
	// 		echo $obj->comment;
	// 		echo "<br>";
	// 		echo $obj->datetime;
	// 		echo "<br>";
	// 		echo $obj->email;
	// 		echo "<br>";
	// 		echo $obj->website;
	// 		echo "<br>";
	// 		echo $obj->ip;
	// 	}
	// }
	// unset($db);
?>