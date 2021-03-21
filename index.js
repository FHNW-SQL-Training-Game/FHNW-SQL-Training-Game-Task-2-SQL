const path = require("path");
const fs = require("fs");
const utils = require("./utitilities");

// Consts
const DESCRIPTION_REGEX = /(?<=DESCRIPTION {)[^}]*(?=})/;
const TABLE_REGEX = /(?<=TABLE {)[^}]*(?=})/;
const RESULT_REGEX = /(?<=TABLE {)[^}]*(?=})/;
const INPUT_ARG = 2;
const OUTPUT_ARG = 3;

// ARGS
const inputPath = process.argv[INPUT_ARG];
const outputPath = process.argv[OUTPUT_ARG];

// ARGS check
if (!inputPath || !outputPath) {
    console.error("⚠️\t Missing args, see README.md!");
    return;
}

// Folders
const directoryInputPath = path.join(__dirname, inputPath);
const directoryOutputPath = path.join(__dirname, outputPath);


// Ensure output dir exists
if (!fs.existsSync(directoryOutputPath)) fs.mkdirSync(directoryOutputPath);

// Read Input dir
fs.readdir(directoryInputPath, function (err, fileNames) {
    if (err) return console.log("Unable to scan directory: " + err);
    // Filter task files
    const taskFileNames = fileNames.filter((m) => m.endsWith(".task"));
    // Loop trough each filenames
    taskFileNames.forEach(function (fileName) {
        // readfile
        fs.readFile(path.join(directoryInputPath, fileName), "utf8", function (err, content) {

            const taskName = fileName.split(".")[0];
            const description = content.match(DESCRIPTION_REGEX)[0];
            const result = content.match(RESULT_REGEX)[0];
            const table = content.match(TABLE_REGEX)[0];

            const markdownContent = utils.converToMarkDown(taskName, description, result);
            const createQueryContent = utils.asQuery(table);

            fs.writeFileSync(path.join(directoryOutputPath, `${taskName}.md`), markdownContent);
            fs.writeFileSync(path.join(directoryOutputPath, `${taskName}.sql`), createQueryContent);
        });
    });
});



