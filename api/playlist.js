export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  try {
    const apiRes = await fetch("http://api-boom.v2h-cdn.com:4001/v1/app/get-live");
    if (!apiRes.ok) throw new Error("API Error");

    const json = await apiRes.json();
    const channels = json.data || [];

    // ตรวจสอบว่าถ้าผู้ใช้เติม ?format=raw จะให้ส่งออกเป็นไฟล์ M3U ล้วนๆ สำหรับแอป IPTV
    const format = req.query.format;
    if (format === "raw") {
      let m3uContent = "#EXTM3U\n";
      channels.forEach(ch => {
        const name = ch.name || "Unknown";
        const logo = ch.image_v || "";
        const streamUrl = ch.link || "";
        if (streamUrl) {
          m3uContent += `#EXTINF:-1 tvg-logo="${logo}",${name}\n`;
          m3uContent += `${streamUrl}\n`;
        }
      });
      res.setHeader("Content-Type", "audio/x-mpegurl; charset=utf-8");
      return res.status(200).send(m3uContent);
    }

    // ถ้าเข้าลิงก์ปกติ จะแสดงเป็นหน้าเว็บสวยๆ ที่มีลิงก์ .m3u8 ให้กดคัดลอกหรือเปิดดูได้ทันที
    let htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Live TV .m3u8 Links</title>
<style>
  body { font-family: Arial, sans-serif; background: #0f172a; color: #fff; padding: 20px; }
  h2 { color: #ef4444; }
  .channel-card { background: #1e293b; padding: 15px; margin-bottom: 15px; border-radius: 8px; }
  input { width: 100%; padding: 8px; margin-top: 5px; background: #0f172a; border: 1px solid #334155; color: #38bdf8; border-radius: 4px; box-sizing: border-box; }
  .btn-group { margin-top: 10px; display: flex; gap: 10px; }
  button { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
  .copy-btn { background: #3b82f6; color: white; }
  .play-btn { background: #ef4444; color: white; }
  button:hover { opacity: 0.9; }
</style>
</head>
<body>
  <h2>📺 รายการลิงก์ .m3u8 แบบเรียลไทม์</h2>
  <p>ลิงก์ M3U สำหรับแอป IPTV: <a href="/api/playlist?format=raw" target="_blank" style="color: #38bdf8;">/api/playlist?format=raw</a></p>
  <hr style="border-color: #334155; margin-bottom: 20px;">`;

    channels.forEach(ch => {
      const name = ch.name || "ไม่มีชื่อช่อง";
      const link = ch.link || "";
      htmlContent += `
        <div class="channel-card">
          <strong>${name}</strong>
          <div><input type="text" value="${link}" readonly id="link-${ch.id}"></div>
          <div class="btn-group">
            <button class="copy-btn" onclick="navigator.clipboard.writeText('${link}'); alert('คัดลอกลิงก์ .m3u8 เรียบร้อย!');">คัดลอกลิงก์ .m3u8</button>
            <a href="${link}" target="_blank"><button class="play-btn">เปิดไฟล์ .m3u8 ตรงๆ</button></a>
          </div>
        </div>`;
    });

    htmlContent += `</body></html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(htmlContent);

  } catch (error) {
    return res.status(500).send("Error loading streams");
  }
}
