import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

class User extends Model {
  toSafeJSON() {
    const data = this.toJSON();
    delete data.passwordHash;
    return data;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },

    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("ADMIN", "TEAM_MEMBER"),
      allowNull: false,
      defaultValue: "TEAM_MEMBER",
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "DISABLED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

export default User;
