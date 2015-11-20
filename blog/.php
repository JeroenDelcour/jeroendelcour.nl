<html lang="en">
<head>
	<meta charset="utf-8" />
	<?php
		include("../head.php");
		$date = strtotime("2015-11-21");
	?>
	<title></title>
	<meta name="date" content="2015-11-21">
</head>
<?php include("../header.php"); ?>
<main>
	<article>

	<h1></h1>

	<time datetime="<?php echo date("Y-m-d", $date); ?>" pubdate="pubdate"><?php echo date($settings["dateformat"], $date); ?></time>

	

	</article>
	<?php include("footer.php"); ?>
</main>
</body>
</html>
