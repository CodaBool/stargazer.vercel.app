// take the topojson write entire
import topo from "@/app/data"
import { Client } from 'pg'

// get this from the user table
const ADMIN_ID = "clzdlawq2000047bzhlscljeh"
const client = new Client({ connectionString: process.env.DIRECT_URL })
client.connect()

// TODO: rework for non-lancer maps
const MAP_NAME = "lancer"
const insertData = async () => {
  for (const [key, value] of Object.entries(topo)) {
    // Split on first capital letter
    const [first, ...rest] = key.split(/(?=[A-Z])/)
    const [creator, type] = [first, rest.join('')]

    for (const obj of value.objects.collection.geometries) {
      const { properties, coordinates } = obj

      let coord = "complex"
      if (coordinates) {
        coord = coordinates.join(",")
      }

      const query = `
        INSERT INTO "Location" (
          name, description, city, type, coordinates, faction, source, "userId", published,
          capital, crowded, destroyed, resolved, "thirdParty", alias, map
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
      `

      const values = [
        properties.name,
        properties.description || "",
        properties.city || "",
        properties.type,
        coord,
        properties.faction || "",
        properties.source || "",
        ADMIN_ID,
        true, // published
        properties.capital || false,
        properties.crowded || false,
        properties.destroyed || false,
        true, // resolved
        properties.thirdParty || false,
        properties.alias || "",
        MAP_NAME + "-" + creator // map
      ]

      try {
        await client.query(query, values)
        console.log(`Inserted ${properties.name}`);
      } catch (err) {
        console.error(`Error inserting ${properties.name}:`, err);
      }
    }
  }
  await client.end()
}

insertData()
