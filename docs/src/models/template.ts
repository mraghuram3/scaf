import mongoose, { Schema } from "mongoose";

export interface ITemplate extends mongoose.Document {
    name: string;
    version: string;
    description: string;
    language: string;
    tags: string[];
    status: string;
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    _id: {
      type: String,
      required: true,
        unique: true,
    },
    name: {
        type: String,
        required: [true, "Please provide the Template Name"],
        maxlength: [100, "Template Name must be less than 100 characters"],
    },
    version: {
        type: String,
        required: [true, "Version is required"],
        default: "latest",
    },
    description: {
      type: String,
      required: false,
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    updatedBy: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "discarded"],
      default: "draft", required: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
          validator: function (v: string[]) {
              return Array.isArray(v) && v.length > 0;
          },
          message: "Tags array must not be empty",
      },
    },
  },
  {
      timestamps: {
          createdAt: 'created_at', // Use `created_at` to store the created date
          updatedAt: 'updated_at' // and `updated_at` to store the last updated date
      }
  }
);

export const Template =
  mongoose.models.Template || mongoose.model("Template", TemplateSchema);
