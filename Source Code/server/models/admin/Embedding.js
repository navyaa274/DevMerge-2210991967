const mongoose = require('mongoose');

const EmbeddingSchema = new mongoose.Schema({
    sourceType: {
        type: String,
        enum: ["Syllabus", "CourseMaterial", "Course", "Submission"],
        required: true
    },
    sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number], // vector array
        required: true
    },
    metadata: {
        chunkIndex: Number,
        title: String,
        tokens: Number
    }
}, { timestamps: true });

module.exports = mongoose.model("Embedding", EmbeddingSchema);

// Note: The atlas vector search index must be created via MongoDB shell/UI:
// {
//   "fields": [
//     {
//       "type": "vector",
//       "path": "embedding",
//       "numDimensions": 768,
//       "similarity": "cosine"
//     }
//   ]
// }

// End of model definition
