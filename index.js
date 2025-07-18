const { createApp, ref, watch, nextTick } = Vue;

const terminal = ref('');
const command = ref('');
const disabled = ref(true);
const githubUsername = 'Nawab-AS';
const email = 'nawab-as@hackclub.app';
const profileReadme = ref('');


// Fetch GitHub profile README
fetch(`https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/README.md`)
    .then(response => { return response.text(); })
    .then(text => { profileReadme.value = text.replace(/<!--(.*?)-->/gms, ''); })
    .catch(error => {
        profileReadme.value = `HTTP error! status: ${error.status}`;
    });


async function type(text, delay=50) {
    if (delay === 0) {terminal.value += text;return;}

    for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
            terminal.value += text[i];
        }, delay * i);
    }

    await new Promise(resolve => setTimeout(resolve, delay * (text.length+1)));
    return;
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


// fetch top repos
let top_repos = [];
async function getTopRepos(refresh=false) {
    if (!refresh) {
        let stored = localStorage.getItem('top_repos');
        if (stored) {
            try {
                let data = JSON.parse(stored);
                if (Date.now() - data.set < 24 * 60 * 60 * 1000) { // max timeout of 24 hours
                    top_repos = data.top_repos;
                    return data.set;
                }
            } catch (error) {
                console.info('stored data is malformed, fetching new data', error);
                top_repos = [];
            }
        }
    }

    // if refreshing OR no stored data OR stored data malformed OR data is >24hrs old, fetch from GitHub
    // this api has a rate limit of 60 requests per hour for unauthenticated requests
    try {
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos`);
        const json = await response.json();
        for (let i in json) {
            if (json[i].name.toLowerCase().includes(githubUsername.toLowerCase())) continue;
            top_repos.push({ name: json[i].full_name, last_commit: new Date(json[i].pushed_at).getTime() });
        }
        top_repos.sort((a, b) => b.last_commit - a.last_commit);
        return Date.now();
    } catch (error) {
        console.warn('Error fetching:', error);
        top_repos = [];
    } finally {
        localStorage.setItem('top_repos', JSON.stringify({ top_repos, set: Date.now() }));
    }
}


async function executeCommand(e) {
    e.preventDefault();
    let cmd = command.value.trim();
    terminal.value += `\nuser@Portfolio:~$ ${cmd}`;
    if (cmd === '') return; // empty command
    disabled.value = true;
    if (cmd in commands){
        let output = commands[cmd];
        await type(`\n${output.output}`, output.speed);
        disabled.value = false;
        return;
    }

    switch (cmd) {
        case 'help':
            await type('\nAvailable commands:\n- help: Show this help message\n- about: Show information about me\n- projects: show some of my most recent List projects\n- contact: Show contact information\n- clear: Clear the terminal', 30);
            for (let i in commands) {
                await type(`\n- ${i}: ${commands[i].help}`, 30);
            }
            break;
        case 'about':
            await type(`\n\n${profileReadme.value}`, 50);
            break;
        case 'contact':
            await type(`\nYou can contact me at:${email ? `\nEmail: ${email}` : ''}\nGitHub: ${githubUsername}`, 50);
            break;
        case 'projects -r':
            await type('\nFetching recent projects...\nPlease note that projects can only be fetched at a maximum of 60 times/hour.', 40);
        case 'projects':
            let set = await getTopRepos(cmd == 'projects -r');
            if (top_repos.length === 0) {
                await type('\nNo projects found or unable to fetch projects.');
            } else {
                let output = '\nTop Projects:';
                for (let i = 0; i < Math.min(5, top_repos.length); i++) {
                    let repo = top_repos[i];
                    console.log(repo);
                    output += `\n\n${i+1}) ${repo.name} (Last commit: ${(new Date(repo.last_commit)).toLocaleDateString()})     https://github.com/${repo.name}`;
                }
                await type(`${output}\n\nlast checked: ${new Date(set).toLocaleString()}\nTip: use 'projects -r' to fetch for more recent projects`, 25);
            }
            break;
        case 'clear':
            terminal.value = '';
            await type('Terminal cleared.\n');
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
    }/*,
    components: {
        'vue-showdown': VueShowdown
    }*/
});
//app.component('VueShowdown', VueShowdown.default);
app.mount('body');
