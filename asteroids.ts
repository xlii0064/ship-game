// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

function asteroids() {
  // Inside this function you will use the classes and functions 
  // defined in svgelement.ts and observable.ts
  // to add visuals to the svg element in asteroids.html, animate them, and make them interactive.
  // Study and complete the Observable tasks in the week 4 tutorial worksheet first to get ideas.

  // You will be marked on your functional programming style
  // as well as the functionality that you implement.
  // Document your code!  
  // Explain which ideas you have used ideas from the lectures to 
  // create reusable, generic functions.
  const svg = document.getElementById("canvas")!;
  var bullets = new Array<Elem>();
  var rocks = new Array<Elem>();
  var enemyBullets = new Array<Elem>();
  //The total score of the player
  var points = 0;
  // make a group for the spaceship and a transform to move it and rotate it
  // to animate the spaceship you will update the transform property
  let g = new Elem(svg, 'g')
    .attr("transform", "translate(300 300) rotate(0)")
    .attr("r", 20).attr("life", 3);

  // create a polygon shape for the space ship as a child of the transform group
  let ship = new Elem(svg, 'polygon', g.elem)
    .attr("points", "-15,20 15,20 0,-20")
    .attr("style", "fill:lightblue;stroke:purple;stroke-width:1");
  //The wing of the ship (just for decoration)
  let shipWing = new Elem(svg, 'polygon', g.elem)
    .attr("points", "-20,0 0,-5 20,0 0,5")
    .attr("style", "fill:darkred;stroke:darkred;stroke-width:1");
  //The enemy ship
  let asteroidDefender = new Elem(svg, 'polygon')
    .attr("dead", "t").attr("r", 8)
    .attr("cx", 200).attr("cy", 200).attr("angle", 120)
    .attr("style", "fill:red;stroke:red;stroke-width:1");

  const keydown = Observable.fromEvent<KeyboardEvent>(document, 'keydown');

  //shoot bullets
  //If the user pressed space, create new bullets and add to the bullet array
  keydown.filter((event) => event.which == 32 ? true : false)
    .filter(() => Number(g.attr("life")) >= 1)
    .subscribe(() => {
      var transform = g.attr("transform").split(" ");
      var x = Number(transform[0].substr(10));
      var y = Number(transform[1].substr(0, transform[1].length - 1));
      var angle = Number(transform[2].substr(7, transform[2].length - 8));
      bullets.push(new Elem(svg, "circle")
        .attr("cx", x).attr("cy", y).attr("r", 3)
        .attr("style", "fill:darkblue;stroke:blue;stroke-width:1")
        .attr("dead", "f").attr("angle", angle))
    })

  //move forward
  //If the user pressed w, it will move towards the direction of the head of the ship
  keydown.filter((event) => event.which == 87 ? true : false)
    .subscribe(() => {
      var transform = g.attr("transform").split(" ");
      var x = Number(transform[0].substr(10));
      var y = Number(transform[1].substr(0, transform[1].length - 1));
      var angle = Number(transform[2].substr(7, transform[2].length - 8));
      var newX = (x + 6 * Math.cos(angle * Math.PI / 180 - Math.PI / 2))
      var newY = (y + 6 * Math.sin(angle * Math.PI / 180 - Math.PI / 2))
      let temp = wrapElem(newX, newY);
      g.attr("transform", "translate(" + temp[0].toString() + " " + temp[1].toString() + ") rotate(" + angle.toString() + ")")
    })
  //rotate clockwise
  //If the user pressed t, it will rotate clockwise by changing its transform property
  keydown.filter((event) => event.which == 84 ? true : false)
    .subscribe(() => {
      var transform = g.attr("transform").split(" ");
      var x = Number(transform[0].substr(10));
      var y = Number(transform[1].substr(0, transform[1].length - 1));
      var angle = Number(transform[2].substr(7, transform[2].length - 8));
      g.attr("transform", "translate(" + x.toString() + " " + y.toString() + ") rotate(" + ((angle + 5) % 360).toString() + ")")
    })

  //rotate anticlockwise
  //If the user pressed s, it will rotate anticlockwise by changing its transform property
  keydown.filter((event) => event.which == 82 ? true : false)
    .subscribe(() => {
      var transform = g.attr("transform").split(" ");
      var x = Number(transform[0].substr(10));
      var y = Number(transform[1].substr(0, transform[1].length - 1));
      var angle = Number(transform[2].substr(7, transform[2].length - 8));
      g.attr("transform", "translate(" + x.toString() + " " + y.toString() + ") rotate(" + ((angle - 5) % 360).toString() + ")")
    })
  /**
   * This function aims to check if the current coordinates of this object is within the canvas. If not, wrap it around
   * @param targetX  the x coordinates of the object to be wrapped
   * @param targetY  the x coordinates of the object to be wrapped
   */
  function wrapElem(targetX: Number, targetY: Number): Number[] {
    if (targetX < 0)
      return targetY < 0 ? [600, 600] : [600, targetY]
    if (targetX > 600)
      return targetY > 600 ? [0, 0] : [0, targetY]
    if (targetY < 0)
      return [targetX, 600]
    if (targetY > 600)
      return [targetX, 0]
    //return the original coordinates if it doesn't need any wrapping
    return [targetX, targetY]
  }
  /**
   * This function is to determine whether 2 objects crashed or not. The function was designed in this way since it may be used to determine whether a ship collided
   * with something else or not. So instead of taking the x,y and r of target1, if the target1 itself was simply taken, the function would be less reusable as it's hard
   * to tell whether it's a circle or not. Although everything in the game was estimated into circles, obtaining the coordinates of the ship would still requires to split
   * the transform property to get the values. So the properties of target1 were taken to make this function suitable under any condition.
   * @param target1X the x coordinates of the first object
   * @param target1Y the y coordinates of the first object
   * @param target1R the radius of the first object
   * @param target2 the second object to be compared with
   */
  function crash(target1X: number, target1Y: number, target1R: number, target2: Elem): Boolean {
    var distance = Math.sqrt(Math.pow(target1X - Number(target2.attr("cx")), 2) + Math.pow(target1Y - Number(target2.attr("cy")), 2));
    return distance < target1R + Number(target2.attr("r")) ? true : false;
  }
  /**
   * This function is to see whether the ship collides with other objects or not. If so and the ship has no remaining lives, remove them and change their state.
   * Else return false. Although this function may seems impure since it affects global varibales outside of the subscribe(). But this function is only called inside
   * the subscribe() function so it's safe to use and improved usability of the code
   * @param object The object to be compared with the ship to see if they collide or not
   */
  function shipCrashHandler(object: Elem): Boolean {
    var transform = g.attr("transform").split(" ");
    var x = Number(transform[0].substr(10));
    var y = Number(transform[1].substr(0, transform[1].length - 1));
    if (crash(x, y, Number(g.attr("r")), object)) {
      if (Number(g.attr("life")) > 1) {
        var life = Number(g.attr("life")) - 1;
        object.attr("dead", "t");
        object.elem.remove();
        g.attr("transform", "translate(300 300) rotate(0)").attr("life", life)
        console.log(g.attr("transform"))
        document.getElementById("life")!.innerHTML = "Life:" + life.toString();
      }
      else {
        //set life to 0 and remove the ship
        document.getElementById("life")!.innerHTML = "Life:0";
        g.attr("life", 0);
        g.elem.remove();
      }
      return true;
    }
    return false;
  }
  //the interval that would be executed each 300 miliseconds
  Observable.interval(300)
    .subscribe(() => {
      //if the bullet is alive, move the bullets towards its angle
      bullets.filter((bullet) => bullet.attr("dead") == "f")
        .map(bullet => {
          var x = Number(bullet.attr("cx"));
          var y = Number(bullet.attr("cy"));
          var angle = (Number(bullet.attr("angle")) * Math.PI / 180 - Math.PI / 2);
          bullet.attr("cx", 12 * Math.cos(angle) + x)
            .attr("cy", 12 * Math.sin(angle) + y);
          return bullet;
        })
        //bullet hit rock
        .map(bullet => {
          rocks.filter((rock) => rock.attr("dead") == "f" && crash(Number(bullet.attr("cx")), Number(bullet.attr("cy")), Number(bullet.attr("r")), rock))
            .forEach(rock => {
              //If else statement is used here because it would be unnecessary and redundant to use filter separately and filter the above conditions again.
              if (Number(rock.attr("stage")) == 1) {
                //If the rock is hit by the bullet and in stage 1. i.e the rock haven't been splited yet
                //create 2 new smaller rocks and add them into the array
                var x = Number(rock.attr("cx"));
                var y = Number(rock.attr("cy"));
                var r = Math.floor(Number(rock.attr("r")) / 2)
                var angle = Number(rock.attr("cy"));
                rock.attr("dead", "t");
                rock.elem.remove();
                rocks.push((new Elem(svg, "circle")
                  .attr("cx", x).attr("cy", y).attr("r", r).attr("angle", angle)
                  .attr("stage", 0).attr("dead", "f")
                  .attr("style", "fill:yellow;stroke:yellow;stroke-width:1")));
                rocks.push((new Elem(svg, "circle")
                  .attr("cx", x).attr("cy", y).attr("r", r).attr("angle", angle + 90)
                  .attr("stage", 0).attr("dead", "f")
                  .attr("style", "fill:yellow;stroke:yellow;stroke-width:1")));
                points += 15;
              } else {
                //if the rock has already been splited, remove it and add 30 points
                rock.attr("dead", "t");
                rock.elem.remove();
                points += 30;
              }
              //update the score and remove the used bullets
              document.getElementById("marks")!.innerHTML = "Points:" + points.toString();
              bullet.attr("dead", "t");
              bullet.elem.remove();
            });
        })

      //moving the rocks
      rocks.filter((rock) => rock.attr("dead") == "f")
        .map(rock => {
          var rockX = Number(rock.attr("cx"));
          var rockY = Number(rock.attr("cy"));
          var rockAngle = Number(rock.attr("angle"));
          rock.attr("cx", 8 * Math.cos(Number(rockAngle)) + rockX)
            .attr("cy", 8 * Math.sin(Number(rockAngle)) + rockY);
          let temp = wrapElem(Number(rock.attr("cx")), Number(rock.attr("cy")));
          rock.attr("cx", String(temp[0])).attr("cy", String(temp[1]))
          //check if it collides with the ship.
          shipCrashHandler(rock);
        })
      var transform = g.attr("transform").split(" ");
      var x = Number(transform[0].substr(10));
      var y = Number(transform[1].substr(0, transform[1].length - 1));
      var angle = Number(transform[2].substr(7, transform[2].length - 8));
      x = (x + Math.cos(angle * Math.PI / 180 - Math.PI / 2))
      y = (y + Math.sin(angle * Math.PI / 180 - Math.PI / 2))
      let temp = wrapElem(x, y);
      //when there's no Thrust, the ship would move slowly
      g.attr("transform", "translate(" + temp[0].toString() + " " + temp[1].toString() + ") rotate(" + angle.toString() + ")");
      var randX = Math.floor(Math.random() * 600);
      var randRX = Math.floor(Math.random() * 30 + 20);
      var randAngle = Math.floor(Math.random() * -180);
      //calculate the alive rocks
      var count = 0;
      for (var index = 0; index < rocks.length; index++) { rocks[index].attr("dead") == "f" ? count++ : count += 0 }
      //If the remaining alive rocks are less than 12, make more rocks. This is to maintain the amount of rocks so the player would always have something to shoot
      if (count < 12) {
        rocks.push(new Elem(svg, "circle")
          .attr("cx", 0).attr("cy", randX).attr("r", randRX).attr("angle", randAngle)
          .attr("stage", 1)
          .attr("style", "fill:lightyellow;stroke:yellow;stroke-width:1")
          .attr("dead", "f")
        )
      }
      /////////////////////////HARD LEVEL//////////////////////////////////
      if (asteroidDefender.attr("dead") == "f") {
        //move
        var ePoints = asteroidDefender.attr("points").split(" ");
        var newPointsArray = [];
        for (var i = 0; i < ePoints.length; i++) { newPointsArray.push(ePoints[i].split(",")); }
        console.log(newPointsArray)
        var asteroidDefenderAngle = Number(asteroidDefender.attr("angle"));
        var movedY = 8 * Math.sin(asteroidDefenderAngle * Math.PI / 180 - Math.PI / 2)
        var movedX = 8 * Math.cos(asteroidDefenderAngle * Math.PI / 180 - Math.PI / 2)
        var newcx = Number(asteroidDefender.attr("cx")) + movedX
        var newcy = Number(asteroidDefender.attr("cy")) + movedY
        var tempWrap = wrapElem(newcx, newcy);
        movedX -= newcx - Number(tempWrap[0])
        movedY -= newcy - Number(tempWrap[1])
        var newPoints = (Number(newPointsArray[0][0]) + movedX).toString() + "," + (Number(newPointsArray[0][1]) + movedY).toString() + " " +
          (Number(newPointsArray[1][0]) + movedX).toString() + "," + (Number(newPointsArray[1][1]) + movedY).toString() + " " +
          (Number(newPointsArray[2][0]) + movedX).toString() + "," + (Number(newPointsArray[2][1]) + movedY).toString() + " " +
          (Number(newPointsArray[3][0]) + movedX).toString() + "," + (Number(newPointsArray[3][1]) + movedY).toString()
        asteroidDefender.attr("points", newPoints).attr("cx", tempWrap[0].toString()).attr("cy", tempWrap[1].toString())
        console.log(asteroidDefender.attr("points"))
        //shoot bullets every 300 miliseconds. The y coordinate was made this way on purpose so instead of shooting just like the player, it will form a "fence"
        //that can change length every 300 miliseconds to make the game more interesting. The "fence" is made by circles.
        enemyBullets.push(new Elem(svg, "circle")
          .attr("cx", newcx).attr("cy", Number(asteroidDefender.attr("cx")) + movedY).attr("r", 4)
          .attr("style", "fill:red;stroke:red;stroke-width:1")
          .attr("angle", asteroidDefenderAngle).attr("dead", "f"))
        enemyBullets.map((bullet) => {
          var x = Number(bullet.attr("cx"));
          var y = Number(bullet.attr("cy"));
          var angle = (Number(bullet.attr("angle")) * Math.PI / 180 - Math.PI / 2);
          bullet.attr("cx", 10 * Math.cos(angle) + x)
            .attr("cy", 10 * Math.sin(angle) + y);
        })
        //collide with the ship
        if (shipCrashHandler(asteroidDefender)) {
          enemyBullets.map((eBullet) => {
            eBullet.attr("dead", "t")
            eBullet.elem.remove()
          })
          document.getElementById("life")!.innerHTML = "Life:0"
          g.attr("life", 0);
          g.elem.remove()
        }
        //hit the ship with bullets
        enemyBullets.map((eBullets) => shipCrashHandler(eBullets))
      }
    })
  //This set time out function will only show and make the enemy alive after 30 seconds
  setTimeout(() => {
    asteroidDefender.attr("points", "190,200 200,180 210,200 200,205").attr("dead", "f");
  }, 30000)
}
// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = () => {
    asteroids();
  }