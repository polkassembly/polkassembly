const fs = require('fs');

const loadEnvVars = () => {
  try {
    // Read the contents of the JSON file
    const jsonData = fs.readFileSync('./Test Folder/polkassembly/cred.json', 'utf8');
    // Parse the JSON data
    const { username, password } = JSON.parse(jsonData).env;
    return { username, password };
  } catch (err) {
    console.error('Error loading environment variables:', err.message);
    return {};
  }
};

module.exports = loadEnvVars;
