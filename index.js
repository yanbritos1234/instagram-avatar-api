const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const port = process.env.PORT || 8080;

app.get("/api/profile-pic", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "Missing username" });

  try {
    const url = `https://www.instadp.io/full-size/${username}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });

    const $ = cheerio.load(response.data);

    const imageUrl = $('img.profile-picture').attr('src');

    if (!imageUrl) {
      return res.status(404).json({ error: "Profile picture not found" });
    }

    res.json({ profilePic: imageUrl });
  } catch (err) {
    console.error("Erro ao buscar imagem:", err.message);
    return res.status(500).json({ error: "Erro ao buscar imagem do InstaDP" });
  }
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
