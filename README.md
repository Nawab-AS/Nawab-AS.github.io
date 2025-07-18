# Portfolio

Welcome to my portfolio! This repository showcases my projects, skills, and experience.

Why read this boring `README.md` when you can explore my projects directly through the terminal (or at least an emulator)?

## Getting Started

### Live Demo

Check out the live version of this portfolio [here](https://Nawab-AS.github.io).

### Hosting locally

To view this portfolio locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/Nawab-AS/Nawab-AS.github.io.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Nawab-AS.github.io
   ```
4. serve the project using a local server
   ```bash
   python -m http.server 8000
   ```
   or use any other method to serve static files.

5. Open `localhost:8000` in your browser to explore the portfolio.



## Is This a Template?
Although this is my personal portfolio, feel free to fork this repo and use this as a template for your own portfolio.
Just make sure to change the `githubUsername` and `email` variables in the `commands.js` file to your own GitHub username and email address.



## Features

- **Terminal-like interface**: A simulated terminal experience for user interaction.
- **Custom commands**: Easy to add new commands (supports arguments).
- **Dynamic content**: Built-in commands that fetch and displays realtime data from GitHub (e.g., profile README, recent repositories).
- **Customizable template**: Easily adaptable for other users by modifying variables like githubUsername and email.


## Adding Commands

### Static Commands

To add new commands to the terminal interface, you can modify the `commands.json` file. Each command should be added in the following format.

```json
"yourCommand": {
    "help": "Description of your command",
    "output": "what the command should output",
}
```

### Dynamic Commands

Dynamic commands are defined in the `commands.js` file. In order to do this you need to create a new async function for your command which accepts an array called `args`. 

One last thing to know is that to append text to the terminal, you can use the `type` function. This function takes two parameters: the text to append and the typing speed in milliseconds.

#### Example

```javascript
async function echo(args) {
    await type(`\nYou said: ${args[0]}`, 50);
}
```

aditionally, dynamic commands must also be registered in the `commands.json` file with the following format:

```json
"yourDynamicCommand": {
    "help": "Description of your command",
    "run": "<insert the name of your javascript function here>"
}
```

#### Example

```json
"echo": {
    "help": "Repeats what you said",
    "run": "echo"
}
```


## Screenshots

Here is a preview of the terminal interface:

![Terminal Interface](https://hc-cdn.hel1.your-objectstorage.com/s/v3/dd1707dd77991f9e771e1acc10e866818a01933f_20250718_09h41m28s_grim.png)
