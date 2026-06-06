const BASE_URL = "/api";

async function apiFetch(path, options = {}) {
    const defaultHeaders = {
        "ngrok-skip-browser-warning": "true"
    };

    if (options.body) {
        defaultHeaders["Content-Type"] = "application/json";
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!res.ok) {
        // Thử parse JSON để lấy message lỗi từ server (ChatResponse.error)
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
            const errData = await res.json();
            // Ném object để caller phân biệt được lỗi từ server vs lỗi network
            throw { isServerError: true, status: res.status, data: errData };
        }
        const msg = await res.text();
        throw new Error(msg || `Lỗi ${res.status}`);
    }

    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
}