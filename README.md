# Pick Fair Teams


Find the tool itself at [https://www.pickfairteams.com](https://www.pickfairteams.com).

This web application helps you divide a group of people (students, football players, etc.) into fair teams based on their individual proficiency levels. It uses an algorithm developed as part of a Master's Thesis, which  you can read [here](ReworkedThesis.pdf).

## How to Use

You put in a list of people and their proficiencies. The tool will divide them into the number of teams you specify in a fair way (although if it's a large number of people  probably not the very fairest, to save time). This assumes that, e.g. a team of two people with scores of 80 and 70 is equivalent to a team of 
two people both with scores of 75. This assumption may not always hold, but is a useful and simple fudge 
in many cases.

## Algorithm

The algorithm, called SynTeamPlus, was developed from the original SynTeam algorithm, which was designed by Ewa Andrejczuk. The code for the algorithm can be found in the `synTeamPlus.js` file, and overviews in words for SynTeam and my adaptations for SynTeamPlus can be found on pages 16 and 20 of my Thesis respectively.

A python version is also provided in this repository.

## Licence

Do what you want, but credit is nice.
