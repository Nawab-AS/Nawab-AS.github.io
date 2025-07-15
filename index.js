const { createApp, ref } = Vue

const terminal = ref('');
const command = ref('');


async function type(text, delay=100) {
    if (delay == 0) {terminal.value += text;return;}

    for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
            terminal.value += text[i];
        }, delay * i);
    }

    await (new Promise(resolve => setTimeout(resolve, delay * (text.length+1))));
    return;
}

function executeCommand() {
    const cmd = command.value.trim();
    if (cmd === '') return;
}


// intro text
let introText;
fetch('default.txt').then(response => response.text())
    .then(text => {introText = text;})
    .catch(error => console.error('Error fetching default.txt:', error));
setTimeout(async () => {
    await type('Initializing Terminal', 50);
    await type(' ...\n', 500);
    await type("\n"+introText+"\n\n", 1);
    await type('Welcome to my portfolio!\nType "help" for commands.\n', 50);
}, 1500);



// bind app
const app = {
    setup() {
        return { terminal, command, executeCommand };
    }
};
createApp(app).mount('body');
