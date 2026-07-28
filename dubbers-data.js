// dubbers-data.js - Premium Audiobook Narrators Database
const dubbersData = {
    "amin_souli": {
        id: "amin_souli",
        name: "أمين السهيلي",
        avatar: "logo.png",
        bio: "مؤدي صوتي محترف متخصص في الروايات والأنمي الحماسية."
    },
    "abdurrahman": {
        id: "abdurrahman",
        name: "عبدالرحمن دانيال",
        avatar: "logo.png",
        bio: "قارئ وصاحب نبرة سينمائية دافئة للأدب الكلاسيكي والعربي."
    },
    "reviewer_voice": {
        id: "reviewer_voice",
        name: "مراجعي المنصة",
        avatar: "logo.png",
        bio: "أصوات مميزة مخصصة لمراجعة وتلخيص الكتب العالمية."
    }
};

if (typeof window !== 'undefined') {
    window.dubbersData = dubbersData;
}
console.log('🎙️ Narrators database loaded successfully.');