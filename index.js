let consoleText = 'test444444444444444444444444444444444445555555555\ntest2\ncool\ncool2\ncool3'
const consoleTextPadding = 20;
let font;
let input;
let disabled = true;
let body = document.querySelector('body');

function windowResized() {resizeCanvas(windowWidth, windowHeight)}

function preload() {
  font = loadFont('/SourceCodePro.ttf');
}

function setup() {
    // styles
    createCanvas(100, 100);
    windowResized();
    fill(3, 156, 0);
    textFont(font, 20);
    noStroke();
    textWrap(CHAR);
    textAlign(LEFT, TOP);

    // input box
    input = createInput();
    input.position(consoleTextPadding, 200);
    input.elt.disabled = true;

    body.addEventListener('keydown', function(event) {
        if (disabled) return;
        if (event.key === 'Enter' && input.value().trim() !== '') {
            event.preventDefault();
            consoleText += '\n' + input.value().trim();
            input.value('');
        } else if (event.key === 'Backspace') {
            event.preventDefault();
            if (input.value().length > 0) {
                input.value(input.value().slice(0, -1));
            }
        } else if (event.key.length === 1) {
            event.preventDefault();
            input.value(input.value() + event.key);
        }
    });

}

function draw() {
    background(0, 0, 0);
    drawConsoleText();
}

function drawConsoleText() {
    let yOffest=0;
    let lines = consoleText.split('\n');
    for (let i = 0; i < lines.length; i++) {
        text(lines[i], consoleTextPadding, yOffest + consoleTextPadding, width - consoleTextPadding * 2);
        yOffest += round(textWidth(lines[i]) / width +0.5)*24;
    }
    input.position(textWidth(lines.at(-1)) + consoleTextPadding + 5, yOffest - 3);
}