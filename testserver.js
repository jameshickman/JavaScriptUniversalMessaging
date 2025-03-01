const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
  console.log(`Test pages available at:`);
  console.log(`  - http://localhost:${port}/_test_core/index.html`);
  console.log(`  - http://localhost:${port}/_test_navigation/index.html`);
});