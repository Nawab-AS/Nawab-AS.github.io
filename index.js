const { createApp, ref, watch, nextTick } = Vue;

const terminal = ref('');
const command = ref('');
const disabled = ref(true);

async function type(text, delay=50) {
    const focus = document.getElementById('focus');
    if (delay === 0) {terminal.value += text;return;}

    let scroll = setInterval(() => {
        focus.scrollIntoView({ behavior: 'smooth' })
    }, 100);

    for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
            terminal.value += text[i];
        }, delay * i);
    }

    await new Promise(resolve => setTimeout(resolve, delay * (text.length+2)));
    clearInterval(scroll);
    return;
}


// intro text
let introText;
fetch('default.txt').then(response => response.text())
    .then(text => {introText = text;})
    .catch(error => console.error('Error fetching default.txt:', error));
setTimeout(async () => {
    await type('Initializing Terminal', 50);
    await type('...', 400);
    await type("\n\n"+introText+"\n\n", 1);
    await type('Welcome to my portfolio!\nType "help" for commands.', 50);
    disabled.value = false;
}, 1500);


// make sure text box never loses focus
watch(disabled, async (_, __) => {
    command.value = '';
    await nextTick();

    let input = document.querySelector('input');
    if (!input) return; // disabled
    input.focus();
    input.addEventListener('blur', () => {
        let input = document.querySelector('input');
        if (input) input.focus();
    });

});

// fetch commands from commands.json
let commands;
(async () => {
    commands = await fetch('./commands.json')
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching commands.json:', error);
            return {};
    });
})();



async function executeCommand(e) { // TODO: add command history
    e.preventDefault();
    let cmd = command.value.trim();
    terminal.value += `\nuser@Portfolio:~$ ${cmd}`;

    if (cmd === '') return; // empty command
    cmd = cmd.split(' ');
    if (cmd[0] == 'sudo') cmd.shift(); // remove sudo from command
    if (cmd.length == 0) return;

    disabled.value = true;
    if (cmd[0] in commands){
        let output = commands[cmd[0]];
        if (output?.output) {
            await type(`\n${output.output}`, output.speed);
            disabled.value = false;
            return;
        }
        
        // command is dynamic
        if (output?.run) {
            if (typeof window[output.run] !== 'function') {
                await type(`\nCommand not found: '${cmd[0]}'\nType "help" for a list of commands.`);
                disabled.value = false;
                return;
            }
            await window[output.run](cmd.slice(1));
            disabled.value = false;
            return;
        }
    }

    // build-in commands

    switch (cmd[0]) {
        case 'help':
            //await type('\nAvailable commands:\n- help: Show this help message\n- about: Show information about me\n- projects: show some of my most recent List projects\n- contact: Show contact information\n- clear: Clear the terminal', 30);
            await type('\nAvailable commands:\n- help: Show this help message\n\n- clear: Clear the terminal', 30);
            for (let i in commands) {
                await type(`\n\n- ${i}: ${commands[i].help}`, 30);
            }
            break;
        
        case 'clear':
            terminal.value = '';
            await type('Terminal cleared.');
            break;
        default:
            await type(`\nCommand not found: '${cmd}'\nType "help" for a list of commands.`);
            break;
    }
    disabled.value = false;
}


// bind app
const app = createApp({
    setup() {
        return { terminal, command, disabled, executeCommand };
    }
});
app.mount('#app');
