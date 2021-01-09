let x_vals = [];
let y_vals = [];

// y = ax^2 + bx + c <- Linear Equation
// let a, b, c;
let coeffs = [];
let b;

let coeffSlider;
let coeffP;
let learnSlider;
let learnP;

let canvas;

let dragging = false;

let learningRate = 0.1;
let optimizer = tf.train.sgd(learningRate);

const PARENT_INTERACTION_ID = "interaction";

function setup() {
    let canvasCont = select("#canvas-cont");
    canvas = createCanvas(canvasCont.width - 10, canvasCont.width - 10);
    canvas.parent("canvas-cont");
    canvas.id("canvas");
    canvas.mouseClicked(() => {
        dragging = false;
        pointAdd()
    });
    canvas.mousePressed(dragged);
    canvas.mouseReleased(dragged);
    canvas.mouseOut(() => dragging = false);

    coeffP = select("#coeffP");
    coeffSlider = select("#coeffSlider");

    learnP = select("#learnP");
    learnSlider = select("#learnSlider");

    /*  a = tf.variable(tf.scalar(random(-1, 1)));
      b = tf.variable(tf.scalar(random(-1, 1)));
      c = tf.variable(tf.scalar(random(-1, 1)));*/


    coeffs.push(tf.variable(tf.scalar(random(-1, 1))));
}

function dragged() {
    dragging = !dragging;
}

function pointAdd() {
    let x = map(mouseX, 0, width, -1, 1);
    let y = map(mouseY, 0, height, 1, -1);
    x_vals.push(x);
    y_vals.push(y);
}

function updateCoeffs() {
    let numCoeffs = coeffSlider.value();
    if (coeffs.length < numCoeffs) {
        let differ = numCoeffs - coeffs.length;
        for (let i = 0; i < differ; i++) {
            coeffs.push(tf.variable(tf.scalar(random(-1, 1))));
            console.log(coeffs.length)
        }

    } else {
        let differ = coeffs.length - numCoeffs;
        for (let i = 0; i < differ; i++) coeffs.pop();
        console.log(coeffs.length)

    }
    coeffP.html("Order: " + coeffs.length);
}


/*
function updateCoeffs() {
    let numCoeffs = coeffSlider.value();
    coeffs = [];
    for (let i = 0; i <= numCoeffs; i++) {
        coeffs.push(tf.variable(tf.scalar(random(-1, 1))));
    }
    coeffP.html("Order: " + coeffs.length);
}
*/




function updateLearningRate() {
    learningRate = learnSlider.value();
    optimizer = tf.train.sgd(learningRate);
    learnP.html("Learning rate: " + learningRate);
}

function predict(input) {
    const xs = tf.tensor1d(input);
    let output = xs.pow(coeffs.length).mul(coeffs[0]);
    for (let i = 1; i < coeffs.length; i++) {
        output = output.add(xs.pow(coeffs.length - 1 - i).mul(coeffs[i]));
    }
    console.log(output);

    return output;
}


function loss(pred, labels) {
    return pred.sub(labels).square().mean();
}

function reset() {
    x_vals = [];
    y_vals = [];
    let firstCoeff = coeffs[0];
    coeffs = [];
    coeffs[0] = firstCoeff;
    coeffP.html("Order: " + coeffs.length);
    coeffSlider.value(1);
    optimizer = tf.train.sgd(learningRate);
}



/*function predict(x) {
  const xs = tf.tensor1d(x);
  // const ys = xs.mul(m).add(b);
  const ys = xs.square().mul(a).add(xs.mul(b)).add(c);
  return ys;
}*/



function draw() {
    if (dragging) {
        pointAdd();
    } else {
        tf.tidy(() => {
            if (x_vals.length > 0) {
                const ys = tf.tensor1d(y_vals);
                optimizer.minimize(() => loss(predict(x_vals), ys))
            }
        });
    }

    background(0);
    stroke(39, 135, 216);
    strokeWeight(8);


    for (let i = 0; i < x_vals.length; i++) {
        let px = map(x_vals[i], -1, 1, 0, width);
        let py = map(y_vals[i], -1, 1, height, 0);
        point(px, py);
    }

    // const lineX = [0, 1];
    const curveX = [];
    for (let x = -1; x <= 1; x += 0.005) {
        curveX.push(x)
    }

    /*  const ys = tf.tidy(() => predict(lineX));
      let lineY = ys.dataSync();
      ys.dispose();*/

    const ys = tf.tidy(() => predict(curveX));
    let curveY = ys.dataSync();
    ys.dispose();

    /*  let x1 = map(lineX[0], -1, 1, 0, width);
      let x2 = map(lineX[1], -1, 1, 0, width);

      let y1 = map(lineY[0], -1, 1, height, 0);
      let y2 = map(lineY[1], -1, 1, height, 0);

      strokeWeight(2);
      stroke(255);
      line(x1, y1, x2, y2);*/


    beginShape();
    noFill();
    stroke(255);
    strokeWeight(2);

    for (let i = 0; i < curveX.length; i++) {
        let x = map(curveX[i], -1, 1, 0, width)
        let y = map(curveY[i], -1, 1, height, 0)
        vertex(x, y)
    }
    endShape();


    console.log(tf.memory().numTensors);

    /*    let div = 8;
        for (let i = width / div; i < width; i += width / div) {
            strokeWeight(1);
            stroke("rgba(255, 255, 255, 0.1)");
            line(i, 0, i, height);
            line(0, i, width, i);
        }*/

    div = 8;
    for (let i = width / div; i < width; i += width / div) {
        strokeWeight(2)
        stroke("rgba(117, 136, 138, 0.2)");
        line(i, 0, i, height);
        line(0, i, width, i);
    }
}