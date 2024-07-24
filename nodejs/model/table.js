import mongoose from "mongoose";

const { Schema } = mongoose;

const tableSchema = new Schema({
  name: String,
  class: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: "rectangle",
    enum: ["rectangle", "square", "circle", "corner"],
  },
  size: {
    type: String,
    required: true,
    default: "medium",
    enum: ["small", "medium", "large"],
  },
  rotation: {
    type: String,
    required: true,
    default: "0degrees",
  },
  location: {
    type: String,
    enum: ["inside", "garden", "outside"],
    required: true,
  },
  HTMLSpecs: {
    type: Object,
    default: {},
  },
  total: {
    type: Number,
    default: 0,
    required: true,
  },
});

const Table = mongoose.model("Table", tableSchema);

export { Table };
