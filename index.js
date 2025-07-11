const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

app.get("/api/profile-pic", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "Missing username" });

  try {
    const response = await axios.get("https://instagram-scraper-stable-api.p.rapidapi.com/search.php", {
      params: { q: username },
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "instagram-scraper-stable-api.p.rapidapi.com"
      }
    });

    const result = response.data[0];
    if (!result || !result.profile_pic_url_hd) {
      return res.status(404).json({ error: "Profile picture not found" });
    }

    return res.json({ profilePic: result.profile_pic_url_hd });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Failed to fetch profile pic" });
  }
});

app.listen(port, () => {
  console.log(`✅ API running on port ${port}`);
});
