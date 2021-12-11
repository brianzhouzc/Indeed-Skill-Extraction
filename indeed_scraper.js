import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

import request from 'request';
import * as cheerio from 'cheerio';
import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'
import validUrl from 'valid-url';
import * as indeed from 'indeed-scraper'
import { exit } from 'process';

const options = commandLineArgs([
  { name: 'help', type: Boolean },
  { name: 'mode', alias: 'm', type: String },
  { name: 'host', alias: 'h', type: String, defaultValue: 'ca.indeed.com' },
  { name: 'job', alias: 'j', type: String },
  { name: 'location', alias: 'l', type: String, defaultValue: 'Canada' },
  { name: 'radius', alias: 'r', type: Number, defaultValue: 25 },
  { name: 'src', type: String },
  { name: 'dest', type: String },
  { name: 'start', alias: 's', type: Number, defaultValue: 0 },
  { name: 'delay', alias: 'd', type: Number, multiple: true, typeLabel: '<ms>', defaultValue: [15000, 30000] },
  { name: 'querylimit', alias: 'q', type: Number, defaultValue: 50 },
  { name: 'totallimit', alias: 't', type: Number, defaultValue: 10000 }
]);

const usage = commandLineUsage([
  {
    header: 'Indeed Scraper',
    content: 'A scraper that scrapes both summary as well as detailed description from Indeed.'
  },
  {
    header: 'Synopsis',
    content: [
      '$ node indeed_scraper {bold -m} {underline summary} <{bold -j} {underline string}> <{bold --dest} {underline string}>',
      '$ node indeed_scraper {bold -m} {underline description} <{bold --src} {underline string}> <{bold --dest} {underline string}>'
    ]
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'help',
        description: 'Display this usage guide.',
        type: Boolean
      },
      {
        name: 'mode',
        description: 'Required. Scraping mode. Either {bold {underline summary}} or {bold {underline description}}',
        alias: 'm',
        type: String
      }
    ]
  },
  {
    header: 'Required arguments',
    optionList: [
      {
        name: 'job',
        description: 'Job title to query Indeed with. ({bold Required for summary mode})',
        alias: 'j',
        type: String
      },
      {
        name: 'src',
        description: 'Source file containing the scraped summary. ({bold Required for description mode})',
        type: String
      },
      {
        name: 'dest',
        description: 'Destination file to put the results in.',
        type: String
      }
    ]
  },
  {
    header: 'Optional arguments',
    optionList: [
      {
        name: 'host',
        description: 'Url to query Indeed with. [default: ca.indeed.com]',
        alias: 'h',
        type: String
      },
      {
        name: 'location',
        description: 'Location of the job posting. [default: Canada]',
        alias: 'l',
        type: String
      },
      {
        name: 'radius',
        description: 'Search radius. [default: 25]',
        alias: 'r',
        type: Number,
        typeLabel: '{underline km}'
      },
      {
        name: 'start',
        description: 'The start index of the search. [default: 0]',
        alias: 's',
        type: Number
      },
      {
        name: 'delay',
        description: 'The delay between each query. Use one number to set a fix delay or two numbers [min, max] to get a random delay in that range. [default: [15000,30000]]',
        alias: 'd',
        multiple: true,
        type: Number,
        typeLabel: '{underline ms} ...'
      },
      {
        name: 'querylimit',
        description: 'The maximum amount to scrape per query. [default: 50]',
        alias: 'q',
        type: Number
      },
      {
        name: 'totallimit',
        description: 'The total amount of postings to scrape. [default: 10000]',
        alias: 't',
        type: Number
      }
    ]
  }
]);

const __dirname = dirname(fileURLToPath(import.meta.url));

if (options.help) {
  console.log(usage);
} else {
  if (!options.mode && !options.job && !options.dest && !options.src) {
    console.log(usage);
    exit(0);
  } else if (!options.mode) {
    console.log('Missing --mode. Use --help to display usage guide.')
    exit(0);
  } else if (!options.job && options.mode == 'summary') {
    console.log('Missing --job. Use --help to display usage guide.')
    exit(0);
  } else if (!options.dest) {
    console.log('Missing --dest. Use --help to display usage guide.')
    exit(0);
  } else if (!options.src && options.mode == 'description') {
    console.log('Missing --src. Use --help to display usage guide.')
    exit(0);
  }

  if (options.mode == 'summary') {
    var summary_file = join(__dirname, options.dest);
    var summary_adapter = new JSONFile(summary_file);
    var summary_db = new Low(summary_adapter);
    await summary_db.read();
    summary_db.data ||= { postings: [] };

    var queryOptions = {
      host: options.host,
      query: options.job,
      city: options.location,
      radius: options.radius,
      sort: 'date',
      limit: options.querylimit,
      start: options.start
    };

    scrape_summary(queryOptions, summary_db);
  } else if (options.mode == 'description') {
    var summary_file = join(__dirname, options.src);
    var summary_adapter = new JSONFile(summary_file);
    var summary_db = new Low(summary_adapter);
    await summary_db.read();
    summary_db.data ||= { postings: [] };

    var description_file = join(__dirname, options.dest);
    var description_adapter = new JSONFile(description_file);
    var description_db = new Low(description_adapter);
    await description_db.read();
    description_db.data ||= { postings: [] };

    scrape_description(summary_db, description_db);
  } else {
    console.log('Invalid mode. Use --help to display usage guide.');
    exit(0);
  }
}

function scrape_summary(queryOptions, db) {
  var num_results = 0;
  function query_summary(queryOptions, db) {
    console.log("Querying... Start=" + queryOptions.start)
    indeed.query(queryOptions).then(res => {
      num_results += res.length;

      console.log("├ Done, result_len=" + res.length + ", total_len=" + num_results);
      res.forEach(post => {
        db.data.postings.push(post);
      })
      db.write();
      console.log("├ Done writing to DB");

      if (res.length > 0 && num_results < options.totallimit) {
        var delay = options.delay.length > 1 ? Math.floor(Math.random() * (options.delay[1] - options.delay[0]) + options.delay[0]) : options.delay[0];
        console.log("└ Waiting " + delay + " ms...");

        queryOptions.start += res.length;
        setTimeout(function () {
          query_summary(queryOptions, db);
        }, delay)
      } else {
        console.log("Done querying.");
        console.log("├ Total postings = " + num_results)
        console.log("└ Last query start = " + queryOptions.start);
        remove_duplicates(db);
      }
    });
  }

  function remove_duplicates(db) {
    var total_duplicate = 0;
    var dupe_indexes = [];
    for (var i = 0; i < db.data.postings.length - 2; i++) {
      var dupe = false;
      var post_1 = db.data.postings[i];
      for (var j = i + 1; j < db.data.postings.length - 1; j++) {
        var post_2 = db.data.postings[j];
        if (post_1.summary == post_2.summary) {
          dupe = true;
          break;
        }
      }
      if (dupe) {
        dupe_indexes.push(i);
        total_duplicate++;
      }
    }

    for (var i = dupe_indexes.length - 1; i >= 0; i--) {
      db.data.postings.splice(dupe_indexes[i], 1);
    }
    db.write();
    console.log('Removed ' + total_duplicate + ' duplicates. Total postings: ' + db.data.postings.length);
  }

  query_summary(queryOptions, db);
}

function scrape_description(src_db, dest_db) {
  var total_entires = src_db.data.postings.length;
  var current_idx = options.start;
  function query_description(src_db, dest_db) {
    if (current_idx < total_entires) {
      var url = src_db.data.postings[current_idx].url;
      console.log('Querying idx: ' + current_idx + ", url: " + url);
      current_idx++;
      query(url).then(description => {
        if (description) {
          console.log('├ Done, result_len: ' + description.description.length);

          dest_db.data.postings.push(description);
          dest_db.write();
          console.log("├ Done writing to DB");
        } else {
          console.log('├ Done, empty response.');
          console.log("├ Either it's invalid url, or something else went wrong.");
        }

        if (!url.includes('undefined'))
          var delay = options.delay.length > 1 ? Math.floor(Math.random() * (options.delay[1] - options.delay[0]) + options.delay[0]) : options.delay[0];
        else
          var delay = 0;
        console.log("└ Waiting " + delay + " ms...");

        setTimeout(function () {
          query_description(src_db, dest_db);
        }, delay)
      });
    } else {
      console.log("Done querying.");
      console.log("└ Total postings = " + total_entires);
    }
  }

  function query(query_url) {
    return new Promise((resolve, reject) => {
      if (validUrl.isWebUri(query_url) && !query_url.includes('undefined')) {
        request(query_url, (error, response, body) => {
          const $ = cheerio.load(body);
          var description = $('#jobDescriptionText').text().trim();
          resolve({
            query_url: query_url,
            description: description
          });
        });
      } else {
        resolve();
      }
    });
  }

  query_description(src_db, dest_db);
}
