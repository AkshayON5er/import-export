const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//api-1
app.get("/players/", async (request, response) => {
  const getAllPlayers = `
        SELECT
         *
        FROM
            player_details;`;
  const AllPlayers = await db.all(getAllPlayers);
  response.send(AllPlayers);
});

//api-2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getAllPlayers = `
        SELECT
         *
        FROM
            player_details
        WHERE
            player_id = ${playerId};`;
  const AllPlayers = await db.get(getAllPlayers);
  response.send(AllPlayers);
});

app.put("/players/:playerId/"), async (request, response) => {
  const { playerId } = request.params;
  const {playerName} = request.body
  const updatePlayerQuery = `
  UPDATE
    player_details
  SET
    player_name = '${playerName}',
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//api-4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatches = `
        SELECT
         *
        FROM
            match_details
        WHERE
            match_id = ${matchId};`;
  const match = await db.get(getMatches);
  response.send(match);
});

//api-5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
        SELECT
         *
        FROM
            player_match_score NATURAL JOIN match_details
        WHERE
            player_id = ${playerId};`;
  const playerMatches = await db.get(getPlayerMatchesQuery);
  response.send(playerMatches);
});

//api-6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
	    SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`;
  const playerMatches = await db.get(getMatchPlayersQuery);
  response.send(playerMatches);
});

//api-7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const playerMatches = await db.get(getPlayerScored);
  response.send(playerMatches);
});
