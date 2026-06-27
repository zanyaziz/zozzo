const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files at /zozzo
app.use('/zozzo', express.static(path.join(__dirname)));

// root to redirect to the app
app.get('/', (req, res) => {
  res.redirect('/zozzo/index.html');
});

app.listen(PORT, () => {
  console.log(`Zozzo server running at http://localhost:${PORT}/zozzo`);
});
