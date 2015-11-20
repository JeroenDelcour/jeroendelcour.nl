<?php

$url = $_POST['title'];
$url = preg_replace('/[^\\pL0-9]+/u', '-', $url);
$url = trim($url, "-");
$url = iconv("utf-8", "us-ascii//TRANSLIT", $url);
$url = preg_replace('/[^-a-z0-9]+/i', '', $url);

$file = fopen("../".$url.".php", "w") or die("Unable to open file!");

$html = '<html lang="en">
<head>
	<meta charset="utf-8" />
	<?php
		include("../head.php");
		$date = strtotime("'.date("Y-m-d").'");
	?>
	<title>'.$_POST['title'].'</title>
	<meta name="date" content="'.date("Y-m-d").'">
</head>
<?php include("../header.php"); ?>
<main>
	<article>

	<h1>'.$_POST['title'].'</h1>

	<time datetime="<?php echo date("Y-m-d", $date); ?>" pubdate="pubdate"><?php echo date($settings["dateformat"], $date); ?></time>

	'.$_POST['content'].'

	</article>
	<?php include("footer.php"); ?>
</main>
</body>
</html>
';

fwrite($file, $html);

fclose($file);

require('../../settings.php');
print $settings['baseurl'].'/blog/'.$url.'/';

?>