// Sinh sessionId ngẫu nhiên, lưu vào localStorage
let sessionId = localStorage.getItem('chatSessionId');
if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chatSessionId', sessionId);
}

// userId - lấy từ session đăng nhập (null nếu chưa login)
const userId = null; // TODO: thay bằng ID user thực từ session

// ===== Gửi tin nhắn =====
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (!message) return;

    // Ẩn quick replies sau lần đầu nhắn
    document.getElementById('quickReplies').style.display = 'none';

    appendMessage('user', message);
    input.value = '';
    input.style.height = 'auto';

    setLoading(true);
    const typingEl = showTyping();

    try {
        // api.js có BASE_URL="/api" rồi, nên chỉ cần path từ /chatbot trở đi
        const data = await apiFetch('/chatbot/chat', {
            method: 'POST',
            body: JSON.stringify({ sessionId, userId, message }),
        });

        typingEl.remove();
        appendMessage('bot', data.message || data.error || 'Có lỗi xảy ra.');

    } catch (err) {
        typingEl.remove();

        // Lỗi trả về từ server (ChatResponse.error)
        if (err.isServerError && err.data) {
            appendMessage('bot', err.data.error || 'Có lỗi từ server, vui lòng thử lại.');
        } else {
            // Lỗi network / không kết nối được
            showError('Không thể kết nối server. Vui lòng kiểm tra lại.');
            appendMessage('bot', 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau ít phút.');
        }
    } finally {
        setLoading(false);
    }
}

// ===== Gửi quick reply =====
function sendQuick(text) {
    document.getElementById('messageInput').value = text;
    sendMessage();
}

// ===== Xoá lịch sử =====
async function clearChat() {
    if (!confirm('Bắt đầu cuộc trò chuyện mới?')) return;

    try {
        await apiFetch(`/chatbot/history/${sessionId}`, { method: 'DELETE' });
    } catch (e) { /* ignore */ }

    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chatSessionId', sessionId);

    const messages = document.getElementById('chatMessages');
    messages.innerHTML = '';
    document.getElementById('quickReplies').style.display = 'flex';
    appendMessage('bot', 'Xin chào! Tôi có thể giúp gì cho bạn? 😊');
}

// ===== Helpers =====
function appendMessage(role, text) {
    const container = document.getElementById('chatMessages');
    const isUser = role === 'user';
    const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const msgEl = document.createElement('div');
    msgEl.className = `message ${isUser ? 'user' : 'bot'}`;
    msgEl.innerHTML = `
        <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
        <div>
            <div class="bubble">${escapeHtml(text)}</div>
            <div class="message-time">${now}</div>
        </div>
    `;

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
}

function showTyping() {
    const container = document.getElementById('chatMessages');
    const el = document.createElement('div');
    el.className = 'message bot';
    el.id = 'typingIndicator';
    el.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    return el;
}

function setLoading(loading) {
    document.getElementById('sendBtn').disabled = loading;
    document.getElementById('messageInput').disabled = loading;
}

function showError(msg) {
    const toast = document.getElementById('errorToast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
}