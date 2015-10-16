<html lang="en">
<head>
	<meta charset="utf-8" />
	<?php
		include("../head.php");
		$date = strtotime('2015-09-23');
	?>
	<title>Test blog entry</title>
	<meta name="date" content="2015-09-23">
</head>
<?php include("../header.php"); ?>
<main>
	<article>
		<h1>Test blog entry</h1>
		
		<time datetime="<?php echo date('Y-m-d', $date); ?>" pubdate="pubdate"><?php echo date($settings['dateformat'], $date); ?></time>
		
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ultricies tristique nulla et mattis. Phasellus id massa eget nisl congue blandit sit amet id ligula. Praesent et nulla eu augue tempus sagittis. Mauris faucibus nibh cursus in vestibulum sapien egestas. Curabitur ut lectus tortor. Sed ipsum eros, egestas ut eleifend non, elementum vitae eros.</p>
		
		<h2>Donec lobortis</h2>
		<p>Mauris felis diam, pellentesque vel lacinia ac, dictum a nunc. Mauris mattis nunc sed mi sagittis et facilisis tortor volutpat. Etiam tincidunt urna mattis erat placerat placerat ac eu tellus. Ut nec velit id nisl tincidunt vehicula id a metus. Pellentesque erat neque, faucibus id ultricies vel, mattis in ante. Donec lobortis, mauris id congue scelerisque, diam nisl accumsan orci, condimentum porta est magna vel arcu. Curabitur varius ante dui. Vivamus sit amet ante ac diam ullamcorper sodales sed a odio:</p>
		
		<blockquote><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ultricies tristique nulla et mattis. Phasellus id massa eget nisl congue blandit sit amet id ligula.</p> - <cite><a href="">Biggus Dickus</a>, the Life of Brian, Monty Python</cite></blockquote>
		
		<p>Praesent et nulla eu augue tempus sagittis. Mauris faucibus nibh et nibh cursus in vestibulum sapien egestas. Curabitur ut lectus tortor. Sed ipsum eros, egestas ut eleifend non, elementum vitae eros: <q>Mauris felis diam, pellentesque vel lacinia ac, dictum a nunc. Mauris mattis nunc sed mi sagittis et facilisis tortor volutpat.</q></p>
		
<pre><code class="language-css">pre {
  text-align: center;
}
code {
  text-align: left;
  display: inline-block;
  margin: 0 -9999%;
  box-sizing: border-box;
  width: 100vw;
  line-height: 1.4em;
}</code></pre>
		
		<p>Etiam tincidunt urna mattis erat <code class="language-css">placerat</code> placerat ac eu tellus. Ut nec velit id nisl tincidunt vehicula id a metus. Pellentesque erat neque, faucibus id ultricies vel, mattis in ante. Donec lobortis, mauris id congue scelerisque, diam nisl accumsan orci, condimentum porta est magna vel arcu. Curabitur varius ante dui. Vivamus sit amet ante ac diam ullamcorper sodales sed a odio.</p>
	</article>
	
	<?php include("footer.php"); ?>

</main>
</body>
</html>