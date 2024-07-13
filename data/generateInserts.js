const csv = require('csv-parser');
const fs = require('fs');

let index = 1

// remove any previous output.sql file
if (fs.existsSync('output.sql')) {
  console.log("removing previous output.sql file")
  fs.unlinkSync('output.sql')
}

const adminId = "clyeotzuy00007jphvhta603b"
const MAP = "lancer"

function processCSV(row) {
  const data = {
    index: index,
    name: row.name,
    type: row.type || "destroyed",
    coordinates: `${row.X},${row.Y}`,
    faction: row.faction,
  }

  // some names have single quotes, those need to be escaped for SQL by making them '' instead of '
  data.name = data.name.replace(/'/g, "''")

  const insertStatement = `INSERT INTO public."Location" (id, name, "createdAt", description, type, coordinates, faction, source, published, resolved, map, "userId", "thirdParty", alias) VALUES (${data.index}, '${data.name}', '2024-07-13 07:06:36.929', ' ', '${data.type}', '${data.coordinates}', '${data.faction}', ' ', true, true, '${MAP}', '${adminId}', false, NULL);`;
  fs.appendFileSync('output.sql', insertStatement + '\n')
  index++
}

fs.createReadStream('collection1.csv')
  .pipe(csv())
  .on('data', r => processCSV(r))
  .on('end', () => console.log("processed csv"));

fs.createReadStream('collection2.csv')
  .pipe(csv())
  .on('data', r => processCSV(r))
  .on('end', () => console.log("processed csv"));
