const converToMarkDown =
    (name, description, result) => {
        return `\r
# ${name}\r
## Description\r
${description}\r
## Expected result\r
\`\`\`\r${result}\r\`\`\``;
    }


const asQuery = (testContent, tableName = "") => {
    const columnTypes = [];
    const rows = testContent.split("\r\n").map(m => m.trim()).filter(m => m !== "");
    // Set TABLE Name
    tableName = `${tableName}_${rows.shift()}`

    const header = rows.shift().split("|");
    const firstRow = rows[0];
    for (let i = 0; i < firstRow.length; i++) {
        const value = firstRow[i];
        if (isNaN(value)) {
            columnTypes[i] = "VARCHAR";
        } else {
            columnTypes[i] = "INT";
        }
    }

    let columns = [];
    for (let i = 0; i < header.length; i++) {
        columns.push(header[i] + " " + columnTypes[i] + (columnTypes[i] == "VARCHAR" ? "(255)" : ""));
    }

    const queries = [];
    // example: CREATE TABLE Table (col1 TEXT, col2 NUMBER);
    queries.push(`CREATE TABLE ${tableName} (${columns.join(",")});`);
    for (let row of rows) {
        row = row.split("|")
        const valuesWithTypes = [];
        for (let i = 0; i < row.length; i++) {
            // Adds 'value' if TEXT and escapes ' if necessary, otherwise value (assuming number)
            valuesWithTypes.push(columnTypes[i] === "VARCHAR" ? `'${row[i].split("'").join("\\''")}'` : row[i]);
        }
        // example: INSERT INTO Table (col1, col2) VALUES ("value", 0);
        queries.push(`INSERT INTO ${tableName} (${header.join(",")}) VALUES (${valuesWithTypes.join(",")});`);
    }
    return queries.join("\r\n");
}


module.exports = {
    converToMarkDown: converToMarkDown,
    asQuery: asQuery
};