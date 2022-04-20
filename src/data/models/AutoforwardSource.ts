import { DataTypes, Model } from "sequelize";
import db from "../sqlite-client";

class AutoforwardSource extends Model {
  declare serverId: string;
  declare sourceId: string;
}

AutoforwardSource.init({
  serverId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sourceId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
}, { sequelize: db });

AutoforwardSource.sync();

export default AutoforwardSource;