import { DataTypes, Model } from "sequelize";
import db from "../sqlite-client";

class UsersLastActivity extends Model {
	declare userId: string;
  declare serverId: string;
  declare epoch: number;
}

UsersLastActivity.init({
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  serverId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  epoch: {
    type: DataTypes.NUMBER,
    allowNull: false,
  }
}, {
  sequelize: db,
  freezeTableName: true
});

UsersLastActivity.sync();

export default UsersLastActivity;