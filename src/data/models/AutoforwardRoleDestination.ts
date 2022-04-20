import { DataTypes, Model } from "sequelize";
import db from "../sqlite-client";

class AutoforwardRoleDestination extends Model {
  declare serverId: string;
  declare roleId: string;
  declare channelId: string;
}

AutoforwardRoleDestination.init({
  serverId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  channelId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
}, { sequelize: db });

AutoforwardRoleDestination.sync();

export default AutoforwardRoleDestination;