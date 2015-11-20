<html lang="en">
<head>
	<?php include("../head.php"); ?>
	<title>Jeroen Delcour</title>
</head>
<body>
<?php include("../header.php"); ?>
  <main>
    
    <ol class="feed">
    <?php
    
    libxml_use_internal_errors(true); // prevent html5 semantic tags from throwing errors
    $files = glob('*.php'); // get all .php files in folder
    // remove files which lack a 'date' meta tag (assuming they are not articles)
    foreach ($files as $key => $file) {
      if (!isset(get_meta_tags($file)['date'])) {
        unset($files[$key]);
      }
    }
    // sort by date (most recent first)
    usort($files, function($a, $b) {
      return strtotime(get_meta_tags($a)['date']) < strtotime(get_meta_tags($b)['date']);
    });
    $articles = array_slice($files, 0, 5); // get first 5 articles
    foreach ($articles as $article) {
          $doc = new DomDocument;
          libxml_use_internal_errors(true);
          $doc->loadHtml(file_get_contents($article));
          
          $url = $settings['baseurl'] . '/blog/' . preg_replace('/\.php$/', '/', $article);
          echo '<li>';
          echo '<article>';
          $title = $doc->getElementsByTagName('title')->item(0)->nodeValue;
          echo '<h1><a href="' . $url . '">' . $title . '</a></h1>';
          // $timeElement = $doc->getElementsByTagName('time');
          // $time = $timeElement[0]->nodeValue;
          // $datetime = $timeElement[0]->getAttribute('datetime');
          $date = strtotime(get_meta_tags($article)['date']);
          echo '<time datetime="' . date('Y-m-d', $date) . '" pubdate="pubdate">' . date($settings['dateformat'], $date) . '</time>';
          echo '<p>' . $doc->getElementsByTagName("p")->item(0)->nodeValue . ' <a class="continuereading" href="' . $url . '">Continue reading &rarr;</a></p>';
          echo '</article>';
          echo '</li>';
          echo '<hr>';
    }
    ?>
    </ol>
    
  </main>
</body>
</html>