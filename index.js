import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/api/profile-pic', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Username required' });

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    const imageUrl = await page.evaluate(() => {
      const meta = document.querySelector('meta[property="og:image"]');
      return meta?.getAttribute('content');
    });

    await browser.close();

    if (!imageUrl) {
      return res.status(404).json({ error: 'Profile picture not found' });
    }

    res.json({ profilePic: imageUrl });
  } catch (error) {
    console.error('[ERRO]', error.message);
    res.status(500).json({ error: 'Failed to fetch profile picture' });
  }
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
