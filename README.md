# Indeed-Skill-Extraction
<p align="center">My final project for the COSC 329 Learning Analytics course. Written in Node.js and D3.js.</p>
<p align="center">Features include Indeed.com scraping, skill extraction, as well as data visualization</p>
<p align="center"><a href="https://brianzhouzc.github.io/visualization/">Link to Data Visualization</a></p>
<p align="center">
    <img src="https://github.com/brianzhouzc/Indeed-Skill-Extraction/blob/main/img/chord.png" alt="Chord Chart" width="600"/>
</p>

## Features
- Scrape and extract job postings from Indeed.com
- Identify and extract job skills from job postings
- Visualize the data in logical and pleasing way


## NLP functions & Skill Extraction Algorithm
The NLP library I decided to use is [winkJS](https://winkjs.org/). The functions I used to pre-process the texts are:

- Part-of-Speach tagging
- Lemmatization
- Sentence Spliting
- Stop Words
- Unigrams and Bigrams

To identify the skills, I first converted the job postings to lower case and remove all line breaks. The posting is then split into sentences using winJS `sentences()` function. Then, each sentences are processed seperately and split into unigrams and bigrams.

The purpose of unigrams is to capture technical phrases that are only used in a professional setting. All stop words and non-noun words are removed. Additionally, all words that ranked higher than 10,000 in the common english word list are removed. This will hopefully filter out all common english words and left us with words that we aren't likely to use in daily life. Finally, the unigrams are lemmatized to remove variation in word forms.

For bigrams, the purpose is to capture short phrases that are likely used to describe a skill such as 'problem solving', 'microsft office' and more. To achieve this, all non-enlighs words as well as stop words are removed. The phrase is then normalized (remove extra spacing etc), but not lemmatized to give more context to the phrase.

All unigrams and bigrams are then stored in a frequency table. Once all postings are processed, the algorithm normalizes the frequency as a ratio to the amount of posting processed. The ratio is then multiplied by 100 and floored to give us an integer instead of a fraction. Finally, any unigram/bigram with a normalized ratio lower than a set threshold is removed.

Finally, all remaining unigrams and bigrams are written to a csv file along with it's frequency and normalized ratio.


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


## Usage
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


## Pipeline
The general pipeline of this project is shown below:

```Scrape Summary => Scrape Description => Extract Skills => Manual Processing => Visualization```

Each step depends on the data generated by the previous steps.

I will walk through the entire pipeline with the job title `Software Developer` and `Data Scientist`.

### Step 1: Scraping Summary
First we will have to scrape the summary. This is to optain the posting url for scraping description later. We start by:
```
$ node indeed_scraper --mode summary --job 'Software Developer' --dest 'summary/SDE.json' --total 100
```
This will scrape 100 job postings with the job title `Software Developer` and put the result in the file `summary/SDE.json`

Repeat the same with `Data Scientist`:
```
$ node indeed_scraper --mode summary --job 'Data Scientist' --dest 'summary/DS.json' --total 100
```

### Step 2: Scraping Description
Next, once we have scraped the summary and obtained the results, we can start scraping the detailed description of the job posting. To do this, run:
```
$ node indeed_scraper --mode description --src 'summary/SDE.json' --dest 'description/SDE.json'
```
This will read the job url from `summary/SDE.json` and scrape the job description. The results are then write to `description/SDE.json`

Repeat the same with `Data Scientist`:
```
$ node indeed_scraper --mode description --src 'summary/DS.json' --dest 'description/DS.json'
```

### Step 3: Extracting Skills
Once we have the description, we can extract the skills and calculate the bhattacharyya coefficient. Run:
```
$ node skill_extractor --source 'description' --destination 'skills_raw'
```
This will read every file in the directory `description` and extract the skills from it, then write the result into the directory `skills_raw` with the same filename. In this case, `SDE.csv` and `DS.csv` will be generated. A file call `bhattacharyya.csv` will also be generated which contains te bhattacharyya coefficient of every pair of job titles.

### Step 4: Manual Processing
Once the skills has been extracted, we need to manually process the result to remove irrelavent skill terms. We do this by opening the csv files generated in the previous step with Excel or a text editor and remove terms we find that doesn't make sense. Since there's likely to be hundreds or even thousands of terms extracted, it's unreleastic to go over them all. What I normally do is make sure the top 20 skills contains no terms that doesn't make sense (i.e delete any terms that doesn't make sense until the the top 20 terms is valid skills). Repeat for every csv file. It normally takes ~1 minute for me to process each file.

### Step 5: Visualization
Visualization is a very complicated process. It will require changing code and modifying data manually! If you plan to do this step yourself, be warn that there might be a lot of fiddling before you are able to get it working.

Alternatively, just visit https://brianzhouzc.github.io/visualization/ and view the graphs directly :)

I'll split the Visualization into two parts, the word clouds, and the relationship diagrams.

#### Word Clouds
Word clouds are a lot easier to work with comparing to the relationship diagrams. To start, visit https://observablehq.com/@brianzhouzc/wordcloud. This notebook contains all the D3.js code required for generating the wordcloud.

Once on the page, navigate to the section that asks you to choose an csv file. Click on the button and select one of the csv file we manually cleaned in the previous step.

Voilà, enjoy your new beautiful word cloud!

#### Relationship Diagrams
Relationship diagrams are way more involved. I will go over the Sankey diagram here. The Chord diagram requires extensive modifying so I won't get into it here.

First, we have to create a new csv file. This csv file will contain the top 20 skills of all the job titles. Let's name it `top_20.csv`

The header of `top_20.csv` should be:
```csv
source,target,frequency,value
```

Next, use a text editor to open the csv files you manually cleaned in the previous step. Copy the top 20 entires and past them into `top_20.csv`. Be careful not to copy the headers!

Once that is done, visit https://observablehq.com/@brianzhouzc/sankey. Similar to be for, navigate to the section that prompts you to select an csv file. Click the button and select the `top_20.csv` we just created.

Voilà, enjoy your new sankey diagram!

If you feel like experimenting, here's the link to the Chord Diagram notebook: https://observablehq.com/@brianzhouzc/jobskills_chord


## Orginal Project Plan and Timeline
- Week 9: Setup github repo and research on available libraries and languages
- Week 10: Develop code for scraping info off indeed.ca (midterm break)
- Week 11: Continue working on code that scrapes info from indeed.ca and maybe other sites as well. Also start working on processing the scraped data.
- Week 12: Work on documentation and continue to work on the code.
- Week 13: Finish the majority of the functions and make a presentation video
- Week 14: Finish all remaining tasks (bug fixes and unfinished features) and submit all deliverables.


## File Structure
```graphql
/root/
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


## Bugs and Know Issues
### < 10,000 Job posting data
Despite scraping over `15,000` posting (very likely way more than this) and over 7 job titles, I'm only able to get `5,135` useful job postings. This is due to Indeed limiting ~1,000 postings per job title via the search tool, as well the fact that a huge amount of job postings have duplicated content dispite having a different and unique url.

This can be verified using my helper tool:
```
>$ node helper -m stats -s 'data/summary'

Processing summary_Clerk.json
└ Total posts: 929. Duplicates: 1
Processing summary_CustomerSupport.json
└ Total posts: 1102. Duplicates: 1
Processing summary_DS.json
└ Total posts: 991. Duplicates: 413
Processing summary_EE.json
└ Total posts: 1838. Duplicates: 1191
Processing summary_Finance.json
└ Total posts: 932. Duplicates: 0
Processing summary_PM.json
└ Total posts: 1922. Duplicates: 1186
Processing summary_Pharmacist.json
└ Total posts: 239. Duplicates: 0
Processing summary_SDE.json
└ Total posts: 6885. Duplicates: 5887
Total scraped posting: 14838. Total dupe postings: 8679
```
As you can see, I scraped 14838 posting in total (a lot of the job titles have low amount of duplicate because I implemented code to remove duplicates later on), but over 8,000 postings are duplicates. 

I ended up with a total of 5,135 useful job postings:
```
>$ node helper -m stats -s 'data/description'

Processing Clerk.json
└ Total posts: 766. Duplicates: 0
Processing CustomerSupport.json
└ Total posts: 896. Duplicates: 0
Processing DS.json
└ Total posts: 602. Duplicates: 0
Processing EE.json
└ Total posts: 671. Duplicates: 0
Processing Finance.json
└ Total posts: 549. Duplicates: 0
Processing PM.json
└ Total posts: 744. Duplicates: 0
Processing SDE.json
└ Total posts: 907. Duplicates: 0
Total scraped posting: 5135. Total dupe postings: 0
```
The only way I might be able to get more job posting and reach the 10,000 posting goal is to scrape ~6 more job titles.

### Indeed.com rate limitation and invalid urls
Indeed.com rate limits my scraper after a certain amount of requests are made in a short period of time. This can be avoided by using long enough delay between each request, but this is all trial-and-error and inevitably Indeed.com will stop responding to your requests. When this happened, the script simply exsits. The last queried index is printed to the terminal so the script can then be manually restarted later without loosing progress.

In rare cases, when scraping the description, we will encounter an invalid URL. The script have the ability to handle most cases in which it will simply skip scraping said job posting. But sometimes the script might mistaken an invalid url as a valid one and try to make request to it. When this happens, the script will throw an error and exit. 


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
