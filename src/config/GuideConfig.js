import { GameConfig } from "./GameConfig.js";

export const GuideConfig = {
    title: "How to Play",
    basicsTitle: "Gameplay Basics",
    basics: `• Kéo ngón tay hoặc chuột để vẽ một đường.
• Bóng sẽ nảy trên đường vừa vẽ.
• Không để bóng chạm khung màu đỏ.
• Thu thập các quả cầu để nhận hiệu ứng.
• Né các hiệu ứng bất lợi nếu không muốn tăng độ khó.`,
    itemsTitle: "Item Encyclopedia",
    items: [
        {
            name: "Mystery Orb",
            type: "Mystery",
            description: "Random một hiệu ứng ngẫu nhiên",
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
            description: "Chặn một lần Game Over.",
            duration: "",
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
            description: "Xuất hiện từ 2 đến 4 viên đạn bay ngang màn hình.",
            duration: "",
            color: 0xff4d6d
        },
        {
            name: "Gravity Down",
            type: "Debuff",
            description: "Đổi hướng bóng lao thẳng xuống.",
            duration: "5s",
            color: 0x7c3aed
        },
        {
            name: "Gravity Up",
            type: "Debuff",
            description: "Đổi hướng bóng lao thẳng lên.",
            duration: "5s",
            color: 0x38bdf8
        }
    ]
};
