import db from "./sqlite-client";

// map of source channel id to destination channel id
const autoforwardSettings = new Map<string, string>();
// set up autoforwarding
db.each(`SELECT serverId, sourceId, destinationId FROM autoforwardSettings`, async (err, row) => {
  if (err) {
    console.error("Failed to get autoforwardSettings record: ", err);
  } else {
    const { sourceId, destinationId } = row;
    autoforwardSettings.set(sourceId, destinationId);
  }
});

export default autoforwardSettings;