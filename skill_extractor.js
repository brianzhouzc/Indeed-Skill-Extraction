import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

import winkNLP from 'wink-nlp';
import its from 'wink-nlp/src/its.js';
import as from 'wink-nlp/src/as.js';
import model from 'wink-eng-lite-model';

import { words } from 'popular-english-words'
import * as csv from 'csv-writer';

import fs from 'fs';
import { exit } from 'process';

const options = commandLineArgs([
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'source', alias: 's', type: String },
    { name: 'destination', alias: 'd', type: String },
    { name: 'threshold', alias: 't', type: Number, defaultValue: 6 }
]);

const usage = commandLineUsage([
    {
        header: 'Skill Extractor',
        content: 'Extract skills from Indeed postings'
    },
    {
        header: 'Synopsis',
        content: [
            '$ node skill_extractor {bold --source} {underline /path/to/dir/} {bold --destination} {underline /path/to/dir/}',
            '$ node skill_extractor {bold -s} {underline /path/to/dir/} {bold -d} {underline /path/to/dir/}'
        ]
    },
    {
        header: 'Arguments',
        optionList: [
            {
                name: 'help',
                description: 'Display this usage guide.',
                alias: 'h',
                type: Boolean
            },
            {
                name: 'source',
                description: 'Source directory containing all Indeed posting descriptions.',
                alias: 's',
                type: String
            },
            {
                name: 'destination',
                description: 'Destination directory to put all results in.',
                alias: 'd',
                type: String
            },
            {
                name: 'threshold',
                description: 'Default: 6. Threshold to what will be consider as a skill. Any terms with frequency < threshold will be discarded.',
                alias: 't',
                type: Number
            }
        ]
    }
]);

const __dirname = dirname(fileURLToPath(import.meta.url));
const winknlp = winkNLP(model);
const custom_stopwords = fs.readFileSync(join(__dirname, 'stopwords.txt')).toString().split("\n").map(
    function (item) {
        return item.trim();
    }
);


if (options.help || (!options.source && !options.description)) {
    console.log(usage);
} else {
    if (!options.source || !(fs.existsSync(join(__dirname, options.source)) && fs.lstatSync(join(__dirname, options.source)).isDirectory())) {
        console.log('Invalid source directory.');
        exit(0);
    }

    if (!options.destination || !(fs.existsSync(join(__dirname, options.destination)) && fs.lstatSync(join(__dirname, options.destination)).isDirectory())) {
        console.log('Invalid destination directory.');
        exit(0);
    }

    var frequency_arr = [];
    var frequency_arr_name = []
    for (var file of fs.readdirSync(options.source)) {
        var db_file = join(__dirname, options.source, file);
        var db_adapter = new JSONFile(db_file);
        var db = new Low(db_adapter);
        await db.read();
        db.data ||= { postings: [] };

        console.log('Processing', file, '...');
        var freq = new Map();
        for (var i = 0; i < db.data.postings.length; i++) {
            let description = db.data.postings[i].description;
            description = description.toLowerCase();
            description = description.replace(/(?:\r\n|\r|\n)/g, '.');
            description = description.replace(/\s+/g, ' ');
            description = description.replace(/\.+/g, '.');

            var winkdoc = winknlp.readDoc(description);

            var sentences = winkdoc.sentences().out(its.array);

            sentences.forEach(sentence => {
                var sentencedoc = winknlp.readDoc(sentence);

                //Extract nouns vis POS. Also lemmatize the noun.
                var nouns = sentencedoc.tokens().filter(
                    (t) => t.out(its.pos) === 'NOUN' && !t.out(its.stopWordFlag) && !custom_stopwords.includes(t.out(its.lemma))
                        && (words.getWordRank(t.out(its.lemma)) > 10000 || words.getWordRank(t.out(its.lemma)) < 0)
                ).out(its.lemma, as.array);

                //Extract bigrams.
                var bigrams = sentencedoc.tokens().filter(
                    (t) => t.out(its.type) === 'word' && !t.out(its.stopWordFlag)
                ).out(its.normal, as.bigrams);

                bigrams.forEach(bigram => {
                    bigram = bigram.join(' ');
                    if (!custom_stopwords.includes(bigram))
                        freq.get(bigram) ? freq.set(bigram, freq.get(bigram) + 1) : freq.set(bigram, 1);
                });

                nouns.forEach(noun => {
                    freq.get(noun) ? freq.set(noun, freq.get(noun) + 1) : freq.set(noun, 1);
                });
            });
        }
        var sorted_skills = new Map([...freq].sort(
            (a, b) => {
                return b[1] - a[1];
            })
        );


        var entires = sorted_skills.entries();
        var csv_arr = [];
        var name = file.split(".")[0];
        var temp = {};
        for (var i = 0; i < sorted_skills.size; i++) {
            var entry = entires.next();
            var normalized = Math.floor((entry.value[1] / db.data.postings.length) * 100);
            if (normalized < options.threshold)
                break;
            csv_arr.push([entry.value[0], name, entry.value[1], normalized]);
            temp[entry.value[0]] = normalized;
        }
        frequency_arr.push(temp);
        frequency_arr_name.push(name);

        var csv_writer = csv.createArrayCsvWriter(
            {
                path: join(__dirname, options.destination, name + '.csv'),
                header: ['term', 'job', 'frequency', 'normalized']
            }
        )
        csv_writer.writeRecords(csv_arr);
        console.log("└ Done, data written to:", join(__dirname, options.destination, name + '.csv'));
    }

    console.log('Calculating Bhattacharyya coefficient...');
    var csv_arr = [];
    for (var i = 0; i < frequency_arr.length - 1; i++) {
        for (var j = i + 1; j < frequency_arr.length; j++) {
            var big, small;
            if (frequency_arr[i].length > frequency_arr[j].length) {
                big = frequency_arr[i];
                small = frequency_arr[j];
            } else {
                big = frequency_arr[j];
                small = frequency_arr[i];
            }

            var total = 0;
            for (var key of Object.keys(big)) {
                if (small.hasOwnProperty(key))
                    total += Math.sqrt(big[key] * small[key]);
            }
            csv_arr.push([frequency_arr_name[i], frequency_arr_name[j], total]);
        }
    }
    var csv_writer = csv.createArrayCsvWriter(
        {
            path: join(__dirname, options.destination, 'bhattacharyya.csv'),
            header: ['job_1', 'job_2', 'bhattacharyya_coefficient']
        }
    )
    csv_writer.writeRecords(csv_arr);
    console.log("└ Done, data written to:", join(__dirname, options.destination, 'bhattacharyya_coefficient.csv'));
}