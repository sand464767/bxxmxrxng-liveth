export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  try {
    const apiRes = await fetch("http://api-boom.v2h-cdn.com:4001/v1/app/get-live");
    
    if (!apiRes.ok) {
      throw new Error(`API error: ${apiRes.status}`);
    }

    const json = await apiRes.json();
    const channels = json.data || [];

    // หัวข้อบังคับของไฟล์ M3U
    let m3uContent = "#EXTM3U x-tvg-url=\"\"\n";

    channels.forEach((ch, index) => {
      const id = ch.id || (index + 1);
      const name = ch.name || "Unknown Channel";
      const logo = ch.image_v || ch.image_h || ch.image_b || "";
      const streamUrl = ch.link || "";

      if (streamUrl) {
        // จัดรูปแบบ EXTINF ให้ถูกต้องตามมาตรฐาน IPTV
        m3uContent += `#EXTINF:-1 tvg-id="${id}" tvg-name="${name}" tvg-logo="${logo}" group-title="Live TV",${name}\n`;
        m3uContent += `${streamUrl}\n`;
      }
    });

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl; charset=utf-8");
    return res.status(200).send(m3uContent);
    
  } catch (error) {
    return res.status(500).send("#EXTM3U\n#EXTINF:-1, Error loading playlist");
  }
}
