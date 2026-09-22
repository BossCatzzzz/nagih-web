NAGIH_DATA.ready.then(({ photographers }) => {
/* =========================================================
   BẢNG GIÁ
   - Photographer count lấy trực tiếp từ photographers.js.
   - Các photographer placeholder (demo-*) không được tính vào số thợ thật.
========================================================= */

const PRICE_TIERS = [
    {
        category: "founder",
        level: "Hạng 01",
        title: "Founder",
        price: "2.800.000đ",
        description: `Founder & Photographer của NAGIH.\nTrực tiếp thực hiện những booking yêu cầu cao về concept, hình ảnh và trải nghiệm.`,
        peopleLabel: "thợ",
        linkText: "Xem thợ →"
    },
    {
        category: "ekip1",
        level: "Hạng 02",
        title: "Ekip 1",
        price: "2.500.000đ",
        description: `Nhóm photographer chủ lực, giàu kinh nghiệm và có phong cách cá nhân rõ nét.`,
        peopleLabel: "thợ",
        linkText: "Xem thợ →"
    },
    {
        category: "ekip23",
        level: "Hạng 03",
        title: "Ekip 2, 3",
        price: "2.200.000đ",
        description: `Những photographer trẻ của NAGIH, đa dạng phong cách, bắt trend nhanh và được vận hành theo cùng tiêu chuẩn của ekip.`,
        peopleLabel: "thợ",
        linkText: "Xem thợ →"
    },
    {
        category: "takecare",
        level: "Hỗ trợ",
        title: "Take Care",
        price: "600.000đ",
        description: `Nhân sự đồng hành xuyên suốt buổi chụp: hỗ trợ trang phục, tóc, phụ kiện, chỉnh dáng, giữ đồ và các nhu cầu phát sinh.`,
        peopleLabel: "thợ",
        linkText: "Xem thợ →"
    }
];

function getRealPhotographers(category) {
    if (typeof NAGIH_DATA === "undefined") return [];
    return photographers.filter(
        p => p && p.profile && !p.placeholder && Array.isArray(p.categories) && p.categories.includes(category)
    );
}

function renderPriceCards() {
    const grid = document.querySelector(".price-grid");
    if (!grid || typeof NAGIH_DATA === "undefined") return;

    grid.innerHTML = PRICE_TIERS.map(tier => {
        const people = getRealPhotographers(tier.category);
        const count = people.length;
        const names = people.map(p => p.name).join(" · ");
        const countText = count === 0
            ? "0 thợ hiện có"
            : `${count} ${tier.peopleLabel}`;

        return `
            <article class="price-card">
                <div class="price-level">${tier.level}</div>
                <h2 class="price-card-title">${tier.title}</h2>
                <div class="price-number">${tier.price}</div>
                <p class="price-card-description">${tier.description}</p>
                <div class="price-card-footer">
                    <div>
                        <span class="people-count"><strong>${count}</strong> ${tier.peopleLabel}</span>
                        ${names ? `<div class="people-names">${names}</div>` : ""}
                    </div>
                    <a href="./tho.html?category=${encodeURIComponent(tier.category)}" class="price-link">${tier.linkText}</a>
                </div>
            </article>
        `;
    }).join("");
}

renderPriceCards();

/* =========================================================
   TRAVEL SURCHARGE CALCULATOR
========================================================= */

const locationSelect = document.getElementById("locationSelect");
const photographerCount = document.getElementById("photographerCount");
const resultPlace = document.getElementById("resultPlace");
const resultNote = document.getElementById("resultNote");
const resultPrice = document.getElementById("resultPrice");

function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function updateTravelPrice() {
    if (!locationSelect || !photographerCount) return;

    const option = locationSelect.options[locationSelect.selectedIndex];
    const baseFee = Number(locationSelect.value);
    const people = Number(photographerCount.value);

    if (!baseFee) {
        resultPlace.textContent = "Chọn địa điểm";
        resultNote.textContent = "Chưa chọn địa điểm";
        resultPrice.textContent = "—";
        return;
    }

    const total = baseFee * people;
    resultPlace.textContent = option.textContent;
    resultNote.textContent = `${formatMoney(baseFee)} / 1 thợ × ${people} thợ`;
    resultPrice.textContent = formatMoney(total);
}

locationSelect?.addEventListener("change", updateTravelPrice);
photographerCount?.addEventListener("change", updateTravelPrice);

});
