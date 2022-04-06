import db from "./sqlite-client";

export const recordLastActivityTimestamp = (userId: string, serverId: string, epoch: number) => {
  return db.run(`
    INSERT INTO usersLastActivity (userId, serverId, epoch) VALUES (:userId, :serverId, :epoch)
    ON CONFLICT (userId, serverId) DO UPDATE SET userId = excluded.userId, serverId = excluded.serverId, epoch = excluded.epoch
  `,{
    ':userId': userId,
    ':serverId': serverId,
    ':epoch': epoch,
  }, err => {
    if (err) {
      console.error('Failed to upsert usersLastActivity: ', err);
    }
  });
};

export const getActiveUsers = (serverId: string, days: number) => {
  const epoch = Date.now() - days*24*60*60*1000;
  return db.all(`SELECT userId FROM usersLastActivity WHERE epoch > :epoch`, {
    ':epoch': epoch
  }, (err, rows) => {
    if (err) {
      console.error(`Failed to get active users: `, err);
    } else {
      return rows;
    }
  });
};

export const getInactiveUsers = (serverId: string, days: number) => {
  const epoch = Date.now() - days*24*60*60*1000;
  return db.all(`SELECT userId FROM usersLastActivity WHERE epoch < :epoch`, {
    ':epoch': epoch
  }, (err, rows) => {
    if (err) {
      console.error(`Failed to get inactive users: `, err);
    } else {
      return rows;
    }
  });
}