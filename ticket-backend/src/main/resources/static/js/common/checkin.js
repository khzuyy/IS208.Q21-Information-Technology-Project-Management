const resultDiv = document.getElementById("result");

let dangQuet = false;

const html5QrCode = new Html5Qrcode("reader");

/*
|--------------------------------------------------------------------------
| BEEP
|--------------------------------------------------------------------------
*/
function beep() {

    try {

        const audio = new Audio(
            "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
        );

        audio.play();

    } catch (e) {
        console.error(e);
    }
}

/*
|--------------------------------------------------------------------------
| RUNG ĐIỆN THOẠI
|--------------------------------------------------------------------------
*/
function rungDienThoai() {

    try {

        if (navigator.vibrate) {
            navigator.vibrate(300);
        }

    } catch (e) {
        console.error(e);
    }
}

/*
|--------------------------------------------------------------------------
| HIỂN THỊ
|--------------------------------------------------------------------------
*/
function showMessage(message, color = "black") {

    resultDiv.innerHTML = `
        <div style="
            color:${color};
            font-size:22px;
            font-weight:bold;
            text-align:center;
            padding:20px;
        ">
            ${message}
        </div>
    `;
}

/*
|--------------------------------------------------------------------------
| CHECK-IN API
|--------------------------------------------------------------------------
*/
async function guiCheckIn(qrToken) {

    const response = await fetch("/api/hoadon/checkin", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            qrToken: qrToken
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Check-in thất bại");
    }

    return data;
}

/*
|--------------------------------------------------------------------------
| QUÉT THÀNH CÔNG
|--------------------------------------------------------------------------
*/
async function onScanSuccess(decodedText) {

    /*
    |--------------------------------------------------------------------------
    | CHỐNG QUÉT LIÊN TỤC
    |--------------------------------------------------------------------------
    */
    if (dangQuet) return;

    dangQuet = true;

    console.log("QR:", decodedText);

    showMessage("Đang check-in...", "orange");

    try {

        /*
        |--------------------------------------------------------------------------
        | GỌI API
        |--------------------------------------------------------------------------
        */
        const data = await guiCheckIn(decodedText);

        console.log(data);

        /*
        |--------------------------------------------------------------------------
        | RUNG + ÂM THANH
        |--------------------------------------------------------------------------
        */
        rungDienThoai();

        beep();

        /*
        |--------------------------------------------------------------------------
        | HIỂN THỊ THÀNH CÔNG
        |--------------------------------------------------------------------------
        */
        showMessage(`
            ✅ ${data.message}
            <br><br>

            🎫 Vé: ${data.tenVe}
            <br>

            💺 Ghế: ${data.khuVuc}
        `, "green");

    } catch (error) {

        console.error(error);

        rungDienThoai();

        /*
        |--------------------------------------------------------------------------
        | HIỂN THỊ LỖI
        |--------------------------------------------------------------------------
        */
        showMessage(`
            ❌ ${error.message}
        `, "red");

    } finally {

        /*
        |--------------------------------------------------------------------------
        | CHO PHÉP QUÉT LẠI
        |--------------------------------------------------------------------------
        */
        setTimeout(() => {

            dangQuet = false;

            showMessage("Sẵn sàng quét QR", "#444");

        }, 2500);
    }
}

/*
|--------------------------------------------------------------------------
| CAMERA LỖI
|--------------------------------------------------------------------------
*/
function onScanFailure(error) {

    // Không log liên tục tránh spam console
}

/*
|--------------------------------------------------------------------------
| KHỞI ĐỘNG CAMERA SAU
|--------------------------------------------------------------------------
*/
async function startScanner() {

    try {

        showMessage("Đang mở camera...", "orange");

        /*
        |--------------------------------------------------------------------------
        | ƯU TIÊN CAMERA SAU
        |--------------------------------------------------------------------------
        */
        await html5QrCode.start(

            {
                facingMode: "environment"
            },

            {
                fps: 10,

                qrbox: {
                    width: 250,
                    height: 250
                },

                aspectRatio: 1.777,

                rememberLastUsedCamera: true,

                showTorchButtonIfSupported: true
            },

            onScanSuccess,

            onScanFailure
        );

        showMessage("Sẵn sàng quét QR", "#444");

    } catch (error) {

        console.error(error);

        /*
        |--------------------------------------------------------------------------
        | FALLBACK CAMERA THƯỜNG
        |--------------------------------------------------------------------------
        */
        try {

            const devices = await Html5Qrcode.getCameras();

            if (!devices || devices.length === 0) {

                showMessage("Không tìm thấy camera", "red");

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | TÌM CAMERA SAU THỦ CÔNG
            |--------------------------------------------------------------------------
            */
            let cameraSau = devices.find(device => {

                const label = (device.label || "").toLowerCase();

                return (
                    label.includes("back") ||
                    label.includes("rear") ||
                    label.includes("environment")
                );
            });

            /*
            |--------------------------------------------------------------------------
            | KHÔNG CÓ -> LẤY CAMERA CUỐI
            |--------------------------------------------------------------------------
            */
            if (!cameraSau) {
                cameraSau = devices[devices.length - 1];
            }

            await html5QrCode.start(

                cameraSau.id,

                {
                    fps: 10,

                    qrbox: {
                        width: 250,
                        height: 250
                    },

                    aspectRatio: 1.777,

                    rememberLastUsedCamera: true,

                    showTorchButtonIfSupported: true
                },

                onScanSuccess,

                onScanFailure
            );

            showMessage("Sẵn sàng quét QR", "#444");

        } catch (err) {

            console.error(err);

            showMessage(`
                ❌ Không mở được camera
                <br><br>
                Hãy cấp quyền camera cho trình duyệt
            `, "red");
        }
    }
}

/*
|--------------------------------------------------------------------------
| START
|--------------------------------------------------------------------------
*/
startScanner();