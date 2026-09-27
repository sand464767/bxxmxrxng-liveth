export default async function handler(req, res) {
  try {
    // ดึงข้อมูลจาก API ต้นทางแบบสดๆ
    const apiRes = await fetch("http://api-boom.v2h-cdn.com:4001/v1/app/get-live");
    const json = await apiRes.json();
    const channels = json.data || [];

    // สร้างข้อความรูปแบบ M3U Playlist
    let m3uContent = "#EXTM3U\n";

    channels.forEach(ch => {
      const name = ch.name || "Unknown";
      const logo = ch.image_v || ch.image_h || "";
      const streamUrl = ch.link || "";

      // ใส่ข้อมูลชื่อ โลโก้ และลิงก์ m3u8 ที่มี Token ล่าสุด
      m3uContent += `#EXTINF:-1 tvg-logo="${logo}" group-title="Live TV",${name}\n`;
      m3uContent += `${streamUrl}\n`;
    });

    // กำหนด Header ให้เป็นไฟล์ Playlist และอนุญาตให้เข้าถึงจากภายนอกได้
    res.setHeader("Content-Type", "audio/x-mpegurl; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).send(m3uContent);
    
  } catch (error) {
    return res.status(500).send("Error generating M3U playlist");
  }
}
