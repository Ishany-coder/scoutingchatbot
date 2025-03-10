import { json } from '@sveltejs/kit';
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
    apiKey: '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'});

// ✅ Define a Zod schema for the structured SQL response
const SQLResponseSchema = z.object({
    query: z.string() // The generated SQL query
});

function extractSQLQuery(response) {
    try {
        const parsedResponse = JSON.parse(response);
        return parsedResponse.query.trim(); // ✅ Extract only the SQL query
    } catch (error) {
        console.error("❌ Error parsing SQL response:", error);
        return null;
    }
}

function combineMessages(messages) {
    // Extract the content from each message and join them with newlines
    const combinedPrompt = messages
        .map(message => `${message.role}: ${message.content}`)
        .join('\n\n');
    
    return combinedPrompt;
}


export async function generateSQL(messages) {
    try {
        console.log('HERE');
        console.log(messages);
    
        const combinedMessages = combineMessages(messages);


        // ✅ Use correct OpenAI API call syntax
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an expert MySQL query generator. Always return a structured JSON response with only the SQL query." },
                { 
                    role: "user", 
                    content: `I have three MySQL tables named scouting_match_data and team_opr_stats and team_names that stores match scouting data and overall average scores and the names for each ftc team given their number
                    for FTC teams. Below are the table schemas:

                    CREATE TABLE scouting_match_data (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        team_number INT,
                        match_id INT,
                        event_name VARCHAR(255),
                        match_type VARCHAR(50),
                        match_number INT,
                        alliance VARCHAR(10),
                        high_basket INT,
                        low_basket INT,
                        high_chamber INT,
                        low_chamber INT,
                        auto_score INT,
                        teleop_score INT,
                        total_points INT,
                        penalties INT
                    );

                    CREATE TABLE "team_opr_stats" (
                        team_number int NOT NULL,
                        total_points decimal(5,2) DEFAULT NULL,
                        auto_points decimal(5,2) DEFAULT NULL,
                        driver_controlled_points decimal(5,2) DEFAULT NULL,
                        endgame_points decimal(5,2) DEFAULT NULL,
                        PRIMARY KEY ("team_number")
                        );

                    CREATE TABLE "team_names" (
                        "team_number" int NOT NULL,
                        "team_name" varchar(255) DEFAULT NULL,
                        PRIMARY KEY ("team_number")
                    );


                    The table team_opr_stats contains overall average scores for the teams. Each team_number has only one row in the table and it is the primary key. Use this table to answer questions like
                    which team has the highest scores or which team is the best team.

                    The table scouting_match_data contains data for individual matches that a team has played. Each team_number can have multiple rows in this table for every match they have played. Use this table
                    to answer questions on individual matches or for questions related to baskets, chambers, teleop etc.

                    The team_names table contains all of the team names corresponding to their number, you should join the team_names table with whatever other database you choose to use, this will
                    make it so it returns the team name rather than the team number.

                    **Generate an optimized MySQL query** that answers the following request:
                    "${combinedMessages}"

                    **Only return JSON** in this format:
                    {
                        "query": "<Generated SQL Query>"
                    }
                    `
                }
            ],
            response_format: zodResponseFormat(SQLResponseSchema, "sql_query") // ✅ Enforce JSON format using Zod
        });

        console.log("✅ OpenAI response received:", JSON.stringify(completion, null, 2));

        // ✅ Extract the structured SQL query from the response
        const sqlQuery = completion.choices?.[0]?.message.content

        if (!sqlQuery) {
            console.error("❌ OpenAI response did not contain a valid SQL query.");
            return json({ error: "Failed to generate a valid SQL query." }, { status: 500 });
        }

        const newSqlQuery = extractSQLQuery(sqlQuery);
        console.log("✅ Generated SQL query:", sqlQuery);
        console.log("✅ Extracted SQL query:", newSqlQuery);

        return json({ newSqlQuery });

    } catch (error) {
        console.error("❌ OpenAI Error:", error);
        return json({ error: "OpenAI request failed: " + (error.message || "Unknown error") }, { status: 500 });
    }
}