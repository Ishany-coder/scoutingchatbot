import { json } from '@sveltejs/kit';
import mysql from 'mysql2/promise';

const dbConfig = {
    port: 16851, // ✅ Add the port
    host: 'mysql-ad51b2f-ftcscout.f.aivencloud.com', // e.g., 'localhost' or cloud DB host
    user: 'avnadmin',
    password: 'AVNS_HT0sFv9Q5KamEIgDxZM',
    database: 'defaultdb'
};

export async function runSQL(sqlQuery) {
    try {

        if (!sqlQuery) {
            return json({ error: "No SQL query provided." }, { status: 400 });
        }

        // ✅ Ensure `sqlQuery` is only the SQL statement
        if (typeof sqlQuery === "string") {
            try {
                // If sqlQuery is accidentally still a JSON string, parse it
                const parsedQuery = JSON.parse(sqlQuery);
                sqlQuery = parsedQuery.query || sqlQuery; // Extract query if inside JSON
            } catch (err) {
                // It's already a string, no need to parse
            }
        }

        console.log("🚀 Executing SQL:", sqlQuery);

        // ✅ Connect to MySQL
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(sqlQuery);
        await connection.end();

        return json({ results: rows });

    } catch (error) {
        console.error("❌ Database Error:", error);
        return json({ error: "Database query failed: " + error.message }, { status: 500 });
    }
}