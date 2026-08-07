import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/database.js";

class Document extends Model {}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    leadId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    stageContext: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    documentType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    storageType: {
      type: DataTypes.ENUM(
        "URL",
        "LOCAL"
      ),
      allowNull: false,
    },

    externalUrl:
      DataTypes.STRING(1500),

    filePath:
      DataTypes.STRING(1000),

    originalName:
      DataTypes.STRING(500),

    mimeType:
      DataTypes.STRING(200),

    fileSize:
      DataTypes.INTEGER,

    uploadedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Document",
    tableName: "documents",
    timestamps: true,
    underscored: true,
  }
);

export default Document;
