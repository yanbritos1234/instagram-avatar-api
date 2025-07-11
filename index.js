require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8080;

app.get("/api/profile-pic", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "Missing username" });

  try {
    const response = await axios.get("https://instagram-scraper-stable-api.p.rapidapi.com/search_user.php", {
      params: { username },
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "instagram-scraper-stable-api.p.rapidapi.com",
      },
    });

    const imageUrl = response.data.profile_pic_url_hd || response.data.profile_pic_url;
    return res.json({ profilePic: imageUrl });
  } catch (err) {
    console.error("Erro RapidAPI:", err.message);
    return res.status(500).json({ error: "Failed to fetch profile pic" });
  }
});

app.listen(port, () => {
  console.log(`API running on port ${port} — ✅ usando Scraper Stable`);
});
