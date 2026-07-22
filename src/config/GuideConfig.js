import { GameConfig } from "./GameConfig.js";

export const GuideConfig = {
    title: "CÁCH CHƠI",
    basicsTitle: "CƠ BẢN",
    basics: `• Kéo ngón tay hoặc chuột để vẽ một đường.
• Bóng sẽ nảy trên đường vừa vẽ.
• Không để bóng chạm khung màu đỏ.
• Thu thập các quả cầu để nhận hiệu ứng.
• Né các hiệu ứng bất lợi nếu không muốn tăng độ khó.`,
    itemsTitle: "VẬT PHẨM",
    items: [
        {
            name: "Mystery Orb",
            type: "Mystery",
            description: "Nhận một hiệu ứng ngẫu nhiên.",
            duration: "",
            color: GameConfig.orb.color
        },
        {
            name: "Double Score",
            type: "Buff",
            description: "Nhân đôi điểm trong 8 giây.",
            duration: "8s",
            color: 0xffd166
        },
        {
            name: "Slow Motion",
            type: "Buff",
            description: "Giảm tốc độ bóng trong 5 giây.",
            duration: "5s",
            color: 0x60a5fa
        },
        {
            name: "Shield",
            type: "Buff",
            description: "Chặn một viên đạn trong 6 giây.",
            duration: "6s",
            color: 0x4ade80
        },
        {
            name: "Speed Up",
            type: "Debuff",
            description: "Tăng tốc độ bóng trong 5 giây.",
            duration: "5s",
            color: 0xf97316
        },
        {
            name: "Projectile",
            type: "Debuff",
            description: "Tạo 2 viên đạn từ mép sân bay về phía bóng.",
            duration: "",
            color: 0xff4d6d
        },
        {
            name: "Gravity Down",
            type: "Debuff",
            description: "Trọng lực kéo bóng xuống mạnh hơn.",
            duration: "5s",
            color: 0x7c3aed
        },
        {
            name: "Gravity Up",
            type: "Debuff",
            description: "Trọng lực kéo bóng lên trong 5 giây.",
            duration: "5s",
            color: 0x38bdf8
        }
    ]
};
