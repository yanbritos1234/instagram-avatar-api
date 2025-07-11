const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = process.env.PORT || 8080;

app.get("/api/profile-pic", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: "Missing username" });

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    );

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    const pageContent = await page.content();

    // Primeira tentativa: buscar via JSON embutido
    const jsonMatch = pageContent.match(/<script type="application\/ld\+json">(.+?)<\/script>/);
    if (jsonMatch && jsonMatch.length >= 2) {
      const userData = JSON.parse(jsonMatch[1]);
      if (userData && userData.image) {
        await browser.close();
        return res.json({ profilePic: userData.image });
      }
    }

    // Segunda tentativa: buscar por imagem CDN
    await page.waitForSelector('img[src*="scontent"]', { timeout: 8000 });
    const imageUrl = await page.$eval('img[src*="scontent"]', img => img.src);

    console.log("Imagem capturada via fallback:", imageUrl);
    await browser.close();
    return res.json({ profilePic: imageUrl });

  } catch (err) {
    console.error("Erro ao buscar imagem:", err.message);
    return res.status(500).json({ error: "Profile picture not found" });
  }
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
