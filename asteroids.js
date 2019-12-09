"use strict";
function asteroids() {
    const svg = document.getElementById("canvas");
    var bullets = new Array();
    var rocks = new Array();
    var enemyBullets = new Array();
    var points = 0;
    let g = new Elem(svg, 'g')
        .attr("transform", "translate(300 300) rotate(0)")
        .attr("r", 20).attr("life", 3);
    let ship = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:lightblue;stroke:purple;stroke-width:1");
    let shipWing = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-20,0 0,-5 20,0 0,5")
        .attr("style", "fill:darkred;stroke:darkred;stroke-width:1");
    let asteroidDefender = new Elem(svg, 'polygon')
        .attr("dead", "t").attr("r", 8)
        .attr("cx", 200).attr("cy", 200).attr("angle", 120)
        .attr("style", "fill:red;stroke:red;stroke-width:1");
    const keydown = Observable.fromEvent(document, 'keydown');
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
            .attr("dead", "f").attr("angle", angle));
    });
    keydown.filter((event) => event.which == 87 ? true : false)
        .subscribe(() => {
        var transform = g.attr("transform").split(" ");
        var x = Number(transform[0].substr(10));
        var y = Number(transform[1].substr(0, transform[1].length - 1));
        var angle = Number(transform[2].substr(7, transform[2].length - 8));
        var newX = (x + 6 * Math.cos(angle * Math.PI / 180 - Math.PI / 2));
        var newY = (y + 6 * Math.sin(angle * Math.PI / 180 - Math.PI / 2));
        let temp = wrapElem(newX, newY);
        g.attr("transform", "translate(" + temp[0].toString() + " " + temp[1].toString() + ") rotate(" + angle.toString() + ")");
    });
    keydown.filter((event) => event.which == 84 ? true : false)
        .subscribe(() => {
        var transform = g.attr("transform").split(" ");
        var x = Number(transform[0].substr(10));
        var y = Number(transform[1].substr(0, transform[1].length - 1));
        var angle = Number(transform[2].substr(7, transform[2].length - 8));
        g.attr("transform", "translate(" + x.toString() + " " + y.toString() + ") rotate(" + ((angle + 5) % 360).toString() + ")");
    });
    keydown.filter((event) => event.which == 82 ? true : false)
        .subscribe(() => {
        var transform = g.attr("transform").split(" ");
        var x = Number(transform[0].substr(10));
        var y = Number(transform[1].substr(0, transform[1].length - 1));
        var angle = Number(transform[2].substr(7, transform[2].length - 8));
        g.attr("transform", "translate(" + x.toString() + " " + y.toString() + ") rotate(" + ((angle - 5) % 360).toString() + ")");
    });
    function wrapElem(targetX, targetY) {
        if (targetX < 0)
            return targetY < 0 ? [600, 600] : [600, targetY];
        if (targetX > 600)
            return targetY > 600 ? [0, 0] : [0, targetY];
        if (targetY < 0)
            return [targetX, 600];
        if (targetY > 600)
            return [targetX, 0];
        return [targetX, targetY];
    }
    function crash(target1X, target1Y, target1R, target2) {
        var distance = Math.sqrt(Math.pow(target1X - Number(target2.attr("cx")), 2) + Math.pow(target1Y - Number(target2.attr("cy")), 2));
        return distance < target1R + Number(target2.attr("r")) ? true : false;
    }
    function shipCrashHandler(object) {
        var transform = g.attr("transform").split(" ");
        var x = Number(transform[0].substr(10));
        var y = Number(transform[1].substr(0, transform[1].length - 1));
        if (crash(x, y, Number(g.attr("r")), object)) {
            if (Number(g.attr("life")) > 1) {
                var life = Number(g.attr("life")) - 1;
                object.attr("dead", "t");
                object.elem.remove();
                g.attr("transform", "translate(300 300) rotate(0)").attr("life", life);
                console.log(g.attr("transform"));
                document.getElementById("life").innerHTML = "Life:" + life.toString();
            }
            else {
                document.getElementById("life").innerHTML = "Life:0";
                g.attr("life", 0);
                g.elem.remove();
            }
            return true;
        }
        return false;
    }
    Observable.interval(300)
        .subscribe(() => {
        bullets.filter((bullet) => bullet.attr("dead") == "f")
            .map(bullet => {
            var x = Number(bullet.attr("cx"));
            var y = Number(bullet.attr("cy"));
            var angle = (Number(bullet.attr("angle")) * Math.PI / 180 - Math.PI / 2);
            bullet.attr("cx", 12 * Math.cos(angle) + x)
                .attr("cy", 12 * Math.sin(angle) + y);
            return bullet;
        })
            .map(bullet => {
            rocks.filter((rock) => rock.attr("dead") == "f" && crash(Number(bullet.attr("cx")), Number(bullet.attr("cy")), Number(bullet.attr("r")), rock))
                .forEach(rock => {
                if (Number(rock.attr("stage")) == 1) {
                    var x = Number(rock.attr("cx"));
                    var y = Number(rock.attr("cy"));
                    var r = Math.floor(Number(rock.attr("r")) / 2);
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
                }
                else {
                    rock.attr("dead", "t");
                    rock.elem.remove();
                    points += 30;
                }
                document.getElementById("marks").innerHTML = "Points:" + points.toString();
                bullet.attr("dead", "t");
                bullet.elem.remove();
            });
        });
        rocks.filter((rock) => rock.attr("dead") == "f")
            .map(rock => {
            var rockX = Number(rock.attr("cx"));
            var rockY = Number(rock.attr("cy"));
            var rockAngle = Number(rock.attr("angle"));
            rock.attr("cx", 8 * Math.cos(Number(rockAngle)) + rockX)
                .attr("cy", 8 * Math.sin(Number(rockAngle)) + rockY);
            let temp = wrapElem(Number(rock.attr("cx")), Number(rock.attr("cy")));
            rock.attr("cx", String(temp[0])).attr("cy", String(temp[1]));
            shipCrashHandler(rock);
        });
        var transform = g.attr("transform").split(" ");
        var x = Number(transform[0].substr(10));
        var y = Number(transform[1].substr(0, transform[1].length - 1));
        var angle = Number(transform[2].substr(7, transform[2].length - 8));
        x = (x + Math.cos(angle * Math.PI / 180 - Math.PI / 2));
        y = (y + Math.sin(angle * Math.PI / 180 - Math.PI / 2));
        let temp = wrapElem(x, y);
        g.attr("transform", "translate(" + temp[0].toString() + " " + temp[1].toString() + ") rotate(" + angle.toString() + ")");
        var randX = Math.floor(Math.random() * 600);
        var randRX = Math.floor(Math.random() * 30 + 20);
        var randAngle = Math.floor(Math.random() * -180);
        var count = 0;
        for (var index = 0; index < rocks.length; index++) {
            rocks[index].attr("dead") == "f" ? count++ : count += 0;
        }
        if (count < 12) {
            rocks.push(new Elem(svg, "circle")
                .attr("cx", 0).attr("cy", randX).attr("r", randRX).attr("angle", randAngle)
                .attr("stage", 1)
                .attr("style", "fill:lightyellow;stroke:yellow;stroke-width:1")
                .attr("dead", "f"));
        }
        if (asteroidDefender.attr("dead") == "f") {
            var ePoints = asteroidDefender.attr("points").split(" ");
            var newPointsArray = [];
            for (var i = 0; i < ePoints.length; i++) {
                newPointsArray.push(ePoints[i].split(","));
            }
            console.log(newPointsArray);
            var asteroidDefenderAngle = Number(asteroidDefender.attr("angle"));
            var movedY = 8 * Math.sin(asteroidDefenderAngle * Math.PI / 180 - Math.PI / 2);
            var movedX = 8 * Math.cos(asteroidDefenderAngle * Math.PI / 180 - Math.PI / 2);
            var newcx = Number(asteroidDefender.attr("cx")) + movedX;
            var newcy = Number(asteroidDefender.attr("cy")) + movedY;
            var tempWrap = wrapElem(newcx, newcy);
            movedX -= newcx - Number(tempWrap[0]);
            movedY -= newcy - Number(tempWrap[1]);
            var newPoints = (Number(newPointsArray[0][0]) + movedX).toString() + "," + (Number(newPointsArray[0][1]) + movedY).toString() + " " +
                (Number(newPointsArray[1][0]) + movedX).toString() + "," + (Number(newPointsArray[1][1]) + movedY).toString() + " " +
                (Number(newPointsArray[2][0]) + movedX).toString() + "," + (Number(newPointsArray[2][1]) + movedY).toString() + " " +
                (Number(newPointsArray[3][0]) + movedX).toString() + "," + (Number(newPointsArray[3][1]) + movedY).toString();
            asteroidDefender.attr("points", newPoints).attr("cx", tempWrap[0].toString()).attr("cy", tempWrap[1].toString());
            console.log(asteroidDefender.attr("points"));
            enemyBullets.push(new Elem(svg, "circle")
                .attr("cx", newcx).attr("cy", Number(asteroidDefender.attr("cx")) + movedY).attr("r", 4)
                .attr("style", "fill:red;stroke:red;stroke-width:1")
                .attr("angle", asteroidDefenderAngle).attr("dead", "f"));
            enemyBullets.map((bullet) => {
                var x = Number(bullet.attr("cx"));
                var y = Number(bullet.attr("cy"));
                var angle = (Number(bullet.attr("angle")) * Math.PI / 180 - Math.PI / 2);
                bullet.attr("cx", 10 * Math.cos(angle) + x)
                    .attr("cy", 10 * Math.sin(angle) + y);
            });
            if (shipCrashHandler(asteroidDefender)) {
                enemyBullets.map((eBullet) => {
                    eBullet.attr("dead", "t");
                    eBullet.elem.remove();
                });
                document.getElementById("life").innerHTML = "Life:0";
                g.attr("life", 0);
                g.elem.remove();
            }
            enemyBullets.map((eBullets) => shipCrashHandler(eBullets));
        }
    });
    setTimeout(() => {
        asteroidDefender.attr("points", "190,200 200,180 210,200 200,205").attr("dead", "f");
    }, 30000);
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map