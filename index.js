const path = require("path");
const fs = require("fs");
const utils = require("./utitilities");

// Consts
const DESCRIPTION_REGEX = /(?<=DESCRIPTION {)[^}]*(?=})/;
const TEST_REGEX = /TEST([\S\s]*?)RESULT/;
const TABLE_REGEX = /(?<=TABLE {)[^}]*(?=})/g;
const RESULT_REGEX = /(?<=RESULT {)[^}]*(?=})/;
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
const fileNames = fs.readdirSync(directoryInputPath)
// Filter task files
let taskFileNames = fileNames.filter((m) => m.endsWith(".task"));
let masterSqlFile = [];
// Loop trough each filenames


taskFileNames.forEach(fileName => {
    // readfile
    const content = fs.readFileSync(path.join(directoryInputPath, fileName), "utf8")

    const taskName = fileName.split(".")[0];
    const description = content.match(DESCRIPTION_REGEX)[0];
    const result = content.match(RESULT_REGEX)[0];
    const test = content.match(TEST_REGEX)[0];


    const markdownContent = utils.converToMarkDown(taskName, description, result);
    let queryMapper = []
    for (const match of test.matchAll(TABLE_REGEX)) {
        queryMapper.push(utils.asQuery(match[0], taskName.replace("-", "_")));
    }
    const createQueryContent = queryMapper.join("\r\n");


    fs.writeFileSync(path.join(directoryOutputPath, `${taskName}.md`), markdownContent);
    fs.writeFileSync(path.join(directoryOutputPath, `${taskName}.sql`), createQueryContent);
    masterSqlFile.push(`-- CREATE: ${taskName} --\r\n${createQueryContent}\r\n`);

})


fs.writeFileSync(path.join(directoryOutputPath, `000_master.sql`), masterSqlFile.join("\r\n"))




