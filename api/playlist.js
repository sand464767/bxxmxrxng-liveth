export default async function handler(req, res) {
  // อนุญาตให้เข้าถึงจากทุกที่
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  try {
    // ดึงข้อมูลจาก API ต้นทาง
    const apiRes = await fetch("http://api-boom.v2h-cdn.com:4001/v1/app/get-live");
    
    if (!apiRes.ok) {
      throw new Error(`API responded with status: ${apiRes.status}`);
    }

    const json = await apiRes.json();
    const channels = json.data || [];

    let m3uContent = "#EXTM3U\n";

    channels.forEach(ch => {
      const name = ch.name || "Unknown";
      const logo = ch.image_v || ch.image_h || ch.image_b || "";
      const streamUrl = ch.link || "";

      if (streamUrl) {
        m3uContent += `#EXTINF:-1 tvg-logo="${logo}" group-title="Live TV",${name}\n`;
        m3uContent += `${streamUrl}\n`;
      }
    });

    res.setHeader("Content-Type", "audio/x-mpegurl; charset=utf-8");
    return res.status(200).send(m3uContent);
    
  } catch (error) {
    console.error("M3U Generation Error:", error);
    return res.status(500).json({ 
      error: "Failed to generate playlist", 
      details: error.message 
    });
  }
}
