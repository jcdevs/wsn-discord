import { DataTypes, Model } from "sequelize";
import db from "../sqlite-client";

class AutoforwardSetting extends Model {
  declare serverId: string;
  declare sourceId: string;
  declare destinationId: string;
}

AutoforwardSetting.init({
  serverId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sourceId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  destinationId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
}, { sequelize: db });

AutoforwardSetting.sync();

export default AutoforwardSetting;