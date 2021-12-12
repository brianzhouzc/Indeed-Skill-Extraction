# Indeed-Skill-Extraction
<p align="center">My final project for the COSC 329 Learning Analytics course. Written in Node.js and D3.js.</p>
<p align="center">Features include Indeed.com scraping, skill extraction, as well as data visualization</p>
<p align="center">
    <img src="https://github.com/brianzhouzc/Indeed-Skill-Extraction/blob/main/img/chord.png" alt="Chord Chart" width="600"/>
</p>

## Features
- Scrape and extract job postings from Indeed.com
- Identify and extract job skills from job postings
- Visualize the data in logical and pleasing way

## Orginal Project Plan and Timeline
- Week 9: Setup github repo and research on available libraries and languages
- Week 10: Develop code for scraping info off indeed.ca (midterm break)
- Week 11: Continue working on code that scrapes info from indeed.ca and maybe other sites as well. Also start working on processing the scraped data.
- Week 12: Work on documentation and continue to work on the code.
- Week 13: Finish the majority of the functions and make a presentation video
- Week 14: Finish all remaining tasks (bug fixes and unfinished features) and submit all deliverables.

## File Structure
```
.
├── ...
├── README.md                   # Documentation file 
├── indeed_scraper.js           # Script to scrape Indeed.com
├── skill_extractor.js          # Script for extracting skills
├── helper.js                   # Script for misc. functions
├── data
│   ├── summary                 # Contains all scraped summaries
│   │   └── <job_title>.json    # Job posting summary for each job title
│   ├── description             # Contains all scraped descriptions
│   │   └── <job_title>.json    # Job posting description for each job title
│   ├── skills_raw              # Contains all extracted skills. Not manually reviewed
│   │   ├── bhattacharyya.csv   # Bhattacharyya Coefficient
│   │   └── <job_title>.csv     # All extracted skills for each job title
│   └── skills_cleaned          # Contains all extracted skills. Manually cleaned.
│       ├── top_20.csv          # Top 20 skills from each job postings. Manually created.
│       └── <job_title>.csv     # All extracted skills for each job title
├── backup                      # Backups for all scrapped data. Ordered by date/time
│   └── ...
└── visualization               # Contains all code for data visualization
    ├── index.html              # Data visualization page
    └── ...
```
## Setup
This project is developed with Node.js. Hence, you must have Node.js installed on your system to run the scripts. Additionally, you will need npm to install all the required packages.

### Installing Node.js and npm
For Windows and macOS, visit https://nodejs.org/en/download/ and download the respective installer. It will setup both Node.js and npm automatically.

For Linux, visit https://github.com/nodesource/distributions and follow the guide to install both Node.js and npm.

### Installing dependencies
Once you've installed Node.js and npm, open your terminal and cd into the repo's directory:

```bash
$ cd ./Indeed-Skill-Extraction
```

Then, use npm to install all dependencies:

```bash
$ npm install
```

You've completed the setup.

### Usage
The project contains 3 independent scripts: `indeed_scraper.js`, `skill_extractor.js` and `helper.js`. Each script contains it's own usage guide that's accessable by passing the `--help` argument when executing.

The visualization of the data depends on [Observable](observablehq.com) and requires manual processing of the data. All code related to visualization/graph is hosted on Observable and can be found here: https://observablehq.com/@brianzhouzc. This repositry only contains a simple webpage that display the graphs from Observable in a organized manner.

### indeed_scraper
To get started, run `node indeed_scraper`. See [Testing Procedure](https://github.com/brianzhouzc/Indeed-Skill-Extraction#testing-procedures) section of this documentation for a real example.
```
>$ node indeed_scraper

Indeed Scraper

  A scraper that scrapes both summary as well as detailed description from
  Indeed.

Synopsis

  $ node indeed_scraper -m summary <-j string> <--dest string>
  $ node indeed_scraper -m description <--src string> <--dest string>

Options

  --help              Display this usage guide.
  -m, --mode string   Required. Scraping mode. Either summary or description

Required arguments

  -j, --job string   Job title to query Indeed with. (Required for summary mode)
  --src string       Source file containing the scraped summary. (Required for description mode)
  --dest string      Destination file to put the results in.

Optional arguments

  -h, --host string         Url to query Indeed with. [default: ca.indeed.com]
  -l, --location string     Location of the job posting. [default: Canada]
  -r, --radius km           Search radius. [default: 25]
  -s, --start number        The start index of the search. [default: 0]
  -d, --delay ms ...        The delay between each query. Use one number to set a fix delay or two
                            numbers [min, max] to get a random delay in that range. [default:
                            [15000,30000]]
  -q, --querylimit number   The maximum amount to scrape per query. [default: 50]
  -t, --totallimit number   The total amount of postings to scrape. [default: 10000]
```

### skill_extractor
To get started, run `node skill_extractor`. See [Testing Procedure](https://github.com/brianzhouzc/Indeed-Skill-Extraction#testing-procedures) section of this documentation for a real example.
```
>$ node skill_extractor

Skill Extractor

  Extract skills from Indeed postings

Synopsis

  $ node skill_extractor --source /path/to/dir/ --destination /path/to/dir/
  $ node skill_extractor -s /path/to/dir/ -d /path/to/dir/

Arguments

  -h, --help                 Display this usage guide.
  -s, --source string        Source directory containing all Indeed posting descriptions.
  -d, --destination string   Destination directory to put all results in.
  -t, --threshold number     Default: 20. Threshold to what will be consider as a skill. Any terms with
                             frequency < threshold will be discarded.
```

### helper
The helper script is meant to serve two purposes: To calculate the amount of duplicate contains in the scraped data as well as removing them from the data.

To get started, run `node helper`:
```
>$ node helper

Helper

  Small helper to calculate number of postings in a file, as well as removing
  duplicates.

Synopsis

  $ node helper -m stats <-s string>
  $ node helper --mode clean <--src string>

Options

  --help                Display this usage guide.
  -m, --mode string     Required. Either stats (display information of the file) or clean (remove
                        duplicates from the file)
  -s, --source string   Required. Path to the json file
```

### visualization
The view the pre-generated graphs, simply open `visualization/index.html` with any modern browser, or visit https://brianzhouzc.github.io/visualization/.

To generate your own graphs with your own data, please see the Pipeline section in this documentation.

## Testing Procedures
All testing are done manually. Due to time limit and practicality, I wasn't able to implement automated unit testing.

### indeed_scraper.js
Testing the job scraper is kinda tricky, this is due to the fact that Indeed.com might rate-limit us at anytime. We can avoid rate limitation by adjusting the delay between each query, but this is all trial-and-error since nothing is and should be documented about how indeed's rate limitation works.

Testing the summary scraping function, with job title Software Developer, and 100 job posting limit:
```bash
$ node indeed_scraper -m summary -j 'Software Developer' --dest 'data/summary/SDE.json' -t 100
```
And examine both the terminal output as well as the output file. The script outputs the current scrape index so in the event of rate-limitation, we can wait a few hours and use the `--start` option to resume scraping with the previous index.

Testing the description scraping function, this dependes on the previously scraped summary:
```bash
$ node indeed_scraper -m description --src 'data/summary/SDE.json' --dest 'data/description/SDE.json'
```
And do the same as we did with the summary function.

### skill_extractor.js
Tested manually by running:
```bash
$ node skill_extractor -s 'data/description' - d 'data/skills_raw'
```
And examine the output csv files. The script should output the same amount of csv files as the provided job descriptions, as well as an addtional `bhattacharyya.csv` file which contains the bhattacharyya coefficient for every pair of job titles.

### visualization
No testing is neccessary - it either produce a graph or doesn't.

## Credits
### Node.js dependencies
- https://www.npmjs.com/package/cheerio
- https://www.npmjs.com/package/request
- https://www.npmjs.com/package/indeed-scraper
- https://www.npmjs.com/package/lowdb
- https://www.npmjs.com/package/valid-url
- https://www.npmjs.com/package/wink-nlp
- https://www.npmjs.com/package/wink-eng-lite-model
- https://www.npmjs.com/package/popular-english-words
- https://www.npmjs.com/package/csv-writer
- https://www.npmjs.com/package/command-line-args
- https://www.npmjs.com/package/command-line-usage
### Visualization
- https://d3js.org/
- https://observablehq.com/@d3/chord-dependency-diagram
- https://observablehq.com/@d3/sankey
- https://observablehq.com/@d3/word-cloud
- https://bulma.io/
- https://github.com/BulmaTemplates/bulma-templates/blob/master/templates/tabs.html
