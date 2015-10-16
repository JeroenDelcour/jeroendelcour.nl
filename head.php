<meta charset="utf-8" />
<meta name="author" content="Jeroen Delcour">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php $base_url = 'http://' . $_SERVER['SERVER_NAME'] . str_replace('\\', '/', dirname(substr(__FILE__, strlen( $_SERVER[ 'DOCUMENT_ROOT' ])))); ?>
<link rel="shortcut icon" href="<?php echo $base_url; ?>/favicon.ico" />
<link rel="stylesheet" href="<?php echo $base_url; ?>/style.css" />
<link rel="stylesheet" href="<?php echo $base_url; ?>/prism/prism.css" />
<!--<link rel="stylesheet" href="<?php echo $base_url; ?>/tomorrow-night.css" type="text/css" />-->
<!--<link rel="stylesheet" href="<?php echo $base_url; ?>/highlightjs/styles/tomorrow-night.css" type="text/css">-->
<?php	include_once('settings.php'); ?>
<!--<script src="<?php // echo $base_url; ?>/highlightjs/highlight.pack.js"></script>-->
<script>
	// hljs.configure({
	// 	tabReplace: '  '
	// })
	// hljs.initHighlightingOnLoad();
</script>