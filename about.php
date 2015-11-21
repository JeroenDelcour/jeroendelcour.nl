<html lang="en">
<head>
  <?php include("head.php"); ?>
  <title>About Jeroen Delcour</title
</head>
<body>  
<?php include("header.php"); ?>
<main>
  
  <h1>About</h1>
  
  <p>Hi, I'm Jeroen Delcour. I dabble in programming, web design, video game development, and general geekiness.</p>
  
  <p>Over time, these hobbies have resulted in a modest collection of programming doodads, web design thingamajigs, video game development tomfoolery, and general geeky gismos. A word of warning: some of these are highly experimental and liable to explode (a.k.a. buggy).</p>
  
  <h1>Projects</h1>
  
  <section class="project-list">
    <ul>
      <li>
        <h2><a href="/Octy" target="_blank">Octy</a> (work in progress)</h2>
        <a class="img-link" href="/Octy" target="_blank"><img src="<?php echo $settings['baseurl']; ?>/imgs/octy.svg"></a>
        <p>
          A platfomer-like mobile game with a built-in level editor. Built using the Phaser.js framework.
          Currently only available <a href="/Octy" target="_blank">in-browser</a> (work-in-progress version) and on <a href="https://www.microsoft.com/en-us/store/apps/octy/9nblggh0j563" target="_blank">Windows Phone</a> (old version built with Construct 2), but I do plan to release it on Android and possibly iPhone some day.
        </p>
      </li>
      <hr>
      <li>
        <h2><a href="/neuron-draw" target="_blank">Neuron draw</a></h2>
        <a href="/neuron-draw" target="_blank"><img src="<?php echo $settings['baseurl']; ?>/imgs/neuron-draw.png"></a>
        <p>
          A little exercise in HTML5 canvas drawing and procedural generation. It can create very interesting patterns when you play around with the input variables. Inspired by <a href="https://en.wikipedia.org/wiki/Santiago_Ram%C3%B3n_y_Cajal" target="_blank">Santiago Ramón y Cajal</a>, who was one of the first to make detailed drawings of neurons.
        </p>
        <a class="github" href="https://github.com/JeroenDelcour/neuron-draw" target="_blank">source code</a>
      </li>
      <hr>
      <li>
        <h2><a href="/yearcircler" target="_blank">Yearcircler</a> (experimental)</h2>
        <a href="/yearcicler" target="_blank"><img src="<?php echo $settings['baseurl']; ?>/imgs/yearcircler.png"></a>
        <p>
          An experimental calendar/planner displaying a full year in the form of a clock. An exercise in building SVGs using JavaScript. Warning: breaks easily. I need to figure out a better way to display date ranges (especially ones that span multiple years).
        </p>
      </li>
    </ul>
  </section>
  
</main>
<?php include("footer.php"); ?>
</body>
</html>