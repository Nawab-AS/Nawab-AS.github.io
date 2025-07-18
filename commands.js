const githubUsername = 'Nawab-AS';
const email = 'nawab-as@hackclub.app';
const profileReadme = ref('');


async function about(args) { await type(`\n\n${profileReadme.value}`, 50) }
// Fetch GitHub profile README
fetch(`https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/README.md`)
    .then(response => { return response.text() })
    .then(text => { profileReadme.value = text.replace(/<!--(.*?)-->/gms, '') }) // Fetch the README file and remove comments
    .catch(error => { profileReadme.value = `HTTP error! status: ${error.status}` });


async function contact(args) {
    await type(`\nYou can contact me at:${email ? `\nEmail: ${email}` : ''}\nGitHub: ${githubUsername}`, 50);
}



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
async function projects(args) {
    let r = args.includes('-r'); // -r flag means refresh
    if (r) {
        await type('\nFetching top repositories...\nPlease note that repositories can only be fetched at a maximum of 60 times/hour.', 40);
    } else {
        await type('\nTip: Use "projects -r" to fetch top repositories.', 50);
    }
    let set = await getTopRepos(r);
    
    if (top_repos.length === 0) {
        await type('\nNo repositories found or an error occurred while fetching.', 50);
        return;
    }

    await type(`\nTop Repositories (last updated: ${new Date(set).toLocaleString()}):`, 50);
    let i = 1;
    for (let repo of top_repos) {
        await type(`\n\n${i++}) ${repo.name}    last updated: ${new Date(repo.last_commit).toLocaleString()}`, 50);
        if (i > 5) break; // limit to 5 repositories
    }
}