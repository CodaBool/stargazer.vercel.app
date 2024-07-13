# Generate Location SQL
1. combine the topojson
2. [convert topojson to csv](https://mygeodata.cloud/converter/topojson-to-csv)
3. `bun i && bun run generateInserts.js`
4. `psql -h host -U user -d postgres -f output.sql`
