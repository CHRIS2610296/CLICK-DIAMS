// This code runs on the SERVER. Users CANNOT see this.
export default async function handler(req, res) {
  // 1. Get the ID and Game from the frontend request
  const { id, game, zone } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing ID' });
  }

  try {
    let targetUrl = "";

    // 2. YOUR SECRET LOGIC (The "Hacker" URLs)
    // No one can inspect element to see these URLs now.
    if (game === 'ff') {
      targetUrl = `https://api.isan.eu.org/nickname/freefire?id=${id}`;
    } else if (game === 'mlbb') {
      targetUrl = `https://api.isan.eu.org/nickname/mobile-legends?id=${id}&zone=${zone}`;
    } else {
      return res.status(400).json({ error: 'Game not supported' });
    }

    // 3. The Server fetches the data (Server-to-Server communication)
    // Servers don't have CORS issues like browsers do!
    const response = await fetch(targetUrl);
    const data = await response.json();

    // 4. Send ONLY the result back to the user
    if (data.success === true && data.name) {
      return res.status(200).json({ success: true, name: data.name });
    } else {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}