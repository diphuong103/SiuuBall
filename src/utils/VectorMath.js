/**
 * Rút gọn 1 đường vẽ (nhiều điểm) thành ít điểm hơn nhưng vẫn giữ đúng hình dạng.
 * Thuật toán Ramer–Douglas–Peucker (RDP) — chuẩn công nghiệp cho việc này.
 */
export function simplifyPath(points, tolerance = 3) {
  if (points.length < 3) return points;

  function perpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) {
      return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
    }
    const u =
      ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (mag * mag);
    const closestX = lineStart.x + u * dx;
    const closestY = lineStart.y + u * dy;
    return Math.hypot(point.x - closestX, point.y - closestY);
  }

  function rdp(pts, eps) {
    let maxDist = 0;
    let index = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const dist = perpendicularDistance(pts[i], pts[0], pts[pts.length - 1]);
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }
    if (maxDist > eps) {
      const left = rdp(pts.slice(0, index + 1), eps);
      const right = rdp(pts.slice(index), eps);
      return left.slice(0, -1).concat(right);
    }
    return [pts[0], pts[pts.length - 1]];
  }

  return rdp(points, tolerance);
}