# COMP1720 template

Here's the **javascript** template for making p5 sketches for COMP1720. If
you've used Processing before, the p5 function names and general worldview will
be really similar.

## Setup

Follow the guide [here](https://cs.anu.edu.au/courses/comp1720/resources/software-setup/).

## Use

1. clone this repository, either to your home repository (eg. u1234567 on the lab machines)
   or to a comp1720 folder on your own machine

2. open the folder in VSCode and start the live server (`View > Command Palette
   (Ctrl+Shift+P) > Live Server: Open with Live Server` or `Alt+O` or click the
   `Go Live` button in the bottom right of VSCode)

3. this should automatically open the server in a new tab in Chrome, if it
   doesn't then type `localhost:X` (where X is the port number listed on the
   bottom right) into the address bar to run/view the sketch

4. every time you save (`Ctrl+S`) the `sketch.js` file, the live view will
   auto-update the sketch, making changes to variables in the draw loop will
   cause the sketch to update on the fly without reloading (unless you save it)

### Repo structure

- `master` is the very base branch - contains the p5 template and nothing else
- `lab-base` is the base lab/assignment repo branch, which includes the stuff
  from `master` plus the CI file for deploying to the test URL
- `lab-{1..9}` contains the starter code for each lab exercise
- `assignment-{1..3}` contains the starter code for each assignment
- `major-project` contains the starter code for the major project
- the `lecture-livecode` branch is used throughout the whole course, and is
  tagged each week with the "results" of that week's livecoding

The assignment and major project CI files (`.gitlab-ci.yml`) also include some
deliverable-specific CI checks (e.g. ass1 checks that the `nametag.png` has been
added).

### Notes

If you want to view you console.logs or any error messages, open the developer
console (with `Ctrl+Shift+J` on Chrome) and click on console. There are further
steps on using the developer console
[here](https://cs.anu.edu.au/courses/comp1720/resources/software-setup/#developer-console).

This should work in all browsers, but we'll be using Chrome in the labs, so it's
probably best to use that.

Also, if you do make a cool sketch, don't push the changes back up to the
"template" repo (you probably don't have permission to do that anyway). Instead,
create a new GitLab repo and push it up there.

## Resources

Here are a few places you'll find useful information:

- [COMP1720 lab 1](https://cs.anu.edu.au/courses/comp1720/labs/01-intro/)
- [p5.js reference](https://p5js.org/reference/)
- [course website](https://cs.anu.edu.au/courses/comp1720/)
