import db from "./sqlite-client";

// map of channel id to deletion interval
const autodeleteIntervals = new Map<string, number>();
// set up autodeletion
db.each(`SELECT channelId, serverId, seconds FROM autodeleteSettings`, async (err, row) => {
  if (err) {
    console.error("Failed to get autodeleteSettings record: ", err);
  } else {
    const { channelId, seconds } = row;
    autodeleteIntervals.set(channelId, seconds);
  }
});

export default autodeleteIntervals;