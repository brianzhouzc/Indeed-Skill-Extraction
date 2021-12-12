const summary_db_file = 'data/summary_Pharmacist.json'
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'
import fs from 'fs';
import { exit } from 'process';

const options = commandLineArgs([
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'mode', alias: 'm', type: String },
    { name: 'source', alias: 's', type: String }
])

const usage = commandLineUsage([
    {
        header: 'Helper',
        content: 'Small helper to calculate number of postings in a file, as well as removing duplicates.'
    },
    {
        header: 'Synopsis',
        content: [
            '$ node helper {bold -m} {underline stats} <{bold -s} {underline string}>',
            '$ node helper {bold --mode} {underline clean} <{bold --src} {underline string}>'
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
                description: 'Required. Either stats (display information of the file) or clean (remove duplicates from the file)',
                alias: 'm',
                type: String
            },
            {
                name: 'source',
                description: 'Required. Path to the json file',
                alias: 's',
                type: String
            }
        ]
    }
])


if (options.help) {
    console.log(usage);
} else {
    if (!options.mode && !options.source) {
        console.log(usage);
        exit(0);
    }

    if (!options.mode) {
        console.log('Missing mode.')
        exit(0);
    } else if (!options.source) {
        console.log('Missing source.')
        exit(0);
    }

    if (options.mode != 'stats' && options.mode != 'clean') {
        console.log('Invalid mode.')
        exit(0);
    }

    const __dirname = dirname(fileURLToPath(import.meta.url));

    if (fs.existsSync(join(__dirname, options.source)) && fs.lstatSync(join(__dirname, options.source)).isDirectory()) {
        var total = 0;
        var total_dupe = 0;
        for (var file of fs.readdirSync(options.source)) {
            var summary_file = join(__dirname, options.source, file);
            var summary_adapter = new JSONFile(summary_file)
            var summary_db = new Low(summary_adapter)
            await summary_db.read();
            console.log('Processing', file);
            var r = process(summary_db);
            total += r[0];
            total_dupe += r[1];
        }
        console.log('Total scraped posting: ' + total + ". Total dupe postings: " + total_dupe);
    } else if (fs.existsSync(join(__dirname, options.source)) && fs.lstatSync(join(__dirname, options.source)).isFile()) {
        var summary_file = join(__dirname, options.source);
        var summary_adapter = new JSONFile(summary_file)
        var summary_db = new Low(summary_adapter)
        await summary_db.read();
        console.log('Processing' + options.source);
        process(summary_db);
    } else {
        console.log('Invalid source path. Neither a directory or a file.')
    }

    function process(summary_db) {
        var dupe_indexes = [];
        for (var i = 0; i < summary_db.data.postings.length - 1; i++) {
            var dupe = false;
            for (var j = i + 1; j < summary_db.data.postings.length; j++) {
                if (summary_db.data.postings[i].hasOwnProperty('description')) {
                    if (summary_db.data.postings[i].description == summary_db.data.postings[j].description) {
                        dupe = true;
                        break;
                    }
                } else if (summary_db.data.postings[i].hasOwnProperty('summary')) {
                    if (summary_db.data.postings[i].summary == summary_db.data.postings[j].summary) {
                        dupe = true;
                        break;
                    }
                } else {
                    console.log('Invalid file.');
                    exit(0);
                }
            }
            if (dupe) dupe_indexes.push(i);
        }
        for (var i = dupe_indexes.length - 1; i >= 0; i--) {
            summary_db.data.postings.splice(dupe_indexes[i], 1);
        }
        if (options.mode == 'clean') {
            summary_db.write();
            console.log("└ Removed", dupe_indexes.length, "duplicates. Remaining postings:", summary_db.data.postings.length);
        } else {
            console.log("└ Total posts: " + (dupe_indexes.length + summary_db.data.postings.length) + ". Duplicates: " + dupe_indexes.length)
        }

        return [dupe_indexes.length + summary_db.data.postings.length, dupe_indexes.length];
    }
}
