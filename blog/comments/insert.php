<?php

if($_POST['email'] != ''){
	file_put_contents('spam.log', date('Y-m-d H:i:s').': '.var_dump($_POST)."\r\n", FILE_APPEND);
    die("You spammer!");
} else {
	try {
		// db means "Database Handle"
		$db = new PDO("sqlite:comments.db"); // open database
		$db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION ); // set error reporting mode

		// create 'comments' table
		// $db->exec("DROP TABLE comments");
		// $db->exec("CREATE TABLE comments (Id INTEGER PRIMARY KEY, post TEXT, name TEXT, website TEXT, comment TEXT)");  

		// inserting data
		$data = $_POST;
		unset($data['email']);
		// st means "Statement Handle"
		$st = $db->prepare("INSERT INTO comments (post, name, website, comment) values (:post, :name, :website, :comment)");
		$st->execute($data);
		echo 'Comment posted';
	}

	catch(PDOException $e) {
		echo "Database error.";
		file_put_contents('database_errors.log', date('Y-m-d H:i:s').': '.$e->getMessage()."\r\n", FILE_APPEND);
	}

	// close the database
	$db = null;

}

?>