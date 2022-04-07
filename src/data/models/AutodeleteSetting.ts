import { DataTypes, Model } from "sequelize";
import db from "../sqlite-client";

class AutodeleteSetting extends Model {
  declare channelId: string;
  declare serverId: string;
  declare seconds: number;
}

AutodeleteSetting.init({
  channelId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  serverId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  seconds: {
    type: DataTypes.NUMBER,
    allowNull: false,
  }
}, { sequelize: db });

AutodeleteSetting.sync();

export default AutodeleteSetting;