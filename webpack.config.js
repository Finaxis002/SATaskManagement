module.exports = {
  resolve: {
    alias: {
      quill: "quill/dist/quill.js", // Correct path for Quill in the browser
    },
  },
  externals: {
    quill: "Quill",  // Treat Quill as an external dependency
  },
};
