NAGIH_DATA.ready.then(({ photographers }) => {
/* =========================================================
       ELEMENTS
    ========================================================= */

    const photographer =
        document.getElementById(
            "photographer"
        );

    const shootDate =
        document.getElementById(
            "shootDate"
        );

    const province =
        document.getElementById(
            "province"
        );

    const specificLocation =
        document.getElementById(
            "specificLocation"
        );

    const concept =
        document.getElementById(
            "concept"
        );

    const customerName =
        document.getElementById(
            "customerName"
        );

    const phone =
        document.getElementById(
            "phone"
        );

    const website =
        document.getElementById(
            "website"
        );

    const evening =
        document.getElementById(
            "evening"
        );

    const messageBox =
        document.getElementById(
            "messageBox"
        );

    const copyButton =
        document.getElementById(
            "copyButton"
        );



/* =========================================================
   PHOTOGRAPHER OPTIONS
   Read the same central data used by the photographer pages.
========================================================= */

function populatePhotographerOptions() {
    if (!photographer || typeof NAGIH_DATA === "undefined") return;

    const selectedSlug =
        new URLSearchParams(window.location.search).get("tho")?.trim().toLowerCase() || "";

    const options = photographers
        .filter(p => p && p.profile)
        .map(p => `<option value="${p.slug}">${p.name}</option>`)
        .join("");

    photographer.innerHTML = `
        <option value="">Nhờ studio gợi ý</option>
        ${options}
    `;

    if (selectedSlug) {
        const exists = photographers.some(
            p => p.profile && p.slug.toLowerCase() === selectedSlug
        );

        if (exists) photographer.value = selectedSlug;
    }
}

populatePhotographerOptions();

    /* =========================================================
       STATE
    ========================================================= */

    let duration = "Cả ngày";

    let people = 1;


    /* =========================================================
       DURATION
    ========================================================= */

    document
        .querySelectorAll(".segment")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(".segment")
                        .forEach(item => {

                            item.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );


                    duration =
                        button.dataset.duration;


                    updateMessage();

                }
            );

        });


    /* =========================================================
       PEOPLE
    ========================================================= */

    document
        .querySelectorAll(".people-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".people-button"
                        )
                        .forEach(item => {

                            item.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );


                    people =
                        Number(
                            button.dataset.people
                        );


                    updateMessage();

                }
            );

        });


    /* =========================================================
       FORMAT DATE
    ========================================================= */

    function formatDate(value) {

        if (!value) {
            return "chưa chốt";
        }


        const date =
            new Date(
                value + "T00:00:00"
            );


        return date.toLocaleDateString(
            "vi-VN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    /* =========================================================
       PEOPLE TEXT
    ========================================================= */

    function getPeopleText() {

        if (people === 1) {
            return "1 người (gói lẻ)";
        }


        return `${people} người (gói nhóm)`;

    }


    /* =========================================================
       MESSAGE
    ========================================================= */

    function buildMessage() {

        const photographerValue =
            photographer.value ||
            "nhờ studio gợi ý";


        const dateValue =
            formatDate(
                shootDate.value
            );


        const provinceValue =
            province.value ||
            "chưa chọn";


        const locationValue =
            specificLocation.value.trim() ||
            "chưa chọn";


        const conceptValue =
            concept.value.trim();


        const nameValue =
            customerName.value.trim();


        const phoneValue =
            phone.value.trim();


        const websiteValue =
            website.value.trim();


        let message =
`Chào NAGIH GRAPHY, mình muốn đặt lịch chụp.

- Thợ: ${photographerValue}
- Chụp: ${duration}
- Số người chụp: ${getPeopleText()}
- Ngày chụp dự kiến: ${dateValue}
- Tỉnh / thành: ${provinceValue}
- Địa điểm: ${locationValue}
- Chụp tối đến 20h: ${evening.checked ? "Có" : "Không"}
- Concept mong muốn: ${conceptValue || "chưa có"}

- Tên: ${nameValue || "chưa cung cấp"}
- Số điện thoại: ${phoneValue || "chưa cung cấp"}
- Website: ${websiteValue || "không có"}`;


        return message;

    }


    /* =========================================================
       UPDATE MESSAGE
    ========================================================= */

    function updateMessage() {

        messageBox.textContent =
            buildMessage();

    }


    /* =========================================================
       ALL INPUT EVENTS
    ========================================================= */

    [

        photographer,
        shootDate,
        province,
        specificLocation,
        concept,
        customerName,
        phone,
        website,
        evening

    ].forEach(element => {

        element.addEventListener(
            "input",
            updateMessage
        );

        element.addEventListener(
            "change",
            updateMessage
        );

    });


    /* =========================================================
       COPY
    ========================================================= */

    copyButton.addEventListener(
        "click",
        async () => {

            const message =
                buildMessage();


            try {

                await navigator.clipboard.writeText(
                    message
                );


                copyButton.textContent =
                    "Đã sao chép ✓";


                copyButton.classList.add(
                    "copied"
                );


                setTimeout(() => {

                    copyButton.textContent =
                        "Sao chép";

                    copyButton.classList.remove(
                        "copied"
                    );

                }, 1800);


            } catch (error) {

                /*
                 * Fallback cho browser không cho
                 * truy cập Clipboard API.
                 */

                const textarea =
                    document.createElement(
                        "textarea"
                    );


                textarea.value =
                    message;


                document.body.appendChild(
                    textarea
                );


                textarea.select();


                document.execCommand(
                    "copy"
                );


                textarea.remove();


                copyButton.textContent =
                    "Đã sao chép ✓";


                setTimeout(() => {

                    copyButton.textContent =
                        "Sao chép";

                }, 1800);

            }

        }
    );


    /* =========================================================
       INITIAL MESSAGE
    ========================================================= */

    updateMessage();

});
