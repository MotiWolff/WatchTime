import { Client, Query, TablesDB } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const tablesDB = new TablesDB(client);

export const updateSearchCount = async (searchTerm, movie) => {
  console.log("updateSearchCount called with:", { searchTerm, movie });
  console.log("Config:", { PROJECT_ID, DATABASE_ID, TABLE_ID });

  try {
    console.log("Listing rows for searchTerm:", searchTerm);
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.equal("searchTerm", [searchTerm])],
    });

    console.log("List result:", result);

    if (result.rows.length > 0) {
      const row = result.rows[0];
      console.log("Updating existing row:", row);

      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: row.$id,
        data: {
          count: row.count + 1,
        },
      });
      console.log("Row updated successfully");
    } else {
      console.log("Creating new row");
      const rowId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newRow = await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: rowId,
        data: {
          searchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
        },
      });
      console.log("Row created successfully:", newRow);
    }
  } catch (error) {
    console.error("Error in updateSearchCount:", error);
    console.error("Error details:", error.message, error.response);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.limit(10), Query.orderDesc("count")],
    });

    return result.rows;
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};
