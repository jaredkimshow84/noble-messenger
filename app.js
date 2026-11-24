/* 노블 메신저 – 앱 동작
   데이터: Supabase (로그인, 데이터베이스, 실시간, 파일 저장, 서버 함수) */
(function () {
  'use strict';
  var CFG = window.NOBLE_CONFIG || {};
  var EMAIL_DOMAIN = 'staff.noble365.app';
  var root = document.getElementById('root');

  /* ---------------- 작은 도우미 ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function linkify(s) { return esc(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function initial(n) { return (n || '?').trim().slice(0, 1); }
  var WD = ['일', '월', '화', '수', '목', '금', '토'];
  function d(x) { return x instanceof Date ? x : new Date(x); }
  function hm(x) { var t = d(x), h = t.getHours(), m = t.getMinutes(); return (h < 12 ? '오전 ' : '오후 ') + ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m; }
  function dayLabel(x) { var t = d(x); return t.getFullYear() + '년 ' + (t.getMonth() + 1) + '월 ' + t.getDate() + '일 ' + WD[t.getDay()] + '요일'; }
  function sameDay(a, b) { a = d(a); b = d(b); return a.toDateString() === b.toDateString(); }
  function shortTime(x) {
    var t = d(x), now = new Date();
    if (sameDay(t, now)) return hm(t);
    var y = new Date(now); y.setDate(now.getDate() - 1);
    if (sameDay(t, y)) return '어제';
    return (t.getMonth() + 1) + '/' + t.getDate();
  }
  function ymd(x) { var t = d(x); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); }
  function size(n) { if (!n && n !== 0) return ''; if (n < 1024) return n + 'B'; if (n < 1048576) return (n / 1024).toFixed(0) + 'KB'; return (n / 1048576).toFixed(1) + 'MB'; }
  function mins(n) { n = +n || 0; var h = Math.floor(n / 60), m = n % 60; return h ? h + '시간' + (m ? ' ' + m + '분' : '') : m + '분'; }
  var IC = {
    chat: '<path d="M4 5h16v11H9l-5 4z"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .7 3.2 2.6 3.5 6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.8 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.8-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.8H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.8-1.2V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.8 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.8H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1.1z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    pencil: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14.5 7.5l3 3"/>', tobottom: '<path d="M12 5v14M6 13l6 6 6-6"/>', plus: '<path d="M12 5v14M5 12h14"/>', back: '<path d="M15 18l-6-6 6-6"/>', clip: '<path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>',
    more: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>', mute: '<path d="M11 5L6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', down: '<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>',
    pop: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    pin: '<path d="M9 3h6l-1 7 3 3H7l3-3z"/><path d="M12 13v8"/>',
    reply: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v4"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    poll: '<path d="M5 20V11M12 20V4M19 20v-7"/><path d="M3 20h18"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    check: '<path d="M5 12l5 5 9-10"/>', checkall: '<path d="M2.5 12.5l4.5 4.5 8-10"/><path d="M12 15.5l1.5 1.5 8-10"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    at: '<circle cx="12" cy="12" r="3.6"/><path d="M15.6 12v1.4a2.4 2.4 0 0 0 4.8 0V12a8.4 8.4 0 1 0-3.3 6.7"/>',
    crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M2 6h14a2 2 0 0 1 2 2v14"/>',
    queue: '<path d="M8 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/><rect x="8" y="2.5" width="8" height="3.6" rx="1.2"/><path d="M8 11.4l1.4 1.4 2.5-2.7"/><path d="M14.4 11.7h2.1"/><path d="M8 16.6h.01"/><path d="M11.4 16.6h5.1"/>'
  };
  /* 프로필 사진(없으면 이름 첫 글자) */
  function av(p, cls) {
    p = p || {}; var u = p.avatar_url;
    return '<span class="avatar' + (cls ? ' ' + cls : '') + (u ? ' ph' : '') + '"' + (p.id ? ' data-uid="' + p.id + '"' : '') + '>' + (u ? '<img src="' + esc(u) + '" alt="" loading="lazy">' : esc(initial(p.name))) + '</span>';
  }
  var DESKTOP = window.matchMedia('(hover:hover) and (pointer:fine)');
  var NARROW = window.matchMedia('(max-width:860px)');
  var QUAD = window.matchMedia('(min-width:1200px)'), LANDSCAPE = window.matchMedia('(orientation:landscape)'), W640 = window.matchMedia('(min-width:640px)');   // 큰 화면 4단 · 가로 폰/태블릿 3단 판단용
  var EMOJIS = ['네!', '👍', '❤️', '😂', '😮', '😢', '🙏', '✅'];   // 맨 앞 "네!" = 글자 공감 (직원 건의)
  function isTextReact(e) { return /[가-힣]/.test(e); }
  var PICK_EMOJIS = ['😀', '😄', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤔', '😮', '😅', '😢', '😭', '😡', '🥲', '😴', '🤗', '🙄', '😱',
    '👍', '👎', '👏', '🙏', '💪', '👌', '✌️', '🙌', '👋', '🤝', '❤️', '💙', '💛', '🔥', '⭐', '🎉', '🎂', '☕', '🍚', '🍺',
    '✅', '❌', '⭕', '❗', '❓', '⚠️', '📌', '📢', '💊', '🏥'];
  function reRx(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function svg(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + '</svg>'; }
  function toast(html, onClick) {
    var el = document.createElement('div'); el.className = 'toast'; el.innerHTML = html; el.setAttribute('role', 'status');
    document.body.appendChild(el);
    var t = setTimeout(function () { el.remove(); }, 4200);
    el.addEventListener('click', function () { clearTimeout(t); el.remove(); if (onClick) onClick(); });
  }
  /* 새 메시지 팝업 – PC는 오른쪽 아래, 휴대폰은 위쪽 */
  function msgPopup(title, text, p, onClick) {
    var box = $('#pops'); if (!box) { box = document.createElement('div'); box.id = 'pops'; box.className = 'pops'; document.body.appendChild(box); }
    var el = document.createElement('div'); el.className = 'popmsg'; el.setAttribute('role', 'status');
    el.innerHTML = av(p, 'sm') + '<div class="pm-txt"><b>' + esc(title) + '</b><p>' + esc(text) + '</p></div><button class="pm-x" aria-label="닫기">×</button>';
    box.appendChild(el);
    while (box.children.length > 3) box.removeChild(box.firstChild);
    var t = setTimeout(function () { el.remove(); }, 6000);
    el.addEventListener('click', function (e) { clearTimeout(t); el.remove(); if (!e.target.closest('.pm-x') && onClick) onClick(); });
  }
  /* ---------- 메시지 알림음 (이 기기에 저장) ---------- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  var SOUNDS = { ding: ['띵동', [[880, 0, .22], [1320, .14, .45]]], pop: ['똑', [[700, 0, .09], [1050, .05, .12]]], bell: ['종소리', [[1046, 0, .9], [1568, 0, .9], [2093, 0, .6]]], chime: ['차임', [[784, 0, .25], [988, .12, .3], [1175, .24, .5]]] };
  var actx = null, lastBeep = 0;
  function unlockAudio() {
    try { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {}
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, unlockAudio, { passive: true }); });
  /* 글자 크기 (이 기기에 저장) */
  var FS = [['s', '작게'], ['', '보통'], ['l', '크게'], ['xl', '아주 크게']];
  function fontSize() { var v = lsGet('noble-font'); return v === 's' || v === 'l' || v === 'xl' ? v : ''; }
  function applyFont(v) { var h = document.documentElement; h.classList.remove('fs-s', 'fs-l', 'fs-xl'); if (v) h.classList.add('fs-' + v); }
  applyFont(fontSize());
  /* 글씨체 (이 기기에 저장) */
  var FACES = {
    pretendard: ['프리텐다드 (기본)', '"Pretendard"', ''],
    malgun: ['맑은 고딕', '"Malgun Gothic","맑은 고딕"', ''],
    nanum: ['나눔고딕', '"Nanum Gothic"', 'Nanum+Gothic:wght@400;700;800'],
    noto: ['본고딕', '"Noto Sans KR"', 'Noto+Sans+KR:wght@400;500;700;800'],
    gowun: ['고운돋움 (부드러운)', '"Gowun Dodum"', 'Gowun+Dodum']
  };
  function fontFace() { var v = lsGet('noble-face'); return FACES[v] ? v : 'pretendard'; }
  function applyFace(k) {
    var f = FACES[k] || FACES.pretendard;
    if (f[2] && !document.getElementById('gf-' + k)) {
      var l = document.createElement('link'); l.id = 'gf-' + k; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=' + f[2] + '&display=swap'; document.head.appendChild(l);
    }
    document.documentElement.style.setProperty('--font', f[1] + ',"Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif');
  }
  if (fontFace() !== 'pretendard') applyFace(fontFace());
  function applyFaceLink(k) { var f = FACES[k]; if (f[2] && !document.getElementById('gf-' + k)) { var l = document.createElement('link'); l.id = 'gf-' + k; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + f[2] + '&display=swap'; document.head.appendChild(l); } }
  function soundOn() { return lsGet('noble-sound') !== 'off'; }
  function soundKind() { var k = lsGet('noble-sound-kind'); return SOUNDS[k] ? k : 'ding'; }
  function soundVol() { var v = parseFloat(lsGet('noble-sound-vol')); return isNaN(v) ? 0.6 : v; }
  function playSound(kind, force) {
    if (!force && (!soundOn() || Date.now() - lastBeep < 1200)) return;
    lastBeep = Date.now(); unlockAudio(); if (!actx) return;
    var t0 = actx.currentTime + 0.02, vol = soundVol() * 0.35;
    SOUNDS[kind || soundKind()][1].forEach(function (n) {
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = n[0];
      g.gain.setValueAtTime(0.0001, t0 + n[1]); g.gain.exponentialRampToValueAtTime(vol, t0 + n[1] + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + n[1] + n[2]);
      o.connect(g); g.connect(actx.destination); o.start(t0 + n[1]); o.stop(t0 + n[1] + n[2] + 0.05);
    });
  }
  /* PC 설치 프로그램(노블 메신저.exe)과 연결 */
  var ND = window.nobleDesktop || null;
  /* Windows 알림 클릭: 좁은 창이면 그 채팅방을 새 작은 창으로, 넓은 창이면 이 창에서 열기 */
  if (ND && ND.onOpen) ND.onOpen(function (hash, mode) {
    if (!hash) { if (ND.focusMain) ND.focusMain(); return; }
    if (mode === 'here') { location.hash = hash; return; }   // 1.0.5+: 프로그램이 '메신저 창에서 열기'로 보냄
    var rm = /^#room\/([^/]+)/.exec(hash);
    if (rm) { openRoomWindow(rm[1]); return; }   // 채팅 알림은 항상 새 작은 창
    if (ND.focusMain) ND.focusMain();
    location.hash = hash;
  });
  function deskNotify(title, body, hash, extra) {
    if (!ND) return false;
    var o = { title: title, body: body, hash: hash, silent: soundOn() };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    ND.notify(o);
    return true;
  }

  /* 프로필 사진 크게 보기 */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.avatar[data-uid]');
    if (!a || a.closest('.room-item') || a.closest('.mention-box') || a.closest('.pick') || a.closest('.pv') || a.closest('[data-edit]') || a.closest('[data-dm]')) return;
    e.preventDefault(); e.stopPropagation();
    profileView(a.getAttribute('data-uid'));
  }, true);
  function profileView(uid) {
    var p = S.profiles[uid]; if (!p) return;
    var label = [p.clinic, p.dept, p.title].filter(function (x) { return x && x !== '공통'; }).join(' · ');
    var m = document.createElement('div'); m.className = 'modal pv-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', p.name + ' 프로필');
    m.innerHTML = '<div class="pv"><button class="pv-x" data-close aria-label="닫기">' + svg('x') + '</button>' +
      (p.avatar_url ? '<img class="pv-img" src="' + esc(p.avatar_url) + '" alt="' + esc(p.name) + ' 프로필 사진">' : '<div class="pv-ini">' + esc(initial(p.name)) + '</div>') +
      '<div class="pv-info"><b>' + esc(p.name) + (p.id === S.me.id ? ' (나)' : '') + '</b><span>' + esc(label || '') + '</span></div>' +
      '<div class="pv-btns">' + (p.id !== S.me.id ? '<button class="btn btn-gold" id="pvDm">1:1 대화</button>' : '<button class="btn btn-gold" id="pvSet">프로필 사진 바꾸기</button>') +
      (S.me.role === 'admin' ? '<button class="btn btn-line" id="pvEdit">직원 정보 수정</button>' : '') + '</div></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) m.remove(); });
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); m.remove(); } });
    setTimeout(function () { var x = $('.pv-x', m); if (x) x.focus(); }, 30);
    var dm = $('#pvDm', m); if (dm) dm.onclick = function () { m.remove(); sb.rpc('start_dm', { other: uid }).then(function (r) { if (r.error) { toast(esc(errMsg(r.error))); return; } loadRooms().then(function () { location.hash = '#room/' + r.data; }); }); };
    var pe = $('#pvEdit', m); if (pe) pe.onclick = function () { m.remove(); userSheet(S.profiles[uid]); };
    var st = $('#pvSet', m); if (st) st.onclick = function () { m.remove(); location.hash = '#settings'; };
  }
  function errMsg(e) {
    var m = (e && (e.message || e.error_description || e.error)) || String(e);
    if (/Invalid login/i.test(m)) return '아이디 또는 비밀번호가 맞지 않습니다.';
    if (/banned/i.test(m)) return '사용이 정지된 계정입니다. 관리자에게 문의해 주세요.';
    if (/Failed to fetch|NetworkError/i.test(m)) return '인터넷 연결을 확인해 주세요.';
    return m;
  }

  /* ---------------- 설정 확인 ---------------- */
  if (!CFG.url || !CFG.anonKey) {
    root.innerHTML = '<div class="login"><div class="login-card"><div class="login-brand"><img src="logo.svg" alt=""><div><b>노블 메신저</b><span>설정이 필요합니다</span></div></div>' +
      '<p class="muted">messenger/config.js 파일에 Supabase 주소(url)와 공개 키(anonKey)를 넣으면 사용할 수 있습니다. 설치 가이드를 확인해 주세요.</p></div></div>';
    return;
  }
  var sb = window.supabase.createClient(CFG.url, CFG.anonKey, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'noble-msg-auth' } });

  /* ---------------- 상태 ---------------- */
  var S = {
    me: null, profiles: {}, rooms: [], notices: [], noticeReads: {}, pendingCount: 0, wPend: [], wPendOk: false, wPendErr: '', wPendSeq: 0,
    route: { tab: 'chats', id: null }, room: null, members: {}, messages: [], oldestLoaded: null, hasOlder: false,
    urlCache: {}, channel: null, rChannel: null, rsv: null, solo: false, polls: {}, pollSel: {}, pollLoading: {}, imgSize: {}, replyTo: null, reacts: {}, replyCache: {}, workTab: 'att', att: null, ipReqs: [], ipHist: [], queue: [], qDone: [], qErr: '', qLoaded: false, qStale: false, qWatch: null, qOpenDone: false, qSig: '', attWatch: null, attMonth: ymd(new Date()).slice(0, 7), attDay: ymd(new Date()), attView: 'mine', adminMonth: ymd(new Date()).slice(0, 7), adminStatus: '전체', staffQuery: ''
  };

  /* ---------------- 로그인 ---------------- */
  function joinCode() { var m = /^#join\/([\w-]+)/.exec(location.hash); return m ? m[1] : ''; }
  function renderLogin(msg) {
    if (joinCode() && !msg) { renderJoin(); return; }
    root.innerHTML = '<main class="login"><form class="login-card" id="loginForm" novalidate>' +
      '<div class="login-brand"><img src="logo.svg" alt=""><div><b>노블 메신저</b><span>노블365의원 · 노블경희한의원</span></div></div>' +
      '<div class="field"><label for="lid">아이디</label><input class="input" id="lid" autocomplete="username" autocapitalize="off" spellcheck="false" required></div>' +
      '<div class="field"><label for="lpw">비밀번호</label><input class="input" id="lpw" type="password" autocomplete="current-password" required></div>' +
      '<p class="err" id="lerr">' + esc(msg || '') + '</p>' +
      '<button class="btn btn-navy block" id="lbtn">로그인</button>' +
      '<p class="muted small" style="margin-top:14px;text-align:center">처음이신가요? 관리자에게 받은 <b>가입 링크</b>로 가입해 주세요.</p></form></main>';
    $('#loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var id = $('#lid').value.trim().toLowerCase(), pw = $('#lpw').value;
      if (!id || !pw) { $('#lerr').textContent = '아이디와 비밀번호를 입력해 주세요.'; return; }
      $('#lbtn').disabled = true; $('#lbtn').textContent = '로그인 중…';
      sb.auth.signInWithPassword({ email: id + '@' + EMAIL_DOMAIN, password: pw }).then(function (r) {
        if (r.error) throw r.error;
        return boot();
      }).catch(function (er) { $('#lerr').textContent = errMsg(er); $('#lbtn').disabled = false; $('#lbtn').textContent = '로그인'; });
    });
    setTimeout(function () { var i = $('#lid'); if (i) i.focus(); }, 50);
  }

  function renderJoin(done) {
    var code = joinCode();
    if (done) {
      root.innerHTML = '<main class="login"><div class="login-card"><div class="login-brand"><img src="logo.svg" alt=""><div><b>가입 신청 완료</b><span>노블 메신저</span></div></div>' +
        '<p style="margin-bottom:16px">관리자가 승인하면 바로 로그인할 수 있습니다. 승인까지 잠시 기다려 주세요.</p><a class="btn btn-navy block" href="#">로그인 화면으로</a></div></main>';
      return;
    }
    root.innerHTML = '<main class="login"><form class="login-card" id="joinForm" novalidate>' +
      '<div class="login-brand"><img src="logo.svg" alt=""><div><b>노블 메신저 가입</b><span>노블365의원 · 노블경희한의원 직원용</span></div></div>' +
      '<div class="row2"><div class="field"><label for="jn">이름</label><input class="input" id="jn" autocomplete="name"></div>' +
      '<div class="field"><label for="jc">소속</label><select class="input" id="jc"><option>노블365의원</option><option>노블경희한의원</option><option>공통</option></select></div></div>' +
      '<div class="row2"><div class="field"><label for="jd">부서</label><input class="input" id="jd" placeholder="예: 원무, 간호"></div>' +
      '<div class="field"><label for="jt">직책 <span class="muted">(선택)</span></label><input class="input" id="jt" placeholder="예: 실장"></div></div>' +
      '<div class="field"><label for="ji">사용할 아이디 <span class="muted">(메일주소 아님)</span></label><input class="input" id="ji" autocomplete="username" autocapitalize="off" spellcheck="false" placeholder="영문 소문자·숫자 3자 이상 (예: hong01) · @ 넣지 마세요"></div>' +
      '<div class="row2"><div class="field"><label for="jp">비밀번호</label><input class="input" id="jp" type="password" autocomplete="new-password" placeholder="8자 이상"></div>' +
      '<div class="field"><label for="jp2">비밀번호 확인</label><input class="input" id="jp2" type="password" autocomplete="new-password"></div></div>' +
      '<p class="err" id="jerr"></p><button class="btn btn-navy block" id="jbtn">가입 신청</button>' +
      '<p class="muted small" style="margin-top:14px;text-align:center">이미 계정이 있으면 <a href="#" style="text-decoration:underline">로그인</a></p></form></main>';
    $('#joinForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var body = { code: code, name: $('#jn').value.trim(), clinic: $('#jc').value, dept: $('#jd').value.trim(), title: $('#jt').value.trim(),
        login_id: $('#ji').value.trim().toLowerCase(), password: $('#jp').value };
      var er = $('#jerr');
      if (!body.name) { er.textContent = '이름을 입력해 주세요.'; return; }
      if (!/^[a-z0-9._-]{3,30}$/.test(body.login_id)) { er.textContent = /@/.test(body.login_id) ? '아이디는 메일주소가 아닙니다. @ 없이 영문 소문자·숫자로 정해 주세요. (예: hong01)' : '아이디는 영문 소문자·숫자 3자 이상으로 입력해 주세요.'; return; }
      if (body.password.length < 8) { er.textContent = '비밀번호는 8자 이상이어야 합니다.'; return; }
      if (body.password !== $('#jp2').value) { er.textContent = '두 비밀번호가 다릅니다.'; return; }
      $('#jbtn').disabled = true; $('#jbtn').textContent = '신청 중…'; er.textContent = '';
      sb.functions.invoke('signup', { body: body }).then(function (r) {
        if (r.error) { var ctx = r.error.context; if (ctx && ctx.json) return ctx.json().then(function (j) { throw new Error(j.error || r.error.message); }); throw r.error; }
        if (r.data && r.data.error) throw new Error(r.data.error);
        renderJoin(true);
      }).catch(function (x) { er.textContent = errMsg(x); $('#jbtn').disabled = false; $('#jbtn').textContent = '가입 신청'; });
    });
  }
  window.addEventListener('hashchange', function () { if (!S.me && root.querySelector('.login')) renderLogin(); });

  /* ---------------- 시작 ---------------- */
  function boot() {
    return sb.auth.getSession().then(function (r) {
      var ses = r.data && r.data.session;
      if (!ses) { renderLogin(); return; }
      return sb.from('profiles').select('*').order('name').then(function (p) {
        if (p.error) throw p.error;
        S.profiles = {}; (p.data || []).forEach(function (x) { S.profiles[x.id] = x; });
        S.me = S.profiles[ses.user.id];
        if (!S.me || !S.me.active) {
          return sb.rpc('my_status').then(function (st) {
            var row = st.data && st.data[0];
            var msg = row && row.pending ? '가입 승인을 기다리고 있습니다. 관리자가 승인하면 로그인할 수 있습니다.' : '사용이 정지된 계정입니다. 관리자에게 문의해 주세요.';
            return sb.auth.signOut().then(function () { renderLogin(msg); });
          });
        }
        if (/^#join/.test(location.hash)) location.hash = '#chats';
        draftPrune();
        renderShell();
        subscribeRealtime(); checkPush();
        return Promise.all([loadRooms(), loadNotices(), loadPending(), loadIpReqs(), loadQueue()]).then(function () { route(); });
      });
    }).catch(function (e) { renderLogin(errMsg(e)); });
  }

  /* ---------------- 화면 틀 ---------------- */
  var TABS = [['chats', '채팅', 'chat'], ['queue', '순서표', 'queue'], ['rsv', '예약', 'calendar'], ['notices', '공지', 'bell'], ['work', '근무신청', 'clock'], ['staff', '직원', 'users'], ['settings', '설정', 'gear']];
  function renderShell() {
    var tabs = TABS.slice(); if (S.me.role === 'admin') tabs.splice(tabs.length - 1, 0, ['admin', '관리', 'shield']);
    root.innerHTML = '<div class="app" id="app"><nav class="rail" aria-label="메뉴"><img class="logo" src="logo.svg" alt="노블">' +
      tabs.map(function (t) { return '<a class="tab" href="#' + t[0] + '" data-tab="' + t[0] + '">' + svg(t[2]) + '<span>' + t[1] + '</span><span class="badge" data-badge="' + t[0] + '" hidden></span></a>'; }).join('') +
      '<div class="spacer"></div></nav>' +
      '<section class="list-pane" id="list"></section><section class="main-pane" id="main"></section>' +
      '<aside class="queue-pane" id="qpane" aria-label="진료순서표" hidden></aside></div>';
  }
  function setBadges() {
    var chat = S.rooms.reduce(function (a, r) { return a + (r.muted ? 0 : r.unread); }, 0);
    var nt = S.notices.filter(function (n) { return !S.noticeReads[n.id]; }).length;
    var signups = S.me.role === 'admin' ? Object.keys(S.profiles).filter(function (k) { return S.profiles[k].pending; }).length : 0;
    var wp = S.me.role === 'admin' ? S.pendingCount : 0, ip = (S.ipReqs || []).length;   // 근무신청 승인 대기 · 출퇴근 주소 요청
    var map = { chats: chat, queue: qPending().length, notices: nt, admin: wp + signups, work: wp + ip };
    var why = { work: [wp && '근무신청 승인 대기 ' + wp + '건', ip && '출퇴근 주소 요청 ' + ip + '건'], admin: [wp && '근무신청 승인 대기 ' + wp + '건', signups && '가입 승인 대기 ' + signups + '명'] };   // 숫자에 마우스를 올리면 계산 내역
    $$('[data-badge]').forEach(function (b) {
      var k = b.getAttribute('data-badge'), v = map[k] || 0, tip = v && why[k] ? why[k].filter(Boolean).join(' + ') : '';
      b.hidden = !v; b.textContent = v > 99 ? '99+' : v;
      if (tip) b.title = tip; else b.removeAttribute('title');
    });
    syncWorkTabs();
    if (ND && ND.setBadge) ND.setBadge(chat + nt);
    try { if (navigator.setAppBadge) { var tot = chat + nt; tot ? navigator.setAppBadge(tot) : navigator.clearAppBadge(); } } catch (e) {}
  }

  /* 근무신청 화면 탭 이름의 숫자: "전체 관리 (승인 대기 건수)" · "출퇴근 (주소 요청 건수)". 숫자가 바뀔 때마다 setBadges 가 글자만 바꿔 줌(탭을 새로 그리지 않음) */
  function wtLabel(t) { var n = t === 'all' ? S.pendingCount : (S.ipReqs || []).length; return (t === 'all' ? '전체 관리' : '출퇴근') + (n ? ' (' + n + ')' : ''); }
  function syncWorkTabs() {
    $$('[data-wt="all"], [data-wt="att"]').forEach(function (b) { var t = wtLabel(b.getAttribute('data-wt')); if (b.textContent !== t) b.textContent = t; });
    var gp = $('#goPend'); if (gp) { if (S.pendingCount) gp.textContent = '근무신청 대기 ' + S.pendingCount + '건'; else gp.remove(); }   // 관리 탭의 "근무신청 대기 N건" 링크
  }

  /* ---------------- 라우팅 ---------------- */
  /* ---------- 대화방 자동 열기 ----------
     넓은 창(왼쪽 목록 + 오른쪽 대화)에서 채팅 탭을 열거나 메신저를 다시 켜면 "대화를 선택해 주세요" 대신 방을 바로 엶:
     마지막으로 본 방 → 없으면 '노블365' 단톡방. (좁은 창·휴대폰·새 창은 예전 그대로) 설정에서 '노블365 단톡방만'·'열지 않기' 선택 가능 */
  function autoMode() { var v = lsGet('noble-auto-room'); return v === 'group' || v === 'off' ? v : 'last'; }
  function lastRoomKey() { return 'noble-last-room-' + S.me.id; }   // 직원별로 따로 기억 (같은 PC를 여러 명이 써도 섞이지 않게)
  function hasRoom(id) { return !!id && S.rooms.some(function (r) { return r.id === id; }); }
  function groupRoomId() {   // 이름이 '노블365'로 시작하는 단체방: 이름이 정확히 '노블365' → 상단 고정 → 인원 많은 순
    var nm = function (r) { return String(r.name || '').replace(/\s+/g, ''); };
    var c = S.rooms.filter(function (r) { return r.type === 'group' && /^노블365/.test(nm(r)); });
    var exact = function (r) { return nm(r) === '노블365' ? 1 : 0; };
    c.sort(function (a, b) { return exact(b) - exact(a) || (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.member_count || 0) - (a.member_count || 0); });
    return c.length ? c[0].id : null;
  }
  function autoRoomOn() { return (!NARROW.matches || qMode() === 'q3') && autoMode() !== 'off'; }   // 폰·태블릿 가로(띠 + 채팅방 + 순서표)도 방이 늘 열려 있어야 함
  function autoRoomId() {
    if (!autoRoomOn()) return null;
    var last = lsGet(lastRoomKey()), grp = groupRoomId();
    if (autoMode() === 'group') return grp || (hasRoom(last) ? last : null);
    return hasRoom(last) ? last : grp;
  }
  window.addEventListener('hashchange', route);
  function route() {
    if (!S.me) return;
    var h = location.hash.replace(/^#/, '') || 'chats';
    if (h === 'chats') {   // 주소를 그 방으로 덮어써서(뒤로 가기 기록이 늘지 않음) 방 나가기·알림 판단이 어긋나지 않게
      var auto = autoRoomId();
      if (auto) { try { history.replaceState(null, '', '#room/' + auto); } catch (e) { location.replace('#room/' + auto); return; } h = 'room/' + auto; }
    }
    var parts = h.split('/');
    var tab = parts[0], id = parts[1] || null;
    /* v49: 예약(rsv) 탭도 새 창(solo)으로 띄울 수 있게 queue와 같은 방식으로 추가 */
    S.solo = (tab === 'room' && parts[2] === 'solo') || (tab === 'queue' && parts[1] === 'solo') || (tab === 'rsv' && parts[1] === 'solo');
    if (tab === 'room') { S.route = { tab: 'chats', id: id }; }
    else if (tab === 'notice') { S.route = { tab: 'notices', id: id }; }
    else { S.route = { tab: tab, id: null }; }
    var app = $('#app'); if (!app) return;
    $$('.tab').forEach(function (t) { if (t.getAttribute('data-tab') === S.route.tab) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    app.classList.remove('in-detail', 'in-room', 'single');
    app.classList.toggle('solo', S.solo);
    layoutSync();   // 큰 화면/가로 화면이면 채팅 탭에서만 오른쪽에 순서표 칸 (화면을 그리기 전에 맞춰 순서표 본문이 두 곳에 생기지 않게)
    if (S.route.tab !== 'chats' || !S.route.id) leaveRoom();
    if (S.route.tab !== 'rsv') rsvLeave();   // 예약 화면의 타이머·이벤트 정리
    switch (S.route.tab) {
      case 'chats': renderRoomList(); if (S.route.id) { app.classList.add('in-detail', 'in-room'); openRoom(S.route.id); } else renderPlaceholder('대화를 선택해 주세요'); break;
      case 'notices': renderNoticeList(); if (S.route.id) { app.classList.add('in-detail'); openNotice(+S.route.id); } else renderPlaceholder('공지를 선택해 주세요'); break;
      case 'queue': single(); renderQueue(); break;
      case 'rsv': single(); renderRsv(); break;
      case 'work': single(); renderWork(); break;
      case 'staff': single(); renderStaff(); break;
      case 'admin': single(); if (S.me.role === 'admin') renderAdmin(); break;
      case 'settings': single(); renderSettings(); break;
      default: location.hash = '#chats';
    }
    setBadges();
  }
  /* ---------- 화면 배치: 큰 화면 4단 / 폰·태블릿 가로 3단 ----------
     q4 = 폭 1200px 이상: 메뉴 | 채팅방 목록 | 채팅방 | 순서표
     q3 = 터치 기기를 가로로 둔 폭 640~1199px: 메뉴 | 방 아이콘 띠 | 채팅방 | 순서표
     순서표 칸(#qpane)은 채팅 탭에서만 보임. 새 창(solo)·작은 PC 창·세로 화면은 예전 그대로 */
  function qMode() {
    if (S.solo) return '';
    if (QUAD.matches) return 'q4';
    return LANDSCAPE.matches && W640.matches && !DESKTOP.matches ? 'q3' : '';
  }
  function layoutSync() {
    var app = $('#app'), pane = $('#qpane'); if (!app || !pane) return;
    var m = qMode(), on = !!m && !!S.route && S.route.tab === 'chats';
    if (m) app.setAttribute('data-lay', m); else app.removeAttribute('data-lay');
    app.classList.toggle('has-q', on);
    if (on) { pane.hidden = false; if (!$('#qbody', pane)) renderQueue(pane); }   // 이미 그려져 있으면 그대로 (방을 옮길 때 깜빡이거나 서버를 다시 부르지 않게)
    else { if (pane.firstChild) pane.innerHTML = ''; pane.hidden = true; }
  }
  /* 창 크기·방향이 바뀔 때: 방이 안 열린 채팅 탭이면 route()(마지막 방 열기·목록 다시 그림), 아니면 배치만 맞춤 — 열려 있는 대화방은 다시 불러오지 않음 */
  function onLayoutChange() {
    if (!S.me || !$('#app') || !S.route) return;
    if (S.route.tab === 'chats' && !S.route.id && (!NARROW.matches || qMode() === 'q3')) { route(); return; }
    layoutSync();
    if (S.route.tab === 'rsv') rsvLayout();   // 예약 달력: 좁은 화면 ↔ 넓은 화면 (날짜 띠·글자)
    if (S.route.tab === 'chats' && $('#roomQ') && (qMode() === 'q3') !== !!S.stripOn) renderRoomList();   // 띠 ↔ 목록 모양이 바뀌면 목록만 다시 그림 (열려 있는 대화방은 그대로)
  }
  [NARROW, QUAD, LANDSCAPE, W640].forEach(function (mq) { if (mq.addEventListener) mq.addEventListener('change', onLayoutChange); else if (mq.addListener) mq.addListener(onLayoutChange); });
  function single() { var a = $('#app'); a.classList.add('in-detail', 'single'); $('#list').hidden = true; $('#main').hidden = false; }
  function unsingle() { $('#list').hidden = false; $('#main').hidden = false; }
  function renderPlaceholder(t) { $('#main').innerHTML = '<div class="empty" style="margin:auto">' + esc(t) + '</div>'; $('#main').style.justifyContent = 'center'; }
  function header(title, opts) {
    opts = opts || {};
    return '<header class="pane-hd">' + (opts.back ? '<a class="icon-btn back" href="' + opts.back + '" aria-label="뒤로">' + svg('back') + '</a>' : '') +
      '<h1>' + title + '</h1>' + (opts.right || '') + '</header>';
  }

  /* ================= 채팅 ================= */
  function loadRooms() {
    return sb.rpc('my_rooms').then(function (r) {
      if (r.error) throw r.error; S.rooms = r.data || []; setBadges();
      if (S.room) { var i = S.rooms.find(function (x) { return x.id === S.room.id; }); if (i) { S.room.info = i; renderRoomNotice(); } }
      if (S.solo && S.room && S.room.info) document.title = S.room.info.name + ' · 노블 메신저';
    });
  }
  var roomsTimer = null;
  function refreshRooms() { clearTimeout(roomsTimer); roomsTimer = setTimeout(function () { loadRooms().then(function () { if (S.route.tab === 'chats') renderRoomList(); }); }, 250); }

  /* 단체방 사진 색: 방 고유 번호를 섞어(해시) 12색 중 하나를 기본으로 고르고, 내 방들 사이에서 이미 쓰인 색이면 다음 빈 색으로 (12개까지는 겹치지 않음).
     방 번호 순서대로 정하므로 목록 순서·검색·이름 바꾸기와 상관없이 같은 방은 같은 색 */
  var TONES = 12;
  function hashId(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function roomTones() {
    var used = {}, map = {};
    S.rooms.filter(function (r) { return r.type === 'group'; }).map(function (r) { return String(r.id); }).sort().forEach(function (id) {
      var base = hashId(id) % TONES, t = base, k = 0;
      while (used[t] && k < TONES) { t = (t + 1) % TONES; k++; }
      if (k === TONES) t = base;   // 12색이 다 찼으면(방이 13개 이상) 기본 색을 다시 씀
      used[t] = true; map[id] = t;
    });
    return map;
  }
  /* 단체방 사진 = 방 이름 글자 (네모 안에 다 보이게 길이에 따라 글씨 크기 조절) */
  function grpFace(name, tone) {
    var n = String(name || '#').replace(/\s+/g, ' ').trim(), len = n.replace(/ /g, '').length;
    var cls = len <= 2 ? 'g1' : len <= 4 ? 'g2' : len <= 6 ? 'g3' : len <= 9 ? 'g4' : 'g5';
    var html = esc(n);
    if (n.indexOf(' ') < 0 && len >= 4) {   // 띄어쓰기 없는 이름은 보기 좋게 두 줄로 나눔 (한글/숫자 경계 우선)
      var mid = Math.ceil(len / 2), cut = mid, chars = Array.from(n);
      var kind = function (c) { return /[가-힣]/.test(c) ? 'k' : /[0-9]/.test(c) ? 'd' : 'o'; };
      [mid, mid - 1, mid + 1].some(function (i) { if (i > 0 && i < chars.length && kind(chars[i - 1]) !== kind(chars[i])) { cut = i; return true; } });
      html = esc(chars.slice(0, cut).join('')) + '<br>' + esc(chars.slice(cut).join(''));
    }
    return '<span class="avatar grp gname ' + cls + (tone == null ? '' : ' t' + tone) + '" aria-hidden="true"><span>' + html + '</span></span>';
  }
  function renderRoomList() {
    unsingle(); $('#main').style.justifyContent = '';
    var strip = qMode() === 'q3', ob = $('#list .pane-body'), keepTop = strip && S.stripOn && ob ? ob.scrollTop : 0; S.stripOn = strip;   // 폰·태블릿 가로: 목록이 아이콘 띠(검색칸 숨김) → 검색어는 무시하되 값은 보관(세로로 돌리면 다시 적용)
    var q = strip ? '' : (S.roomQuery || '').trim();
    var list = S.rooms.filter(function (r) { return !q || (r.name || '').indexOf(q) > -1; });
    var tones = roomTones();   // 걸러진 목록(list)이 아니라 전체 방 기준 — 검색해도 색이 바뀌지 않게
    $('#list').innerHTML = header('채팅', { right: '<button class="ra-btn" id="readAll" type="button" title="안 읽은 대화를 모두 읽음으로 표시" aria-label="모두 읽음"' + (S.rooms.some(function (r) { return r.unread > 0; }) ? '' : ' disabled') + '>' + svg('checkall') + '<span>모두 읽음</span></button><button class="icon-btn" id="newChat" aria-label="새 대화">' + svg('plus') + '</button>' }) +
      '<div class="search">' + svg('search') + '<input id="roomQ" placeholder="대화방·메시지 검색" value="' + esc(q) + '" aria-label="대화방·메시지 검색"></div><div id="pushAsk"></div><div id="attNudge"></div>' +
      '<div class="pane-body">' + (q && list.length ? '<div class="group-hd">대화방</div>' : '') + (list.length ? list.map(function (r) {
        var grp = r.type === 'group';
        var face = grp ? grpFace(r.name, tones[String(r.id)]) : r.type === 'self' ? av(S.me, 'me') : av(S.profiles[r.other_id] || { name: r.name });
        var rn = r.name == null ? '' : String(r.name);
        // 띠에서는 글자가 안 보이므로 방 이름·안 읽은 수를 라벨로 (목록 모양에서는 마지막 메시지가 읽히도록 라벨을 달지 않음)
        var sa = strip ? ' title="' + esc(rn) + '" aria-label="' + esc(rn + (r.unread ? ' · 안 읽은 메시지 ' + (r.unread > 99 ? '99개 이상' : r.unread + '개') : '')) + '"' : '';
        return '<a class="room-item' + (r.pinned ? ' pinned' : '') + (r.muted ? ' is-muted' : '') + '" href="#room/' + r.id + '" data-room="' + r.id + '"' + (S.route.id === r.id ? ' aria-current="true"' : '') + sa + '>' + face +
          '<span class="ri-main"><span class="ri-top"><b>' + (r.pinned ? '<svg class="pin-ico" viewBox="0 0 24 24">' + IC.pin + '</svg>' : '') + esc(r.name) + (r.type === 'dm' && pTag(S.profiles[r.other_id]) ? '<span class="who-tag">' + esc(pTag(S.profiles[r.other_id])) + '</span>' : '') + (grp ? '<small>' + r.member_count + '</small>' : '') + (r.muted ? ' <svg class="mute-ico" viewBox="0 0 24 24">' + IC.mute + '</svg>' : '') + '</b><time>' + (r.last_body != null ? shortTime(r.last_message_at) : '') + '</time></span>' +
          '<span class="ri-bot"><p>' + esc(r.last_body == null ? '새 대화방' : (grp && r.last_sender ? r.last_sender + ': ' : '') + r.last_body) + '</p>' + (r.unread ? '<span class="badge">' + (r.unread > 99 ? '99+' : r.unread) + '</span>' : '') + '</span></span></a>';
      }).join('') : (q ? '' : '<p class="empty">아직 대화가 없습니다.<br>오른쪽 위 + 버튼으로 대화를 시작하세요.</p>')) +
      (q ? '<div id="msgResults">' + msgResultsHtml(q) + '</div>' : '') + '</div>';
    $('#newChat').onclick = newChatSheet;
    $('#readAll').onclick = readAllRooms;
    $$('[data-room]').forEach(function (a) {
      /* PC: 한 번 클릭 = 이 창에서 열기, 더블클릭 = 새 창으로 열기 */
      if (DESKTOP.matches) {
        var ct = null;
        a.addEventListener('click', function (e) {
          if (e.ctrlKey || e.metaKey || e.shiftKey) return;
          e.preventDefault();
          clearTimeout(ct);
          // 좁은 창(목록만 보이는 창): 카카오워크처럼 한 번 클릭은 선택만, 더블클릭해야 새 창으로 열림
          if (NARROW.matches) {
            $$('.room-item.sel').forEach(function (x) { x.classList.remove('sel'); });
            a.classList.add('sel'); S.selRoom = a.getAttribute('data-room'); a.focus();
            return;
          }
          ct = setTimeout(function () { location.hash = '#room/' + a.getAttribute('data-room'); }, 230);
        });
        a.addEventListener('dblclick', function (e) { e.preventDefault(); clearTimeout(ct); openRoomWindow(a.getAttribute('data-room')); });
      }
      if (S.selRoom === a.getAttribute('data-room')) a.classList.add('sel');
      a.addEventListener('keydown', function (e) { if (e.key === 'Enter' && DESKTOP.matches && NARROW.matches) { e.preventDefault(); openRoomWindow(a.getAttribute('data-room')); } });
      a.addEventListener('contextmenu', function (e) { e.preventDefault(); roomQuickSheet(S.rooms.find(function (x) { return x.id === a.getAttribute('data-room'); })); });
      longPress(a, function () { roomQuickSheet(S.rooms.find(function (x) { return x.id === a.getAttribute('data-room'); })); });
    });
    /* v49 버그 수정: 글자마다 목록을 다시 그리며 입력창(#roomQ)을 새로 만들어서, 한글 입력 중(조합 중)에 자음이 겹쳐 눌리는 문제가 있었음.
       조합이 끝난 뒤에만 다시 그리도록 고침 (영문·숫자는 조합이 없어 예전처럼 바로 반영됨) */
    var qi = $('#roomQ'), roomQComposing = false;
    function roomQApply() { S.roomQuery = qi.value; var pos = qi.selectionStart; renderRoomList(); var n = $('#roomQ'); n.focus(); n.setSelectionRange(pos, pos); }
    qi.addEventListener('compositionstart', function () { roomQComposing = true; });
    qi.addEventListener('compositionend', function () { roomQComposing = false; roomQApply(); });
    qi.oninput = function () { if (roomQComposing) { S.roomQuery = qi.value; return; } roomQApply(); };
    if (q.length >= 2 && (!S.msgSearch || S.msgSearch.q !== q)) searchAllMessages(q);
    renderPushAsk();
    if (S.att && (S.att.error || S.att.today === ymd(new Date()))) renderAttNudge(); else if ((S.profiles[S.me.id] || S.me).att_enabled && (DESKTOP.matches || (S.profiles[S.me.id] || S.me).mobile_punch) && !S.attLoading) { S.attLoading = true; attLoad().then(function () { S.attLoading = false; renderAttNudge(); }); } else renderAttNudge();
    wireMsgResults();
    if (strip) keepStripView(keepTop);
  }
  /* 채팅방 목록 맨 위 "모두 읽음": 안 읽은 대화(알림 끈 방 포함) 전부를 내 읽은 시각만 갱신해 한 번에 처리.
     서버가 거절하면 화면은 그대로 두고 안내만. 성공하면 배지를 0으로 한 뒤 서버 기준으로 다시 맞춤(시계 오차로 서버가 아직 안 읽음이라 하면 배지가 돌아옴) */
  function readAllRooms() {
    var rs = S.rooms.filter(function (r) { return r.unread > 0; }); if (!rs.length) return;
    var total = rs.reduce(function (a, r) { return a + r.unread; }, 0), muted = rs.filter(function (r) { return r.muted; }).length;
    var m = sheet('모두 읽음',
      '<p style="margin:0 0 6px;line-height:1.6">안 읽은 대화 <b>' + rs.length + '개</b>(메시지 ' + total + '개)를 모두 읽은 것으로 표시할까요?</p>' +
      '<p class="muted small" style="margin:0 0 14px;line-height:1.6">' + (muted ? '알림을 끈 방(' + muted + '개)도 포함되고, ' : '') + '보낸 사람에게도 읽음으로 보입니다.</p>' +
      '<div style="display:grid;gap:8px"><button class="btn btn-navy" id="raGo">모두 읽음으로 표시</button><button class="btn btn-line" data-close>취소</button></div>');
    var go = $('#raGo', m);
    go.onclick = function () {
      if (go.disabled) return; go.disabled = true; go.textContent = '처리 중…';   // 두 번 눌러도 요청은 1번
      var ids = rs.map(function (r) { return r.id; });
      var fail = function (e) { closeSheet(m); toast('<b>읽음 표시 실패</b> ' + esc(errMsg(e))); };
      sb.from('room_members').update({ last_read_at: new Date().toISOString() }).eq('user_id', S.me.id).in('room_id', ids).then(function (r) {
        if (r.error) { fail(r.error); return; }
        closeSheet(m);
        S.rooms.forEach(function (x) { if (ids.indexOf(x.id) > -1) x.unread = 0; });
        setBadges(); if (S.route.tab === 'chats') renderRoomList();
        toast('<b>읽음</b> 대화 ' + ids.length + '개를 읽은 것으로 표시했습니다');
        loadRooms().then(function () { if (S.route.tab === 'chats') renderRoomList(); }, function () {});
      }, fail);
    };
  }
  /* 아이콘 띠: 다시 그려도(방을 옮기거나 안 읽은 수가 바뀔 때) 보던 위치를 유지하고, 선택된 방이 띠 밖이면 보이는 곳까지만 스크롤 */
  function keepStripView(top) {
    var pb = $('#list .pane-body'); if (!pb) return;
    pb.scrollTop = top;
    var cur = $('.room-item[aria-current="true"]', pb); if (!cur) return;
    var p = pb.getBoundingClientRect(), c = cur.getBoundingClientRect();
    if (c.top < p.top) pb.scrollTop -= p.top - c.top + 8; else if (c.bottom > p.bottom) pb.scrollTop += c.bottom - p.bottom + 8;
  }

  /* ---------- 메시지 검색 ---------- */
  function likePat(q) { return '%' + q.replace(/[\\%_]/g, function (c) { return '\\' + c; }) + '%'; }
  function hl(text, q) {
    var h = esc(text); if (!q) return h;
    return h.replace(new RegExp(reRx(esc(q)), 'gi'), function (x) { return '<mark>' + x + '</mark>'; });
  }
  function around(body, q) {
    body = (body || '').replace(/\s+/g, ' ');
    var i = body.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0 || body.length <= 70) return body.slice(0, 90);
    var st = Math.max(0, i - 24); return (st ? '…' : '') + body.slice(st, st + 90);
  }
  function visibleHit(m) {
    var r = S.rooms.find(function (x) { return x.id === m.room_id; });
    return r && (!r.cleared_at || m.created_at > r.cleared_at);
  }
  var searchTimer = null;
  function searchAllMessages(q) {
    clearTimeout(searchTimer);
    S.msgSearch = { q: q, rows: null };
    searchTimer = setTimeout(function () {
      sb.from('messages').select('id, room_id, sender_id, body, created_at').ilike('body', likePat(q)).eq('deleted', false)
        .order('created_at', { ascending: false }).limit(60).then(function (r) {
          if (!S.msgSearch || S.msgSearch.q !== q) return;
          S.msgSearch.rows = (r.data || []).filter(visibleHit);
          var box = $('#msgResults'); if (box) { box.innerHTML = msgResultsHtml(q); wireMsgResults(); }
        });
    }, 300);
  }
  function msgResultsHtml(q) {
    if (q.length < 2) return '<p class="muted small" style="padding:12px 16px">메시지는 두 글자 이상 입력하면 검색됩니다.</p>';
    var ms = S.msgSearch && S.msgSearch.q === q ? S.msgSearch.rows : null;
    if (!ms) return '<div class="group-hd">메시지</div><p class="muted small" style="padding:12px 16px">검색 중…</p>';
    if (!ms.length) return '<div class="group-hd">메시지</div><p class="muted small" style="padding:12px 16px">"' + esc(q) + '"이(가) 들어간 메시지가 없습니다.</p>';
    /* v49b: 전체 채팅방 검색(사이드바 "메시지 N건" 목록)도 방 안 검색(.rs-day)과 같이 날짜별로 묶어서 표시 */
    var lastDay = '', items = '';
    ms.forEach(function (m) {
      var r = S.rooms.find(function (x) { return x.id === m.room_id; }) || {}, p = S.profiles[m.sender_id] || { name: '(퇴사자)' };
      var day = ymd(m.created_at);
      if (day !== lastDay) { items += '<div class="rs-day">' + dayLabel(m.created_at) + '</div>'; lastDay = day; }
      items += '<button class="hit" data-hit="' + m.id + '">' + av(p, 'sm') + '<span class="hit-main"><span class="hit-top"><b>' + esc(r.name || '') + '</b><time>' + hm(m.created_at) + '</time></span>' +
        '<span class="hit-body"><em>' + esc(p.name) + '</em> ' + hl(around(m.body, q), q) + '</span></span></button>';
    });
    return '<div class="group-hd">메시지 ' + ms.length + (ms.length >= 60 ? '+' : '') + '건</div>' + items;
  }
  function wireMsgResults() {
    $$('[data-hit]').forEach(function (b) {
      b.onclick = function () {
        var m = (S.msgSearch.rows || []).find(function (x) { return x.id === +b.getAttribute('data-hit'); }); if (!m) return;
        S.pendingJump = m;
        if (S.room && S.room.id === m.room_id && $('#msgs')) { S.pendingJump = null; S.searchQ = (S.roomQuery || '').trim(); renderMessages(false); jumpToMsg(m); }
        else location.hash = '#room/' + m.room_id;
      };
    });
  }
  /* 오래된 메시지도 찾아가기: 그 메시지 주변을 불러와서 이동 */
  function jumpToMsg(m) {
    if (S.messages.some(function (x) { return x.id === m.id; })) { jumpTo(m.id, S.searchQ); return; }
    var rid = S.room.id, cl = S.room.info && S.room.info.cleared_at;
    var bq = sb.from('messages').select('*').eq('room_id', rid).lt('created_at', m.created_at); if (cl) bq = bq.gt('created_at', cl);
    Promise.all([
      bq.order('created_at', { ascending: false }).limit(20),
      sb.from('messages').select('*').eq('room_id', rid).gte('created_at', m.created_at).order('created_at', { ascending: true }).limit(1000)
    ]).then(function (res) {
      if (!S.room || S.room.id !== rid) return;
      S.messages = (res[0].data || []).reverse().concat(res[1].data || []); S.hasOlder = (res[0].data || []).length === 20;
      renderMessages(false); setTimeout(function () { jumpTo(m.id, S.searchQ); }, 60);
    });
  }
  function roomSearchBar(forceOpen) {
    var bar = $('#roomSearch'); if (!bar) return;
    if (!bar.hidden) {
      if (forceOpen === true) { var q0 = $('#rsQ'); if (q0) { q0.focus(); q0.select(); } return; }   // Ctrl+F 를 또 눌렀을 때: 닫지 않고 쓰던 검색어를 선택
      bar.hidden = true; S.searchQ = ''; renderMessages(false); return;
    }
    bar.hidden = false;
    bar.innerHTML = '<div class="rs-in">' + svg('search') + '<input id="rsQ" placeholder="이 대화방에서 검색 (두 글자 이상)" aria-label="대화방 안에서 검색"><span class="rs-n" id="rsN" aria-live="polite"></span><button type="button" id="rsX" aria-label="검색 닫기">' + svg('x') + '</button></div><div class="rs-list" id="rsList" hidden></div>';
    var inp = $('#rsQ'), list = $('#rsList'), cnt = $('#rsN'), t = null;
    var hits = [], cur = -1, doneQ = null, runQ = null, want = 0;   // hits: 화면에 보이는 결과 목록(최근 → 과거 순) · cur: 지금 보고 있는 결과 · doneQ: 그 결과가 나온 검색어 · runQ: 마지막으로 검색을 시작한 검색어 · want: 검색이 끝나면 이동할 방향(Enter 1 · Shift+Enter -1)
    inp.focus();
    $('#rsX').onclick = function () { bar.hidden = true; S.searchQ = ''; renderMessages(false); };
    function go(i) {   // i번째 결과로 이동 (목록은 닫고 "3/12" 처럼 몇 번째인지 표시)
      cur = i; list.hidden = true; cnt.textContent = (i + 1) + '/' + hits.length + (hits.length >= 100 ? '+' : '');
      jumpToMsg(hits[i]);
    }
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); $('#rsX').click(); return; }
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (e.isComposing || e.keyCode === 229) return;   // 한글 조합을 확정하는 Enter 는 이동으로 치지 않음
      var q = inp.value.trim(), dir = e.shiftKey ? -1 : 1;
      if (q.length < 2) { clearTimeout(t); run(); return; }   // 한 글자 이하: 검색하지 않고 남아 있던 결과 목록만 닫음 (예전 Enter 동작 그대로)
      if (doneQ === q && runQ === q) { clearTimeout(t); if (hits.length) go(cur < 0 ? (dir > 0 ? 0 : hits.length - 1) : (cur + dir + hits.length) % hits.length); return; }   // Enter = 더 오래된 결과 · Shift+Enter = 더 최근 결과 (끝에서는 반대쪽 끝으로)
      want = dir; if (runQ !== q) { clearTimeout(t); run(); }   // 아직 검색 전이면 지금 바로 검색 → 끝나는 대로 이동
    });
    inp.addEventListener('input', function () { clearTimeout(t); cnt.textContent = ''; want = 0; t = setTimeout(run, 350); });   // 글자를 고치면 번호는 지우고 기다리던 이동은 취소 (화면에 남은 이전 결과 목록은 새 결과가 나올 때까지 그대로 눌러 쓸 수 있음)
    function run() {
      var q = inp.value.trim(); S.searchQ = q; runQ = q;
      if (q.length < 2) { list.hidden = true; renderMessages(false); return; }
      var rid = S.room.id, cl = S.room.info && S.room.info.cleared_at;
      var qq = sb.from('messages').select('id, room_id, sender_id, body, created_at').eq('room_id', rid).eq('deleted', false).ilike('body', likePat(q));
      if (cl) qq = qq.gt('created_at', cl);
      qq.order('created_at', { ascending: false }).limit(100).then(function (r) {
        if (!S.room || S.room.id !== rid || S.searchQ !== q) return;
        var rows = r.data || [];
        hits = rows; cur = -1; doneQ = q; cnt.textContent = '';
        list.hidden = false;
        /* ④ 날짜별 그룹 헤더 추가 (KakaoWork 스타일) */
        if (rows.length) {
          var lastDay = '', items = '';
          rows.forEach(function (m) {
            var day = ymd(m.created_at);
            if (day !== lastDay) {
              items += '<div class="rs-day">' + dayLabel(m.created_at) + '</div>';
              lastDay = day;
            }
            var p = S.profiles[m.sender_id] || { name: '(퇴사자)' };
            items += '<button data-rs="' + m.id + '"><b>' + esc(nameTag(p)) + '</b><time>' + hm(m.created_at) + '</time><span>' + hl(around(m.body, q), q) + '</span></button>';
          });
          list.innerHTML = '<p class="rs-count">' + rows.length + (rows.length >= 100 ? '+' : '') + '건</p>' + items;
        } else {
          list.innerHTML = '<p class="rs-count">검색 결과가 없습니다.</p>';
        }
        $$('[data-rs]', list).forEach(function (b) { b.onclick = function () { var m = rows.find(function (x) { return x.id === +b.getAttribute('data-rs'); }); go(rows.indexOf(m)); }; });
        renderMessages(false);
        if (want) { var d = want; want = 0; if (rows.length) go(d > 0 ? 0 : rows.length - 1); }   // Enter 로 시작한 검색이면 결과가 나오는 대로 이동
      });
    }
  }

  function others() { return Object.keys(S.profiles).map(function (k) { return S.profiles[k]; }).filter(function (p) { return p.active && p.id !== S.me.id; }); }
  /* 이름 옆 (부서 직위) */
  function pTag(p) { if (!p) return ''; var t = [p.dept, p.title].filter(function (x) { return x && x !== '공통'; }).join(' '); return t ? '(' + t + ')' : ''; }
  function nameTag(p) { return p ? (p.name || '') + pTag(p) : ''; }
  function personLabel(p) { return [p.clinic !== '공통' ? p.clinic.replace('노블', '') : '', p.dept, p.title].filter(Boolean).join(' · '); }

  function newChatSheet() {
    var list = others().sort(function (a, b) { return (a.dept + a.name).localeCompare(b.dept + b.name, 'ko'); });
    var m = sheet('새 대화', '<button class="btn btn-line block" id="selfChat" style="margin-bottom:14px">' + av(S.me, 'sm') + ' 나와의 채팅</button>' +
      '<div class="field"><label for="gname">단체방 이름 <span class="muted">(2명 이상 선택 시)</span></label><input class="input" id="gname" placeholder="예: 원무과, 물리치료실"></div>' +
      '<div class="search" style="margin:0 0 10px">' + svg('search') + '<input id="pq" placeholder="이름·부서 검색" aria-label="직원 검색"></div>' +
      '<div class="pick" id="pick">' + list.map(function (p) {
        return '<label data-s="' + esc(p.name + p.dept + p.clinic + p.title) + '"><input type="checkbox" value="' + p.id + '">' + av(p, 'sm') + '<span><b>' + esc(p.name) + '</b> <span class="muted small">' + esc(personLabel(p)) + '</span></span></label>';
      }).join('') + '</div><p class="err" id="nerr"></p>' +
      '<div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="startChat">대화 시작</button></div>');
    $('#selfChat', m).onclick = function () { closeSheet(m); openSelf(); };
    $('#pq', m).oninput = function () { var q = this.value.trim(); $$('#pick label', m).forEach(function (l) { l.hidden = q && l.getAttribute('data-s').indexOf(q) < 0; }); };
    $('#startChat', m).onclick = function () {
      var ids = $$('#pick input:checked', m).map(function (i) { return i.value; });
      if (!ids.length) { $('#nerr', m).textContent = '대화할 직원을 선택해 주세요.'; return; }
      var p;
      if (ids.length === 1) p = sb.rpc('start_dm', { other: ids[0] });
      else {
        var nm = $('#gname', m).value.trim() || ids.map(function (i) { return S.profiles[i].name; }).slice(0, 3).join(', ') + (ids.length > 3 ? ' 외' : '');
        p = sb.rpc('create_group', { room_name: nm, member_ids: ids });
      }
      this.disabled = true;
      p.then(function (r) { if (r.error) throw r.error; closeSheet(m); return loadRooms().then(function () { location.hash = '#room/' + r.data; }); })
        .catch(function (e) { $('#nerr', m).textContent = errMsg(e); $('#startChat', m).disabled = false; });
    };
  }

  /* ---------- 작성 중이던 글 보관 ----------
     입력창에 쓰던 글을 방마다·직원마다 따로 이 기기에 저장해 두었다가, 그 방을 다시 열면 이어서 쓸 수 있게 함
     (다른 방·다른 탭에 갔다 와도, 메신저를 껐다 켜도). 보내거나 다 지우거나 방을 나가면 삭제 · 14일이 지나면 자동 삭제 · 로그아웃하면 내 것 삭제(공용 PC) */
  var DRAFT_PRE = 'noble-draft-', DRAFT_MS = 14 * 864e5;
  function draftKey(rid) { return DRAFT_PRE + S.me.id + '-' + rid; }
  function draftRead(raw) {   // 저장된 값 → 쓰던 글 (비어 있거나 깨졌거나 14일이 지났으면 null)
    try { var o = JSON.parse(raw); return o && typeof o.t === 'string' && o.t.trim() && Date.now() - o.at < DRAFT_MS ? o.t : null; } catch (e) { return null; }
  }
  function draftGet(rid) { return draftRead(lsGet(draftKey(rid))); }
  function draftPut(rid, text) {   // 글이 있으면 저장 · 비었으면(공백만 있어도) 삭제 · 같은 글이면 다시 쓰지 않음(방을 열기만 해서 14일이 늘어나지 않게)
    var k = draftKey(rid);
    if (!text || !text.trim()) { if (lsGet(k) !== null) lsDel(k); return; }
    if (draftGet(rid) !== text) lsSet(k, JSON.stringify({ t: text, at: Date.now() }));
  }
  function draftDel(rid) { lsDel(draftKey(rid)); }
  function draftSweep(pick) {   // 조건에 맞는 보관 글을 모두 삭제
    try {
      var dead = [];
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(DRAFT_PRE) === 0 && pick(k, localStorage.getItem(k))) dead.push(k); }
      dead.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
  }
  function draftPrune() { draftSweep(function (k, raw) { return draftRead(raw) === null; }); }   // 시작할 때: 14일 지난 것·깨진 것 정리 (다른 직원 것 포함)
  function draftClearMine() { var mine = DRAFT_PRE + S.me.id + '-'; draftSweep(function (k) { return k.indexOf(mine) === 0; }); }   // 로그아웃할 때: 내 것 전부 삭제
  /* 전송에 실패하면 보내려던 글을 되돌려 놓음: 그 방이 열려 있으면 입력창 맨 앞에(쓰던 글이 있으면 그 앞에 붙여서), 다른 방으로 옮겼으면 그 방의 작성 중 글로 */
  function unsent(rid, body) {
    var t = S.room && S.room.id === rid ? $('#txt') : null;
    if (t) { t.value = t.value.trim() ? body + '\n' + t.value : body; t.dispatchEvent(new Event('input', { bubbles: true })); return; }
    var cur = draftGet(rid); draftPut(rid, cur ? body + '\n' + cur : body);
  }

  /* ---- 대화방 ---- */
  function leaveRoom() { if (reactPopEl) hideReactPop(); S.room = null; S.messages = []; S.members = {}; S.replyTo = null; S.reacts = {}; S.pollSel = {}; }
  function openSelf() {
    sb.rpc('start_self').then(function (r) { if (r.error) { toast(esc(errMsg(r.error))); return; } loadRooms().then(function () { location.hash = '#room/' + r.data; }); });
  }
  function longPress(el, fn) {
    var t = null;
    el.addEventListener('touchstart', function () { t = setTimeout(function () { t = null; fn(); }, 550); }, { passive: true });
    ['touchend', 'touchmove', 'touchcancel'].forEach(function (ev) { el.addEventListener(ev, function (e) { if (t) { clearTimeout(t); t = null; } else if (ev === 'touchend') e.preventDefault(); }, { passive: ev !== 'touchend' }); });
  }
  /* 대화방을 좁은 새 창으로 열기 (카카오워크처럼) */
  function openRoomWindow(id) {
    var w = 380, h = Math.min(screen.availHeight - 40, 760);
    var win = window.open(location.href.split('#')[0] + '#room/' + id + '/solo', 'noble-room-' + id,
      'popup,width=' + w + ',height=' + h + ',left=' + Math.max(0, screen.availWidth - w - 420) + ',top=40');
    if (!win && ND) return;   // PC 프로그램은 프로그램이 직접 창을 열어 줌 (차단 아님)
    if (!win) toast('팝업이 차단되었습니다. 주소창 오른쪽 팝업 차단 아이콘에서 "항상 허용"을 눌러 주세요.');
    else try { win.focus(); } catch (e) {}
  }
  /* 설치한 앱 창을 폭 380으로 맞추기 (설정에서 켰을 때) */
  function fitMini(force) {
    if (!DESKTOP.matches || ND) return;
    if (!force && lsGet('noble-mini-default') !== '1') return;
    var app = window.matchMedia('(display-mode: standalone)').matches || window.name === 'noble-mini';
    if (!app && !force) return;
    var w = 380, h = Math.min(screen.availHeight - 40, 820);
    try { window.resizeTo(w, h); window.moveTo(screen.availWidth - w - 20, 20); } catch (e) {}
    setTimeout(function () { if (force && window.outerWidth > 460) toast('이 창은 브라우저가 크기를 바꾸지 못하게 막고 있습니다. 위의 "작은 창 (380)" 버튼을 써 주세요.'); }, 400);
  }
  fitMini(false);
  function roomTitle(info) { return info ? esc(info.name) + (info.type === 'dm' && pTag(S.profiles[info.other_id]) ? '<span class="who-tag">' + esc(pTag(S.profiles[info.other_id])) + '</span>' : '') + (info.type === 'group' ? '<small>' + info.member_count + '명</small>' : '') : '대화'; }
  function openRoom(id) {
    if (S.room && S.room.id === id && $('#msgs')) return;
    var info = S.rooms.find(function (r) { return r.id === id; });
    if (info && !S.solo) lsSet(lastRoomKey(), id);   // 다음에 메신저를 켜거나 채팅 탭으로 돌아오면 이 방이 열림
    // 나갔던(숨긴) 방에 다시 들어오면 목록에 다시 보이게
    if (!info && !(S.unhid || (S.unhid = {}))[id]) {
      S.unhid[id] = true;
      sb.from('room_members').update({ hidden: false }).eq('room_id', id).eq('user_id', S.me.id).eq('hidden', true)
        .then(function () { return loadRooms(); })
        .then(function () { if (S.route.id === id) { S.room = null; openRoom(id); } if (!S.solo) refreshRooms(); });
    }
    S.room = { id: id, info: info }; S.messages = []; S.members = {}; S.hasOlder = false; S.seenId = 0;   // seenId: 맨 아래를 마지막으로 본 시점의 마지막 글 번호 (앞 방의 값이 따라오지 않게 0으로)
    S.replyTo = null;   // 다른 방에서 눌러 둔 "답장"이 이 방 전송에 따라오지 않게 (예전에는 방을 바로 옮기면 남아 있었음)
    $('#main').style.justifyContent = '';
    var title = roomTitle(info);
    var right = '<button class="icon-btn" id="roomSearchBtn" aria-label="대화 내용 검색" title="대화 내용 검색">' + svg('search') + '</button>' + (DESKTOP.matches && !S.solo ? '<button class="icon-btn" id="popOut" aria-label="새 창으로 열기" title="새 창으로 열기">' + svg('pop') + '</button>' : '') +
      '<button class="icon-btn" id="roomMenu" aria-label="대화방 메뉴">' + svg('more') + '</button>';
    $('#main').innerHTML = '<div class="chat">' + header(title, { back: '#chats', right: right }) + '<div id="roomNotice"></div><div class="room-search" id="roomSearch" hidden></div>' +
      '<div class="msgs-box"><div class="msgs" id="msgs" aria-live="polite"><p class="empty">불러오는 중…</p></div>' +
      '<button type="button" class="to-latest" id="toLatest" aria-label="맨 아래로 이동" hidden>' + svg('tobottom') + '<span></span></button></div>' +   // 버튼은 #msgs 밖: 대화를 다시 그려도 지워지지 않음
      '<div class="uploading" id="upl" hidden></div>' +
      '<div class="reply-bar" id="replyBar" hidden></div><div class="mention-box" id="mentionBox" hidden></div>' +
      '<div class="emoji-pick" id="emojiPick" hidden></div>' +
      '<form class="composer kw" id="composer"><textarea id="txt" rows="2" placeholder="메시지를 입력해 보세요." aria-label="메시지 입력"></textarea>' +
      '<div class="ctools"><label class="icon-btn" aria-label="파일 첨부" title="사진·파일 첨부">' + svg('clip') + '<input type="file" id="fileIn" multiple hidden></label>' +
      '<button type="button" class="icon-btn" id="emojiBtn" aria-label="이모티콘" title="이모티콘">' + svg('smile') + '</button>' +
      (info && info.type === 'self' ? '' : '<button type="button" class="icon-btn" id="atBtn" aria-label="멘션(@)" title="멘션 (@이름)">' + svg('at') + '</button>') +
      '<button type="button" class="icon-btn" id="capBtn" aria-label="화면 캡처" title="화면 캡처해서 보내기">' + svg('crop') + '</button>' +
      (info && info.type === 'self' ? '' : '<button type="button" class="icon-btn" id="pollBtn" aria-label="투표 만들기" title="투표 만들기">' + svg('poll') + '</button>') +
      '<span class="ct-sp"></span><button class="send" id="sendBtn" aria-label="보내기" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20l18-8L3 4l2 7 9 1-9 1z"/></svg></button></div></form></div>';
    $('#roomMenu').onclick = roomMenu;
    var tl = $('#toLatest');
    tl.addEventListener('mousedown', function (e) { e.preventDefault(); });   // 눌러도 입력창의 커서(폰에서는 키보드)가 그대로 있게
    tl.addEventListener('click', function () {
      var ms = $('#msgs'); if (!ms) return;
      S.stick = true; ms.scrollTop = ms.scrollHeight; markSeen(); latestBtnUpdate();
      if (DESKTOP.matches) { var tx = $('#txt'); if (tx) tx.focus(); }   // PC: 바로 이어서 쓸 수 있게 (폰은 키보드가 올라오지 않도록 옮기지 않음)
    });
    $('#roomSearchBtn').onclick = function () { roomSearchBar(); }; S.searchQ = '';
    var pb = $('#pollBtn'); if (pb) pb.onclick = pollCreateSheet;
    var po = $('#popOut'); if (po) po.onclick = function () {
      openRoomWindow(id);
    };
    if (S.solo && info) document.title = info.name + ' · 노블 메신저';
    renderRoomNotice(); applyRoomColor();
    var txt = $('#txt'), btn = $('#sendBtn');
    /* 글이 길어지면 입력창이 화면의 절반 정도까지 늘어나 내용 전체가 보임 (그보다 길면 안에서 스크롤) · 보내면 원래 크기로 */
    function grow() {
      var ms = $('#msgs'), stick = !!ms && ms.scrollHeight - ms.scrollTop - ms.clientHeight < 60;
      var vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight || 700;
      var cap = Math.max(120, Math.floor(vh * (vh < 600 ? 0.4 : 0.55)));
      txt.style.height = 'auto';
      var want = txt.scrollHeight;
      txt.style.height = Math.min(cap, want) + 'px';
      txt.style.overflowY = want > cap ? 'auto' : 'hidden';
      if (stick && ms) ms.scrollTop = ms.scrollHeight;   // 아래 대화를 보고 있었다면 입력창이 커져도 마지막 대화가 가려지지 않게
      btn.disabled = !txt.value.trim();
      draftPut(id, txt.value);   // 쓰는 대로 이 방의 "작성 중 글"로 보관 (이모티콘·@ 버튼으로 넣은 글자, 보낸 뒤 비움도 모두 여기를 지남)
    }
    /* 이 방에서 쓰다 만 글이 있으면 입력창에 되살림 (값을 넣으면 커서는 저절로 글 맨 끝 — 실제 크롬에서도 확인) */
    var draft = draftGet(id);
    if (draft) { txt.value = draft; grow(); }
    txt.addEventListener('input', function () { grow(); mentionCheck(txt); });
    txt.addEventListener('click', function () { mentionCheck(txt); });
    txt.addEventListener('keydown', function (e) {
      if (e.isComposing || e.keyCode === 229) return;
      var mb = $('#mentionBox');
      if (mb && !mb.hidden) {
        var items = $$('button', mb), cur = items.findIndex(function (b) { return b.classList.contains('on'); });
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (items.length) { if (cur > -1) items[cur].classList.remove('on'); cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items[cur].classList.add('on'); } return; }
        if ((e.key === 'Enter' || e.key === 'Tab') && items.length) { e.preventDefault(); items[cur > -1 ? cur : 0].click(); return; }
        if (e.key === 'Escape' && !mb.hidden) { e.preventDefault(); mb.hidden = true; return; }
      }
      if (e.key !== 'Enter') return;
      if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
      if (DESKTOP.matches) { e.preventDefault(); send(); }
    });
    txt.addEventListener('paste', function (e) {
      var files = Array.prototype.slice.call((e.clipboardData && e.clipboardData.files) || []);
      if (files.length) { e.preventDefault(); uploadFiles(files); }
    });
    $('#composer').addEventListener('submit', function (e) { e.preventDefault(); send(); });
    function insertAtCaret(t) {
      var a = txt.selectionStart, b = txt.selectionEnd, v = txt.value;
      txt.value = v.slice(0, a) + t + v.slice(b); txt.focus(); txt.setSelectionRange(a + t.length, a + t.length); grow();
    }
    var ep = $('#emojiPick');
    $('#emojiBtn').onclick = function () {
      if (!ep.innerHTML) {
        ep.innerHTML = PICK_EMOJIS.map(function (e) { return '<button type="button">' + e + '</button>'; }).join('');
        ep.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; insertAtCaret(b.textContent); });
      }
      ep.hidden = !ep.hidden;
    };
    if (!S.epWired) { S.epWired = true; document.addEventListener('mousedown', function (e) { var x = $('#emojiPick'); if (x && !x.hidden && !e.target.closest('#emojiPick,#emojiBtn')) x.hidden = true; }); }
    var atb = $('#atBtn'); if (atb) atb.onclick = function () {
      var a = txt.selectionStart, v = txt.value, pre = a > 0 && !/\s/.test(v.charAt(a - 1)) ? ' ' : '';
      insertAtCaret(pre + '@'); mentionCheck(txt);
    };
    $('#capBtn').onclick = function () { screenCapture(); };
    $('#fileIn').addEventListener('change', function () { uploadFiles(Array.prototype.slice.call(this.files)); this.value = ''; });
    var msgsEl = $('#msgs');
    msgsEl.addEventListener('dragover', function (e) { e.preventDefault(); });
    msgsEl.addEventListener('drop', function (e) { e.preventDefault(); uploadFiles(Array.prototype.slice.call(e.dataTransfer.files || [])); });
    function send() {
      var body = txt.value.trim(); if (!body) return;
      txt.value = ''; grow(); var mb = $('#mentionBox'); if (mb) mb.hidden = true;
      var row = { body: body }, men = findMentions(body);
      if (men.length) row.mentions = men;
      if (S.replyTo) { row.reply_to = S.replyTo.id; setReply(null); }
      postMessage(row).then(function (sent) { if (sent === false) unsent(id, body); });   // 보내지 못했으면 쓰던 글이 사라지지 않게 되돌려 놓음
    }
    Promise.all([
      sb.from('room_members').select('*').eq('room_id', id),
      (function () { var q = sb.from('messages').select('*').eq('room_id', id); if (info && info.cleared_at) q = q.gt('created_at', info.cleared_at); return q.order('created_at', { ascending: false }).limit(60); })(),
      sb.from('message_reactions').select('message_id, user_id, emoji').eq('room_id', id).limit(5000)
    ]).then(function (res) {
      if (res[0].error) throw res[0].error; if (res[1].error) throw res[1].error;
      if (!S.room || S.room.id !== id) return;
      res[0].data.forEach(function (m) { S.members[m.user_id] = m; });
      S.reacts = {}; (res[2].data || []).forEach(function (x) { (S.reacts[x.message_id] = S.reacts[x.message_id] || []).push(x); });
      S.messages = res[1].data.reverse(); S.hasOlder = res[1].data.length === 60;
      if (!info) { loadRooms().then(function () { S.room.info = S.rooms.find(function (r) { return r.id === id; }); var h = $('#main .pane-hd h1'); if (h && S.room.info) h.innerHTML = esc(S.room.info.name); }); }
      renderMessages(true); markRead();
      if (S.pendingJump && S.pendingJump.room_id === id) { var pj = S.pendingJump; S.pendingJump = null; S.searchQ = (S.roomQuery || '').trim(); renderMessages(false); setTimeout(function () { jumpToMsg(pj); }, 80); }
    }).catch(function (e) { $('#msgs').innerHTML = '<p class="empty">' + esc(errMsg(e)) + '</p>'; });
    // PC: 채팅방을 열면 바로 입력창에 커서 (클릭 없이 바로 글쓰기)
    if (DESKTOP.matches) { setTimeout(function () { if (!$('.modal')) txt.focus(); }, 50); setTimeout(function () { if (!$('.modal') && document.activeElement === document.body) txt.focus(); }, 600); }
  }

  function loadOlder() {
    if (!S.messages.length) return;
    var first = S.messages[0], el = $('#msgs'), h = el.scrollHeight;
    var oq = sb.from('messages').select('*').eq('room_id', S.room.id).lt('created_at', first.created_at);
    if (S.room.info && S.room.info.cleared_at) oq = oq.gt('created_at', S.room.info.cleared_at);
    oq.order('created_at', { ascending: false }).limit(60).then(function (r) {
      if (r.error) return;
      S.messages = r.data.reverse().concat(S.messages); S.hasOlder = r.data.length === 60;
      renderMessages(false); el.scrollTop = el.scrollHeight - h;
    });
  }

  function unreadCount(m) {
    var n = 0, t = d(m.created_at);
    Object.keys(S.members).forEach(function (u) { if (u !== m.sender_id && d(S.members[u].last_read_at) < t) n++; });
    return n;
  }

  /* 채팅방 "맨 아래로" 버튼 — 위로 올려 읽는 중일 때만 보이고, 그 사이 도착한 남의 새 글 수를 함께 보여 줌 */
  function markSeen() { var last = 0; S.messages.forEach(function (m) { if (m.id > last) last = m.id; }); S.seenId = last; }   // 맨 아래를 보고 있는 지금까지의 글은 "본 것"
  function newBelow() {   // 맨 아래를 마지막으로 본 뒤 도착한 남의 글 수 (내 글·삭제된 글은 세지 않음)
    var n = 0, seen = S.seenId || 0;
    S.messages.forEach(function (m) { if (m.id > seen && m.sender_id !== S.me.id && !m.deleted) n++; });
    return n;
  }
  function latestBtnUpdate() {
    var b = $('#toLatest'), el = $('#msgs'); if (!b || !el) return;
    var dist = el.scrollHeight - el.scrollTop - el.clientHeight, n = dist > 40 ? newBelow() : 0;
    var show = dist > Math.max(120, el.clientHeight * 0.5) || (n > 0 && dist > 40);   // 조금 올린 것만으로는 안 뜸 (화면 절반 이상 올렸거나, 새 글이 있을 때)
    if (b.hidden === show) b.hidden = !show;
    if (!show) return;
    var lab = n > 0 ? '새 메시지 ' + (n > 99 ? '99+' : n) : '맨 아래로', sp = b.lastChild;
    var aria = n > 0 ? '새 메시지 ' + (n > 99 ? '99개 이상' : n + '개') + ', 맨 아래로 이동' : '맨 아래로 이동';
    if (sp.textContent !== lab) sp.textContent = lab;
    if (b.getAttribute('aria-label') !== aria) b.setAttribute('aria-label', aria);
    b.classList.toggle('has-new', n > 0);
  }

  function renderMessages(toBottom) {
    var el = $('#msgs'); if (!el) return;
    if (reactPopEl) hideReactPop();   // 글을 다시 그리면 떠 있던 공감 막대가 가리키던 글이 사라지므로 닫음
    // 사용자가 맨 아래를 보고 있을 때만 아래로 따라감 (위로 올려 읽는 중이면 절대 끌어내리지 않음)
    if (toBottom) S.stick = true;
    var nearBottom = S.stick !== false && el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    var html = S.hasOlder ? '<button class="btn btn-line sm load-older" id="older">이전 메시지 보기</button>' : '';
    if (!S.messages.length) html += '<p class="empty">첫 메시지를 보내 보세요.</p>';
    var prev = null, needUrls = [], qm = qMap();
    S.messages.forEach(function (m) {
      /* ② 날짜 구분선 — span으로 감싸 CSS ::before 가로줄 위로 pill이 뜨게 */
      if (!prev || !sameDay(prev.created_at, m.created_at)) { html += '<div class="day"><span>' + dayLabel(m.created_at) + '</span></div>'; prev = null; }
      var mine = m.sender_id === S.me.id, p = S.profiles[m.sender_id] || { name: '(퇴사자)' };
      var toMe = !mine && (m.mentions || []).indexOf(S.me.id) > -1;
      var cont = prev && prev.sender_id === m.sender_id && (d(m.created_at) - d(prev.created_at)) < 5 * 60000;
      var content;
      if (m.deleted) content = '<div class="bubble deleted">삭제된 메시지입니다</div>';
      else if (m.file_path) {
        needUrls.push(m.file_path);
        var u = cachedUrl(m.file_path);
        if ((m.file_type || '').indexOf('image/') === 0) content = '<a class="img-msg" data-path="' + esc(m.file_path) + '" href="' + (u || '#') + '" target="_blank" rel="noopener"><img alt="' + esc(m.file_name || '사진') + '" ' + (u ? 'src="' + u + '"' : '') + (S.imgSize[m.file_path] ? ' width="' + S.imgSize[m.file_path][0] + '" height="' + S.imgSize[m.file_path][1] + '"' : '') + ' decoding="async"></a>';
        else content = '<a class="file-msg" data-path="' + esc(m.file_path) + '" data-dl="' + esc(m.file_name || 'file') + '" href="' + (u || '#') + '" target="_blank" rel="noopener">' + svg('file') + '<span style="min-width:0"><b>' + esc(m.file_name || '파일') + '</b><span>' + size(m.file_size) + ' · 열기</span></span></a>';
        if (m.body) content += '<div class="bubble' + (toMe ? ' to-me' : '') + '">' + fmtBody(m.body) + '</div>';
      } else content = '<div class="bubble' + (toMe ? ' to-me' : '') + '">' + fmtBody(m.body) + '</div>';
      if (m.poll_id && !m.deleted) content = pollCard(m.poll_id);
      if (m.reply_to && !m.deleted) content = quoteHtml(m.reply_to) + content;
      var un = unreadCount(m), rh = reactsHtml(m.id);
      /* ③ 공감칩(rh)·진료완료(qTagHtml)를 .line 밖(.col 안)으로 이동 → 말풍선 + 보낸사람 명확히 */
      var qtag = m.deleted ? '' : qTagHtml(qm[m.id]);
      html += '<div class="msg' + (mine ? ' mine' : '') + (cont ? ' cont' : '') + (rh ? ' has-react' : '') + '" data-id="' + m.id + '">' +
        (mine ? '' : av(p, 'sm')) +
        '<div class="col">' + (mine ? '' : '<div class="who">' + esc(p.name || '') + (pTag(p) ? '<span class="who-tag">' + esc(pTag(p)) + '</span>' : '') + '</div>') +
        '<div class="line"><div class="col" style="gap:4px">' + content + '</div><span class="meta">' + (un ? '<span class="unread">' + un + '</span>' : '') + '<time>' + hm(m.created_at) + '</time></span>' +
        (!m.deleted && m.body && !m.poll_id ? '<button class="copy-btn" data-act="copy" title="복사" aria-label="메시지 복사">' + svg('copy') + '</button>' : '') +
        (!m.deleted && m.body && !m.poll_id ? '<button class="copy-btn q-btn' + (qm[m.id] && qm[m.id].status === 'pending' ? ' on' : '') + '" data-act="queue" title="진료순서표에 올리기" aria-label="진료순서표에 올리기">' + svg('queue') + '</button>' : '') +
        (!m.deleted ? '<span class="msg-acts"><button data-act="react" title="공감" aria-label="공감">' + svg('smile') + '</button><button data-act="reply" title="답장" aria-label="답장">' + svg('reply') + '</button><button data-act="more" title="더보기" aria-label="더보기">' + svg('more') + '</button></span>' : '') +
        '</div>' + (rh || qtag ? '<div class="msg-extra">' + rh + qtag + '</div>' : '') + '</div></div>';
      prev = m;
    });
    /* 이미 불러온 사진은 그대로 옮겨 붙여서 다시 그릴 때 깜빡이거나 겹치지 않게 */
    var keepImg = {};
    $$('.img-msg img', el).forEach(function (im) { if (im.complete && im.naturalWidth) keepImg[im.parentNode.getAttribute('data-path')] = im; });
    el.innerHTML = html;
    $$('.img-msg', el).forEach(function (a) { var k = keepImg[a.getAttribute('data-path')], ni = $('img', a); if (k && ni) a.replaceChild(k, ni); });
    $$('.img-msg img', el).forEach(function (im) {
      var rec = function () { if (im.naturalWidth) S.imgSize[im.parentNode.getAttribute('data-path')] = [im.naturalWidth, im.naturalHeight]; };
      if (im.complete) rec(); else im.addEventListener('load', rec, { once: true });
    });
    var ob = $('#older'); if (ob) ob.onclick = loadOlder;
    if (!el.getAttribute('data-wired')) {
      el.setAttribute('data-wired', '1');
      // 손가락·마우스로 위로 올리면 '따라가기' 해제, 맨 아래로 다시 내리면 재개
      var lastTop = el.scrollTop;
      el.addEventListener('scroll', function () {
        if (reactPopEl) hideReactPop();
        var dist = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (el.scrollTop < lastTop - 2 && dist > 40) S.stick = false;
        else if (dist < 40) S.stick = true;
        lastTop = el.scrollTop;
        if (dist < 40) markSeen();   // 맨 아래까지 내려오면 그동안의 새 글은 본 것으로
        latestBtnUpdate();
      }, { passive: true });
      el.addEventListener('click', function (e) {
        var pb = e.target.closest('[data-popt],[data-pvote],[data-pclose],[data-pwho],[data-predo]');
        if (pb) { pollClick(pb); return; }
        if (e.target.closest('[data-qgo]')) { goQueue(); return; }
        var b = e.target.closest('[data-act],[data-tog],[data-jump]'); if (!b) return;
        if (reactPopEl) hideReactPop();
        if (b.hasAttribute('data-jump')) { jumpTo(+b.getAttribute('data-jump')); return; }
        if (b.hasAttribute('data-tog')) { var t = b.getAttribute('data-tog').split('|'); toggleReact(+t[0], t[1]); return; }
        var mid = +b.closest('.msg').getAttribute('data-id'), msg = S.messages.find(function (x) { return x.id === mid; }); if (!msg) return;
        var a = b.getAttribute('data-act');
        if (a === 'copy') { copyText(msg.body, b); return; }
        if (a === 'queue') { queueFromMessage(msg, b); return; }
        if (a === 'reply') setReply(msg); else msgSheet(msg);
      });
      el.addEventListener('contextmenu', function (e) {
        var row = e.target.closest('.msg'); if (!row || e.target.closest('a')) return;
        var msg = S.messages.find(function (x) { return x.id === +row.getAttribute('data-id'); }); if (!msg || msg.deleted) return;
        e.preventDefault(); msgSheet(msg);
      });
      /* PC: 😊 에 마우스를 잠깐(150ms) 올리면 공감 막대 — 지나가다 뜨지 않게. 서버에 저장하는 것은 막대의 이모지를 눌렀을 때뿐 */
      el.addEventListener('mouseover', function (e) {
        var b = e.target.closest && e.target.closest('[data-act="react"]'); if (!b || !DESKTOP.matches) return;
        clearTimeout(popHideT);
        if (reactPopEl && reactPopBtn === b) return;
        clearTimeout(popOpenT); popOpenT = setTimeout(function () { if (b.isConnected) showReactPop(b); }, 150);
      });
      el.addEventListener('mouseout', function (e) {
        var b = e.target.closest && e.target.closest('[data-act="react"]'); if (!b || b.contains(e.relatedTarget)) return;
        clearTimeout(popOpenT);   // 150ms 채우기 전에 벗어나면 뜨지 않음
        if (reactPopEl && !reactPopEl.contains(e.relatedTarget)) popHideSoon();
      });
      var lpT = null;
      el.addEventListener('touchstart', function (e) {
        var row = e.target.closest('.msg'); if (!row) return;
        lpT = setTimeout(function () { lpT = null; var msg = S.messages.find(function (x) { return x.id === +row.getAttribute('data-id'); }); if (msg && !msg.deleted) msgSheet(msg); }, 550);
      }, { passive: true });
      ['touchend', 'touchmove', 'touchcancel'].forEach(function (ev) { el.addEventListener(ev, function () { if (lpT) { clearTimeout(lpT); lpT = null; } }, { passive: true }); });
    }
    fetchReplyTargets();
    fetchPolls(S.messages.filter(function (m) { return m.poll_id && !m.deleted && !S.polls[m.poll_id] && !S.pollLoading[m.poll_id]; }).map(function (m) { return m.poll_id; }));
    if (toBottom || nearBottom) { S.stick = true; el.scrollTop = el.scrollHeight; markSeen(); }
    $$('img', el).forEach(function (im) { if (!im.complete || !im.getAttribute('src')) im.addEventListener('load', function () { if (S.stick && el.isConnected) el.scrollTop = el.scrollHeight; }, { once: true }); });
    S.qSig = qSig();
    signUrls(needUrls.filter(function (p) { return !cachedUrl(p); }));
    latestBtnUpdate();
  }

  /* @언급 · 답장 · 공감 · 대화방 공지 */
  function roomPeople() { return Object.keys(S.members).map(function (u) { return S.profiles[u]; }).filter(Boolean); }
  function fmtBody(body) {
    var h = linkify(body);
    if (S.searchQ && S.searchQ.length >= 2) h = h.replace(new RegExp('(' + reRx(esc(S.searchQ)) + ')(?![^<]*>)', 'gi'), '<mark>$1</mark>');
    var names = roomPeople().map(function (p) { return esc(p.name); }).filter(Boolean);
    names.push('모두');
    names.sort(function (a, b) { return b.length - a.length; });
    return h.replace(new RegExp('@(' + names.map(reRx).join('|') + ')', 'g'), '<span class="mention">@$1</span>');
  }
  function findMentions(body) {
    var ppl = roomPeople().filter(function (p) { return p.id !== S.me.id; });
    if (/@모두(\s|$)/.test(body)) return ppl.map(function (p) { return p.id; });
    return ppl.filter(function (p) { return body.indexOf('@' + p.name) > -1; }).map(function (p) { return p.id; });
  }
  function mentionCheck(txt) {
    var box = $('#mentionBox'); if (!box) return;
    var info = S.room && S.room.info;
    if (!info || info.type !== 'group') { box.hidden = true; return; }
    var before = txt.value.slice(0, txt.selectionStart), m = /(^|\s)@([^\s@]{0,12})$/.exec(before);
    if (!m) { box.hidden = true; return; }
    var q = m[2], list = roomPeople().filter(function (p) { return p.id !== S.me.id && p.name.indexOf(q) > -1; }).slice(0, 8);
    var opts = ('모두'.indexOf(q) > -1 ? [{ id: '*', name: '모두', label: '이 방 전원에게 알림' }] : []).concat(list.map(function (p) { return { id: p.id, name: p.name, label: personLabel(p), p: p }; }));
    if (!opts.length) { box.hidden = true; return; }
    box.innerHTML = opts.map(function (o, i) { return '<button type="button"' + (i ? '' : ' class="on"') + ' data-name="' + esc(o.name) + '">' + (o.p ? av(o.p, 'sm') : '<span class="avatar sm grp">@</span>') + '<b>' + esc(o.name) + '</b><span>' + esc(o.label || '') + '</span></button>'; }).join('');
    box.hidden = false;
    $$('button', box).forEach(function (b) {
      b.onmousedown = function (e) { e.preventDefault(); };
      b.onclick = function () {
        var start = txt.selectionStart - q.length - 1;
        txt.setRangeText('@' + b.getAttribute('data-name') + ' ', start, txt.selectionStart, 'end');
        box.hidden = true; txt.focus(); txt.dispatchEvent(new Event('input'));
      };
    });
  }
  function snippet(o) {
    if (!o) return '이전 메시지';
    if (o.deleted) return '삭제된 메시지';
    if (o.file_path && !o.body) return (o.file_type || '').indexOf('image/') === 0 ? '사진' : '파일: ' + (o.file_name || '');
    return (o.body || '').replace(/\s+/g, ' ').slice(0, 60);
  }
  function findMsg(id) { return S.messages.find(function (x) { return x.id === id; }) || S.replyCache[id]; }
  function quoteHtml(rid) {
    var o = findMsg(rid), who = o ? ((S.profiles[o.sender_id] || {}).name || '(퇴사자)') : '';
    return '<button class="quote" data-jump="' + rid + '">' + svg('reply') + '<span><b>' + esc(who ? who + '에게 답장' : '답장') + '</b><span>' + esc(snippet(o)) + '</span></span></button>';
  }
  function fetchReplyTargets() {
    var need = S.messages.filter(function (m) { return m.reply_to && !findMsg(m.reply_to); }).map(function (m) { return m.reply_to; });
    need = need.filter(function (x, i) { return need.indexOf(x) === i && !S.replyCache['miss' + x]; });
    if (!need.length) return;
    need.forEach(function (x) { S.replyCache['miss' + x] = true; });
    sb.from('messages').select('id, sender_id, body, file_path, file_type, file_name, deleted').in('id', need).then(function (r) {
      (r.data || []).forEach(function (o) { S.replyCache[o.id] = o; });
      if (r.data && r.data.length) renderMessages(false);
    });
  }
  function jumpTo(id, q) {
    var el = $('.msg[data-id="' + id + '"]');
    if (!el) { toast('이전 메시지입니다. 위로 올려 \'이전 메시지 보기\'를 눌러 주세요.'); return; }
    el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.classList.add('flash'); setTimeout(function () { el.classList.remove('flash'); }, 1600);
  }
  function setReply(m) {
    S.replyTo = m; var bar = $('#replyBar'); if (!bar) return;
    if (!m) { bar.hidden = true; bar.innerHTML = ''; return; }
    var who = (S.profiles[m.sender_id] || {}).name || '';
    bar.innerHTML = svg('reply') + '<div><b>' + esc(who) + '에게 답장</b><p>' + esc(snippet(m)) + '</p></div><button type="button" aria-label="답장 취소">' + svg('x') + '</button>';
    bar.hidden = false; $('button', bar).onclick = function () { setReply(null); };
    var t = $('#txt'); if (t) t.focus();
  }
  function reactsHtml(mid) {
    var list = S.reacts[mid]; if (!list || !list.length) return '';
    var g = {}; list.forEach(function (x) { (g[x.emoji] = g[x.emoji] || []).push(x.user_id); });
    return '<div class="reacts">' + Object.keys(g).map(function (e) {
      var us = g[e], mine = us.indexOf(S.me.id) > -1, names = us.map(function (u) { return (S.profiles[u] || {}).name || ''; }).join(', ');
      return '<button class="react' + (mine ? ' on' : '') + (isTextReact(e) ? ' txt' : '') + '" data-tog="' + mid + '|' + esc(e) + '" title="' + esc(names) + '">' + esc(e) + ' <b>' + us.length + '</b></button>';
    }).join('') + '</div>';
  }
  function toggleReact(mid, emoji) {
    var rid = S.room.id, list = S.reacts[mid] = S.reacts[mid] || [], i = list.findIndex(function (x) { return x.user_id === S.me.id && x.emoji === emoji; }), adding = i < 0;
    var q;
    if (i > -1) { list.splice(i, 1); q = sb.from('message_reactions').delete().eq('message_id', mid).eq('user_id', S.me.id).eq('emoji', emoji); }
    else { list.push({ message_id: mid, user_id: S.me.id, emoji: emoji }); q = sb.from('message_reactions').insert({ message_id: mid, room_id: S.room.id, user_id: S.me.id, emoji: emoji }); }
    renderMessages(false);
    q.then(function (r) {
      if (!r.error || /duplicate/i.test(r.error.message)) return;
      /* 서버에 반영되지 않았으니 화면도 되돌림 — 저장된 것처럼 남아 있으면 본인만 보냈다고 믿고 상대는 못 보게 됨 */
      if (S.room && S.room.id === rid) {
        var cur = S.reacts[mid] = S.reacts[mid] || [], j = cur.findIndex(function (x) { return x.user_id === S.me.id && x.emoji === emoji; });
        if (adding && j > -1) cur.splice(j, 1); else if (!adding && j < 0) cur.push({ message_id: mid, user_id: S.me.id, emoji: emoji });
        renderMessages(false);
      }
      toast('<b>공감 실패</b> ' + esc(errMsg(r.error)));
    });
  }
  /* ---------- PC 빠른 공감 막대 (카카오워크처럼): 😊 에 마우스를 올리면 바로 고름 ---------- */
  var reactPopEl = null, reactPopBtn = null, popOpenT = null, popHideT = null;
  function hideReactPop() {
    clearTimeout(popOpenT); clearTimeout(popHideT);
    $$('.react-pop').forEach(function (n) { n.remove(); });
    $$('.msg.pop-on').forEach(function (n) { n.classList.remove('pop-on'); });
    reactPopEl = null; reactPopBtn = null;
  }
  function popHideSoon() { clearTimeout(popHideT); popHideT = setTimeout(hideReactPop, 220); }   // 단추에서 막대로 옮겨 갈 틈
  function showReactPop(btn) {
    hideReactPop();
    var row = btn.closest('.msg'); if (!row || !S.room) return;
    var mid = +row.getAttribute('data-id'), mine = (S.reacts[mid] || []).filter(function (x) { return x.user_id === S.me.id; }).map(function (x) { return x.emoji; });
    var pop = document.createElement('div'); pop.className = 'react-pop'; pop.setAttribute('role', 'toolbar'); pop.setAttribute('aria-label', '공감 고르기');
    pop.innerHTML = EMOJIS.map(function (e) {
      var cls = ((isTextReact(e) ? 'txt' : '') + (mine.indexOf(e) > -1 ? ' on' : '')).trim();
      return '<button type="button" data-pick="' + esc(e) + '"' + (cls ? ' class="' + cls + '"' : '') + ' aria-label="' + esc(e) + ' 공감">' + esc(e) + '</button>';
    }).join('');
    pop.style.visibility = 'hidden'; document.body.appendChild(pop);
    var r = btn.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight, vw = document.documentElement.clientWidth;
    var top = r.top - h - 6; if (top < 8) top = r.bottom + 6;   // 맨 위 글이면 아래로
    pop.style.left = Math.max(8, Math.min(vw - w - 8, r.left + r.width / 2 - w / 2)) + 'px'; pop.style.top = top + 'px'; pop.style.visibility = '';
    reactPopEl = pop; reactPopBtn = btn; row.classList.add('pop-on');
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pick]'); if (!b) return;
      e.preventDefault(); var emoji = b.getAttribute('data-pick'); hideReactPop(); toggleReact(mid, emoji);
    });
    pop.addEventListener('mouseover', function () { clearTimeout(popHideT); });
    pop.addEventListener('mouseout', function (e) { var rt = e.relatedTarget; if (!(rt instanceof Node && (pop.contains(rt) || btn.contains(rt)))) popHideSoon(); });
  }
  window.addEventListener('resize', function () { if (reactPopEl) hideReactPop(); });
  /* ---------- 투표 ---------- */
  function fetchPolls(ids) {
    ids = ids.filter(function (x, i) { return ids.indexOf(x) === i; });
    ids.forEach(function (pid) {
      S.pollLoading[pid] = true;
      sb.rpc('poll_state', { p: pid }).then(function (r) {
        S.pollLoading[pid] = false;
        if (r.data) { S.polls[pid] = r.data; renderMessages(false); }
      });
    });
  }
  function pollCard(pid) {
    var st = S.polls[pid];
    if (!st) return '<div class="poll"><p class="muted small">투표 불러오는 중…</p></div>';
    var sel = S.pollSel[pid], editing = !!sel, mine = st.mine || [], voted = mine.length > 0, closed = st.closed;
    var choose = !closed && (!voted || editing);
    var cur = editing ? sel : mine, total = st.participants || 0;
    var maxC = Math.max.apply(null, st.counts.concat([0]));
    var h = '<div class="poll' + (closed ? ' closed' : '') + '"><div class="poll-hd">' + svg('poll') + '<b>' + esc(st.question) + '</b></div>' +
      '<p class="poll-sub">' + [st.multi ? '복수 선택' : '하나만 선택', st.anonymous ? '익명 투표' : '', st.closes_at ? (closed ? '' : shortTime(st.closes_at) + ' ' + hm(st.closes_at) + ' 마감') : ''].filter(Boolean).join(' · ') + '</p><div class="poll-opts">';
    st.options.forEach(function (o, i) {
      var c = st.counts[i] || 0, pct = total ? Math.round(c / total * 100) : 0, on = cur.indexOf(i) > -1;
      var showRes = voted || closed;
      h += '<button class="popt' + (on ? ' on' : '') + (closed && c === maxC && c > 0 ? ' win' : '') + '" data-popt="' + pid + '|' + i + '"' + (choose ? '' : ' disabled') + '>' +
        (showRes ? '<span class="pbar" style="width:' + pct + '%"></span>' : '') +
        '<span class="pchk">' + (on ? svg('check') : '') + '</span><span class="ptxt">' + esc(o) + '</span>' + (showRes ? '<span class="pcnt">' + c + '</span>' : '') + '</button>';
    });
    h += '</div><div class="poll-ft"><span>' + (closed ? '<b>투표 종료</b> · ' : '') + total + '명 참여</span><span class="poll-btns">';
    if (choose && (st.multi || editing)) h += '<button class="btn btn-navy sm" data-pvote="' + pid + '">' + (voted ? '다시 투표' : '투표하기') + '</button>';
    if (!closed && voted && !editing) h += '<button class="btn btn-line sm" data-predo="' + pid + '">다시 선택</button>';
    if (!st.anonymous && total) h += '<button class="btn btn-line sm" data-pwho="' + pid + '">참여자</button>';
    if (!closed && (st.created_by === S.me.id || S.me.role === 'admin')) h += '<button class="btn btn-line sm" data-pclose="' + pid + '">종료</button>';
    return h + '</span></div></div>';
  }
  function pollVote(pid, choices) {
    sb.rpc('vote_poll', { p: pid, choices: choices }).then(function (r) {
      if (r.error) { toast(esc(errMsg(r.error))); return; }
      delete S.pollSel[pid]; fetchPolls([pid]);
    });
  }
  function pollClick(b) {
    var st;
    if (b.hasAttribute('data-popt')) {
      var t = b.getAttribute('data-popt').split('|'), pid = +t[0], i = +t[1]; st = S.polls[pid]; if (!st) return;
      if (!st.multi && !S.pollSel[pid]) { pollVote(pid, (st.mine || []).indexOf(i) > -1 ? [] : [i]); return; }
      if (!st.multi) { S.pollSel[pid] = [i]; renderMessages(false); return; }
      var sel = S.pollSel[pid] = S.pollSel[pid] || (st.mine || []).slice(), k = sel.indexOf(i);
      if (k > -1) sel.splice(k, 1); else sel.push(i);
      renderMessages(false); return;
    }
    if (b.hasAttribute('data-pvote')) { var p1 = +b.getAttribute('data-pvote'); pollVote(p1, (S.pollSel[p1] || (S.polls[p1] || {}).mine || []).slice()); return; }
    if (b.hasAttribute('data-predo')) { var p2 = +b.getAttribute('data-predo'); S.pollSel[p2] = ((S.polls[p2] || {}).mine || []).slice(); renderMessages(false); return; }
    if (b.hasAttribute('data-pclose')) {
      if (!confirmInline(b, '종료할까요?')) return;
      var p3 = +b.getAttribute('data-pclose');
      sb.rpc('close_poll', { p: p3 }).then(function (r) { if (r.error) { toast(esc(errMsg(r.error))); return; } fetchPolls([p3]); });
      return;
    }
    if (b.hasAttribute('data-pwho')) {
      st = S.polls[+b.getAttribute('data-pwho')]; if (!st || !st.voters) return;
      var nm = function (u) { return esc((S.profiles[u] || {}).name || '(퇴사자)'); };
      var not = Object.keys(S.members).filter(function (u) { return (st.voted_users || []).indexOf(u) < 0; });
      sheet(esc(st.question), st.options.map(function (o, i) {
        return '<div class="pw"><b>' + esc(o) + ' <span class="muted small">' + st.voters[i].length + '명</span></b><p>' + (st.voters[i].map(nm).join(', ') || '<span class="muted">없음</span>') + '</p></div>';
      }).join('') + '<div class="pw"><b>미참여 <span class="muted small">' + not.length + '명</span></b><p>' + (not.map(nm).join(', ') || '<span class="muted">모두 참여했습니다</span>') + '</p></div>' +
        '<div class="sheet-actions"><button class="btn btn-line" data-close>닫기</button></div>');
    }
  }
  function pollCreateSheet() {
    var m = sheet('투표 만들기', '<div class="field"><label for="pq">투표 제목</label><input class="input" id="pq" maxlength="200" placeholder="예: 12월 회식 날짜 정하기"></div>' +
      '<div class="field"><label>항목</label><div id="popts"></div><button type="button" class="btn btn-line sm" id="padd" style="margin-top:6px">+ 항목 추가</button></div>' +
      '<div class="pset"><label><input type="checkbox" id="pmulti"> 복수 선택 허용</label><label><input type="checkbox" id="panon"> 익명 투표 (누가 골랐는지 숨김)</label>' +
      '<label><input type="checkbox" id="pend"> 마감 시간 정하기</label><input class="input" type="datetime-local" id="pendAt" hidden></div>' +
      '<p class="err" id="perr"></p><div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="pok">투표 올리기</button></div>');
    var box = $('#popts', m);
    function addOpt(v) {
      if ($$('input', box).length >= 20) return;
      var d = document.createElement('div'); d.className = 'popt-in';
      d.innerHTML = '<input class="input" maxlength="80" placeholder="항목 ' + ($$('input', box).length + 1) + '" value="' + esc(v || '') + '"><button type="button" aria-label="항목 삭제">' + svg('x') + '</button>';
      $('button', d).onclick = function () { if ($$('input', box).length > 2) d.remove(); };
      box.appendChild(d);
    }
    addOpt(); addOpt();
    $('#padd', m).onclick = function () { addOpt(); var l = $$('input', box); l[l.length - 1].focus(); };
    $('#pend', m).onchange = function () {
      var at = $('#pendAt', m); at.hidden = !this.checked;
      if (this.checked && !at.value) { var t = new Date(Date.now() + 24 * 3600e3); t.setMinutes(0, 0, 0); at.value = new Date(t - t.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
    };
    $('#pok', m).onclick = function () {
      var q = $('#pq', m).value.trim(), opts = $$('input', box).map(function (i) { return i.value.trim(); }).filter(Boolean);
      if (!q) { $('#perr', m).textContent = '투표 제목을 입력해 주세요.'; return; }
      if (opts.length < 2) { $('#perr', m).textContent = '항목을 2개 이상 입력해 주세요.'; return; }
      var endAt = $('#pend', m).checked && $('#pendAt', m).value ? new Date($('#pendAt', m).value).toISOString() : null;
      if (endAt && new Date(endAt) <= new Date()) { $('#perr', m).textContent = '마감 시간은 지금 이후로 정해 주세요.'; return; }
      var btn = this; btn.disabled = true;
      sb.rpc('create_poll', { r: S.room.id, q: q, opts: opts, is_multi: $('#pmulti', m).checked, is_anon: $('#panon', m).checked, close_at: endAt }).then(function (r) {
        if (r.error) throw r.error;
        closeSheet(m);
        sb.functions.invoke('push', { body: { action: 'message', message_id: r.data } }).catch(function () {});
        return sb.from('messages').select('*').eq('id', r.data).single().then(function (x) { if (x.data) addMessage(x.data); refreshRooms(); });
      }).catch(function (e) { $('#perr', m).textContent = errMsg(e); btn.disabled = false; });
    };
  }

  function copyText(t, btn) {
    function done() {
      if (btn) { btn.classList.add('ok'); btn.innerHTML = svg('check'); setTimeout(function () { btn.classList.remove('ok'); btn.innerHTML = svg('copy'); }, 1200); }
      else toast('복사했습니다');
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, fallback); else fallback();
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('복사하지 못했습니다'); } ta.remove();
    }
  }
  function msgSheet(m) {
    var mine = m.sender_id === S.me.id;
    var s = sheet('메시지', '<div class="emoji-row">' + EMOJIS.map(function (e) { return '<button' + (isTextReact(e) ? ' class="txt"' : '') + ' data-e="' + e + '" aria-label="' + e + ' 공감">' + e + '</button>'; }).join('') + '</div>' +
      '<div style="display:grid;gap:8px">' +
      '<button class="btn btn-line" id="mReply">답장</button>' +
      (m.body ? '<button class="btn btn-line" id="mCopy">복사</button>' : '') +
      (m.body && !m.poll_id ? '<button class="btn btn-line" id="mQueue">진료순서표에 올리기</button>' : '') +
      '<button class="btn btn-line" id="mNotice">이 메시지를 대화방 공지로 등록</button>' +
      (mine ? '<button class="btn btn-danger" id="mDel">삭제</button>' : '') +
      '<button class="btn btn-line" data-close>닫기</button></div>');
    $$('[data-e]', s).forEach(function (b) { b.onclick = function () { closeSheet(s); toggleReact(m.id, b.getAttribute('data-e')); }; });
    $('#mReply', s).onclick = function () { closeSheet(s); setReply(m); };
    var c = $('#mCopy', s); if (c) c.onclick = function () { closeSheet(s); copyText(m.body); };
    var mq = $('#mQueue', s); if (mq) mq.onclick = function () { closeSheet(s); queueFromMessage(m); };
    $('#mNotice', s).onclick = function () { closeSheet(s); setRoomNotice(m.id); };
    var dl = $('#mDel', s); if (dl) dl.onclick = function () { if (!confirmInline(dl, '한 번 더 누르면 삭제됩니다')) return; closeSheet(s); deleteMessage(m.id); };
  }
  function setRoomNotice(mid) {
    var rid = S.room.id;
    sb.rpc('set_room_notice', { r: rid, mid: mid }).then(function (r) {
      if (r.error) { toast(esc(errMsg(r.error))); return; }
      toast(mid ? '대화방 공지로 등록했습니다' : '공지를 내렸습니다'); loadRooms();
    });
  }
  function renderRoomNotice() {
    var box = $('#roomNotice'); if (!box || !S.room) return;
    var i = S.room.info;
    if (!i || !i.notice_id) { box.innerHTML = ''; return; }
    box.innerHTML = '<div class="room-notice"><button class="rn-body" id="rnGo"><span class="rn-tag">공지</span><span class="rn-txt">' + esc(i.notice_body || '사진·파일') + '</span>' + (i.notice_sender ? '<span class="rn-who">' + esc(i.notice_sender) + '</span>' : '') + '</button><button class="rn-x" id="rnX" aria-label="공지 내리기" title="공지 내리기">' + svg('x') + '</button></div>';
    $('#rnGo').onclick = function () { jumpTo(+i.notice_id); };
    $('#rnX').onclick = function () { if (!confirmInline(this, '내리기?')) return; setRoomNotice(null); };
  }
  function togglePin(r) {
    sb.from('room_members').update({ pinned: !r.pinned }).eq('room_id', r.id).eq('user_id', S.me.id).then(function (x) {
      if (x.error) { toast(esc(errMsg(x.error))); return; }
      toast(r.pinned ? '고정을 해제했습니다' : '채팅방을 맨 위에 고정했습니다'); r.pinned = !r.pinned; refreshRooms();
    });
  }
  function toggleMute(r) {
    sb.from('room_members').update({ muted: !r.muted }).eq('room_id', r.id).eq('user_id', S.me.id).then(function (x) {
      if (x.error) { toast(esc(errMsg(x.error))); return; }
      r.muted = !r.muted; refreshRooms(); toast(r.muted ? '이 방 알림을 껐습니다' : '알림을 켰습니다');
    });
  }
  var COLORS = [['', '기본'], ['#dfe8f3', '하늘'], ['#b8cbe0', '파랑'], ['#e3f0e5', '연두'], ['#fbf1dc', '크림'], ['#f8e4e8', '분홍'], ['#ece6f6', '보라'], ['#e6e6e6', '회색'], ['#2b3a4d', '어두운 남색']];
  function applyRoomColor() {
    var el = $('#msgs'); if (!el || !S.room) return;
    var c = (S.room.info && S.room.info.color) || '';
    el.style.background = c; el.classList.toggle('dark-bg', c === '#2b3a4d');
  }
  function colorSheet(r) {
    if (!r) return;
    var s = sheet('채팅방 배경색', '<p class="muted small" style="margin-bottom:12px">나에게만 적용됩니다.</p><div class="color-grid">' + COLORS.map(function (c) {
      return '<button data-c="' + c[0] + '"' + ((r.color || '') === c[0] ? ' aria-pressed="true"' : '') + '><span style="background:' + (c[0] || 'var(--bg)') + '"></span>' + c[1] + '</button>';
    }).join('') + '</div>');
    $$('[data-c]', s).forEach(function (b) {
      b.onclick = function () {
        var c = b.getAttribute('data-c');
        sb.from('room_members').update({ color: c }).eq('room_id', r.id).eq('user_id', S.me.id).then(function (x) {
          if (x.error) { toast(esc(errMsg(x.error))); return; }
          r.color = c; closeSheet(s); applyRoomColor();
        });
      };
    });
  }
  /* 1:1·나와의 채팅 나가기 = 목록에서만 숨김 (대화 내용 유지, 다시 대화하면 그대로 보임)
     clear=true 일 때만 대화 내용까지 지움 */
  function leaveOrHide(r, clear) {
    if (!r) return;
    var q = r.type === 'group'
      ? sb.from('room_members').delete().eq('room_id', r.id).eq('user_id', S.me.id)
      : sb.from('room_members').update(clear ? { hidden: true, cleared_at: new Date().toISOString() } : { hidden: true }).eq('room_id', r.id).eq('user_id', S.me.id);
    q.then(function (x) {
      if (x.error) { toast(esc(errMsg(x.error))); return; }
      toast(r.type === 'group' ? '채팅방에서 나왔습니다' : clear ? '대화 내용을 지우고 나왔습니다' : '채팅방에서 나왔습니다 (대화 내용은 남아 있습니다)');
      draftDel(r.id);   // 나간 방의 작성 중 글도 함께 삭제
      loadRooms().then(function () { if (S.route.id === r.id) location.hash = '#chats'; else renderRoomList(); });
    });
  }
  function roomQuickSheet(r) {
    if (!r) return;
    var s = sheet(esc(r.name), '<div style="display:grid;gap:8px">' +
      '<button class="btn btn-line" id="qPin">' + (r.pinned ? '상단 고정 해제' : '채팅방 상단 고정') + '</button>' +
      '<button class="btn btn-line" id="qMute">' + (r.muted ? '알림 켜기' : '이 방 알림 끄기') + '</button>' +
      (DESKTOP.matches ? '<button class="btn btn-line" id="qPop">새 창으로 열기</button>' : '') +
      '<button class="btn btn-line" id="qColor">채팅방 배경색 바꾸기</button>' +
      '<button class="btn btn-danger" id="qLeave">채팅방 나가기</button>' +
      (r.type === 'group' ? '' : '<button class="btn btn-line" id="qClear" style="color:#c0392b">대화 내용 지우고 나가기</button>') +
      '<button class="btn btn-line" data-close>닫기</button></div>');
    $('#qColor', s).onclick = function () { closeSheet(s); colorSheet(r); };
    $('#qLeave', s).onclick = function () { if (!confirmInline(this, '한 번 더 누르면 나갑니다')) return; closeSheet(s); leaveOrHide(r); };
    var qc = $('#qClear', s); if (qc) qc.onclick = function () { if (!confirmInline(this, '내 화면의 대화가 지워집니다. 한 번 더 누르세요')) return; closeSheet(s); leaveOrHide(r, true); };
    $('#qPin', s).onclick = function () { closeSheet(s); togglePin(r); };
    $('#qMute', s).onclick = function () { closeSheet(s); toggleMute(r); };
    var qp = $('#qPop', s); if (qp) qp.onclick = function () { closeSheet(s); openRoomWindow(r.id); };
  }

  /* 읽음 표시(숫자)만 바꾸기 – 화면 전체를 다시 그리지 않아 사진이 깜빡이지 않음 */
  var unreadRaf = 0;
  function updateUnreadCounts() {
    cancelAnimationFrame(unreadRaf);
    unreadRaf = requestAnimationFrame(function () {
      var el = $('#msgs'); if (!el) return;
      S.messages.forEach(function (m) {
        var meta = $('.msg[data-id="' + m.id + '"] .meta', el); if (!meta) return;
        var un = unreadCount(m), sp = $('.unread', meta);
        if (un) { if (!sp) { sp = document.createElement('span'); sp.className = 'unread'; meta.insertBefore(sp, meta.firstChild); } if (sp.textContent !== String(un)) sp.textContent = un; }
        else if (sp) sp.remove();
      });
    });
  }
  function cachedUrl(p) { var c = S.urlCache[p]; return c && c.exp > Date.now() ? c.url : null; }
  function signUrls(paths) {
    if (!paths.length) return Promise.resolve();
    return sb.storage.from('files').createSignedUrls(paths, 3600).then(function (r) {
      (r.data || []).forEach(function (x) { if (x.signedUrl) S.urlCache[x.path] = { url: x.signedUrl, exp: Date.now() + 3500 * 1000 }; });
      $$('[data-path]').forEach(function (a) {
        var u = cachedUrl(a.getAttribute('data-path')); if (!u) return;
        a.href = a.hasAttribute('data-dl') ? u + '&download=' + encodeURIComponent(a.getAttribute('data-dl')) : u;
        var im = $('img', a); if (im && !im.getAttribute('src')) im.src = u;
      });
    });
  }

  function postMessage(row) {   // 결과: 서버에 저장됐으면 true · 저장하지 못했으면 false (글을 되돌려 놓을 때 씀)
    var roomId = S.room.id, sent = false;
    row.room_id = roomId; row.sender_id = S.me.id;
    return sb.from('messages').insert(row).select().single().then(function (r) {
      if (r.error) throw r.error;
      sent = true;
      addMessage(r.data);
      sb.functions.invoke('push', { body: { action: 'message', message_id: r.data.id } }).catch(function () {});
      refreshRooms();
      return true;
    }).catch(function (e) { toast('<b>전송 실패</b> ' + esc(errMsg(e))); return sent; });
  }
  function addMessage(m) {
    if (!S.room || m.room_id !== S.room.id) return;
    if (S.messages.some(function (x) { return x.id === m.id; })) return;
    S.messages.push(m); renderMessages(m.sender_id === S.me.id);
  }
  function deleteMessage(id, btn) {
    if (btn && !confirmInline(btn, '삭제?')) return;
    sb.from('messages').update({ deleted: true, body: '' }).eq('id', id).then(function (r) {
      if (r.error) { toast(esc(errMsg(r.error))); return; }
      var m = S.messages.find(function (x) { return x.id === id; });
      if (m) { if (m.file_path) sb.storage.from('files').remove([m.file_path]); m.deleted = true; m.body = ''; renderMessages(false); }
      refreshRooms();
    });
  }

  /* 사진은 자동으로 줄여서 올립니다 (최대 1600px, JPEG) */
  function compress(file) {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type) || !window.createImageBitmap) return Promise.resolve(file);
    return createImageBitmap(file).then(function (bmp) {
      var max = 1600, sc = Math.min(1, max / Math.max(bmp.width, bmp.height));
      var c = document.createElement('canvas'); c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      return new Promise(function (res) { c.toBlob(function (b) { res(b && b.size < file.size ? new File([b], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file); }, 'image/jpeg', 0.82); });
    }).catch(function () { return file; });
  }
  /* ---------- 화면 캡처 ---------- */
  function screenCapture() {
    if (!S.room) return;
    if (ND && ND.capture) {
      toast('캡처할 영역을 마우스로 드래그하세요');
      ND.capture().then(function (dataUrl) {
        if (!dataUrl) return;
        fetch(dataUrl).then(function (r) { return r.blob(); }).then(function (blob) {
          var t = new Date(), f = new File([blob], '캡처_' + t.getFullYear() + ('0' + (t.getMonth() + 1)).slice(-2) + ('0' + t.getDate()).slice(-2) + '_' + ('0' + t.getHours()).slice(-2) + ('0' + t.getMinutes()).slice(-2) + ('0' + t.getSeconds()).slice(-2) + '.png', { type: 'image/png' });
          var m = sheet('캡처 보내기', '<img src="' + dataUrl + '" alt="캡처한 화면" style="max-width:100%;max-height:50vh;display:block;margin:0 auto 14px;border:1px solid var(--line);border-radius:8px">' +
            '<div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="capSend">보내기</button></div>');
          var sbtn = $('#capSend', m); sbtn.focus();
          sbtn.onclick = function () { closeSheet(m); uploadFiles([f]); };
        });
      });
      return;
    }
    sheet('화면 캡처', '<p style="line-height:1.7">1. 키보드에서 <b>Windows 키 + Shift + S</b> 를 누릅니다.<br>2. 보낼 영역을 마우스로 드래그합니다.<br>3. 이 채팅방 입력창을 클릭하고 <b>Ctrl + V</b> 를 누르면 바로 전송됩니다.</p>' +
      '<p class="muted small" style="margin-top:8px">PC 프로그램을 최신 버전으로 설치하면 이 버튼만 눌러도 캡처됩니다.</p><div class="sheet-actions"><button class="btn btn-navy" data-close>확인</button></div>');
  }
  function uploadFiles(files) {
    if (!files.length || !S.room) return;
    var roomId = S.room.id, upl = $('#upl');
    var chain = Promise.resolve();
    files.forEach(function (f, i) {
      chain = chain.then(function () {
        if (f.size > 25 * 1024 * 1024) { toast('<b>' + esc(f.name) + '</b> 25MB가 넘어 보낼 수 없습니다'); return; }
        upl.hidden = false; upl.textContent = '보내는 중… (' + (i + 1) + '/' + files.length + ') ' + f.name;
        return compress(f).then(function (ff) {
          var ext = (ff.name.match(/\.([\w]+)$/) || [, 'bin'])[1].toLowerCase();
          var path = 'room/' + roomId + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
          return sb.storage.from('files').upload(path, ff, { contentType: ff.type || 'application/octet-stream', upsert: false }).then(function (r) {
            if (r.error) throw r.error;
            if (!S.room || S.room.id !== roomId) return;
            return postMessage({ body: '', file_path: path, file_name: f.name, file_size: ff.size, file_type: ff.type || 'application/octet-stream' });
          });
        }).catch(function (e) { toast('<b>파일 전송 실패</b> ' + esc(errMsg(e))); });
      });
    });
    chain.then(function () { if (upl) upl.hidden = true; });
  }

  var readTimer = null;
  function markRead() {
    if (!S.room || document.visibilityState !== 'visible') return;
    clearTimeout(readTimer);
    readTimer = setTimeout(function () {
      if (!S.room) return;
      var now = new Date().toISOString(), rid = S.room.id;
      sb.from('room_members').update({ last_read_at: now }).eq('room_id', rid).eq('user_id', S.me.id).then(function () {
        var r = S.rooms.find(function (x) { return x.id === rid; }); if (r && r.unread) { r.unread = 0; setBadges(); if (S.route.tab === 'chats') renderRoomList(); }
      });
    }, 300);
  }
  /* 창이 다시 보일 때(최소화·절전 뒤) 그동안 놓친 새 메시지를 채움 — 방이 계속 열려 있어도(자동 열기) 실시간 연결이 끊겼던 사이의 대화가 빠지지 않게 */
  function catchUp() {
    if (!S.room || !S.messages.length) return;
    var rid = S.room.id, last = S.messages[S.messages.length - 1];
    sb.from('messages').select('*').eq('room_id', rid).gte('created_at', last.created_at).order('created_at', { ascending: true }).limit(200).then(function (r) {
      if (!S.room || S.room.id !== rid || r.error || !r.data) return;
      r.data.forEach(function (m) { addMessage(m); });   // 이미 있는 메시지는 addMessage 가 걸러 줌
    }).catch(function () {});
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') { markRead(); catchUp(); if (S.me) { reloadProfiles().then(function () { return loadRooms(); }).then(function () { if (S.route.tab === 'chats') renderRoomList(); }); loadNotices(); loadQueue(); loadPending(); if (S.route.tab === 'rsv' && rsvShown()) rsvLoad(); } } });

  function roomMenu() {
    var info = S.room.info || {}, grp = info.type === 'group';
    var mem = Object.keys(S.members).map(function (u) { return S.profiles[u]; }).filter(Boolean);
    var m = sheet(grp ? esc(info.name) : '대화 설정',
      '<p class="muted small" style="margin-bottom:8px">참여자 ' + mem.length + '명</p><div class="chips" style="margin-bottom:16px">' + mem.map(function (p) { return '<span>' + esc(p.name) + '</span>'; }).join('') + '</div>' +
      '<div style="display:grid;gap:8px">' +
      (grp ? '<button class="btn btn-line" id="addMem">사람 추가</button><button class="btn btn-line" id="rename">방 이름 바꾸기</button>' : '') +
      '<button class="btn btn-line" id="pinBtn">' + (info.pinned ? '상단 고정 해제' : '채팅방 상단 고정') + '</button>' +
      '<button class="btn btn-line" id="muteBtn">' + (info.muted ? '알림 켜기' : '이 방 알림 끄기') + '</button>' +
      '<button class="btn btn-line" id="colorBtn">채팅방 배경색 바꾸기</button>' +
      '<button class="btn btn-danger" id="leave">채팅방 나가기</button>' +
      (grp ? '' : '<button class="btn btn-line" id="clearLeave" style="color:#c0392b">대화 내용 지우고 나가기</button>') +
      '<button class="btn btn-line" data-close>닫기</button></div>');
    $('#colorBtn', m).onclick = function () { closeSheet(m); colorSheet(S.room.info); };
    $('#leave', m).onclick = function () { if (!confirmInline(this, '한 번 더 누르면 나갑니다')) return; closeSheet(m); leaveOrHide(S.room.info); };
    var cl = $('#clearLeave', m); if (cl) cl.onclick = function () { if (!confirmInline(this, '내 화면의 대화가 지워집니다. 한 번 더 누르세요')) return; closeSheet(m); leaveOrHide(S.room.info, true); };
    $('#muteBtn', m).onclick = function () { closeSheet(m); if (S.room.info) toggleMute(S.room.info); };
    $('#pinBtn', m).onclick = function () { closeSheet(m); if (S.room.info) togglePin(S.room.info); };
    if (grp) {
      $('#rename', m).onclick = function () {
        closeSheet(m);
        var s2 = sheet('방 이름 바꾸기', '<div class="field"><input class="input" id="rn" value="' + esc(info.name) + '" aria-label="방 이름"></div><div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="rnOk">저장</button></div>');
        $('#rnOk', s2).onclick = function () {
          var v = $('#rn', s2).value.trim(); if (!v) return;
          sb.from('rooms').update({ name: v }).eq('id', S.room.id).then(function (r) {
            if (r.error) { toast(esc(errMsg(r.error))); return; }
            closeSheet(s2); info.name = v; var h = $('#main .pane-hd h1'); if (h) h.textContent = v; refreshRooms();
          });
        };
      };
      $('#addMem', m).onclick = function () {
        closeSheet(m);
        var cand = others().filter(function (p) { return !S.members[p.id]; });
        var s3 = sheet('사람 추가', '<div class="pick">' + (cand.length ? cand.map(function (p) { return '<label><input type="checkbox" value="' + p.id + '"><span><b>' + esc(p.name) + '</b> <span class="muted small">' + esc(personLabel(p)) + '</span></span></label>'; }).join('') : '<p class="empty">추가할 직원이 없습니다.</p>') + '</div>' +
          '<div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="amOk">추가</button></div>');
        $('#amOk', s3).onclick = function () {
          var ids = $$('input:checked', s3).map(function (i) { return i.value; }); if (!ids.length) return;
          sb.rpc('add_members', { r: S.room.id, member_ids: ids }).then(function (r) {
            if (r.error) { toast(esc(errMsg(r.error))); return; }
            closeSheet(s3); var rid = S.room.id; S.room = null; refreshRooms(); openRoom(rid);
          });
        };
      };
    }
  }

  /* ================= 공지 ================= */
  function loadNotices() {
    return Promise.all([
      sb.from('notices').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(200),
      sb.from('notice_reads').select('notice_id').eq('user_id', S.me.id)
    ]).then(function (r) {
      S.notices = r[0].data || []; S.noticeReads = {};
      (r[1].data || []).forEach(function (x) { S.noticeReads[x.notice_id] = true; });
      setBadges(); if (S.route.tab === 'notices' && !S.route.id) renderNoticeList();
    });
  }
  function renderNoticeList() {
    unsingle(); var admin = S.me.role === 'admin';
    $('#list').innerHTML = header('공지', { right: admin ? '<button class="icon-btn" id="newNotice" aria-label="공지 쓰기">' + svg('plus') + '</button>' : '' }) +
      '<div class="pane-body">' + (S.notices.length ? S.notices.map(function (n) {
        return '<a class="notice-item" href="#notice/' + n.id + '"' + (+S.route.id === n.id ? ' style="background:#eef3fa"' : '') + '><b>' + (!S.noticeReads[n.id] ? '<span class="dot" aria-label="안 읽음"></span>' : '') + (n.pinned ? '<span class="pill gold">고정</span>' : '') + esc(n.title) + '</b>' +
          '<p>' + esc(ymd(n.created_at)) + ' · ' + esc((S.profiles[n.author_id] || {}).name || '') + ' · ' + esc(n.body.slice(0, 60)) + '</p></a>';
      }).join('') : '<p class="empty">등록된 공지가 없습니다.</p>') + '</div>';
    if (admin) $('#newNotice').onclick = function () { noticeSheet(); };
  }
  function openNotice(id) {
    var n = S.notices.find(function (x) { return x.id === id; });
    var main = $('#main'); main.style.justifyContent = '';
    if (!n) { main.innerHTML = header('공지', { back: '#notices' }) + '<p class="empty">공지를 찾을 수 없습니다.</p>'; return; }
    var admin = S.me.role === 'admin';
    main.innerHTML = header('공지', { back: '#notices', right: admin ? '<button class="btn btn-line sm" id="editN">수정</button><button class="btn btn-danger sm" id="delN">삭제</button>' : '' }) +
      '<div class="pane-body"><article class="doc"><h2>' + esc(n.title) + '</h2><p class="doc-meta">' + esc((S.profiles[n.author_id] || {}).name || '') + ' · ' + dayLabel(n.created_at) + ' ' + hm(n.created_at) + '</p>' +
      '<div class="doc-body">' + linkify(n.body) + '</div>' +
      (n.file_path ? '<p style="margin-top:14px"><a class="file-msg" data-path="' + esc(n.file_path) + '" data-dl="' + esc(n.file_name || 'file') + '" href="#" target="_blank" rel="noopener">' + svg('file') + '<span style="min-width:0"><b>' + esc(n.file_name || '첨부파일') + '</b><span>열기</span></span></a></p>' : '') +
      '</article><div id="readBox"></div></div>';
    if (n.file_path) signUrls([n.file_path]);
    if (!S.noticeReads[id]) {
      sb.from('notice_reads').insert({ notice_id: id, user_id: S.me.id }).then(function () { S.noticeReads[id] = true; setBadges(); renderNoticeList(); });
    }
    if (admin) {
      $('#editN').onclick = function () { noticeSheet(n); };
      $('#delN').onclick = function () {
        if (!confirmInline(this, '한 번 더 누르면 삭제')) return;
        sb.from('notices').delete().eq('id', id).then(function (r) { if (r.error) { toast(esc(errMsg(r.error))); return; } loadNotices().then(function () { location.hash = '#notices'; }); });
      };
      sb.from('notice_reads').select('user_id').eq('notice_id', id).then(function (r) {
        var read = {}; (r.data || []).forEach(function (x) { read[x.user_id] = true; });
        var act = Object.keys(S.profiles).map(function (k) { return S.profiles[k]; }).filter(function (p) { return p.active; });
        var un = act.filter(function (p) { return !read[p.id]; });
        var box = $('#readBox'); if (!box) return;
        box.innerHTML = '<section class="read-box"><h3>읽음 ' + (act.length - un.length) + ' / ' + act.length + '명</h3>' +
          (un.length ? '<p class="muted small" style="margin-bottom:6px">아직 안 읽은 직원</p><div class="chips">' + un.map(function (p) { return '<span>' + esc(p.name) + '</span>'; }).join('') + '</div>' : '<p class="muted small">모두 확인했습니다.</p>') + '</section>';
      });
    }
  }
  function noticeSheet(n) {
    var m = sheet(n ? '공지 수정' : '공지 쓰기',
      '<div class="field"><label for="nt">제목</label><input class="input" id="nt" value="' + esc(n ? n.title : '') + '"></div>' +
      '<div class="field"><label for="nb">내용</label><textarea class="input" id="nb" rows="8">' + esc(n ? n.body : '') + '</textarea></div>' +
      (n ? '' : '<div class="field"><label for="nf">첨부파일 (선택)</label><input class="input" type="file" id="nf"></div>') +
      '<label style="display:flex;gap:8px;align-items:center;margin-bottom:14px"><input type="checkbox" id="np" ' + (n && n.pinned ? 'checked' : '') + ' style="width:20px;height:20px;accent-color:var(--navy)"> 맨 위에 고정</label>' +
      (n ? '' : '<label style="display:flex;gap:8px;align-items:center;margin-bottom:14px"><input type="checkbox" id="npush" checked style="width:20px;height:20px;accent-color:var(--navy)"> 전 직원 휴대폰으로 알림 보내기</label>') +
      '<p class="err" id="ne"></p><div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="nOk">' + (n ? '저장' : '등록') + '</button></div>');
    $('#nOk', m).onclick = function () {
      var t = $('#nt', m).value.trim(), b = $('#nb', m).value.trim(), pin = $('#np', m).checked;
      if (!t) { $('#ne', m).textContent = '제목을 입력해 주세요.'; return; }
      var btn = this; btn.disabled = true;
      var fileIn = $('#nf', m), f = fileIn && fileIn.files[0];
      var up = f ? compress(f).then(function (ff) {
        var path = 'notice/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ((ff.name.match(/\.(\w+)$/) || [, 'bin'])[1]);
        return sb.storage.from('files').upload(path, ff, { contentType: ff.type || 'application/octet-stream' }).then(function (r) { if (r.error) throw r.error; return { file_path: path, file_name: f.name }; });
      }) : Promise.resolve({});
      up.then(function (fx) {
        var row = Object.assign({ title: t, body: b, pinned: pin }, fx);
        if (n) return sb.from('notices').update(row).eq('id', n.id).select().single();
        row.author_id = S.me.id; return sb.from('notices').insert(row).select().single();
      }).then(function (r) {
        if (r.error) throw r.error;
        if (!n && $('#npush', m).checked) sb.functions.invoke('push', { body: { action: 'notice', notice_id: r.data.id } }).catch(function () {});
        closeSheet(m); return loadNotices().then(function () { location.hash = '#notice/' + r.data.id; route(); });
      }).catch(function (e) { $('#ne', m).textContent = errMsg(e); btn.disabled = false; });
    };
  }

  /* ================= 근무 신청 ================= */
  var KINDS = [['초과근무', true], ['휴일근무', true], ['추가근무', true], ['연차', false], ['반차', false], ['조퇴', true], ['지각', true], ['기타', true]];
  function timeKind(k) { var x = KINDS.find(function (y) { return y[0] === k; }); return x ? x[1] : true; }
  function diffMin(a, b) { if (!a || !b) return 0; var p = a.split(':'), q = b.split(':'); var v = (+q[0] * 60 + +q[1]) - (+p[0] * 60 + +p[1]); return v < 0 ? v + 1440 : v; }

  /* ================= 출퇴근 (병원 인터넷 IP에서 PC로) ================= */
  function attCall(body) {
    return sb.functions.invoke('attendance', { body: body }).then(function (r) {
      if (r.error) {
        var ctx = r.error.context; if (ctx && ctx.json) return ctx.json().then(function (j) { var e = new Error(j.error || r.error.message); e.ip = j.ip; throw e; }, function () { throw r.error; });
        throw r.error;
      }
      if (r.data && r.data.error) throw new Error(r.data.error);
      return r.data;
    });
  }
  function attLoad() { return attCall({ action: 'status' }).then(function (d) { S.att = d; return d; }).catch(function (e) { S.att = { error: errMsg(e) }; return S.att; }); }
  function hhmm(x) { if (!x) return ''; var t = d(x); return String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0'); }
  function minsTxt(n) { if (n == null) return ''; var h = Math.floor(n / 60), m = n % 60; return (h ? h + '시간' : '') + (m || !h ? (h ? ' ' : '') + m + '분' : ''); }
  function attCalc(r, p) {
    var o = { work: null, late: null, over: null };
    if (r.clock_in && r.clock_out) o.work = Math.max(0, Math.round((d(r.clock_out) - d(r.clock_in)) / 60000));
    var base = function (hm) { var t = new Date(r.work_date + 'T' + hm.slice(0, 5) + ':00'); return t; };
    if (p && p.work_start && r.clock_in) { var l = Math.round((d(r.clock_in) - base(p.work_start)) / 60000); o.late = l > 0 ? l : 0; }
    if (p && p.work_end && r.clock_out) { var e = base(p.work_end); if (p.work_start && p.work_end < p.work_start) e = new Date(e.getTime() + 864e5); var v = Math.round((d(r.clock_out) - e) / 60000); o.over = v > 0 ? v : 0; }
    return o;
  }
  var WD = ['일', '월', '화', '수', '목', '금', '토'];
  function attDayLbl(ds) { var t = new Date(ds + 'T00:00:00'); return (t.getMonth() + 1) + '/' + t.getDate() + ' (' + WD[t.getDay()] + ')'; }
  function renderAtt() {
    var box = $('#wcontent'); if (!box) return;
    box.innerHTML = '<p class="muted" style="padding:14px">불러오는 중…</p>';
    attLoad().then(function (a) {
      if (!$('#wcontent')) return;
      if (a.error) { box.innerHTML = '<section class="card"><h3>출퇴근</h3><p class="err">' + esc(a.error) + '</p><p class="muted small">관리자가 출퇴근 기능(attendance)을 아직 설치하지 않았을 수 있습니다.</p></section>'; return; }
      var views = [];
      if (a.enabled) views.push(['mine', '내 기록']);
      if ((a.team || []).length) views.push(['team', '우리 팀 (' + a.team.length + ')']);
      if (a.manager) views.push(['all', '전체 현황' + ((S.ipReqs || []).length ? ' (' + S.ipReqs.length + ')' : '')]);
      if (!views.length) { box.innerHTML = '<section class="card"><h3>출퇴근</h3><p class="muted">출퇴근 대상이 아닙니다. 필요하면 관리자에게 문의해 주세요.</p></section>'; return; }
      if (!views.some(function (v) { return v[0] === S.attView; })) S.attView = views[0][0];
      box.innerHTML = (a.enabled ? '<section class="card att-today" id="attToday"></section>' : '') +
        (views.length > 1 ? '<div class="seg sm" role="group" aria-label="출퇴근 보기">' + views.map(function (v) { return '<button aria-pressed="' + (S.attView === v[0]) + '" data-av="' + v[0] + '">' + v[1] + '</button>'; }).join('') + '</div>' : '') +
        '<div id="attBody"></div>';
      $$('[data-av]', box).forEach(function (b) { b.onclick = function () { S.attView = b.getAttribute('data-av'); renderAtt(); }; });
      if (a.enabled) attTodayCard();
      if (S.attView === 'all') attAdmin(); else if (S.attView === 'team') attTeam(); else attMine();
    });
  }
  function attCanPunch() { var a = S.att || {}; return DESKTOP.matches || !!a.mobileOk; }
  function attNetMsg() {
    var a = S.att || {}, mgr = a.manager;
    if (a.noIps) return '<p class="att-warn">아직 병원 인터넷 주소가 등록되지 않았습니다. ' + (mgr ? '<b>전체 현황 → 병원 인터넷 주소</b>에서 등록해 주세요.' : '관리자에게 알려 주세요.') + '</p>';
    if (!a.allowed) return '<p class="att-warn">지금은 병원 인터넷이 아닙니다. ' + (DESKTOP.matches ? '병원 PC에서 눌러 주세요.' : '휴대폰을 <b>병원 와이파이</b>에 연결한 뒤 눌러 주세요.') + (mgr ? ' <span class="muted">(현재 주소 ' + esc(a.ip || '') + ')</span>' : '') + '</p>' + attReqBox();
    return '<p class="muted small" style="margin-top:8px">✓ 병원 인터넷에 연결되어 있습니다</p>';
  }
  function attTeam() {
    var body = $('#attBody'); if (!body) return;
    var a = S.att || {}, team = a.team || [], ids = team.map(function (t) { return t.id; });
    body.innerHTML = '<section class="card"><div class="att-hd"><h3>우리 팀 오늘 출퇴근</h3><span class="muted small">' + attDayLbl(a.today) + '</span></div><div id="teamList"><p class="muted">불러오는 중…</p></div>' +
      (attCanPunch() ? attNetMsg() : '<p class="att-warn">팀원 출퇴근은 병원 <b>PC</b>에서 눌러 주세요.</p>') + '</section>' +
      '<section class="card"><div class="att-hd"><h3>팀원 기록</h3><input class="input sm" type="month" id="teamM" value="' + S.attMonth + '" aria-label="월 선택"></div><div id="teamMonth"></div></section>';
    $('#teamM').onchange = function () { S.attMonth = this.value; attTeamMonth(ids); };
    sb.from('attendance').select('*').in('user_id', ids).eq('work_date', a.today).then(function (r) {
      var l = $('#teamList'); if (!l) return;
      var by = {}; (r.data || []).forEach(function (x) { by[x.user_id] = x; });
      var can = attCanPunch() && a.allowed;
      l.innerHTML = team.map(function (t) {
        var x = by[t.id] || {}, p = S.profiles[t.id] || t;
        return '<div class="team-row"><span class="grow"><b>' + esc(p.name) + '</b><br><span class="muted small">출근 ' + (hhmm(x.clock_in) || '--:--') + ' · 퇴근 ' + (hhmm(x.clock_out) || '--:--') + '</span></span>' +
          (can ? '<button class="btn btn-navy sm" data-tin="' + t.id + '"' + (x.clock_in ? ' disabled' : '') + '>' + (x.clock_in ? '출근 ✓' : '출근') + '</button><button class="btn btn-gold sm" data-tout="' + t.id + '">' + (x.clock_out ? '퇴근 ✓' : '퇴근') + '</button>' : '') + '</div>';
      }).join('');
      $$('[data-tin]', l).forEach(function (b) { b.onclick = function () { attPunch('in', b, b.getAttribute('data-tin')); }; });
      $$('[data-tout]', l).forEach(function (b) { b.onclick = function () { if (b.textContent.indexOf('✓') > -1 && !confirmInline(b, '퇴근 시간을 다시 찍을까요?')) return; attPunch('out', b, b.getAttribute('data-tout')); }; });
    });
    attBindReq(body);
    attTeamMonth(ids);
  }
  function attTeamMonth(ids) {
    var m = S.attMonth, start = m + '-01', end = ymd(new Date(+m.slice(0, 4), +m.slice(5, 7), 0));
    sb.from('attendance').select('*').in('user_id', ids).gte('work_date', start).lte('work_date', end).order('work_date', { ascending: false }).then(function (r) {
      var l = $('#teamMonth'); if (!l) return;
      var rows = r.data || [];
      if (!rows.length) { l.innerHTML = '<p class="muted">이 달 기록이 없습니다.</p>'; return; }
      l.innerHTML = '<table class="att-tbl"><thead><tr><th>날짜</th><th>이름</th><th>출근</th><th>퇴근</th><th>비고</th></tr></thead><tbody>' + rows.map(function (x) {
        var p = S.profiles[x.user_id] || {}, c = attCalc(x, p);
        return '<tr><td>' + attDayLbl(x.work_date) + '</td><td>' + esc(p.name || '') + '</td><td>' + (hhmm(x.clock_in) || '<span class="miss">없음</span>') + '</td><td>' + (hhmm(x.clock_out) || '<span class="miss">없음</span>') + '</td><td class="small">' +
          [c.late ? '<span class="late">지각 ' + minsTxt(c.late) + '</span>' : '', c.over ? '<span class="over">연장 ' + minsTxt(c.over) + '</span>' : '', esc(x.note || '')].filter(Boolean).join(' ') + '</td></tr>';
      }).join('') + '</tbody></table>';
    });
  }
  function attTodayCard() {
    var c = $('#attToday'); if (!c) return;
    var a = S.att || {}, r = a.record || {}, pc = attCanPunch();
    var now = new Date();
    c.innerHTML = '<div class="att-hd"><h3>오늘 출퇴근</h3><span class="muted small">' + attDayLbl(a.today || ymd(now)) + '</span></div>' +
      '<div class="att-times"><div><span>출근</span><b>' + (r.clock_in ? hhmm(r.clock_in) : '--:--') + '</b></div><div><span>퇴근</span><b>' + (r.clock_out ? hhmm(r.clock_out) : '--:--') + '</b></div></div>' +
      (pc ? '<div class="att-btns"><button class="btn btn-navy" id="attIn"' + (r.clock_in ? ' disabled' : '') + '>' + (r.clock_in ? '출근 완료' : '출근') + '</button><button class="btn btn-gold" id="attOut"' + (!r.clock_in && !r.clock_out ? '' : '') + '>' + (r.clock_out ? '퇴근 다시 찍기' : '퇴근') + '</button></div>' +
        attNetMsg()
        : '<p class="att-warn">출퇴근은 병원 <b>PC</b>에서 눌러 주세요. 휴대폰에서는 기록 확인만 됩니다.</p>');
    attBindReq(c);
    var bi = $('#attIn'), bo = $('#attOut');
    if (bi) bi.onclick = function () { attPunch('in', bi); };
    if (bo) bo.onclick = function () { if (r.clock_out && !confirmInline(bo, '다시 찍으면 퇴근 시간이 바뀝니다')) return; attPunch('out', bo); };
  }
  function attPunch(kind, btn, target) {
    if (btn) btn.disabled = true;
    var body = { action: kind }; if (target) body.user_id = target;
    var who = target ? esc((S.profiles[target] || {}).name || '') + ' · ' : '';
    return attCall(body).then(function (res) {
      var t = hhmm(kind === 'in' ? res.record.clock_in : res.record.clock_out);
      toast('<b>' + (kind === 'in' ? '출근' : '퇴근') + '</b> ' + who + (res.already ? '이미 출근했습니다 (' + t + ')' : t + ' 기록했습니다') + (res.noIn ? ' · 출근 기록이 없어 관리자에게 수정 요청하세요' : ''));
      return attLoad().then(function () { if ($('#attToday')) attTodayCard(); renderAttNudge(); if ($('#attList')) attMine(); if ($('#teamList')) attTeam(); });
    }).catch(function (e) { toast(esc(errMsg(e))); if (btn) btn.disabled = false; });
  }
  function attMine() {
    var body = $('#attBody'); if (!body) return;
    body.innerHTML = '<section class="card"><div class="att-hd"><h3>내 출퇴근 기록</h3><input class="input sm" type="month" id="attM" value="' + S.attMonth + '" aria-label="월 선택"></div><div id="attList"><p class="muted">불러오는 중…</p></div></section>';
    $('#attM').onchange = function () { S.attMonth = this.value; attMine(); };
    var m = S.attMonth, start = m + '-01', end = ymd(new Date(+m.slice(0, 4), +m.slice(5, 7), 0));
    sb.from('attendance').select('*').eq('user_id', S.me.id).gte('work_date', start).lte('work_date', end).order('work_date', { ascending: false }).then(function (r) {
      var l = $('#attList'); if (!l) return;
      if (r.error) { l.innerHTML = '<p class="err">' + esc(errMsg(r.error)) + '</p>'; return; }
      var rows = r.data || [], tw = 0, to = 0, p = S.profiles[S.me.id] || S.me;
      if (!rows.length) { l.innerHTML = '<p class="muted">이 달 기록이 없습니다.</p>'; return; }
      l.innerHTML = '<table class="att-tbl"><thead><tr><th>날짜</th><th>출근</th><th>퇴근</th><th>근무</th><th>비고</th></tr></thead><tbody>' + rows.map(function (x) {
        var c = attCalc(x, p); tw += c.work || 0; to += c.over || 0;
        return '<tr><td>' + attDayLbl(x.work_date) + '</td><td>' + (hhmm(x.clock_in) || '<span class="miss">없음</span>') + '</td><td>' + (hhmm(x.clock_out) || '<span class="miss">없음</span>') + '</td><td>' + minsTxt(c.work) + '</td><td class="small">' +
          [c.late ? '<span class="late">지각 ' + minsTxt(c.late) + '</span>' : '', c.over ? '<span class="over">연장 ' + minsTxt(c.over) + '</span>' : '', x.edited_by ? '<span class="muted">관리자 수정</span>' : '', esc(x.note || '')].filter(Boolean).join(' ') + '</td></tr>';
      }).join('') + '</tbody></table><p class="muted small" style="margin-top:8px">이 달 합계: 근무 ' + minsTxt(tw) + (to ? ' · 연장 ' + minsTxt(to) : '') + ' · 기록이 틀리면 관리자에게 수정을 요청하세요.</p>';
    });
  }
  function attAdmin() {
    var body = $('#attBody'); if (!body) return;
    body.innerHTML = '<section class="card" id="attReqs" hidden></section>' +
      '<section class="card"><div class="att-hd"><h3>날짜별 현황</h3><input class="input sm" type="date" id="attD" value="' + S.attDay + '" aria-label="날짜 선택"></div><div id="attDay"><p class="muted">불러오는 중…</p></div></section>' +
      '<section class="card"><div class="att-hd"><h3>월별 엑셀</h3><input class="input sm" type="month" id="attAM" value="' + S.attMonth + '" aria-label="월 선택"></div><p class="muted small" style="margin-bottom:10px">전 직원의 출근·퇴근·근무시간·지각·연장을 엑셀(CSV)로 받습니다. 급여정리에 그대로 쓰세요.</p><button class="btn btn-gold sm" id="attCsv">' + svg('down').replace('<svg', '<svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2"') + ' 출퇴근 엑셀(CSV) 받기</button></section>' +
      '<section class="card" id="attIps"><h3>병원 인터넷 주소</h3><p class="muted small">불러오는 중…</p></section>';
    $('#attD').onchange = function () { S.attDay = this.value; attDayList(); };
    $('#attAM').onchange = function () { S.attMonth = this.value; };
    $('#attCsv').onclick = attCsv;
    attReqs(); loadIpReqs();
    attDayList(); attIps();
  }
  function attDayList() {
    var day = S.attDay;
    sb.from('attendance').select('*').eq('work_date', day).then(function (r) {
      var l = $('#attDay'); if (!l) return;
      if (r.error) { l.innerHTML = '<p class="err">' + esc(errMsg(r.error)) + '</p>'; return; }
      var by = {}; (r.data || []).forEach(function (x) { by[x.user_id] = x; });
      var staff = Object.keys(S.profiles).map(function (k) { return S.profiles[k]; }).filter(function (p) { return p.active && (p.att_enabled || by[p.id]); });
      var cin = staff.filter(function (p) { return by[p.id] && by[p.id].clock_in; }).length;
      l.innerHTML = '<p class="small" style="margin-bottom:8px">출근 <b>' + cin + '</b> / ' + staff.length + '명</p><table class="att-tbl"><thead><tr><th>이름</th><th>출근</th><th>퇴근</th><th>비고</th><th></th></tr></thead><tbody>' +
        staff.sort(function (a, b) { return (a.dept || '').localeCompare(b.dept || '') || a.name.localeCompare(b.name); }).map(function (p) {
          var x = by[p.id], c = x ? attCalc(x, p) : {};
          return '<tr><td><b>' + esc(p.name) + '</b> <span class="muted small">' + esc(p.dept || '') + '</span></td><td>' + (x && x.clock_in ? hhmm(x.clock_in) : '<span class="miss">-</span>') + '</td><td>' + (x && x.clock_out ? hhmm(x.clock_out) : '<span class="miss">-</span>') + '</td><td class="small">' +
            [c.late ? '<span class="late">지각 ' + minsTxt(c.late) + '</span>' : '', c.over ? '<span class="over">연장 ' + minsTxt(c.over) + '</span>' : '', x && x.note ? esc(x.note) : ''].filter(Boolean).join(' ') + '</td><td style="white-space:nowrap"><button class="btn btn-line sm" data-attedit="' + p.id + '">수정</button> <button class="btn btn-line sm" data-attset="' + p.id + '" title="출퇴근 설정">설정</button></td></tr>';
        }).join('') + '</tbody></table>';
      $$('[data-attset]', l).forEach(function (b) { b.onclick = function () { attSetSheet(S.profiles[b.getAttribute('data-attset')], attDayList); }; });
      $$('[data-attedit]', l).forEach(function (b) { b.onclick = function () { attEditSheet(S.profiles[b.getAttribute('data-attedit')], day, by[b.getAttribute('data-attedit')]); }; });
    });
  }
  function attEditSheet(p, day, x) {
    var m = sheet(esc(p.name) + ' · ' + attDayLbl(day), '<div class="row2"><div class="field"><label for="aei">출근</label><input class="input" type="time" id="aei" value="' + (x ? hhmm(x.clock_in) : '') + '"></div>' +
      '<div class="field"><label for="aeo">퇴근</label><input class="input" type="time" id="aeo" value="' + (x ? hhmm(x.clock_out) : '') + '"></div></div>' +
      '<div class="field"><label for="aen">메모</label><input class="input" id="aen" maxlength="100" value="' + esc(x ? x.note : '') + '" placeholder="예: 출근 버튼 누락 – 본인 요청"></div>' +
      '<p class="muted small">퇴근이 출근보다 이르면 다음날 새벽 퇴근으로 처리합니다. 둘 다 비우면 그날 기록을 지웁니다.</p><p class="err" id="aee"></p>' +
      '<div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="aeOk">저장</button></div>');
    $('#aeOk', m).onclick = function () {
      var i = $('#aei', m).value, o = $('#aeo', m).value;
      var ci = i ? new Date(day + 'T' + i + ':00') : null, co = o ? new Date(day + 'T' + o + ':00') : null;
      if (ci && co && co <= ci) co = new Date(co.getTime() + 864e5);
      var btn = this; btn.disabled = true;
      sb.rpc('admin_set_attendance', { uid: p.id, d: day, cin: ci && ci.toISOString(), cout: co && co.toISOString(), memo: $('#aen', m).value.trim() }).then(function (r) {
        if (r.error) throw r.error; closeSheet(m); toast('저장했습니다'); attDayList();
      }).catch(function (e) { $('#aee', m).textContent = errMsg(e); btn.disabled = false; });
    };
  }
  function attIps() {
    attCall({ action: 'ip_list' }).then(function (d) {
      var c = $('#attIps'); if (!c) return;
      var has = (d.ips || []).some(function (x) { return x.ip === d.ip; });
      c.innerHTML = '<h3>병원 인터넷 주소</h3><p class="muted small" style="margin-bottom:10px">여기 등록된 주소(병원 인터넷)에서만 출퇴근을 찍을 수 있습니다. 병원 PC에서 <b>지금 이 PC 주소 등록</b>을 누르세요. 두 병원 회선이 다르면 각 병원에서 한 번씩 등록합니다.</p>' +
        ((d.ips || []).length ? (d.ips || []).map(function (x) { return '<div class="ip-row"><span><b>' + esc(x.ip) + '</b> ' + esc(x.label || '') + (x.ip === d.ip ? ' <span class="pill gold">지금 이 PC</span>' : '') + '</span><button class="btn btn-line sm" data-ipdel="' + esc(x.ip) + '">삭제</button></div>'; }).join('') : '<p class="att-warn">등록된 주소가 없습니다.</p>') +
        '<p class="small" style="margin:10px 0 6px">지금 이 PC 주소: <b>' + esc(d.ip || '확인 불가') + '</b>' + (has ? ' ✓ 등록됨' : '') + '</p>' +
        (has ? '' : '<div class="row2"><input class="input" id="ipLabel" placeholder="이름 (예: 노블365의원)" maxlength="40"><button class="btn btn-navy" id="ipAdd">지금 이 PC 주소 등록</button></div>');
      var ad = $('#ipAdd', c); if (ad) ad.onclick = function () { ad.disabled = true; attCall({ action: 'ip_add', label: $('#ipLabel', c).value.trim() }).then(function () { toast('병원 인터넷 주소를 등록했습니다'); attIps(); attLoad().then(attTodayCard); }).catch(function (e) { toast(esc(errMsg(e))); ad.disabled = false; }); };
      $$('[data-ipdel]', c).forEach(function (b) { b.onclick = function () { if (!confirmInline(b, '삭제할까요?')) return; attCall({ action: 'ip_del', ip: b.getAttribute('data-ipdel') }).then(function () { attIps(); attLoad().then(attTodayCard); }).catch(function (e) { toast(esc(errMsg(e))); }); }; });
    }).catch(function (e) { var c = $('#attIps'); if (c) c.innerHTML = '<h3>병원 인터넷 주소</h3><p class="err">' + esc(errMsg(e)) + '</p>'; });
  }
  function attCsv() {
    var m = S.attMonth, start = m + '-01', end = ymd(new Date(+m.slice(0, 4), +m.slice(5, 7), 0));
    sb.from('attendance').select('*').gte('work_date', start).lte('work_date', end).order('work_date').then(function (r) {
      if (r.error) { toast(esc(errMsg(r.error))); return; }
      var lines = [['병원', '부서', '직책', '이름', '날짜', '요일', '출근', '퇴근', '근무(분)', '근무', '지각(분)', '연장(분)', '연장', '비고']];
      (r.data || []).sort(function (a, b) { var pa = S.profiles[a.user_id] || {}, pb = S.profiles[b.user_id] || {}; return (pa.name || '').localeCompare(pb.name || '') || a.work_date.localeCompare(b.work_date); }).forEach(function (x) {
        var p = S.profiles[x.user_id] || {}, c = attCalc(x, p);
        lines.push([p.clinic || '', p.dept || '', p.title || '', p.name || '(퇴사자)', x.work_date, WD[new Date(x.work_date + 'T00:00:00').getDay()], hhmm(x.clock_in), hhmm(x.clock_out), c.work == null ? '' : c.work, minsTxt(c.work), c.late || '', c.over || '', minsTxt(c.over || null), [x.edited_by ? '관리자 수정' : '', x.note || ''].filter(Boolean).join(' ')]);
      });
      var csv = '﻿' + lines.map(function (l) { return l.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = '출퇴근_' + m + '.csv'; document.body.appendChild(a); a.click(); a.remove();
    });
  }
  function attSetSheet(p, after) {
    if (!p) return;
    var isAdm = S.me.role === 'admin';
    var leaders = Object.keys(S.profiles).map(function (k) { return S.profiles[k]; }).filter(function (x) { return x.active && x.id !== p.id; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    var m = sheet(esc(p.name) + ' · 출퇴근 설정',
      '<label class="chk-row"><input type="checkbox" id="asEn"' + (p.att_enabled ? ' checked' : '') + '> <b>출퇴근 대상</b> <span class="muted small">(체크한 직원만 출퇴근을 찍습니다)</span></label>' +
      '<div class="row2"><div class="field"><label for="asWs">기준 출근</label><input class="input" type="time" id="asWs" value="' + esc((p.work_start || '').slice(0, 5)) + '"></div><div class="field"><label for="asWe">기준 퇴근</label><input class="input" type="time" id="asWe" value="' + esc((p.work_end || '').slice(0, 5)) + '"></div></div>' +
      '<p class="muted small" style="margin:-6px 0 12px">지각·연장 표시 기준 · 비워 두면 계산하지 않습니다</p>' +
      '<div class="field"><label for="asLd">대신 찍어 주는 팀장</label><select class="input" id="asLd"><option value="">없음 (본인이 찍음)</option>' + leaders.map(function (x) { return '<option value="' + x.id + '"' + (p.att_leader === x.id ? ' selected' : '') + '>' + esc(x.name) + (x.dept ? ' (' + esc(x.dept) + ')' : '') + '</option>'; }).join('') + '</select></div>' +
      '<label class="chk-row"><input type="checkbox" id="asMb"' + (p.mobile_punch ? ' checked' : '') + '> 스마트폰으로 출퇴근 허용 <span class="muted small">(PC 없는 직원 · 병원 와이파이에서만)</span></label>' +
      (isAdm ? '<label class="chk-row"><input type="checkbox" id="asMg"' + (p.att_manager ? ' checked' : '') + '> <b>전 직원 출퇴근 관리</b> <span class="muted small">(전체 현황·수정·엑셀)</span></label>' : '') +
      '<p class="err" id="asErr"></p><div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="asOk">저장</button></div>');
    $('#asOk', m).onclick = function () {
      var btn = this; btn.disabled = true;
      var mg = $('#asMg', m);
      sb.rpc('set_att_profile', { uid: p.id, ws: $('#asWs', m).value || null, we: $('#asWe', m).value || null, enabled: $('#asEn', m).checked, mobile: $('#asMb', m).checked, leader: $('#asLd', m).value || null, manager: mg ? mg.checked : !!p.att_manager }).then(function (r) {
        if (r.error) throw r.error;
        closeSheet(m); toast('저장했습니다');
        return reloadProfiles().then(function () { if (after) after(); });
      }).catch(function (e) { $('#asErr', m).textContent = errMsg(e); btn.disabled = false; });
    };
  }

  /* 채팅 목록 위: 관리자에게는 '병원 주소 등록 요청', PC에서 오늘 출근 안 눌렀으면 '출근' 알려 주기 */
  function renderAttNudge() {
    var box = $('#attNudge'); if (!box) return;
    var a = S.att, html = '', nReq = isAttMgr() ? (S.ipReqs || []).length : 0;
    if (nReq) html += '<div class="push-ask att-nudge"><span>🛜 병원 주소 등록 요청 <b>' + nReq + '건</b>이 승인을 기다립니다</span><button class="btn btn-navy sm" id="nudgeReq">확인</button></div>';
    var punch = a && !a.error && a.enabled && (DESKTOP.matches || a.mobileOk) && a.allowed && !(a.record && a.record.clock_in) && lsGet('noble-att-skip') !== (a.today || '');
    if (punch) html += '<div class="push-ask att-nudge"><span>오늘 <b>출근</b>을 아직 안 눌렀어요</span><button class="btn btn-navy sm" id="nudgeIn">출근</button><button class="icon-btn" id="nudgeX" aria-label="오늘은 숨기기">' + svg('x') + '</button></div>';
    box.innerHTML = html;
    if (nReq) $('#nudgeReq').onclick = gotoIpReqs;
    if (punch) {
      $('#nudgeIn').onclick = function () { attPunch('in', this); };
      $('#nudgeX').onclick = function () { lsSet('noble-att-skip', a.today || ''); renderAttNudge(); };
    }
  }

  /* ---- 병원 인터넷 주소 등록 요청 (직원이 요청 → 관리자가 승인) ---- */
  function isAttMgr() { var p = (S.me && S.profiles[S.me.id]) || S.me || {}; return p.role === 'admin' || !!p.att_manager; }
  function mdhm(x) { var t = d(x); return (t.getMonth() + 1) + '/' + t.getDate() + ' ' + hhmm(x); }
  function gotoIpReqs() { S.workTab = 'att'; S.attView = 'all'; if (location.hash === '#work') route(); else location.hash = '#work'; }

  /* 직원 화면: 병원 인터넷이 아닐 때 '요청 중' 안내 또는 '요청' 버튼 */
  function attReqBox() {
    var a = S.att || {}, q = a.request;
    if (q) {
      return '<div class="att-req"><p class="small" style="margin:8px 0 6px">✓ <b>병원 주소 등록을 요청했습니다</b>' + ((q.names || []).length ? ' <span class="muted">(요청: ' + esc((q.names || []).join(', ')) + ')</span>' : '') +
        '<br>관리자가 승인하면 이 화면에서 바로 출근을 누를 수 있습니다.</p><button class="btn btn-line sm" data-ipchk>승인됐는지 확인</button></div>';
    }
    if (a.manager) return '<p class="muted small" style="margin-top:8px">이 PC가 병원이 맞다면 <b>전체 현황 → 병원 인터넷 주소</b>에서 바로 등록할 수 있습니다.</p>';
    if (!DESKTOP.matches) return '';
    return '<div class="att-req"><p class="muted small" style="margin:8px 0 6px">' + (a.rejected ? '관리자가 이 주소의 등록을 허용하지 않았습니다. ' : '') + '이 PC가 <b>병원 안</b>에 있는데도 계속 막히면(병원 인터넷 회선이 바뀐 경우), 관리자에게 등록을 요청할 수 있습니다.</p>' +
      '<button class="btn btn-navy sm" data-ipreq>이 주소를 병원으로 등록 요청</button></div>';
  }
  function attBindReq(root) {
    var r = $('[data-ipreq]', root); if (r) r.onclick = attReqSheet;
    var c = $('[data-ipchk]', root); if (c) c.onclick = function () { c.disabled = true; attRefresh(true); };
    attWatchReq();
  }
  /* 상태를 다시 읽고, 달라졌으면 화면 갱신 (승인되면 알려 줌) */
  function attRefresh(manual) {
    var was = S.att || {};
    return attCall({ action: 'status' }).then(function (n) {
      S.att = n;
      var changed = !!n.allowed !== !!was.allowed || !!n.request !== !!was.request || !!n.rejected !== !!was.rejected;
      if (n.allowed && !was.allowed) toast('<b>✓ 병원 인터넷으로 승인되었습니다</b> 이제 출근을 누르실 수 있어요');
      else if (manual && !changed) toast(n.request ? '아직 승인 전입니다. 급하면 관리자에게 알려 주세요.' : '아직 등록되지 않았습니다');
      if (changed || manual) { if ($('#attToday')) attTodayCard(); if ($('#teamList')) attTeam(); }
      renderAttNudge();
    }).catch(function (e) { if (manual) toast(esc(errMsg(e))); });   // 일시적인 오류면 이전 상태를 그대로 둠
  }
  /* 요청을 보낸 뒤 승인을 기다리는 동안 30초마다 자동 확인 (화면이 보일 때만) */
  function attWatchReq() {
    if (S.attWatch) { clearInterval(S.attWatch); S.attWatch = null; }
    var a = S.att || {}; if (!a.request || a.allowed) return;
    S.attWatch = setInterval(function () {
      var b = S.att || {};
      if ((!$('#attToday') && !$('#teamList')) || !b.request || b.allowed) { clearInterval(S.attWatch); S.attWatch = null; return; }
      if (document.visibilityState === 'visible') attRefresh(false);
    }, 30000);
  }
  function attReqSheet() {
    var a = S.att || {};
    var m = sheet('병원 인터넷 주소 등록 요청',
      '<p class="small" style="margin-bottom:10px">지금 쓰는 이 PC가 <b>병원 안</b>에 있는데 출퇴근이 막힐 때만 요청해 주세요. 관리자가 확인하고 승인하면 이 PC에서 바로 출근을 누를 수 있습니다.</p>' +
      '<p class="att-warn" style="margin:0 0 12px">집·카페 등 병원 밖이라면 요청하지 마세요.</p>' +
      '<div class="field"><label for="irl">이 PC가 있는 곳 <span class="muted small">(선택)</span></label><input class="input" id="irl" maxlength="40" placeholder="예: 침구실, 3층 원무과"></div>' +
      '<p class="muted small">접속 주소 ' + esc(a.ip || '확인 불가') + '</p><p class="err" id="ire"></p>' +
      '<div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="irOk">요청하기</button></div>');
    $('#irOk', m).onclick = function () {
      var btn = this; btn.disabled = true;
      attCall({ action: 'ip_request', label: $('#irl', m).value.trim() }).then(function (res) {
        closeSheet(m);
        if (res.already) toast('이미 병원 인터넷으로 등록된 주소입니다');
        else {
          toast('<b>요청했습니다</b> 관리자가 승인하면 바로 출근을 누를 수 있습니다');
          // 관리자 휴대폰 알림 (push 함수가 이 요청을 지원하면 알림, 아니면 조용히 무시)
          if (res.created && res.id) sb.functions.invoke('push', { body: { action: 'ip_request', request_id: res.id } }).catch(function () {});
        }
        return attRefresh(false);
      }).catch(function (e) { $('#ire', m).textContent = errMsg(e); btn.disabled = false; });
    };
  }

  /* 관리자: 등록 요청 목록 불러오기 (대기 + 최근 처리) */
  function loadIpReqs() {
    if (!isAttMgr()) return Promise.resolve();
    return sb.from('ip_requests').select('*').order('created_at', { ascending: false }).limit(30).then(function (r) {
      if (r.error) return;   // update-9 를 아직 안 돌린 경우 조용히 건너뜀
      var rows = r.data || [];
      S.ipReqs = rows.filter(function (x) { return x.status === 'pending'; }).reverse();   // 오래된 요청 먼저
      S.ipHist = rows.filter(function (x) { return x.status !== 'pending'; }).slice(0, 5);
      setBadges(); renderAttNudge();
      if ($('#attReqs')) attReqs();
      if (S.route && S.route.tab === 'work' && S.workTab === 'att') {
        var sg = $$('[data-av="all"]')[0]; if (sg) sg.textContent = '전체 현황' + (S.ipReqs.length ? ' (' + S.ipReqs.length + ')' : '');
        var wb = $$('[data-wt="att"]')[0]; if (wb) wb.textContent = '출퇴근' + (S.ipReqs.length ? ' (' + S.ipReqs.length + ')' : '');
      }
    }).catch(function () {});
  }
  function attReqs() {
    var c = $('#attReqs'); if (!c) return;
    var P = S.ipReqs || [], H = S.ipHist || [];
    if (!P.length && !H.length) { c.hidden = true; c.innerHTML = ''; return; }
    c.hidden = false;
    var who = function (x) { var n = x.names || []; return esc(n[0] || (S.profiles[x.user_id] || {}).name || '직원') + (n.length > 1 ? ' <span class="muted small">외 ' + (n.length - 1) + '명</span>' : ''); };
    c.innerHTML = '<h3>병원 주소 등록 요청' + (P.length ? ' (' + P.length + ')' : '') + '</h3>' +
      (P.length ? '<p class="muted small" style="margin-bottom:4px">병원 안 PC에서 요청한 것이 맞는지 확인한 뒤 승인하세요. 집·카페 주소를 승인하면 병원 밖에서도 출퇴근이 찍힙니다.</p>' +
        P.map(function (x) {
          return '<div data-rid="' + x.id + '" style="padding:10px 0;border-bottom:1px solid var(--line)"><div><b>' + who(x) + '</b> <span class="muted small">· ' + mdhm(x.created_at) + ' 요청</span></div>' +
            '<div class="small" style="margin-top:2px">접속 주소 <b>' + esc(x.ip) + '</b></div>' +
            '<div style="display:flex;gap:6px;align-items:center;margin-top:6px"><input class="input" data-rlabel maxlength="40" placeholder="이 곳 이름 (예: 침구실)" value="' + esc(x.label || '') + '" aria-label="등록할 이름" style="flex:1;min-width:0">' +
            '<button class="btn btn-navy sm" data-rok>승인</button><button class="btn btn-line sm" data-rno>거절</button></div></div>';
        }).join('') : '<p class="muted small">대기 중인 요청이 없습니다.</p>') +
      (H.length ? '<p class="muted small" style="margin:12px 0 2px">최근 처리</p>' + H.map(function (x) {
        var by = (S.profiles[x.decided_by] || {}).name || '';
        return '<div class="ip-row"><span class="small"><span class="pill ' + (x.status === 'approved' ? 'ok' : 'no') + '">' + (x.status === 'approved' ? '승인' : '거절') + '</span> <b>' + esc(x.ip) + '</b> ' + esc(x.label || '') +
          ' <span class="muted">· 요청 ' + esc((x.names || []).join(', ')) + (by ? ' · ' + esc(by) + ' 처리 ' : ' · ') + (x.decided_at ? mdhm(x.decided_at) : '') + '</span></span></div>';
      }).join('') : '');
    $$('[data-rok]', c).forEach(function (b) {
      b.onclick = function () {
        var row = b.closest('[data-rid]');
        if (!confirmInline(b, '한 번 더 누르면 승인')) return;
        ipDecide(+row.getAttribute('data-rid'), true, $('[data-rlabel]', row).value.trim(), b);
      };
    });
    $$('[data-rno]', c).forEach(function (b) { b.onclick = function () { ipDecide(+b.closest('[data-rid]').getAttribute('data-rid'), false, '', b); }; });
  }
  function ipDecide(id, ok, label, btn) {
    var row = btn.closest('[data-rid]'); if (row) $$('button', row).forEach(function (x) { x.disabled = true; });
    sb.rpc('decide_ip_request', { req_id: id, do_approve: ok, new_label: label || null }).then(function (r) {
      if (r.error) throw r.error;
      toast(r.data === 'approved' ? (ok ? '<b>승인했습니다</b> 이제 그 PC에서 출퇴근을 찍을 수 있습니다' : '이미 승인된 요청입니다') : r.data === 'rejected' ? (ok ? '이미 거절된 요청입니다' : '거절했습니다') : '이미 처리된 요청입니다');
      return loadIpReqs();
    }).then(function () { if ($('#attIps')) attIps(); }).catch(function (e) {
      toast(esc(errMsg(e))); if (row) $$('button', row).forEach(function (x) { x.disabled = false; });
    });
  }

  function renderWork() {
    var admin = S.me.role === 'admin', tab = S.workTab;
    var main = $('#main'); main.style.justifyContent = '';
    main.innerHTML = header('출퇴근 · 근무 신청') + '<div class="pane-body" id="wbody">' +
      '<div class="seg" role="group" aria-label="근무 신청 메뉴"><button aria-pressed="' + (tab === 'att') + '" data-wt="att">' + wtLabel('att') + '</button><button aria-pressed="' + (tab === 'new') + '" data-wt="new">신청하기</button><button aria-pressed="' + (tab === 'mine') + '" data-wt="mine">내 신청 내역</button>' +
      (admin ? '<button aria-pressed="' + (tab === 'all') + '" data-wt="all">' + wtLabel('all') + '</button>' : '') + '</div><div id="wcontent"></div></div>';
    $$('[data-wt]').forEach(function (b) { b.onclick = function () { S.workTab = b.getAttribute('data-wt'); renderWork(); }; });
    if (tab === 'att') renderAtt(); else if (tab === 'new') workForm(); else if (tab === 'mine') workList(false); else { loadPending(); workList(true); }
  }
  function workForm() {
    var today = ymd(new Date());
    $('#wcontent').innerHTML = '<form class="card" id="wf" novalidate><h3>새 신청</h3>' +
      '<div class="row2"><div class="field"><label for="wk">종류</label><select class="input" id="wk">' + KINDS.map(function (k) { return '<option>' + k[0] + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label for="wd">날짜</label><input class="input" type="date" id="wd" value="' + today + '"></div></div>' +
      '<div class="row2" id="wtimes"><div class="field"><label for="ws">시작</label><input class="input" type="time" id="ws" step="300"></div><div class="field"><label for="we">종료</label><input class="input" type="time" id="we" step="300"></div></div>' +
      '<div class="field" id="whalf" hidden><label for="wh">반차 구분</label><select class="input" id="wh"><option>오전 반차</option><option>오후 반차</option></select></div>' +
      '<p class="sum" id="wsum" style="border-radius:10px;margin-bottom:14px">시간을 입력하면 자동 계산됩니다.</p>' +
      '<div class="field"><label for="wr">사유</label><textarea class="input" id="wr" rows="3" placeholder="예: 환자 진료 연장, 행사 준비"></textarea></div>' +
      '<p class="err" id="werr"></p><button class="btn btn-navy block" id="wok">신청하기</button></form>' +
      '<p class="muted small" style="padding:0 18px 20px">신청하면 관리자에게 알림이 가고, 승인·반려되면 알림으로 알려드립니다.</p>';
    function upd() {
      var k = $('#wk').value, tk = timeKind(k);
      $('#wtimes').hidden = !tk; $('#whalf').hidden = k !== '반차';
      var mm = tk ? diffMin($('#ws').value, $('#we').value) : (k === '반차' ? 240 : k === '연차' ? 480 : 0);
      $('#wsum').textContent = tk ? ($('#ws').value && $('#we').value ? '합계 ' + mins(mm) + ' (' + mm + '분)' : '시간을 입력하면 자동 계산됩니다.') : (k === '반차' ? '반차 · 4시간' : '연차 · 1일');
      return mm;
    }
    ['wk', 'ws', 'we'].forEach(function (i) { $('#' + i).addEventListener('input', upd); $('#' + i).addEventListener('change', upd); }); upd();
    $('#wf').addEventListener('submit', function (e) {
      e.preventDefault();
      var k = $('#wk').value, tk = timeKind(k), mm = upd();
      if (!$('#wd').value) { $('#werr').textContent = '날짜를 선택해 주세요.'; return; }
      if (tk && (!$('#ws').value || !$('#we').value)) { $('#werr').textContent = '시작·종료 시간을 입력해 주세요.'; return; }
      var row = { user_id: S.me.id, kind: k, work_date: $('#wd').value, start_time: tk ? $('#ws').value : null, end_time: tk ? $('#we').value : null, minutes: mm,
        reason: (k === '반차' ? $('#wh').value + (($('#wr').value.trim()) ? ' · ' : '') : '') + $('#wr').value.trim() };
      $('#wok').disabled = true;
      sb.from('work_requests').insert(row).select().single().then(function (r) {
        if (r.error) throw r.error;
        sb.functions.invoke('push', { body: { action: 'request', request_id: r.data.id } }).catch(function () {});
        toast('<b>신청 완료</b> 관리자 승인을 기다립니다'); loadPending(); S.workTab = 'mine'; renderWork();
      }).catch(function (er) { $('#werr').textContent = errMsg(er); $('#wok').disabled = false; });
    });
  }
  function statusPill(s) { return '<span class="pill ' + (s === '승인' ? 'ok' : s === '반려' ? 'no' : 'gold') + '">' + s + '</span>'; }
  function reqLine(r) { return esc(r.work_date) + (r.start_time ? ' · ' + r.start_time.slice(0, 5) + '~' + (r.end_time || '').slice(0, 5) : '') + (r.minutes ? ' · ' + mins(r.minutes) : ''); }

  function workList(all) {
    var box = $('#wcontent');
    var month = S.adminMonth, st = S.adminStatus;
    var q = sb.from('work_requests').select('*').order('work_date', { ascending: false }).order('created_at', { ascending: false });
    if (all) {
      var y = +month.slice(0, 4), mo = +month.slice(5, 7), end = new Date(y, mo, 0).getDate();
      q = q.gte('work_date', month + '-01').lte('work_date', month + '-' + String(end).padStart(2, '0'));
      if (st !== '전체') q = q.eq('status', st);
      box.innerHTML = '<section class="pend" id="wpend" aria-label="승인 대기"></section><h3 class="wl-h">월별 신청 내역</h3><div class="toolbar"><input class="input" type="month" id="am" value="' + month + '" aria-label="월 선택"><select class="input" id="as" aria-label="상태">' +
        ['전체', '대기', '승인', '반려'].map(function (s) { return '<option' + (s === st ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
        '<button class="btn btn-gold sm" id="csv">' + svg('down').replace('<svg', '<svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2"') + ' 급여정리용 엑셀(CSV)</button></div><div id="wl"><p class="empty">불러오는 중…</p></div>';
      $('#am').onchange = function () { S.adminMonth = this.value || S.adminMonth; workList(true); };
      $('#as').onchange = function () { S.adminStatus = this.value; workList(true); };
      renderPend();
    } else {
      q = q.eq('user_id', S.me.id).limit(100);
      box.innerHTML = '<div id="wl"><p class="empty">불러오는 중…</p></div>';
    }
    q.then(function (r) {
      if (r.error) throw r.error;
      var rows = r.data || [], wl = $('#wl'); if (!wl) return;
      if (all) {
        var tot = {}; rows.filter(function (x) { return x.status === '승인'; }).forEach(function (x) { tot[x.kind] = (tot[x.kind] || 0) + x.minutes; });
        var sum = Object.keys(tot).map(function (k) { return k + ' ' + mins(tot[k]); }).join(' · ');
        wl.innerHTML = (sum ? '<p class="sum">승인 합계: ' + esc(sum) + '</p>' : '') + (rows.length ? rows.map(reqCard).join('') : '<p class="empty">이 달 신청 내역이 없습니다.</p>');
        bindReq(wl);
        $('#csv').onclick = function () { exportCsv(rows, month); };
      } else {
        wl.innerHTML = rows.length ? rows.map(function (x) {
          return '<div class="req"><div class="req-top"><b>' + esc(x.kind) + '</b>' + statusPill(x.status) + '</div><p>' + reqLine(x) + '</p>' +
            (x.reason ? '<p>사유: ' + esc(x.reason) + '</p>' : '') + (x.review_note ? '<p>관리자 메모: ' + esc(x.review_note) + '</p>' : '') +
            (x.status === '대기' ? '<div class="req-actions"><button class="btn btn-line sm" data-cancel="' + x.id + '">신청 취소</button></div>' : '') + '</div>';
        }).join('') : '<p class="empty">신청 내역이 없습니다.</p>';
        $$('[data-cancel]', wl).forEach(function (b) {
          b.onclick = function () {
            if (!confirmInline(b, '한 번 더 누르면 취소')) return;
            sb.from('work_requests').delete().eq('id', +b.getAttribute('data-cancel')).then(function (r2) { if (r2.error) toast(esc(errMsg(r2.error))); workList(false); });
          };
        });
      }
    }).catch(function (e) { (all && $('#wl') ? $('#wl') : box).innerHTML = '<p class="empty">' + esc(errMsg(e)) + '</p>'; });
  }
  function review(id, status, askNote) {
    function go(note) {
      var patch = { status: status }; if (note != null) patch.review_note = note;
      sb.from('work_requests').update(patch).eq('id', id).then(function (r) {
        if (r.error) { toast(esc(errMsg(r.error))); return; }
        if (status !== '대기') { sb.functions.invoke('push', { body: { action: 'request', request_id: id } }).catch(function () {}); pendDrop(id); }
        workList(true);
        loadPending().then(function () {   // 서버 기준 최신 건수로 안내 (확인이 실패하면 방금 처리를 반영한 값)
          toast('<b>' + (status === '승인' ? '승인했습니다' : status === '반려' ? '반려했습니다' : '대기로 되돌렸습니다') + '</b>' + (status === '대기' ? '' : S.pendingCount ? ' 남은 대기 ' + S.pendingCount + '건' : ' 남은 대기 없음'));
        });
      });
    }
    if (!askNote) { go(null); return; }
    var m = sheet('반려 사유', '<div class="field"><textarea class="input" id="rn" rows="3" placeholder="신청자에게 보이는 메모 (선택)"></textarea></div><div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-danger" id="rjOk">반려</button></div>');
    $('#rjOk', m).onclick = function () { closeSheet(m); go($('#rn', m).value.trim()); };
  }
  function exportCsv(rows, month) {
    var head = ['구분', '사업장', '성명', '부서', '직책', '날짜', '시작', '종료', '시간(분)', '시간', '사유', '상태', '처리메모'];
    var lines = [head].concat(rows.slice().sort(function (a, b) {
      var pa = S.profiles[a.user_id] || {}, pb = S.profiles[b.user_id] || {};
      return (a.kind + (pa.clinic || '') + (pa.name || '') + a.work_date).localeCompare(b.kind + (pb.clinic || '') + (pb.name || '') + b.work_date, 'ko');
    }).map(function (x) {
      var p = S.profiles[x.user_id] || {};
      return [x.kind, p.clinic || '', p.name || '', p.dept || '', p.title || '', x.work_date, (x.start_time || '').slice(0, 5), (x.end_time || '').slice(0, 5), x.minutes, mins(x.minutes), x.reason, x.status, x.review_note];
    }));
    var csv = '﻿' + lines.map(function (l) { return l.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = month.replace('-', '년 ') + '월 근무신청.csv'; document.body.appendChild(a); a.click(); a.remove();
  }
  function loadPending() {
    if (S.me.role !== 'admin') return Promise.resolve();
    var seq = ++S.wPendSeq;
    return sb.from('work_requests').select('*', { count: 'exact' }).eq('status', '대기').order('work_date', { ascending: true }).order('created_at', { ascending: true }).limit(100).then(function (r) {
      if (seq !== S.wPendSeq) return;   // 그 뒤에 더 새로 보낸 조회가 있으면 이 (낡은) 결과는 버림
      if (r.error) throw r.error;
      S.wPend = r.data || []; S.pendingCount = r.count != null ? r.count : S.wPend.length; S.wPendOk = true; S.wPendErr = '';
      setBadges(); renderPend();
    }).catch(function (e) {
      if (seq !== S.wPendSeq) return;
      S.wPendErr = errMsg(e) || '연결 오류'; renderPend();   // 실패해도 숫자·목록은 마지막으로 확인한 값을 그대로 둠 (0으로 사라지면 처리할 건이 없는 것처럼 보임)
    });
  }
  function pendDrop(id) {   // 방금 처리한 건을 대기 목록·숫자에서 바로 뺌 (서버 최신값은 곧이어 loadPending 이 다시 확인)
    var n = (S.wPend || []).length; S.wPend = (S.wPend || []).filter(function (x) { return x.id !== id; });
    if (S.wPend.length < n && S.pendingCount > 0) S.pendingCount--;
    setBadges(); renderPend();
  }
  /* 관리자 화면의 신청 카드 (월별 목록 · 승인 대기 칸 공용) */
  function reqCard(x) {
    var p = S.profiles[x.user_id] || { name: '(퇴사자)', dept: '' };
    return '<div class="req"><div class="req-top"><b>' + esc(p.name) + ' <span class="muted small">' + esc(p.dept) + '</span> · ' + esc(x.kind) + '</b>' + statusPill(x.status) + '</div>' +
      '<p>' + reqLine(x) + '</p>' + (x.reason ? '<p>사유: ' + esc(x.reason) + '</p>' : '') + (x.review_note ? '<p>메모: ' + esc(x.review_note) + '</p>' : '') +
      '<div class="req-actions">' + (x.status !== '승인' ? '<button class="btn btn-navy sm" data-ap="' + x.id + '">승인</button>' : '') + (x.status !== '반려' ? '<button class="btn btn-danger sm" data-rj="' + x.id + '">반려</button>' : '') +
      (x.status !== '대기' ? '<button class="btn btn-line sm" data-rs="' + x.id + '">대기로 되돌리기</button>' : '') + '</div></div>';
  }
  function bindReq(scope) {
    $$('[data-ap]', scope).forEach(function (b) { b.onclick = function () { review(+b.getAttribute('data-ap'), '승인'); }; });
    $$('[data-rj]', scope).forEach(function (b) { b.onclick = function () { review(+b.getAttribute('data-rj'), '반려', true); }; });
    $$('[data-rs]', scope).forEach(function (b) { b.onclick = function () { review(+b.getAttribute('data-rs'), '대기'); }; });
  }
  /* 전체 관리 맨 위 "승인 대기" 칸: 달과 상관없이 모든 대기 신청 (메뉴·탭의 숫자는 이 건수를 센 것) */
  function renderPend() {
    var box = $('#wpend'); if (!box) return;
    if (!S.wPendOk) {   // 아직 한 번도 확인하지 못함
      box.innerHTML = S.wPendErr ? '<p class="err" style="padding:12px 16px">승인 대기를 불러오지 못했습니다 (' + esc(S.wPendErr) + ')</p><p style="padding:0 16px 12px"><button class="btn btn-line sm" id="pretry">다시 시도</button></p>' : '<p class="muted small" style="padding:12px 16px">승인 대기를 확인하는 중…</p>';
      var rt = $('#pretry', box); if (rt) rt.onclick = function () { loadPending(); workList(true); };
      return;
    }
    var n = S.pendingCount, rows = S.wPend || [];
    var stale = S.wPendErr ? '<p class="muted small">최신 내용을 불러오지 못해 마지막으로 확인한 내용을 보여 드립니다.</p>' : '';
    if (!n && !rows.length) { box.innerHTML = '<p class="pend-none">✓ 승인 대기 중인 신청이 없습니다</p>' + stale; return; }
    box.innerHTML = '<h3>승인 대기 <b>' + n + '건</b></h3><p class="muted small">달과 관계없이 모든 대기 신청입니다 · "전체 관리" 옆 숫자와 같습니다</p>' + stale + rows.map(reqCard).join('') +
      (n > rows.length ? '<p class="muted small">처음 ' + rows.length + '건만 보여 드립니다. 처리하면 나머지가 이어서 나옵니다.</p>' : '');
    bindReq(box);
  }

  /* ================= 진료순서표 (채팅 메시지 → 순서표, 진료 후 체크하면 목록에서 사라짐) ================= */
  /* 의원·한의원 구분 없이 한 줄로 관리 (표시: 체크 · 시간 · 내용) */
  function qPending() { return S.queue || []; }
  function qDoneToday() { return S.qDone || []; }
  function qSoundOn() { return lsGet('noble-q-sound') !== 'off'; }
  function qFind(id) { return (S.queue || []).concat(S.qDone || []).find(function (x) { return x.id === id; }); }
  /* 메시지 번호 → 순서표 항목 (대기 중인 항목이 우선) */
  function qMap() {
    var m = {};
    (S.qDone || []).forEach(function (x) { if (x.message_id && !m[x.message_id]) m[x.message_id] = x; });
    (S.queue || []).forEach(function (x) { if (x.message_id) m[x.message_id] = x; });
    return m;
  }
  /* 지금 열려 있는 대화방의 메시지에 붙는 '순서표' 표시가 바뀌었는지 알아보는 표식 */
  function qSig() {
    if (!S.room) return '';
    var ids = {}; S.messages.forEach(function (m) { ids[m.id] = 1; });
    return (S.queue || []).concat(S.qDone || []).filter(function (x) { return x.message_id && ids[x.message_id]; })
      .map(function (x) { return x.id + x.status + (x.done_by || ''); }).join(',');
  }
  function refreshMsgTags() {
    var s = qSig();
    if (s !== S.qSig) { S.qSig = s; if ($('#msgs')) renderMessages(false); }
  }
  function qTagHtml(it) {
    if (!it) return '';
    if (it.status === 'pending') return '<button class="q-tag" data-qgo="1" title="진료순서표 보기">' + svg('queue') + '순서표 대기 중</button>';
    var who = (S.profiles[it.done_by] || {}).name || '';
    return '<button class="q-tag done" data-qgo="1" title="진료순서표 보기">' + svg('check') + '진료 완료' + (who ? ' · ' + esc(who) : '') + ' ' + hm(it.done_at) + '</button>';
  }
  /* 표·함수가 아직 없는 경우(SQL 미적용)만 따로 구분 */
  function qMissing(s) { return /does not exist|schema cache|PGRST20[25]|42P01|42883/i.test(s || ''); }
  function qErrText(e) {
    var m = errMsg(e);
    return qMissing(m + ' ' + ((e && e.code) || '')) ? '진료순서표 업데이트(SQL)가 아직 적용되지 않았습니다. 관리자에게 알려 주세요.' : m;
  }
  function qShown() { return !!$('#qbody'); }   // 순서표 본문이 화면에 있음 (순서표 탭이거나 채팅 탭 오른쪽 칸)
  function qFlash() {   // 오른쪽 칸이 이미 보일 때 "순서표 보기"를 누르면 화면을 옮기지 않고 칸만 잠깐 강조
    var p = $('#qpane'); if (!p || p.hidden) return;
    p.classList.remove('flash'); void p.offsetWidth; p.classList.add('flash');
    clearTimeout(qFlash.t); qFlash.t = setTimeout(function () { p.classList.remove('flash'); }, 900);
  }
  function goQueue() {
    if (qShown()) { qFlash(); return; }
    if (S.solo) { openQueueWindow(); return; }   // 새 창(대화방 등)은 그대로 두고 순서표 창을 따로 띄움
    location.hash = '#queue';
  }
  /* 진료순서표만 따로 띄워 두기 (의사 PC 옆 화면용) */
  function openQueueWindow() {
    var w = 460, h = Math.min(screen.availHeight - 40, 820);
    var win = window.open(location.href.split('#')[0] + '#queue/solo', 'noble-queue',
      'popup,width=' + w + ',height=' + h + ',left=' + Math.max(0, screen.availWidth - w - 20) + ',top=20');
    if (!win && ND) return;   // PC 프로그램은 프로그램이 직접 창을 열어 줌 (차단 아님)
    if (!win) toast('팝업이 차단되었습니다. 주소창 오른쪽 팝업 차단 아이콘에서 "항상 허용"을 눌러 주세요.');
    else try { win.focus(); } catch (e) {}
  }
  /* v49: 예약 달력만 따로 띄워 두기 (데스크 PC 옆 화면용) — 순서표 새 창과 같은 방식, 달력이라 폭을 더 넓게 */
  function openRsvWindow() {
    var w = Math.min(1040, screen.availWidth - 40), h = Math.min(screen.availHeight - 40, 860);
    var win = window.open(location.href.split('#')[0] + '#rsv/solo', 'noble-rsv',
      'popup,width=' + w + ',height=' + h + ',left=' + Math.max(0, screen.availWidth - w - 20) + ',top=20');
    if (!win && ND) return;   // PC 프로그램은 프로그램이 직접 창을 열어 줌 (차단 아님)
    if (!win) toast('팝업이 차단되었습니다. 주소창 오른쪽 팝업 차단 아이콘에서 "항상 허용"을 눌러 주세요.');
    else try { win.focus(); } catch (e) {}
  }

  function loadQueue() {
    var since = new Date(); since.setHours(0, 0, 0, 0);
    return Promise.all([
      sb.from('care_queue').select('*').eq('status', 'pending').order('sort_at', { ascending: true }).limit(500),
      sb.from('care_queue').select('*').eq('status', 'done').gte('done_at', since.toISOString()).order('done_at', { ascending: false }).limit(300),
      loadNotice()
    ]).then(function (r) {
      qNoticeApply(r[2]);   // 공지 오류는 순서표 오류(S.qErr)와 따로 다룸
      if (r[0].error) {
        var em = errMsg(r[0].error) + ' ' + (r[0].error.code || '');
        if (qMissing(em) || !S.qLoaded) { S.qErr = em; S.queue = []; S.qDone = []; S.qLoaded = true; S.qStale = false; }   // 기능이 꺼져 있거나 처음부터 못 불러옴
        else S.qStale = true;                                                                                         // 이미 보고 있던 목록은 그대로 두고 경고만
      } else { S.qErr = ''; S.qStale = false; S.queue = r[0].data || []; S.qDone = (r[1] && r[1].data) || []; S.qLoaded = true; }
      setBadges();
      if (qShown()) renderQueueBody();
      refreshMsgTags();
    }).catch(function () {
      /* 인터넷이 끊긴 경우: 보던 목록은 그대로 두고 '최신이 아닐 수 있음' 경고를 띄운 뒤 자동으로 다시 시도 */
      if (S.qLoaded) { S.qStale = true; if (qShown()) renderQueueBody(); }
    });
  }
  /* ----- 순서표 맨 위 공지 (직원 누구나 고침 · 병원 전체에 하나) ----- */
  var NOTICE_DEFAULT = '* C-Arm 순서 :\n* 초음파 순서 :';
  function loadNotice() {   // 순서표 목록과 따로 불러옴 — 공지를 못 불러와도 목록은 그대로 (끊기면 오류로 돌려줌)
    return Promise.resolve(sb.from('care_queue_notice').select('*').eq('id', 1).maybeSingle()).then(null, function (e) { return { data: null, error: e || { message: 'Failed to fetch' } }; });
  }
  function qNoticeApply(n) {
    n = n || {};
    if (n.error) {
      var nm = errMsg(n.error) + ' ' + (n.error.code || '');
      if (qMissing(nm)) { S.qNotice = null; S.qNoticeErr = 'missing'; }   // 11번 SQL 을 아직 안 올림
      else if (!S.qNotice) S.qNoticeErr = 'fail';                          // 이미 보던 공지가 있으면 그대로 둠
    } else { S.qNoticeErr = ''; S.qNotice = n.data || null; }              // 행이 없으면 기본 문구로 보임
  }
  function qNoticeBody() { return S.qNotice ? String(S.qNotice.body == null ? '' : S.qNotice.body) : NOTICE_DEFAULT; }
  function qNoticeHtml() {
    if (S.qNoticeErr === 'missing') return '<section class="q-notice off" aria-label="공지"><b>공지</b><p>공지 기능 업데이트(SQL)가 아직 적용되지 않았습니다. 관리자에게 알려 주세요.</p></section>';
    if (S.qNoticeErr === 'fail' && !S.qNotice) return '<section class="q-notice off" aria-label="공지"><b>공지</b><p>공지를 불러오지 못했습니다. 잠시 뒤 자동으로 다시 시도합니다.</p></section>';
    var body = qNoticeBody(), n = S.qNotice, who = n && n.updated_by ? ((S.profiles[n.updated_by] || {}).name || '') : '';
    var meta = n && n.updated_by && n.updated_at ? '<div class="q-notice-meta">마지막 수정 · ' + (who ? esc(who) + ' · ' : '') + qFmtTime(n.updated_at) + '</div>' : '';
    return '<section class="q-notice" aria-label="공지"><div class="q-notice-hd"><b>공지</b><button class="icon-btn" data-qnotice="1" aria-label="공지 수정" title="공지 수정">' + svg('pencil') + '</button></div>' +
      '<div class="q-notice-body">' + (body.trim() ? linkify(body) : '<span class="muted">공지가 비어 있습니다</span>') + '</div>' + meta + '</section>';
  }
  function qNoticeSheet() {
    var cur = qNoticeBody();
    var m = sheet('공지 수정',
      '<div class="field"><label for="qnTxt">공지 내용</label><textarea class="input" id="qnTxt" rows="6" maxlength="1000"></textarea></div>' +
      '<p class="muted small" style="margin-bottom:8px">모든 직원의 진료순서표 맨 위에 똑같이 보입니다. 직원 누구나 고칠 수 있습니다.</p>' +
      '<button type="button" class="btn btn-line sm" id="qnReset" style="margin-bottom:10px">기본 문구로 되돌리기</button>' +
      '<p class="err" id="qnErr" role="alert"></p><div class="sheet-actions"><button class="btn btn-line" id="qnCancel" data-close>취소</button><button class="btn btn-navy" id="qnSave" disabled>저장</button></div>');
    var ta = $('#qnTxt', m), save = $('#qnSave', m), err = $('#qnErr', m), busy = false;
    function norm(v) { return String(v).replace(/\r/g, '').replace(/^\s+|\s+$/g, ''); }   // 서버(care_queue_notice_set)와 같은 정리: 앞뒤 공백·줄바꿈 제거
    var orig = norm(cur);   // 창을 연 순간의 공지 — 이것과 같으면 "바뀐 것 없음"
    ta.value = cur;
    function sync() { save.disabled = busy || norm(ta.value) === orig; }
    ta.addEventListener('input', function () { err.textContent = ''; sync(); });
    $('#qnReset', m).onclick = function () { ta.value = NOTICE_DEFAULT; err.textContent = ''; sync(); ta.focus(); };   // 글칸만 기본 문구로 채움 — 저장을 눌러야 반영 (실수로 눌러도 공지가 지워지지 않게)
    save.onclick = function () {
      var v = norm(ta.value); if (busy || v === orig) return;
      busy = true; save.disabled = true; err.textContent = '';
      sb.rpc('care_queue_notice_set', { p_body: v }).then(function (r) {
        if (r.error) throw r.error;
        var dd = r.data;
        S.qNotice = dd && typeof dd.body === 'string' ? dd : { body: v, updated_by: S.me.id, updated_at: new Date().toISOString() }; S.qNoticeErr = '';
        closeSheet(m); toast('<b>✓ 공지를 저장했습니다</b>');
        if (qShown()) renderQueueBody();
      }).catch(function (e) { busy = false; err.textContent = qErrText(e); sync(); });   // 입력은 그대로 두고 다시 저장할 수 있게
    };
  }

  var qTimer = null;
  function queueRefreshSoon() { clearTimeout(qTimer); qTimer = setTimeout(loadQueue, 120); }

  /* 채팅 메시지 → 진료순서표 */
  function queueFromMessage(m, btn) {
    if (!m || !m.body || m.deleted) return;
    var ex = qMap()[m.id];
    if (ex && ex.status === 'pending') { toast('이미 <b>진료순서표</b>에 올라가 있습니다 · 눌러서 보기', goQueue); return; }
    if (btn) btn.disabled = true;
    sb.rpc('care_queue_add', { p_message_id: m.id }).then(function (r) {
      if (btn) btn.disabled = false;
      if (r.error) throw r.error;
      var created = !(r.data && r.data.created === false);
      toast(created ? '<b>📋 진료순서표에 올렸습니다</b> · 눌러서 보기' : '이미 <b>진료순서표</b>에 올라가 있습니다 · 눌러서 보기', goQueue);
      return loadQueue();
    }).catch(function (e) { if (btn) btn.disabled = false; toast('<b>순서표에 올리지 못했습니다</b> ' + esc(qErrText(e))); });
  }

  /* 다른 직원이 새로 올렸을 때: 소리 + 알림 */
  var qLastBeep = 0;
  function queueAlert(row) {
    if (S.solo && S.route.tab !== 'queue') return;   // 대화방 새 창에서는 알리지 않음 (중복 방지)
    var who = (S.profiles[row.sender_id] || S.profiles[row.created_by] || {}).name || '';
    var txt = (row.body || '').replace(/\s+/g, ' ').slice(0, 80);
    if (qSoundOn() && Date.now() - qLastBeep > 1500) { qLastBeep = Date.now(); playSound('chime', true); }   // 채팅 알림음 설정과 별개로 울림
    toast('<span><b>📋 새 진료순서표</b> ' + esc(txt) + (who ? ' <span style="opacity:.7">· ' + esc(who) + '</span>' : '') + '</span>', goQueue);
    if (ND && !S.solo) deskNotify('📋 진료순서표', txt, '#queue', { name: '📋 진료순서표', room: '진료순서표' + (who ? ' · ' + who : '') });
  }

  function qFmtTime(t) { t = d(t); return sameDay(t, new Date()) ? hm(t) : (t.getMonth() + 1) + '/' + t.getDate() + ' ' + hm(t); }
  /* 목록의 시간 칸: 오늘이면 "오전 9:05", 지난 날짜면 위에 날짜(11/19)를 함께 표시 */
  function qTimeHtml(t) {
    var x = d(t);
    return '<time class="q-time" datetime="' + esc(String(t)) + '">' + (sameDay(x, new Date()) ? '' : '<span class="q-day">' + (x.getMonth() + 1) + '/' + x.getDate() + '</span>') + hm(x) + '</time>';
  }
  /* 한 줄 = [체크] [시간] [내용] — 진료순서표(구글시트)와 같은 모양. 보낸 사람·병원 구분은 목록에 표시하지 않음 */
  function qRowHtml(it) {
    return '<li class="q-item" data-qid="' + it.id + '">' +
      '<button class="q-chk" role="checkbox" aria-checked="false" aria-label="진료 완료 체크" title="진료가 끝나면 체크하세요 (목록에서 사라집니다)" data-qdone="' + it.id + '">' + svg('check') + '</button>' +
      qTimeHtml(it.created_at) +
      '<div class="q-main"><div class="q-txt">' + linkify(it.body) + '</div>' + qEditedHtml(it) + '</div>' +
      '<button class="icon-btn q-more" data-qmore="' + it.id + '" aria-label="더보기" title="더보기">' + svg('more') + '</button></li>';
  }
  /* 고친 적이 있는 줄에는 "수정됨" (마우스를 올리면 고친 사람·시간) */
  function qEditedHtml(it) {
    if (!it.edited_at) return '';
    var who = (S.profiles[it.edited_by] || {}).name || '';
    return '<div class="q-edited" title="' + esc((who ? who + ' · ' : '') + qFmtTime(it.edited_at) + ' 수정') + '">수정됨</div>';
  }
  function qDoneRowHtml(it) {
    var who = (S.profiles[it.done_by] || {}).name || '';
    return '<li class="q-drow"><span class="q-dok">' + svg('check') + '</span><div class="q-dmain"><div class="q-dt">' + esc(it.body) + '</div>' +
      '<div class="q-meta"><span>' + hm(it.done_at) + ' 완료' + (who ? ' · ' + esc(who) : '') + '</span></div></div>' +
      '<button class="btn btn-line sm" data-qundo="' + it.id + '">되돌리기</button></li>';
  }
  function renderQueueBody(host) {   // host: 그릴 본문 요소 (생략하면 화면에 있는 #qbody)
    var el = host && host.nodeType === 1 ? host : $('#qbody'); if (!el) return;
    if (S.qErr) {
      var off = qMissing(S.qErr);
      el.innerHTML = '<div class="q-empty"><b>' + (off ? '진료순서표 기능이 아직 켜지지 않았습니다' : '순서표를 불러오지 못했습니다') + '</b><p>' +
        (off ? '관리자에게 "업데이트(SQL) 적용"을 요청해 주세요.' : esc(S.qErr) + '<br>잠시 뒤 자동으로 다시 시도합니다.') + '</p></div>';
      return;
    }
    if (!S.qLoaded) { el.innerHTML = '<p class="empty">불러오는 중…</p>'; return; }
    var pend = qPending(), done = qDoneToday();
    var html = qNoticeHtml() + (S.qStale ? '<div class="q-stale" role="alert">⚠ 최신 목록을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요. (자동으로 다시 시도합니다)</div>' : '') +
      (pend.length ? '<div class="q-count">대기 중 <b>' + pend.length + '</b>건</div>' : '');
    html += pend.length ? '<ol class="q-list">' + pend.map(qRowHtml).join('') + '</ol>' :
      '<div class="q-empty"><span class="q-empty-ic">' + svg('check') + '</span><b>대기 중인 환자가 없습니다</b>' +
      '<p>채팅 메시지 옆의 <span class="q-inl">' + svg('queue') + '</span> 버튼을 누르면 이곳에 올라옵니다.<br>진료가 끝난 항목은 체크하면 사라집니다.</p></div>';
    html += '<section class="q-done"><button class="q-done-hd" id="qDoneTgl" aria-expanded="' + (S.qOpenDone ? 'true' : 'false') + '">오늘 진료 완료 <b>' + done.length + '</b><span class="q-caret" aria-hidden="true"></span></button>' +
      (S.qOpenDone ? (done.length ? '<ul class="q-dlist">' + done.map(qDoneRowHtml).join('') + '</ul>' : '<p class="muted small" style="padding:2px 4px 12px">오늘 완료한 항목이 없습니다.</p>') : '') + '</section>';
    var top = el.scrollTop; el.innerHTML = html; el.scrollTop = top;
  }
  function renderQueue(host) {   // host 가 있으면 그 안(채팅 탭 오른쪽 칸)에, 없으면 #main(순서표 탭)에 그림
    var main = host || $('#main'); if (!host) main.style.justifyContent = '';
    if (S.solo) document.title = '진료순서표 · 노블 메신저';
    var right = '<button class="icon-btn" id="qSnd" aria-label="새 항목 알림음"></button>' +
      (DESKTOP.matches && !S.solo && !host ? '<button class="btn btn-line sm q-win" id="qWin" aria-label="진료순서표를 새 창으로 열기" title="진료순서표만 작은 새 창으로 띄워 두기 (모니터 옆에 두고 볼 수 있습니다)">' + svg('pop') + '새 창</button>' : '') +
      '<button class="icon-btn" id="qAdd" aria-label="직접 추가" title="직접 추가">' + svg('plus') + '</button>';
    main.innerHTML = header('진료순서표', { right: right }) + '<div class="pane-body q-body" id="qbody"></div>';
    function snd() {
      var on = qSoundOn(), b = $('#qSnd', main); b.innerHTML = svg(on ? 'bell' : 'mute'); b.classList.toggle('off', !on);
      b.title = on ? '새 항목 알림음 켜짐 (누르면 끄기)' : '새 항목 알림음 꺼짐 (누르면 켜기)'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    snd();
    $('#qSnd', main).onclick = function () { lsSet('noble-q-sound', qSoundOn() ? 'off' : 'on'); snd(); if (qSoundOn()) playSound('chime', true); };
    var pop = $('#qWin', main); if (pop) pop.onclick = openQueueWindow;
    $('#qAdd', main).onclick = qAddSheet;
    var body = $('#qbody', main);   // 전체 문서가 아니라 방금 그린 칸 안에서 찾음 (순서표 탭 화면이 아직 남아 있는 순간에 오른쪽 칸을 그릴 수 있음)
    body.addEventListener('click', function (e) {
      var t = e.target.closest('[data-qdone],[data-qundo],[data-qmore],[data-qnotice],#qDoneTgl'); if (!t) return;
      if (t.hasAttribute('data-qnotice')) { qNoticeSheet(); return; }
      if (t.hasAttribute('data-qdone')) { qCheck(+t.getAttribute('data-qdone')); return; }
      if (t.hasAttribute('data-qundo')) { qUndo(+t.getAttribute('data-qundo')); return; }
      if (t.hasAttribute('data-qmore')) { var it = qFind(+t.getAttribute('data-qmore')); if (it) qMoreSheet(it); return; }
      if (t.id === 'qDoneTgl') { S.qOpenDone = !S.qOpenDone; renderQueueBody(); }
    });
    renderQueueBody(body);
    loadQueue();   // 열 때마다 최신으로
    qWatch();
  }

  /* 진료 완료 체크 → 목록에서 사라짐 (되돌리기 가능) */
  function qCheck(id) {
    var it = (S.queue || []).find(function (x) { return x.id === id; });
    if (!it || it.busy) return;
    it.busy = true;
    var row = $('.q-item[data-qid="' + id + '"]'); if (row) row.classList.add('leaving');
    sb.rpc('care_queue_set_done', { p_id: id, p_done: true }).then(function (r) {
      if (r.error) throw r.error;
      it.busy = false; it.status = 'done'; it.done_by = S.me.id; it.done_at = new Date().toISOString();
      S.queue = S.queue.filter(function (x) { return x.id !== id; });
      S.qDone = [it].concat((S.qDone || []).filter(function (x) { return x.id !== id; }));
      setBadges(); refreshMsgTags();
      if (qShown()) setTimeout(renderQueueBody, 280);   // 사라지는 동작이 끝난 뒤 목록을 다시 그림
      toast('<b>✓ 진료 완료</b> · 잘못 눌렀다면 여기를 눌러 되돌리기', function () { qUndo(id); });
    }).catch(function (e) {
      it.busy = false; if (row) row.classList.remove('leaving');
      toast('<b>체크하지 못했습니다</b> ' + esc(qErrText(e))); loadQueue();
    });
  }
  function qUndo(id) {
    sb.rpc('care_queue_set_done', { p_id: id, p_done: false }).then(function (r) {
      if (r.error) throw r.error;
      toast(r.data === 'duplicate' ? '같은 메시지가 이미 대기 중이라 되돌릴 수 없습니다' : '대기 목록으로 되돌렸습니다');
      return loadQueue();
    }).catch(function (e) { toast('<b>되돌리지 못했습니다</b> ' + esc(qErrText(e))); });
  }
  function qTop(id) {
    sb.rpc('care_queue_top', { p_id: id }).then(function (r) {
      if (r.error) throw r.error;
      toast('맨 위로 올렸습니다'); return loadQueue();
    }).catch(function (e) { toast('<b>순서를 바꾸지 못했습니다</b> ' + esc(qErrText(e))); });
  }
  function qDelete(id) {
    sb.rpc('care_queue_delete', { p_id: id }).then(function (r) {
      if (r.error) throw r.error;
      toast('목록에서 삭제했습니다'); return loadQueue();
    }).catch(function (e) { toast('<b>삭제하지 못했습니다</b> ' + esc(qErrText(e))); });
  }
  function qGoMessage(it) {
    sb.from('messages').select('id, room_id, created_at').eq('id', it.message_id).maybeSingle().then(function (r) {
      var m = r.data;
      if (!m) { toast('원본 메시지를 찾을 수 없습니다 (삭제됐거나 볼 수 없는 대화방입니다)'); return; }
      if (S.solo) { openRoomWindow(m.room_id); return; }   // 순서표 새 창은 그대로 두고 그 대화방을 따로 엶
      S.pendingJump = m; location.hash = '#room/' + m.room_id;
    });
  }
  function qMoreSheet(it) {
    var canDel = it.created_by === S.me.id || S.me.role === 'admin', by = S.profiles[it.created_by];
    var s = sheet('진료순서표 항목',
      '<p class="q-sheet-txt">' + linkify(it.body) + '</p>' +
      '<p class="muted small" style="margin-bottom:12px">' + esc(qFmtTime(it.created_at)) + ' 올라옴' + (by ? ' · 올린 사람 ' + esc(by.name) : '') + '</p>' +
      '<div style="display:grid;gap:8px">' +
      '<button class="btn btn-line" id="qEd">내용 수정</button>' +
      (it.status === 'pending' ? '<button class="btn btn-line" id="qTop">맨 위로 올리기</button>' : '') +
      (it.message_id ? '<button class="btn btn-line" id="qGo">원본 대화 보기</button>' : '') +
      '<button class="btn btn-line" id="qCp">내용 복사</button>' +
      (canDel ? '<button class="btn btn-danger" id="qDel">목록에서 삭제</button>' : '') +
      '<button class="btn btn-line" data-close>닫기</button></div>');
    $('#qEd', s).onclick = function () { closeSheet(s); qEditSheet(qFind(it.id) || it); };   // 메뉴를 열어 둔 사이 다른 직원이 고쳤다면 최신 글로
    var t = $('#qTop', s); if (t) t.onclick = function () { closeSheet(s); qTop(it.id); };
    var g = $('#qGo', s); if (g) g.onclick = function () { closeSheet(s); qGoMessage(it); };
    $('#qCp', s).onclick = function () { closeSheet(s); copyText(it.body); };
    var dl = $('#qDel', s); if (dl) dl.onclick = function () { if (!confirmInline(dl, '한 번 더 누르면 삭제됩니다')) return; closeSheet(s); qDelete(it.id); };
  }
  /* 순서표 글 고치기 — 직원 누구나. 채팅의 원래 메시지는 그대로이고 순서표에 보이는 글만 바뀜 */
  function qEditSheet(it) {
    var m = sheet('내용 수정',
      '<div class="field"><label for="qEdTxt">내용</label><textarea class="input" id="qEdTxt" rows="5" maxlength="2000"></textarea></div>' +
      '<p class="muted small" style="margin-bottom:8px">채팅방의 원래 메시지는 바뀌지 않고, 순서표에 보이는 글만 바뀝니다.</p>' +
      '<p class="err" id="qEdErr" role="alert"></p><div class="sheet-actions"><button class="btn btn-line" id="qEdCancel" data-close>취소</button><button class="btn btn-navy" id="qEdSave" disabled>저장</button></div>');
    var ta = $('#qEdTxt', m), save = $('#qEdSave', m), err = $('#qEdErr', m), busy = false;
    function norm(v) { return String(v).replace(/\r/g, '').replace(/^\s+|\s+$/g, ''); }   // 서버(care_queue_edit)와 같은 정리: 앞뒤 공백·줄바꿈 제거
    var orig = norm(it.body);   // 창을 연 순간의 글 — 이것과 같으면 "바뀐 것 없음"
    ta.value = it.body;
    function sync() { var v = norm(ta.value); save.disabled = busy || !v || v === orig; }
    ta.addEventListener('input', function () { err.textContent = ''; sync(); });
    function go() {
      var v = norm(ta.value); if (busy || !v || v === orig) return;
      busy = true; save.disabled = true; err.textContent = '';
      sb.rpc('care_queue_edit', { p_id: it.id, p_body: v }).then(function (r) {
        if (r.error) throw r.error;
        var same = !!(r.data && r.data.changed === false), cur = qFind(it.id);
        if (cur) { cur.body = v; if (!same) { cur.edited_by = S.me.id; cur.edited_at = new Date().toISOString(); } }
        closeSheet(m); toast(same ? '이미 같은 내용입니다' : '<b>✓ 내용을 수정했습니다</b>');
        if (qShown()) renderQueueBody();
        return loadQueue();
      }).catch(function (e) { busy = false; err.textContent = qErrText(e); sync(); });   // 입력은 그대로 두고 다시 저장할 수 있게
    }
    save.onclick = go;
  }
  function qAddSheet() {
    var m = sheet('진료순서표에 직접 추가',
      '<div class="field"><label for="qb">내용</label><textarea class="input" id="qb" rows="3" maxlength="1000" placeholder="예: 자보 재진 홍길동님 치료실가세요 - 물치 침/9시에"></textarea></div>' +
      '<p class="err" id="qe"></p><div class="sheet-actions"><button class="btn btn-line" data-close>취소</button><button class="btn btn-navy" id="qOk">추가</button></div>');
    function go() {
      var b = $('#qb', m).value.trim(); if (!b) { $('#qe', m).textContent = '내용을 입력해 주세요.'; return; }
      var btn = $('#qOk', m); btn.disabled = true;
      sb.rpc('care_queue_add', { p_body: b }).then(function (r) {
        if (r.error) throw r.error;
        closeSheet(m); toast('<b>📋 진료순서표에 추가했습니다</b>'); return loadQueue();
      }).catch(function (e) { $('#qe', m).textContent = qErrText(e); btn.disabled = false; });
    }
    $('#qOk', m).onclick = go;
    $('#qb', m).addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229 && DESKTOP.matches) { e.preventDefault(); go(); }
    });
  }
  /* 순서표 화면이 열려 있는 동안만: 1분마다 목록을 다시 확인 (실시간 연결이 끊겼을 때를 대비) */
  function qWatch() {
    if (S.qWatch) { clearInterval(S.qWatch); S.qWatch = null; }
    S.qWatch = setInterval(function () {
      if (!$('#qbody')) { clearInterval(S.qWatch); S.qWatch = null; return; }   // 다른 화면으로 가면 스스로 멈춤
      if (document.visibilityState !== 'visible') return;
      loadQueue();
    }, 60000);
  }

  /* ================= 직원 ================= */
  function groupPeople(list) {
    var g = {};
    list.forEach(function (p) { var k = (p.clinic === '공통' ? '' : p.clinic.replace('노블', '') + ' · ') + (p.dept || '부서 미지정'); (g[k] = g[k] || []).push(p); });
    return Object.keys(g).sort(function (a, b) { return a.localeCompare(b, 'ko'); }).map(function (k) { return [k, g[k].sort(function (a, b) { return a.name.localeCompare(b.name, 'ko'); })]; });
  }
  function renderStaff() {
    var q = S.staffQuery.trim();
    var list = Object.keys(S.profiles).map(function (k) { return S.profiles[k]; }).filter(function (p) { return p.active && (!q || (p.name + p.dept + p.title + p.clinic).indexOf(q) > -1); });
    var main = $('#main'); main.style.justifyContent = '';
    main.innerHTML = header('직원 <small>' + list.length + '명</small>') + '<div class="search">' + svg('search') + '<input id="sq" placeholder="이름·부서 검색" value="' + esc(q) + '" aria-label="직원 검색"></div><div class="pane-body">' +
      groupPeople(list).map(function (g) {
        return '<div class="group-hd">' + esc(g[0]) + '</div>' + g[1].map(function (p) {
          return '<button class="person" data-dm="' + p.id + '">' + av(p) + '<span class="grow"><b>' + esc(p.name) + (p.id === S.me.id ? ' (나)' : '') + '</b><br><span>' + esc(personLabel(p)) + '</span></span>' + (p.role === 'admin' ? '<span class="pill gold">관리자</span>' : '') + '</button>';
        }).join('');
      }).join('') + '</div>';
    /* v49: 직원 검색도 roomQ와 같은 한글 입력 겹침 문제가 있어 같은 방식으로 고침 */
    var si = $('#sq'), staffQComposing = false;
    function staffQApply() { S.staffQuery = si.value; var pos = si.selectionStart; renderStaff(); var n = $('#sq'); n.focus(); n.setSelectionRange(pos, pos); }
    si.addEventListener('compositionstart', function () { staffQComposing = true; });
    si.addEventListener('compositionend', function () { staffQComposing = false; staffQApply(); });
    si.oninput = function () { if (staffQComposing) { S.staffQuery = si.value; return; } staffQApply(); };
    // 직원 목록: 누르면 프로필 카드 (1:1 대화 / 관리자는 정보 수정) — 어디를 눌러도 같게
    $$('[data-dm]').forEach(function (b) { b.onclick = function () { profileView(b.getAttribute('data-dm')); }; });
    if (false) $$('[data-dm]').forEach(function (b) { b.onclick = function () { if (b.getAttribute('data-dm') === S.me.id) { openSelf(); return; } sb.rpc('start_dm', { other: b.getAttribute('data-dm') }).then(function (r) { if (r.error) { toast(esc(errMsg(r.error))); return; } loadRooms().then(function () { location.hash = '#room/' + r.data; }); }); }; });
  }

  /* ================= 관리 (관리자) ================= */
  var CLINICS = ['노블365의원', '노블경희한의원', '공통'];
  function adminCall(body) {
    return sb.functions.invoke('admin-users', { body: body }).then(function (r) {
      if (r.error) {
        var ctx = r.error.context; if (ctx && ctx.json) return ctx.json().then(function (j) { throw new Error(j.error || r.error.message); }, function () { throw r.error; });
        throw r.error;
      }
      if (r.data && r.data.error) throw new Error(r.data.error);
      return r.data;
    });
  }
  function reloadProfiles() { return sb.from('profiles').select('*').order('name').then(function (p) { if (p.error) return; S.profiles = {}; (p.data || []).forEach(function (x) { S.profiles[x.id] = x; }); if (S.me && S.profiles[S.me.id]) S.me = S.profiles[S.me.id]; }); }
  function renderAdmin() {
    var all = Object.keys(S.profiles).map(function (k) { return S.profiles[k]; });
    var pend = all.filter(function (p) { return p.pending; });
    var act = all.filter(function (p) { return p.active; }), off = all.filter(function (p) { return !p.active && !p.pending; });
    var main = $('#main'); main.style.justifyContent = '';
    main.innerHTML = header('직원 계정 관리', { right: '<button class="btn btn-navy sm" id="addUser">' + svg('plus').replace('<svg', '<svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.4"') + ' 계정 만들기</button>' }) +
      '<div class="pane-body"><section class="card" style="margin-top:14px" id="joinCard"><h3>직원 가입 링크</h3><p class="muted small">불러오는 중…</p></section>' +
      (pend.length ? '<div class="group-hd" style="background:var(--gold-soft);color:var(--gold-d)">가입 승인 대기 ' + pend.length + '명</div>' + pend.map(function (p) {
        return '<div class="person">' + av(p) + '<span class="grow"><b>' + esc(p.name) + '</b> <span>' + esc(p.login_id) + '</span><br><span>' + esc(personLabel(p) || '부서 미입력') + '</span></span>' +
          '<button class="btn btn-navy sm" data-approve="' + p.id + '">승인</button> <button class="btn btn-danger sm" data-reject="' + p.id + '">거절</button></div>';
      }).join('') : '') +
      '<div class="banner"><span>재직 ' + act.length + '명 · 정지 ' + off.length + '명</span>' + (S.pendingCount ? '<a class="btn btn-gold sm" href="#work" id="goPend">근무신청 대기 ' + S.pendingCount + '건</a>' : '') + '</div>' +
      groupPeople(act).map(function (g) { return '<div class="group-hd">' + esc(g[0]) + '</div>' + g[1].map(personRow).join(''); }).join('') +
      (off.length ? '<div class="group-hd">사용 정지 (퇴사)</div>' + off.map(personRow).join('') : '') + '</div>';
    function personRow(p) {
      return '<button class="person' + (p.active ? '' : ' off') + '" data-edit="' + p.id + '">' + av(p) + '<span class="grow"><b>' + esc(p.name) + '</b> <span>' + esc(p.login_id) + '</span><br><span>' + esc(personLabel(p) || '부서 미지정') + '</span></span>' + (p.role === 'admin' ? '<span class="pill gold">관리자</span>' : '') + '</button>';
    }
    $('#addUser').onclick = function () { userSheet(); };
    $$('[data-approve]').forEach(function (b) { b.onclick = function () { b.disabled = true; adminCall({ action: 'approve', id: b.getAttribute('data-approve') }).then(function () { toast('승인했습니다'); return reloadProfiles().then(function () { renderAdmin(); setBadges(); }); }).catch(function (e) { b.disabled = false; toast(esc(errMsg(e))); }); }; });
    $$('[data-reject]').forEach(function (b) { b.onclick = function () { if (!confirmInline(b, '한 번 더')) return; adminCall({ action: 'reject', id: b.getAttribute('data-reject') }).then(function () { return reloadProfiles().then(function () { renderAdmin(); setBadges(); }); }).catch(function (e) { toast(esc(errMsg(e))); }); }; });
    joinCard();
    var gp = $('#goPend'); if (gp) gp.onclick = function () { S.workTab = 'all'; };
    $$('[data-edit]').forEach(function (b) { b.onclick = function () { userSheet(S.profiles[b.getAttribute('data-edit')]); }; });
  }
  function joinCard(action) {
    var box = $('#joinCard'); if (!box) return;
    adminCall({ action: action || 'get_code' }).then(function (r) {
      var code = r.code, link = code ? location.href.split('#')[0] + '#join/' + code : '';
      box.innerHTML = '<h3>직원 가입 링크</h3>' + (code ?
        '<p class="small" style="margin-bottom:8px">이 링크를 받은 직원은 직접 가입 신청을 할 수 있고, <b>본부장님이 승인해야</b> 사용할 수 있습니다.</p>' +
        '<input class="input" id="joinLink" readonly value="' + esc(link) + '" aria-label="가입 링크" style="font-size:13px;margin-bottom:8px">' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-gold sm" id="copyJoin">링크 복사</button><button class="btn btn-line sm" id="newJoin">새 링크 만들기 (기존 링크 무효)</button><button class="btn btn-line sm" id="offJoin">가입 받지 않기</button></div>'
        : '<p class="small" style="margin-bottom:8px">지금은 가입 링크가 꺼져 있습니다. 링크를 만들어 직원 단톡방이나 문자로 보내면 직원들이 직접 가입할 수 있습니다.</p><button class="btn btn-gold sm" id="newJoin">가입 링크 만들기</button>');
      var c = $('#copyJoin'); if (c) c.onclick = function () {
        var inp = $('#joinLink');
        (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(function () { toast('가입 링크를 복사했습니다'); }, function () { inp.select(); toast('링크를 길게 눌러 복사해 주세요'); });
      };
      $('#newJoin').onclick = function () { joinCard('new_code'); };
      var o = $('#offJoin'); if (o) o.onclick = function () { joinCard('disable_code'); };
    }).catch(function (e) { box.innerHTML = '<h3>직원 가입 링크</h3><p class="err">' + esc(errMsg(e)) + '</p>'; });
  }
  function userSheet(p) {
    var isNew = !p; p = p || { clinic: '노블365의원', dept: '', title: '', role: 'staff', name: '', login_id: '' };
    var m = sheet(isNew ? '직원 계정 만들기' : esc(p.name) + ' 계정',
      (isNew ? '<div class="row2"><div class="field"><label for="ui">아이디</label><input class="input" id="ui" autocapitalize="off" spellcheck="false" placeholder="영문·숫자 (예: hong01)"></div>' +
        '<div class="field"><label for="upw">초기 비밀번호</label><input class="input" id="upw" autocomplete="new-password" placeholder="8자 이상"></div></div>'
        : '<p class="muted small" style="margin-bottom:12px">아이디: <b>' + esc(p.login_id) + '</b></p>') +
      '<div class="row2"><div class="field"><label for="un">이름</label><input class="input" id="un" value="' + esc(p.name) + '"></div>' +
      '<div class="field"><label for="uc">소속</label><select class="input" id="uc">' + CLINICS.map(function (c) { return '<option' + (c === p.clinic ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="row2"><div class="field"><label for="ud">부서</label><input class="input" id="ud" value="' + esc(p.dept) + '" placeholder="예: 원무, 간호, 물리치료" list="depts"></div>' +
      '<div class="field"><label for="ut">직책</label><input class="input" id="ut" value="' + esc(p.title) + '" placeholder="예: 실장, 팀장"></div></div>' +
      '<datalist id="depts">' + Array.from(new Set(Object.keys(S.profiles).map(function (k) { return S.profiles[k].dept; }).filter(Boolean))).map(function (x) { return '<option value="' + esc(x) + '">'; }).join('') + '</datalist>' +
      '<div class="field"><label for="ur">권한</label><select class="input" id="ur"><option value="staff"' + (p.role === 'staff' ? ' selected' : '') + '>일반 직원</option><option value="admin"' + (p.role === 'admin' ? ' selected' : '') + '>관리자 (계정 관리·공지·근무 승인)</option></select></div>' +
      (isNew ? '' : '<button type="button" class="btn btn-line" id="uAtt" style="width:100%;margin-bottom:12px">출퇴근 설정 (대상·기준시간·팀장·스마트폰)</button>') +
      '<p class="err" id="ue"></p>' +
      '<div class="sheet-actions"><button class="btn btn-line" data-close>닫기</button><button class="btn btn-navy" id="uOk">' + (isNew ? '계정 만들기' : '저장') + '</button></div>' +
      (isNew ? '' : '<hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><div style="display:grid;gap:8px">' +
        '<div class="row2"><input class="input" id="npw" placeholder="새 비밀번호 (8자 이상)" autocomplete="new-password" aria-label="새 비밀번호"><button class="btn btn-line" id="rpw">비밀번호 초기화</button></div>' +
        (p.id !== S.me.id ? '<button class="btn ' + (p.active ? 'btn-danger' : 'btn-line') + '" id="tog">' + (p.active ? '사용 정지 (퇴사 처리)' : '다시 사용하기') + '</button>' : '') + '</div>'));
    var ua = $('#uAtt', m); if (ua) ua.onclick = function () { closeSheet(m); attSetSheet(p, renderAdmin); };
    $('#uOk', m).onclick = function () {
      var body = { name: $('#un', m).value.trim(), clinic: $('#uc', m).value, dept: $('#ud', m).value.trim(), title: $('#ut', m).value.trim(), role: $('#ur', m).value };
      if (!body.name) { $('#ue', m).textContent = '이름을 입력해 주세요.'; return; }
      if (isNew) { body.action = 'create'; body.login_id = $('#ui', m).value.trim().toLowerCase(); body.password = $('#upw', m).value; }
      else { body.action = 'update'; body.id = p.id; }
      var btn = this; btn.disabled = true; $('#ue', m).textContent = '';
      adminCall(body).then(function () {
        closeSheet(m);
        if (isNew) toast('<b>' + esc(body.name) + '</b> 계정을 만들었습니다 · 아이디 ' + esc(body.login_id));
        return reloadProfiles().then(renderAdmin);
      }).catch(function (e) { $('#ue', m).textContent = errMsg(e); btn.disabled = false; });
    };
    if (!isNew) {
      $('#rpw', m).onclick = function () {
        var pw = $('#npw', m).value; if (pw.length < 8) { $('#ue', m).textContent = '새 비밀번호는 8자 이상이어야 합니다.'; return; }
        adminCall({ action: 'reset_password', id: p.id, password: pw }).then(function () { $('#npw', m).value = ''; toast('비밀번호를 바꿨습니다. 직원에게 새 비밀번호를 알려주세요.'); })
          .catch(function (e) { $('#ue', m).textContent = errMsg(e); });
      };
      var tg = $('#tog', m);
      if (tg) tg.onclick = function () {
        if (p.active && !confirmInline(tg, '한 번 더 누르면 로그인이 막힙니다')) return;
        adminCall({ action: 'set_active', id: p.id, active: !p.active }).then(function () { closeSheet(m); return reloadProfiles().then(renderAdmin); })
          .catch(function (e) { $('#ue', m).textContent = errMsg(e); });
      };
    }
  }

  /* ================= 설정 ================= */
  function isIOS() { return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function standalone() { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
  function pushSupported() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; }
  function renderSettings() {
    var me = S.me, main = $('#main'); main.style.justifyContent = '';
    var perm = 'Notification' in window ? Notification.permission : 'unsupported';
    main.innerHTML = header('설정') + '<div class="pane-body">' +
      '<section class="card" style="margin-top:16px"><div style="display:flex;gap:14px;align-items:center">' + av(me, 'xl') + '<div style="min-width:0"><b style="font-size:17px">' + esc(me.name) + '</b><br><span class="muted small">' + esc(personLabel(me) || '') + ' · 아이디 ' + esc(me.login_id) + '</span>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px"><label class="btn btn-gold sm" style="cursor:pointer">' + svg('camera').replace('<svg', '<svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2"') + ' 프로필 사진 변경<input type="file" id="avIn" accept="image/*" hidden></label>' +
      (me.avatar_url ? '<button class="btn btn-line sm" id="avDel">기본 이미지로</button>' : '') + '</div></div></div></section>' +
      '<section class="card"><h3>글자 크기</h3><div class="fs-seg">' + FS.map(function (f, i) { return '<button data-fs="' + f[0] + '"' + (fontSize() === f[0] ? ' aria-pressed="true"' : '') + ' style="font-size:' + [13, 15, 18, 21][i] + 'px">' + f[1] + '</button>'; }).join('') + '</div>' +
      '<h3 style="margin-top:16px">글씨체</h3><div class="face-list">' + Object.keys(FACES).map(function (k) { return '<button data-face="' + k + '"' + (fontFace() === k ? ' aria-pressed="true"' : '') + ' style="font-family:' + FACES[k][1].replace(/"/g, '&quot;') + ',sans-serif">' + FACES[k][0] + '<span>가나다 ABC 123</span></button>'; }).join('') + '</div>' +
      '<div class="fs-prev"><div class="bubble" style="max-width:100%">미리보기입니다. 오늘 오후 3시 회의 있습니다. 확인 부탁드립니다.</div></div><p class="muted small" style="margin-top:8px">이 기기에만 적용됩니다.</p></section>' +
      '<section class="card"><h3>채팅 화면</h3><p class="muted small" style="margin-bottom:10px">창이 넓을 때(왼쪽 목록 + 오른쪽 대화) 채팅 탭을 열거나 메신저를 다시 켜면 대화방을 바로 열어 줍니다. 창이 좁은 미니 창·휴대폰은 목록이 먼저 보입니다. (이 기기에만 적용)</p>' +
      '<div class="field"><label for="autoRoom">자동으로 열 대화방</label><select class="input" id="autoRoom"><option value="last">마지막으로 본 대화방 (없으면 노블365 단톡방)</option><option value="group">항상 노블365 단톡방</option><option value="off">자동으로 열지 않기</option></select></div></section>' +
      '<section class="card"><h3>메시지 알림음</h3><p class="muted small" style="margin-bottom:10px">메신저가 켜져 있을 때 새 메시지가 오면 소리로 알려 줍니다. (이 기기에만 적용)<br>※ 아래 <b>알림 켜기</b>를 한 기기는 Windows·휴대폰 알림음이 대신 울립니다.</p>' +
      '<label class="switch-row"><input type="checkbox" id="sndOn"' + (soundOn() ? ' checked' : '') + '> 알림음 켜기</label>' +
      '<div class="snd-row"><select class="input" id="sndKind" aria-label="알림음 종류">' + Object.keys(SOUNDS).map(function (k) { return '<option value="' + k + '"' + (k === soundKind() ? ' selected' : '') + '>' + SOUNDS[k][0] + '</option>'; }).join('') + '</select>' +
      '<span class="small muted">크기</span><input type="range" id="sndVol" min="0.1" max="1" step="0.1" value="' + soundVol() + '" aria-label="소리 크기"><button class="btn btn-line sm" id="sndTest">미리 듣기</button></div></section>' +
      (ND ? '<section class="card"><h3>PC 프로그램</h3><p class="small">노블 메신저 PC 프로그램 ' + esc(ND.version || '') + ' 사용 중입니다. 새 메시지는 화면 오른쪽 아래(시계 위)에 ' + (ND.toast ? '<b>노블 메신저 알림창</b>' : '<b>Windows 알림</b>') + '으로 표시됩니다.' + (ND.toast ? ' 알림 방식·표시 시간은 트레이 아이콘 오른쪽 클릭 → <b>알림 방식</b>에서 바꿀 수 있습니다.' : '') + '</p><p class="muted small" style="margin-top:6px">창의 X를 누르면 시계 옆 트레이로 숨고 알림은 계속 옵니다. 완전히 끄려면 트레이 아이콘 오른쪽 클릭 → 종료.</p>' + (ND.getPref ? '<div class="field" style="margin-top:12px"><label for="ndOpen">알림을 누르면</label><select class="input" id="ndOpen"><option value="auto">자동 (메신저 창이 넓으면 그 창에서, 좁으면 새 창)</option><option value="popup">항상 새 작은 창에서 열기</option><option value="main">항상 메신저 창에서 열기</option></select></div>' +
        '<div class="field"><label for="ndMode">알림 방식</label><select class="input" id="ndMode"><option value="noble">노블 메신저 알림창 (추천)</option><option value="windows">Windows 알림</option></select></div>' : '') + '<button class="btn btn-line sm" id="ndTest" style="margin-top:10px">알림 테스트</button><p class="muted small" id="ndTestMsg" style="margin-top:6px"></p></section>'
        : '<section class="card"><h3>휴대폰 알림</h3><div id="pushBox"></div></section>') +
      (DESKTOP.matches && !ND ? '<section class="card"><h3>작은 창으로 쓰기</h3><p class="muted small" style="margin-bottom:10px">크롬·엣지는 앱 창을 일정 폭 이하로 줄이지 못하게 막고 있습니다. 아래 버튼을 누르면 <b>카카오워크 크기(폭 380)</b>의 작은 창으로 따로 열립니다. 기존 큰 창은 닫으셔도 됩니다.</p>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-gold sm" data-mini="380">작은 창 (380)</button><button class="btn btn-line sm" data-mini="440">보통 창 (440)</button></div>' +
        '<label class="switch-row" style="margin-top:12px"><input type="checkbox" id="miniDef"' + (lsGet('noble-mini-default') === '1' ? ' checked' : '') + '> 메신저를 켤 때 항상 폭 380으로 열기</label></section>' : '') +
      (ND ? '' : '<section class="card"><h3>앱으로 설치하기</h3>' + (standalone() ? '<p class="muted">앱으로 설치되어 있습니다. ✓</p>' :
        isIOS() ? '<p>아이폰: Safari 아래쪽 <b>공유 버튼(□↑)</b> → <b>홈 화면에 추가</b> → 추가. 설치한 앱을 열어야 알림을 받을 수 있습니다.</p>' :
          '<p>안드로이드(크롬): 오른쪽 위 <b>⋮</b> → <b>앱 설치</b> 또는 <b>홈 화면에 추가</b>. PC(크롬·엣지): 주소창 오른쪽 <b>설치</b> 아이콘.</p>') + '</section>') +
      '<section class="card"><h3>비밀번호 변경</h3><form id="pwf" novalidate><div class="field"><label for="p1">새 비밀번호</label><input class="input" type="password" id="p1" autocomplete="new-password" placeholder="8자 이상"></div>' +
      '<div class="field"><label for="p2">새 비밀번호 확인</label><input class="input" type="password" id="p2" autocomplete="new-password"></div><p class="err" id="pe"></p><button class="btn btn-navy">변경하기</button></form></section>' +
      '<section class="card"><button class="btn btn-line block" id="logout">로그아웃</button></section>' +
      '<p class="muted small" style="text-align:center;padding:4px 16px 24px">노블 메신저 · 노블365의원 · 노블경희한의원</p></div>';
    renderPushBox();
    Object.keys(FACES).forEach(function (k) { if (FACES[k][2]) applyFaceLink(k); });
    $$('[data-face]').forEach(function (b) { b.onclick = function () { var k = b.getAttribute('data-face'); lsSet('noble-face', k); applyFace(k); $$('[data-face]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); }; });
    $$('[data-fs]').forEach(function (b) { b.onclick = function () { lsSet('noble-font', b.getAttribute('data-fs')); applyFont(b.getAttribute('data-fs')); $$('[data-fs]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); }; });
    var ar = $('#autoRoom'); ar.value = autoMode(); ar.onchange = function () { lsSet('noble-auto-room', this.value); toast('저장했습니다'); };
    $('#sndOn').onchange = function () { lsSet('noble-sound', this.checked ? 'on' : 'off'); if (this.checked) playSound(null, true); };
    $('#sndKind').onchange = function () { lsSet('noble-sound-kind', this.value); playSound(this.value, true); };
    $('#sndVol').onchange = function () { lsSet('noble-sound-vol', this.value); playSound(null, true); };
    $('#sndTest').onclick = function () { playSound($('#sndKind').value, true); };
    if (ND && ND.getPref) {
      [['ndOpen', 'openMode'], ['ndMode', 'notifyMode']].forEach(function (x) {
        var el = $('#' + x[0]); if (!el) return;
        ND.getPref(x[1]).then(function (v) { if (v) el.value = v; });
        el.onchange = function () { ND.setPref(x[1], el.value); toast('저장했습니다'); };
      });
    }
    var ndt = $('#ndTest'); if (ndt) ndt.onclick = function () {
      deskNotify('노블 메신저 알림 테스트', '이 알림이 화면 오른쪽 아래(시계 위)에 보이면 정상입니다.', '#settings', { name: '알림 테스트', room: '노블 메신저' });
      $('#ndTestMsg').innerHTML = ND.toast ? '알림창이 안 보이면: 트레이 아이콘 오른쪽 클릭 → <b>알림 방식</b> → <b>노블 메신저 알림창</b>이 선택돼 있는지 확인' : '알림이 안 보이면: Windows <b>설정 → 시스템 → 알림</b>에서 알림 켜기 · <b>노블 메신저</b> 켜기 · <b>방해 금지(집중 지원)</b> 끄기';
    };
    $('#avIn').addEventListener('change', function () { var f = this.files[0]; this.value = ''; if (f) setAvatar(f); });
    var ad = $('#avDel'); if (ad) ad.onclick = function () { setAvatar(null); };
    $('#pwf').addEventListener('submit', function (e) {
      e.preventDefault();
      var a = $('#p1').value, b = $('#p2').value;
      if (a.length < 8) { $('#pe').textContent = '8자 이상 입력해 주세요.'; return; }
      if (a !== b) { $('#pe').textContent = '두 비밀번호가 다릅니다.'; return; }
      sb.auth.updateUser({ password: a }).then(function (r) { if (r.error) throw r.error; $('#p1').value = $('#p2').value = ''; $('#pe').textContent = ''; toast('비밀번호를 바꿨습니다'); })
        .catch(function (er) { $('#pe').textContent = errMsg(er); });
    });
    var md = $('#miniDef'); if (md) md.onchange = function () { lsSet('noble-mini-default', this.checked ? '1' : '0'); if (this.checked) fitMini(true); };
    $$('[data-mini]').forEach(function (b) { b.onclick = function () {
      var w = +b.getAttribute('data-mini'), h = Math.min(screen.availHeight - 40, 820);
      var win = window.open(location.href.split('#')[0] + '#chats', 'noble-mini', 'popup,width=' + w + ',height=' + h + ',left=' + (screen.availWidth - w - 20) + ',top=20');
      if (!win) toast('팝업이 차단되었습니다. 주소창 오른쪽 팝업 차단 아이콘에서 허용해 주세요.');
    }; });
    try { if (window.name === 'noble-mini' && window.resizeTo) {} } catch (e) {}
    $('#logout').onclick = function () {
      unsubscribePush().then(function () { return sb.auth.signOut(); }).then(function () { draftClearMine(); S.me = null; ['channel', 'nChannel', 'rChannel'].forEach(function (k) { if (S[k]) { sb.removeChannel(S[k]); S[k] = null; } }); rsvLeave(); S.rsv = null; location.hash = ''; renderLogin(); });
    };
  }
  function squareJpeg(file) {
    return createImageBitmap(file).then(function (bmp) {
      var sz = Math.min(bmp.width, bmp.height), out = 320, c = document.createElement('canvas'); c.width = c.height = out;
      c.getContext('2d').drawImage(bmp, (bmp.width - sz) / 2, (bmp.height - sz) / 2, sz, sz, 0, 0, out, out);
      return new Promise(function (res, rej) { c.toBlob(function (b) { b ? res(b) : rej(new Error('사진을 읽지 못했습니다')); }, 'image/jpeg', 0.86); });
    });
  }
  function setAvatar(file) {
    var old = S.me.avatar_url || '', oldPath = (old.split('/public/avatars/')[1] || '').split('?')[0];
    var p = file ? squareJpeg(file).then(function (blob) {
      var path = S.me.id + '/' + Date.now() + '.jpg';
      return sb.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg', upsert: false }).then(function (r) {
        if (r.error) throw r.error;
        return sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;
      });
    }) : Promise.resolve('');
    toast(file ? '사진을 올리는 중…' : '기본 이미지로 바꾸는 중…');
    p.then(function (url) {
      return sb.rpc('set_my_avatar', { url: url }).then(function (r) {
        if (r.error) throw r.error;
        if (oldPath) sb.storage.from('avatars').remove([decodeURIComponent(oldPath)]);
        S.me.avatar_url = url; if (S.profiles[S.me.id]) S.profiles[S.me.id].avatar_url = url;
        toast(url ? '프로필 사진을 바꿨습니다' : '기본 이미지로 바꿨습니다'); renderSettings();
      });
    }).catch(function (e) { toast('<b>사진 변경 실패</b> ' + esc(errMsg(e))); });
  }
  function renderPushBox() {
    var box = $('#pushBox'); if (!box) return;
    if (!pushSupported()) { box.innerHTML = '<p class="muted">' + (isIOS() && !standalone() ? '아이폰은 먼저 아래 방법으로 <b>앱으로 설치</b>한 뒤, 설치한 앱에서 알림을 켤 수 있습니다.' : '이 브라우저는 알림을 지원하지 않습니다. 크롬이나 사파리 최신 버전을 사용해 주세요.') + '</p>'; return; }
    if (Notification.permission === 'denied') { box.innerHTML = '<p class="muted">알림이 차단되어 있습니다. 휴대폰 설정 → 앱(또는 브라우저) → 알림에서 허용해 주세요.</p>'; return; }
    navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
      box.innerHTML = sub ? '<p style="margin-bottom:10px">✓ 이 기기에서 알림을 받고 있습니다.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-line sm" id="ptest">알림 확인용 메시지</button><button class="btn btn-line sm" id="poff">이 기기 알림 끄기</button></div>'
        : '<p style="margin-bottom:10px" class="muted">새 메시지·공지·근무 승인 알림을 이 기기로 받습니다.</p><button class="btn btn-gold" id="pon">알림 켜기</button>';
      var on = $('#pon'), off = $('#poff'), test = $('#ptest');
      if (on) on.onclick = function () { on.disabled = true; subscribePush().then(function () { toast('알림을 켰습니다'); renderPushBox(); }).catch(function (e) { toast(esc(errMsg(e))); renderPushBox(); }); };
      if (off) off.onclick = function () { unsubscribePush().then(renderPushBox); };
      if (test) test.onclick = function () { navigator.serviceWorker.ready.then(function (reg) { reg.showNotification('노블 메신저', { body: '알림이 정상적으로 표시됩니다.', icon: 'icons/icon-192.png' }); }); };
    });
  }
  function b64ToU8(b) { var p = '='.repeat((4 - b.length % 4) % 4), s = atob((b + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(s, function (c) { return c.charCodeAt(0); }); }
  /* 이 기기에 알림(Windows 알림 / 휴대폰 알림)이 켜져 있으면 화면 안 팝업 대신 시스템 알림을 사용 */
  function checkPush() {
    if (ND) { S.pushOn = false; return Promise.resolve(); }
    if (!pushSupported() || Notification.permission !== 'granted') { S.pushOn = false; return Promise.resolve(); }
    return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
      if (sub) { S.pushOn = true; return; }
      // 권한은 허용돼 있는데 구독이 없으면 자동으로 다시 켬
      return subscribePush().catch(function () { S.pushOn = false; });
    }).catch(function () { S.pushOn = false; }).then(function () { if (S.route.tab === 'chats') renderPushAsk(); });
  }
  /* 알림이 꺼진 PC에는 채팅 목록 위에 '알림 켜기' 안내 표시 */
  function renderPushAsk() {
    var box = $('#pushAsk'); if (!box) return;
    if (ND) { box.innerHTML = ''; return; }
    if (S.pushOn || !pushSupported() || lsGet('noble-pushask-hide') === '1') { box.innerHTML = ''; return; }
    var denied = Notification.permission === 'denied';
    box.innerHTML = '<div class="push-ask">' + svg('bell') + '<div><b>PC 알림이 꺼져 있습니다</b><p>' +
      (denied ? '주소창 왼쪽 <b>자물쇠(또는 설정) 아이콘 → 알림 → 허용</b>으로 바꾼 뒤 새로고침해 주세요.' : '켜면 새 메시지가 채팅창 위가 아니라 <b>화면 오른쪽 아래(시계 위)</b>에 뜹니다.') + '</p></div>' +
      (denied ? '' : '<button class="btn btn-gold sm" id="pushAskOn">알림 켜기</button>') + '<button class="pa-x" id="pushAskX" aria-label="닫기">' + svg('x') + '</button></div>';
    var on = $('#pushAskOn'); if (on) on.onclick = function () { on.disabled = true; subscribePush().then(function () { toast('알림을 켰습니다'); renderPushAsk(); }).catch(function (e) { toast(esc(errMsg(e))); renderPushAsk(); }); };
    $('#pushAskX').onclick = function () { lsSet('noble-pushask-hide', '1'); box.innerHTML = ''; };
  }
  function subscribePush() {
    return Notification.requestPermission().then(function (perm) {
      if (perm !== 'granted') throw new Error('알림 권한이 허용되지 않았습니다.');
      return sb.functions.invoke('push', { body: { action: 'public_key' } });
    }).then(function (r) {
      if (r.error || !r.data || !r.data.publicKey) throw new Error('알림 서버에 연결하지 못했습니다. (push 함수 설치를 확인해 주세요)');
      return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(r.data.publicKey) }); });
    }).then(function (sub) {
      var j = sub.toJSON();
      return sb.from('push_subscriptions').delete().eq('endpoint', j.endpoint).then(function () {
        return sb.from('push_subscriptions').insert({ user_id: S.me.id, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth });
      }).then(function (r) { if (r.error) throw r.error; S.pushOn = true; });
    });
  }
  function unsubscribePush() {
    if (!pushSupported()) return Promise.resolve();
    return navigator.serviceWorker.ready.then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
      if (!sub) return;
      var ep = sub.endpoint;
      S.pushOn = false;
      return sub.unsubscribe().then(function () { return sb.from('push_subscriptions').delete().eq('endpoint', ep); });
    }).catch(function () {});
  }

  /* ================= 예약 달력: 순수 계산 ================= */
  /* 화면·서버에 손대지 않는 계산만 모은 블록입니다. 날짜·시간은 모두 한국 시간(KST, UTC+9)으로 계산해
     기기 시간대와 상관없이 같은 결과가 나옵니다. t/test_rsv_core.mjs 가 이 블록만 잘라 빈 환경에서 시험하고,
     가져오기 SQL 생성기도 같은 블록을 씁니다 (그래서 화면·바깥 변수는 일절 쓰지 않습니다). */
  /* ===== RSV-CORE-BEGIN ===== */
  var RSV = (function () {
    var DAY = 86400000, KST_MS = 9 * 3600000;
    var STATUS = ['예약', '킵', '내원', '취소', '노쇼'];
    var DOWN = ['일', '월', '화', '수', '목', '금', '토'];
    var DEFAULTS = {
      view_start: '08:00', view_end: '21:00', default_len: 30, snap: 15, week_start: 1,
      courses: ['C3', 'C5', 'C10', 'C15', 'C25', 'E', 'E6', 'J15', 'J15+C5'],
      lunch: { on: true, start: '13:00', end: '14:00' },
      hours: { all: { '0': ['09:00', '20:00'], '1': ['09:00', '20:00'], '2': ['09:00', '20:00'], '3': ['09:00', '20:00'],
                      '4': ['09:00', '20:00'], '5': ['09:00', '20:00'], '6': ['09:00', '20:00'] } }
    };
    var ISO_RE = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:[.,](\d+))?)?\s*(Z|z|[+-]\d{2}(?::?\d{2})?)?$/;
    var RE_END1 = /(\d{1,2})\.(\d{1,2})\s*기간\s*끝/;
    var RE_END2 = /~\s*(\d{1,2})[\/.](\d{1,2})/;
    var RE_INS = /자보(?:\s*도수)?(?:\s*-?\s*(\d+)\s*(?:회차|회)?)?/;
    var RE_GROUP = /\(([^()]*)\)/;
    var RE_HANGUL = /[가-힣]/;
    var RE_NAME = /^[A-Za-z가-힣][A-Za-z가-힣 .\-·']*$/;

    /* ---- 작은 도구 ---- */
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
    function isArr(x) { return Object.prototype.toString.call(x) === '[object Array]'; }
    function trim(v) { return (v === null || v === undefined) ? '' : String(v).replace(/^\s+|\s+$/g, ''); }
    function toList(x) {
      var out = [], k;
      if (!x) return out;
      if (isArr(x)) return x;
      if (typeof x === 'object') { for (k in x) { if (has(x, k)) out.push(x[k]); } }
      return out;
    }

    /* ---- 시간 (서버가 주는 ISO 글자·Date·숫자 모두 읽음. 못 읽으면 null/NaN) ---- */
    function toMs(x) {
      var m, ms, sign, z, off;
      if (typeof x === 'number') return x;
      if (Object.prototype.toString.call(x) === '[object Date]') return x.getTime();
      if (typeof x !== 'string') return NaN;
      m = ISO_RE.exec(x);
      if (!m) return Date.parse(x);
      if (+m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31 || +m[4] > 23 || +m[5] > 59 || +(m[6] || 0) > 59) return NaN;
      ms = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0), +((m[7] || '') + '00').slice(0, 3));
      if (new Date(ms).getUTCDate() !== +m[3]) return NaN;      /* 2월 30일처럼 없는 날짜 */
      off = 0;
      if (m[8] && m[8] !== 'Z' && m[8] !== 'z') {
        sign = m[8].charAt(0) === '-' ? -1 : 1;
        z = m[8].slice(1).replace(':', '');
        off = sign * (parseInt(z.slice(0, 2), 10) * 60 + (z.length > 2 ? parseInt(z.slice(2, 4), 10) : 0)) * 60000;
      }
      return ms - off;
    }
    function kst(x) {
      var t = toMs(x), d;
      if (typeof t !== 'number' || !isFinite(t)) return null;
      d = new Date(t + KST_MS);
      return {
        y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), hh: d.getUTCHours(), mm: d.getUTCMinutes(), dow: d.getUTCDay(),
        ymd: d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()), min: d.getUTCHours() * 60 + d.getUTCMinutes()
      };
    }
    function validYmd(y, m, d) {
      var t;
      if (m < 1 || m > 12 || d < 1 || d > 31) return false;
      t = new Date(Date.UTC(y, m - 1, d));
      return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
    }
    function parseYmd(s) {
      var m = typeof s === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(s) : null;
      if (!m || !validYmd(+m[1], +m[2], +m[3])) return null;
      return [+m[1], +m[2], +m[3]];
    }
    function fmtYmd(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
    function at(ymd, min) {
      var p = parseYmd(ymd);
      if (!p || typeof min !== 'number' || !isFinite(min)) return NaN;
      return Date.UTC(p[0], p[1] - 1, p[2], 0, min) - KST_MS;
    }
    function iso(ymd, min) {
      var t = at(ymd, min);
      return isFinite(t) ? new Date(t).toISOString() : '';
    }
    function addDays(ymd, n) {
      var p = parseYmd(ymd), d;
      if (!p) return '';
      if (typeof n !== 'number' || !isFinite(n)) n = 0;
      d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
      return fmtYmd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    }
    function dowOf(ymd) {
      var p = parseYmd(ymd);
      return p ? new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay() : 0;
    }
    function parseHm(s) {
      var m = typeof s === 'string' ? /^(\d{1,2}):(\d{2})$/.exec(s) : null, h, mi;
      if (!m) return null;
      h = +m[1]; mi = +m[2];
      if (mi > 59 || h > 24 || (h === 24 && mi !== 0)) return null;
      return h * 60 + mi;
    }
    function hm(min) {
      var t;
      if (typeof min !== 'number' || !isFinite(min)) return '';
      t = Math.round(min);
      if (t < 0) t = 0;
      return pad(Math.floor(t / 60)) + ':' + pad(t % 60);
    }

    /* ---- 주·월·보기 범위 ---- */
    function weekStart(ymd, ws) {
      var w = (ws === 0 || ws === '0') ? 0 : 1;
      return addDays(ymd, -((dowOf(ymd) - w + 7) % 7));
    }
    function monthGrid(ymd, ws) {
      var p = parseYmd(ymd), s, out = [], i;
      if (!p) return out;
      s = weekStart(fmtYmd(p[0], p[1], 1), ws);
      for (i = 0; i < 42; i++) out.push(addDays(s, i));
      return out;
    }
    function range(view, ymd, ws) {
      var v = (view === 'day' || view === 'month') ? view : 'week', days = [], s, i, from, to;
      if (v === 'day') days = [ymd];
      else if (v === 'week') { s = weekStart(ymd, ws); for (i = 0; i < 7; i++) days.push(addDays(s, i)); }
      else days = monthGrid(ymd, ws);
      from = days[0]; to = addDays(days[days.length - 1], 1);
      return { from: from, to: to, days: days, fetchFrom: iso(addDays(from, -7), 0), fetchTo: iso(addDays(to, 7), 0) };
    }
    function defaultView(width) { return (typeof width === 'number' && width >= 720) ? 'week' : 'day'; }

    /* ---- 겹치는 예약을 좌우 칸으로 나누기 (맞닿는 것은 겹침이 아님) ---- */
    function lanes(list) {
      var src = toList(list), arr = [], out = {}, cluster = [], laneEnd = [], cend = 0, i, it, p, k;
      function flush() {
        var n = laneEnd.length, q;
        for (q = 0; q < cluster.length; q++) out[cluster[q].id].lanes = n;
        cluster = []; laneEnd = [];
      }
      for (i = 0; i < src.length; i++) {
        it = src[i];
        if (!it || it.id === undefined || it.id === null || typeof it.s !== 'number' || it.s !== it.s) continue;
        arr.push({ id: it.id, s: it.s, e: (typeof it.e === 'number' && it.e > it.s) ? it.e : it.s + 1 });
      }
      arr.sort(function (a, b) { return (a.s - b.s) || (b.e - a.e) || (a.id < b.id ? -1 : (a.id > b.id ? 1 : 0)); });
      for (i = 0; i < arr.length; i++) {
        p = arr[i];
        if (!cluster.length || p.s >= cend) { flush(); cend = p.e; } else if (p.e > cend) { cend = p.e; }
        k = 0;
        while (k < laneEnd.length && laneEnd[k] > p.s) k++;
        laneEnd[k] = p.e;
        cluster.push(p);
        out[p.id] = { lane: k, lanes: 1 };
      }
      flush();
      return out;
    }

    /* ---- 눈금 맞추기 · 끌어 옮기기 · 길이 조절 (분 단위, 한국 시간) ---- */
    function unitOf(u) { return (typeof u === 'number' && u > 0 && isFinite(u)) ? u : 15; }
    function snap(m, u, mode) {
      var unit = unitOf(u), q = m / unit, r;
      r = mode === 'floor' ? Math.floor(q) : (mode === 'ceil' ? Math.ceil(q) : Math.round(q));
      return r * unit || 0;
    }
    function move(item, ymd, startMin, unit, therapistId) {
      var it = item || {}, len = Math.round((toMs(it.end_at) - toMs(it.start_at)) / 60000), st;
      if (!(len > 0)) len = 30;
      if (len > 1440) len = 1440;
      st = snap(startMin, unit);
      if (st < 0) st = 0;
      if (st + len > 1440) st = 1440 - len;
      return { start_at: iso(ymd, st), end_at: iso(ymd, st + len), therapist_id: (therapistId === undefined || therapistId === null) ? it.therapist_id : therapistId };
    }
    function resize(item, endMin, unit) {
      var it = item || {}, k = kst(it.start_at), u = unitOf(unit), e, lo, hi;
      if (!k) return { start_at: it.start_at, end_at: it.end_at };
      e = snap(endMin, u);
      lo = k.min + u; hi = Math.min(k.min + 720, 1440);
      if (e < lo) e = lo;
      if (e > hi) e = hi;
      return { start_at: it.start_at, end_at: iso(k.ymd, e) };
    }

    /* ---- 코스 · 제목 해석 ---- */
    function normCourse(s) {
      var c;
      if (typeof s !== 'string') return '';
      c = s.replace(/\s+/g, '');
      if (!c || c.length > 30 || !/^[A-Za-z][A-Za-z0-9]*(?:\+[A-Za-z][A-Za-z0-9]*)*$/.test(c)) return '';
      return c.toUpperCase();
    }
    /* MM.DD 의 해 고르기: 기준일 −60일 ~ +300일 안의 해, 창 밖(해마다 5~6일 틈)이면 가까운 쪽. 없는 날짜면 null */
    function pickYear(mo, da, ref) {
      var rp = parseYmd(ref), refMs, y, diff, best = null, bestAbs = 1e12;
      if (!rp) return null;
      refMs = Date.UTC(rp[0], rp[1] - 1, rp[2]);
      for (y = rp[0] - 1; y <= rp[0] + 1; y++) {
        if (!validYmd(y, mo, da)) continue;
        diff = Math.round((Date.UTC(y, mo - 1, da) - refMs) / DAY);
        if (diff >= -60 && diff <= 300) return fmtYmd(y, mo, da);
        if (Math.abs(diff) < bestAbs) { bestAbs = Math.abs(diff); best = fmtYmd(y, mo, da); }
      }
      return best;
    }
    /* "홍길동 C10", "홍길동 자보도수-5회(12.04기간끝)", "홍길동 킵" 같은 제목을 칸별 값으로 나눕니다. 예외 없이 항상 같은 모양을 돌려줍니다.
       opt = { refYmd: 기준 날짜(기본 오늘), courses: 내 코스 목록(기본 설정) } */
    function parseTitle(title, opt) {
      var o = opt || {}, ref, listed = {}, cl, i, n, s, m, res, memos = [], inner, gm, guard = 0, toks, kept, last, cn, rest, j, g;
      var name, flags = [], badDate = false, unlisted = false;
      ref = (typeof o.refYmd === 'string' && parseYmd(o.refYmd)) ? o.refYmd : kst(Date.now()).ymd;
      cl = isArr(o.courses) ? o.courses : DEFAULTS.courses;
      for (i = 0; i < cl.length; i++) { n = normCourse(cl[i]); if (n) listed[n] = true; }
      res = { name: '', course: '', status: '예약', ins_kind: '일반', ins_round: null, ins_end: null, memo: '', flags: [] };
      s = typeof title === 'string' ? title : '';
      s = s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/（/g, '(').replace(/）/g, ')');
      m = RE_END1.exec(s) || RE_END2.exec(s);
      if (m) {                                                  /* 기간끝은 자보에만 있는 말 */
        s = s.slice(0, m.index) + ' ' + s.slice(m.index + m[0].length);
        res.ins_kind = '자보';
        res.ins_end = pickYear(+m[1], +m[2], ref);
        if (!res.ins_end) badDate = true;
      }
      while ((gm = RE_GROUP.exec(s)) && guard++ < 50) {         /* (괄호) 안: (킵)은 상태, 나머지는 메모 */
        inner = trim(gm[1].replace(/\s+/g, ' '));
        s = s.slice(0, gm.index) + ' ' + s.slice(gm.index + gm[0].length);
        if (inner === '킵') res.status = '킵';
        else if (inner) memos.push(inner);
      }
      m = RE_INS.exec(s);
      if (m) {
        s = s.slice(0, m.index) + ' ' + s.slice(m.index + m[0].length);
        res.ins_kind = '자보';
        if (m[1] !== undefined) { n = parseInt(m[1], 10); res.ins_round = (n >= 1 && n <= 999) ? n : null; }
      }
      s = s.replace(/\s*\+\s*/g, '+');
      toks = trim(s.replace(/\s+/g, ' ')).split(' ');
      if (toks.length === 1 && toks[0] === '') toks = [];
      kept = [];
      for (i = 0; i < toks.length; i++) { if (toks[i] === '킵') res.status = '킵'; else kept.push(toks[i]); }
      toks = kept;
      if (toks.length) {                                        /* 코스는 맨 끝 토큰 — 따로 있거나, 한글 이름 바로 뒤에 붙어 있거나 */
        last = toks[toks.length - 1];
        cn = normCourse(last);
        rest = toks.slice(0, -1).join(' ');
        if (cn) {
          if (has(listed, cn) || RE_HANGUL.test(rest)) {        /* 영문 이름("Mary Jane")은 목록에 없는 코드를 코스로 보지 않음 */
            res.course = cn; if (!has(listed, cn)) unlisted = true;
            toks.pop();
          }
        } else {
          for (j = 1; j < last.length; j++) {
            if (last.length - j > 30 || !RE_HANGUL.test(last.charAt(j - 1)) || !/[A-Za-z]/.test(last.charAt(j))) continue;
            g = normCourse(last.slice(j));
            if (g && (has(listed, g) || /\d/.test(g))) {
              res.course = g; if (!has(listed, g)) unlisted = true;
              toks[toks.length - 1] = last.slice(0, j);
              break;
            }
          }
        }
      }
      name = trim(toks.join(' ').replace(/\s+/g, ' '));
      res.name = name;
      if (!name) flags.push('noname');
      else {
        if (name.length > 12) flags.push('longname');
        if (!RE_NAME.test(name)) flags.push('oddname');
      }
      if (badDate) flags.push('baddate');
      if (unlisted) flags.push('unlisted');
      res.flags = flags;
      res.memo = memos.join(' ');
      return res;
    }
    /* 블록에 쓰는 한 줄 제목 — 다시 해석해도 같은 값이 나옵니다 */
    function itemTitle(it) {
      var parts = [], t, e;
      if (!it) return '';
      if (trim(it.patient_name)) parts.push(trim(it.patient_name));
      if (it.course) parts.push(it.course);
      if (it.ins_kind === '자보') {
        t = '자보' + (it.ins_round ? it.ins_round : '');
        e = typeof it.ins_end === 'string' ? /^\d{4}-(\d{2})-(\d{2})$/.exec(it.ins_end) : null;
        if (e) t += ' ~' + e[1] + '/' + e[2];
        parts.push(t);
      }
      if (it.status === '킵') parts.push('(킵)');
      return parts.join(' ');
    }

    /* ---- 운영 시간 · 점심 · 보이는 범위 ---- */
    function hours(settings, therapistId, dow) {
      var key = String(dow), hs = settings && settings.hours, th = null, v, a, b;
      if (hs && typeof hs === 'object' && therapistId !== undefined && therapistId !== null && has(hs, therapistId)) th = hs[therapistId];
      if (th && typeof th === 'object' && has(th, key)) v = th[key];
      else if (hs && hs.all && typeof hs.all === 'object' && has(hs.all, key)) v = hs.all[key];
      else v = DEFAULTS.hours.all[key];
      if (!v || v.length !== 2) return null;                    /* null = 쉬는 날 (깨진 값도 쉬는 날로 봄) */
      a = parseHm(v[0]); b = parseHm(v[1]);
      if (a === null || b === null || a >= b) return null;
      return [a, b];
    }
    function lunch(settings) {
      var L = (settings && settings.lunch) ? settings.lunch : DEFAULTS.lunch, a, b;
      if (!L || L.on === false) return null;
      a = parseHm(L.start); b = parseHm(L.end);
      if (a === null || b === null || a >= b) return null;
      return [a, b];
    }
    function spanOf(it) {
      var s, e, k;
      if (!it) return null;
      s = toMs(it.start_at); e = toMs(it.end_at); k = kst(s);
      if (!k || typeof e !== 'number' || !isFinite(e)) return null;
      return { ymd: k.ymd, dow: k.dow, s: k.min, e: k.min + Math.round((e - s) / 60000), ms: s, me: e };
    }
    function visible(settings, items) {
      var a = parseHm(settings && settings.view_start), b = parseHm(settings && settings.view_end), list = toList(items), i, it, sp;
      if (a === null) a = 480;
      if (b === null) b = 1260;
      if (a >= b) { a = 480; b = 1260; }
      for (i = 0; i < list.length; i++) {
        it = list[i];
        if (!it || it.deleted_at) continue;
        sp = spanOf(it);
        if (!sp) continue;
        a = Math.min(a, Math.floor(sp.s / 60) * 60);
        b = Math.max(b, Math.ceil(sp.e / 60) * 60);
      }
      return [Math.max(0, a), Math.min(1440, b)];
    }

    /* ---- 저장 전 경고: 막지 않고 알려만 줍니다 (순서 고정: 겹침·같은환자·운영시간·점심·휴무·기간끝) ---- */
    function therName(list, id) {
      var a = toList(list), i;
      for (i = 0; i < a.length; i++) { if (a[i] && a[i].id === id) return trim(a[i].name); }
      return '';
    }
    function samePatient(a, b) {
      var an, ac, bc;
      if (a.patient_id && b.patient_id) return a.patient_id === b.patient_id;
      an = trim(a.patient_name);
      if (!an || an !== trim(b.patient_name)) return false;
      ac = trim(a.chart_no); bc = trim(b.chart_no);
      return !(ac && bc && ac !== bc);
    }
    function byStart(x, y) { return (x.sp.ms - y.sp.ms) || (x.it.id < y.it.id ? -1 : (x.it.id > y.it.id ? 1 : 0)); }
    function label(p) { return (trim(p.it.patient_name) || '이름 없음') + ' ' + hm(p.sp.s) + '–' + hm(p.sp.e); }
    function idOf(p) { return p.it.id; }
    function warnings(cand, ctx) {
      var out = [], c = ctx || {}, cs, ce, ck, cMin, eMin, th, items, blocks, i, it, sp, b, bs, be, ov = [], pt = [], bm = [], names = [], hr, lu, nm, ie;
      if (!cand || typeof cand !== 'object') return out;
      if (cand.status === '취소' || cand.status === '노쇼') return out;
      cs = toMs(cand.start_at); ce = toMs(cand.end_at);
      if (!(cs < ce) || !isFinite(cs) || !isFinite(ce)) return out;
      ck = kst(cs);
      cMin = ck.min; eMin = cMin + Math.round((ce - cs) / 60000);
      th = therName(c.therapists, cand.therapist_id);
      items = toList(c.items);
      for (i = 0; i < items.length; i++) {
        it = items[i];
        if (!it || it.deleted_at || it.status === '취소' || it.status === '노쇼') continue;
        if (cand.id && it.id === cand.id) continue;
        sp = spanOf(it);
        if (!sp || !(sp.ms < ce && cs < sp.me)) continue;
        if (it.therapist_id === cand.therapist_id) ov.push({ it: it, sp: sp });
        else if (samePatient(cand, it)) pt.push({ it: it, sp: sp });
      }
      if (ov.length) {
        ov.sort(byStart);
        out.push({ code: 'overlap', text: (th ? th + ' 선생님' : '같은 치료사') + '의 같은 시간대에 예약이 있습니다: ' + ov.map(label).join(', '), refs: ov.map(idOf) });
      }
      if (pt.length) {
        pt.sort(byStart);
        for (i = 0; i < pt.length; i++) {
          nm = therName(c.therapists, pt[i].it.therapist_id);
          if (nm && names.indexOf(nm) < 0) names.push(nm);
        }
        out.push({ code: 'patient', text: '같은 환자(' + trim(cand.patient_name) + ')가 같은 시간에 다른 치료사' + (names.length ? '(' + names.join(', ') + ')' : '') + '에게 예약돼 있습니다: ' + pt.map(label).join(', '), refs: pt.map(idOf) });
      }
      hr = hours(c.settings, cand.therapist_id, ck.dow);
      if (!hr) out.push({ code: 'hours', text: '쉬는 요일입니다 (' + DOWN[ck.dow] + '요일)', refs: [] });
      else if (cMin < hr[0] || eMin > hr[1]) out.push({ code: 'hours', text: (th ? th + ' 선생님 ' : '') + '운영 시간(' + hm(hr[0]) + '–' + hm(hr[1]) + ')이 아닙니다', refs: [] });
      lu = lunch(c.settings);
      if (lu && cMin < lu[1] && lu[0] < eMin) out.push({ code: 'lunch', text: '점심시간(' + hm(lu[0]) + '–' + hm(lu[1]) + ')과 겹칩니다', refs: [] });
      blocks = toList(c.blocks);
      for (i = 0; i < blocks.length; i++) {
        b = blocks[i];
        if (!b || b.deleted_at) continue;
        if (b.therapist_id && b.therapist_id !== cand.therapist_id) continue;       /* 치료사 칸이 비어 있으면 병원 전체 */
        bs = toMs(b.start_at); be = toMs(b.end_at);
        if (bs < ce && cs < be) bm.push(b);
      }
      if (bm.length) {
        bm.sort(function (x, y) { return (toMs(x.start_at) - toMs(y.start_at)) || (x.id < y.id ? -1 : (x.id > y.id ? 1 : 0)); });
        out.push({
          code: 'block',
          text: '휴무·마감과 겹칩니다: ' + bm.map(function (x) { return trim(x.reason) || '휴무'; }).join(', '),
          refs: bm.map(function (x) { return x.id; })
        });
      }
      if (cand.ins_kind === '자보' && typeof cand.ins_end === 'string') {
        ie = /^\d{4}-(\d{2})-(\d{2})$/.exec(cand.ins_end);
        if (ie && ck.ymd > cand.ins_end) out.push({ code: 'insend', text: '자보 기간끝(' + ie[1] + '/' + ie[2] + ')이 지난 날짜입니다', refs: [] });
      }
      return out;
    }

    /* ---- 되돌리기: 방금 한 일을 거꾸로 하는 서버 호출 (할 수 없으면 null) ---- */
    var UNDO_KEYS = ['therapist_id', 'patient_name', 'chart_no', 'start_at', 'end_at', 'status', 'ins_kind', 'ins_round', 'ins_end', 'course', 'memo'];
    function undoOf(en) {
      var d, i, v, hasVer, ver;
      if (!en || typeof en !== 'object' || !en.id) return null;
      if (en.op === 'delete') return { rpc: 'rsv_item_restore', args: { p_id: en.id } };
      hasVer = typeof en.ver === 'number' && isFinite(en.ver);
      if (!hasVer) return null;
      ver = (typeof en.exp === 'number' && isFinite(en.exp)) ? en.exp : en.ver;   // exp = 앞의 동작을 되돌린 뒤 서버에 있을 버전 (undoRebase)
      if (en.op === 'create' || en.op === 'restore') return { rpc: 'rsv_item_delete', args: { p_id: en.id, p_version: ver } };
      if (en.op === 'save' || en.op === 'move' || en.op === 'status') {
        if (!en.before || typeof en.before !== 'object') return null;
        d = { id: en.id, version: ver };
        for (i = 0; i < UNDO_KEYS.length; i++) { v = en.before[UNDO_KEYS[i]]; d[UNDO_KEYS[i]] = (v === undefined) ? null : v; }
        return { rpc: 'rsv_item_save', args: { p_data: d } };
      }
      return null;
    }

    /* 목록의 i 번째 동작을 되돌려 서버 버전이 newVer 가 되었을 때: 같은 예약의 바로 아래(이전) 동작이 "이어지는 변경"(그 동작의 ver 가 이 동작의 ver − 1 = 사이에 다른 직원의 변경이 없었음)이면
       그 동작이 되돌릴 때 기대할 버전(exp)을 newVer 로 옮김. 이어지지 않으면 그대로 두어 서버가 충돌로 거절 → 다른 직원의 변경을 덮어쓰지 않음 */
    function undoRebase(list, i, newVer) {
      var en, j;
      if (!list || typeof list !== 'object' || typeof i !== 'number' || i % 1 !== 0 || i < 0 || i >= list.length) return;
      en = list[i];
      if (!en || typeof en.ver !== 'number' || !isFinite(en.ver) || typeof newVer !== 'number' || !isFinite(newVer)) return;
      for (j = i - 1; j >= 0; j--) {
        if (list[j] && list[j].id === en.id) { if (list[j].ver === en.ver - 1) list[j].exp = newVer; return; }
      }
    }

    /* ---- 변경 기록 한 줄 → { head, detail } (⋯ → 변경 기록 · 예약 상세 "기록"). 메모 글은 적지 않고 "메모 변경"만 ---- */
    function logObj(x) { return (x && typeof x === 'object' && !Array.isArray(x)) ? x : null; }
    function logMd(x) { var k = kst(x); return k ? pad(k.m) + '/' + pad(k.d) : ''; }
    function logSame(x, y) { return x === y || (x !== x && y !== y); }
    function logName(it) { return trim(it.patient_name) || '(이름 없음)'; }
    function logTher(thers, id) { return id ? (therName(thers, id) || '(알 수 없음)') : ''; }
    function logLen(it) { var s = toMs(it.start_at), e = toMs(it.end_at); return (typeof s === 'number' && typeof e === 'number' && isFinite(s) && isFinite(e)) ? Math.round((e - s) / 60000) : NaN; }
    function logSpan(it) {   // 11/24 14:00–14:30
      var a = kst(it.start_at), len = logLen(it), e;
      if (!a) return '';
      if (len !== len) return logMd(it.start_at) + ' ' + hm(a.min);
      e = a.min + len; if (e > 1440) e -= 1440;
      return logMd(it.start_at) + ' ' + hm(a.min) + '–' + hm(e);
    }
    function logInsDay(v) { var m = /^\d{4}-(\d{2})-(\d{2})$/.exec(v || ''); return m ? m[1] + '/' + m[2] : (trim(v) || '(없음)'); }
    function logNone(v) { return (v === null || v === undefined || trim(v) === '') ? '(없음)' : trim(v); }
    function logJoin(list) { return list.filter(function (x) { return x !== ''; }).join(' · '); }
    function logItemWhere(it, thers) {   // 만들기·삭제·복원: 어떤 예약이었는지
      var ins = it.ins_kind === '자보' ? '자보' + (it.ins_round ? ' ' + it.ins_round + '회차' : '') + (it.ins_end ? ' ~' + logInsDay(it.ins_end) : '') : '';
      return logJoin([logSpan(it), logTher(thers, it.therapist_id), trim(it.course), ins]);
    }
    function logItemDiff(b, a, thers) {   // 바뀐 칸만 (순서 고정)
      var out = [], x, y;
      if (trim(b.patient_name) !== trim(a.patient_name)) out.push('이름 ' + logName(b) + ' → ' + logName(a));
      if (trim(b.chart_no) !== trim(a.chart_no)) out.push('차트번호 ' + logNone(b.chart_no) + ' → ' + logNone(a.chart_no));
      if (!logSame(toMs(b.start_at), toMs(a.start_at))) {
        x = kst(b.start_at); y = kst(a.start_at);
        out.push('시작 ' + (x ? logMd(b.start_at) + ' ' + hm(x.min) : '(알 수 없음)') + ' → ' + (y ? logMd(a.start_at) + ' ' + hm(y.min) : '(알 수 없음)'));
      }
      x = logLen(b); y = logLen(a);
      if (!logSame(x, y)) out.push('길이 ' + (x === x ? x + '분' : '(알 수 없음)') + ' → ' + (y === y ? y + '분' : '(알 수 없음)'));
      if ((b.therapist_id || '') !== (a.therapist_id || '')) out.push('치료사 ' + (logTher(thers, b.therapist_id) || '(없음)') + ' → ' + (logTher(thers, a.therapist_id) || '(없음)'));
      if (trim(b.status) !== trim(a.status)) out.push('상태 ' + logNone(b.status) + ' → ' + logNone(a.status));
      if ((b.ins_kind || '일반') !== (a.ins_kind || '일반')) out.push('구분 ' + (b.ins_kind || '일반') + ' → ' + (a.ins_kind || '일반'));
      if (logNone(b.ins_round) !== logNone(a.ins_round)) out.push('회차 ' + logNone(b.ins_round) + ' → ' + logNone(a.ins_round));
      if (trim(b.ins_end) !== trim(a.ins_end)) out.push('기간끝 ' + (trim(b.ins_end) ? logInsDay(b.ins_end) : '(없음)') + ' → ' + (trim(a.ins_end) ? logInsDay(a.ins_end) : '(없음)'));
      if (trim(b.course) !== trim(a.course)) out.push('코스 ' + logNone(b.course) + ' → ' + logNone(a.course));
      if (trim(b.memo) !== trim(a.memo)) out.push('메모 변경');
      return out;
    }
    function logBlockWhere(b, thers) {   // 11/25 종일 · 병원 전체 · 연차
      var s = kst(b.start_at), ms = toMs(b.start_at), me = toMs(b.end_at), last, when = '', len, e;
      if (s && typeof me === 'number' && isFinite(me) && me > ms) {
        len = Math.round((me - ms) / 60000);
        if (b.all_day === true) {
          last = kst(me - 1);
          when = (last && last.ymd !== s.ymd ? logMd(b.start_at) + '~' + logMd(me - 1) : logMd(b.start_at)) + ' 종일';
        } else if (s.min + len <= 1440) when = logMd(b.start_at) + ' ' + hm(s.min) + '–' + hm(s.min + len);
        else { e = kst(me); when = logMd(b.start_at) + ' ' + hm(s.min) + ' → ' + (e ? logMd(me) + ' ' + hm(e.min) : ''); }
      } else if (s) when = logMd(b.start_at) + ' ' + hm(s.min);
      return logJoin([when, b.therapist_id ? (therName(thers, b.therapist_id) || '(알 수 없음)') : '병원 전체', trim(b.reason)]);
    }
    function logRange(d) { return (parseHm(d.view_start) === null || parseHm(d.view_end) === null) ? '' : d.view_start + '–' + d.view_end; }
    function logSettingsDiff(b, a) {
      var out = [];
      if (logRange(b) !== logRange(a)) out.push('보이는 시간 범위 ' + (logRange(b) || '(없음)') + ' → ' + (logRange(a) || '(없음)'));
      if (b.default_len !== a.default_len) out.push('기본 길이 ' + b.default_len + '분 → ' + a.default_len + '분');
      if (b.snap !== a.snap) out.push('이동 단위 ' + b.snap + '분 → ' + a.snap + '분');
      if (b.week_start !== a.week_start) out.push('주 시작 ' + (b.week_start === 0 ? '일요일' : '월요일') + ' → ' + (a.week_start === 0 ? '일요일' : '월요일'));
      if (JSON.stringify(b.courses) !== JSON.stringify(a.courses)) out.push('코스 목록');
      if (JSON.stringify(b.lunch) !== JSON.stringify(a.lunch)) out.push('점심시간');
      if (JSON.stringify(b.hours) !== JSON.stringify(a.hours)) out.push('운영 시간');
      return out;
    }
    function logText(en, thers) {
      var act, a, b, it, name, out, t;
      if (!en || typeof en !== 'object') return { head: '', detail: '' };
      act = typeof en.action === 'string' ? en.action : '';
      a = logObj(en.after); b = logObj(en.before);
      thers = toList(thers);
      if (act === 'create' || act === 'delete' || act === 'restore') {
        it = a || b || {};
        return { head: logName(it) + ' 예약 ' + (act === 'create' ? '만들기' : act === 'delete' ? '삭제' : '복원'), detail: logItemWhere(it, thers) };
      }
      if (act === 'update' || act === 'move' || act === 'status') {
        it = a || b || {};
        out = logItemDiff(b || {}, a || {}, thers);
        return { head: logName(it) + (act === 'status' ? ' 상태 변경' : act === 'move' ? ' 예약 이동' : ' 예약 수정'), detail: out.length ? out.join(' · ') : '바뀐 내용 없음' };
      }
      if (act === 'block_create' || act === 'block_update' || act === 'block_delete') {
        it = a || b || {};
        return { head: '휴무·마감 ' + (act === 'block_create' ? '만들기' : act === 'block_update' ? '수정' : '삭제'), detail: logBlockWhere(it, thers) };
      }
      if (act === 'therapist') {
        name = trim((a || b || {}).name);
        if (!b) return { head: '치료사 추가', detail: name };
        t = [];
        if (trim(b.name) !== trim((a || {}).name)) t.push('이름 ' + trim(b.name) + ' → ' + trim((a || {}).name));
        if (trim(b.color).toLowerCase() !== trim((a || {}).color).toLowerCase()) t.push('색 변경');
        if (String(b.sort) !== String((a || {}).sort)) t.push('순서 ' + b.sort + ' → ' + (a || {}).sort);
        if ((b.active !== false) !== ((a || {}).active !== false)) t.push((b.active !== false ? '사용' : '중지') + ' → ' + ((a || {}).active !== false ? '사용' : '중지'));
        if ((b.profile_id || '') !== ((a || {}).profile_id || '')) t.push('직원 계정 연결 변경');
        return { head: '치료사 수정', detail: name + ': ' + (t.length ? t.join(' · ') : '바뀐 내용 없음') };
      }
      if (act === 'settings') {
        b = b && logObj(b.data); a = a && logObj(a.data);
        if (!b && a) return { head: '예약 설정 변경', detail: '처음 저장' };
        out = (a && b) ? logSettingsDiff(b, a) : [];
        return { head: '예약 설정 변경', detail: out.length ? out.join(' · ') : '바뀐 내용 없음' };
      }
      return { head: act, detail: '' };
    }

    /* ---- 변경 기록을 치료사로 걸러 보기: 이 기록이 그 치료사와 관련 있나 (치료사를 고르지 않았으면 걸러 보지 않으므로 true).
       예약은 앞·뒤 어느 쪽이든 그 치료사면 관련 · 휴무·마감은 치료사 칸이 비면(병원 전체) 모두에게 관련 · 설정 변경은 치료사와 무관 ---- */
    function logSideHas(x, thId, blankHits) {
      var t;
      x = logObj(x);
      if (!x) return false;
      t = x.therapist_id;
      return t === thId || (blankHits === true && (t === null || t === undefined || t === ''));
    }
    function logHas(en, thId) {
      var act, a, b;
      if (typeof thId !== 'string' || thId === '') return true;
      if (!en || typeof en !== 'object') return false;
      act = typeof en.action === 'string' ? en.action : '';
      a = logObj(en.after); b = logObj(en.before);
      if (act === 'create' || act === 'update' || act === 'move' || act === 'status' || act === 'delete' || act === 'restore') return logSideHas(a, thId, false) || logSideHas(b, thId, false);
      if (act === 'block_create' || act === 'block_update' || act === 'block_delete') return logSideHas(a, thId, true) || logSideHas(b, thId, true);
      if (act === 'therapist') return !!((a && a.id === thId) || (b && b.id === thId));
      return false;
    }

    /* ---- 휴지통: 삭제한 지 지난 날수(내림)를 30에서 뺀 "복원할 수 있는 남은 날수" (0~30). 시각이 어긋나면 NaN ---- */
    function trashLeft(deletedAt, nowMs) {
      var ms = toMs(deletedAt), left;
      if (typeof ms !== 'number' || !isFinite(ms) || typeof nowMs !== 'number' || !isFinite(nowMs)) return NaN;
      left = 30 - Math.floor((nowMs - ms) / 86400000);
      return left > 30 ? 30 : left < 0 ? 0 : left;
    }

    /* ---- 설정 창(관리자): 서버 설정 ⇄ 창에서 다루는 모양 · 달라진 항목 · 검사 ----
       창 모양 f = { view_start, view_end, default_len, snap, week_start, courses[], lunch{on,start,end},
                     hours{ all[7칸: 0=일 ~ 6=토], th{ 치료사번호: [7칸] } } }  (칸 = { k: 'on'|'off'|'def', s, e } · def = 전체의 그 요일을 따름 · 치료사 칸에만) */
    var SET_KEYS = ['view_start', 'view_end', 'default_len', 'snap', 'week_start', 'courses', 'lunch', 'hours'];
    var SET_DOW = [1, 2, 3, 4, 5, 6, 0];   /* 창에 보이는 요일 순서 (월~일) */
    function okHm(v, a24) { return typeof v === 'string' && (/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(v) || (a24 === true && v === '24:00')); }
    function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
    function setCell(v, s0, e0) { return v ? { k: 'on', s: hm(v[0]), e: hm(v[1]) } : { k: 'off', s: s0, e: e0 }; }
    function setForm(st) {
      var s = isObj(st) ? st : {}, L = isObj(s.lunch) ? s.lunch : DEFAULTS.lunch, hs = isObj(s.hours) ? s.hours : DEFAULTS.hours, cl = Array.isArray(s.courses) ? s.courses : DEFAULTS.courses,
        f = { courses: [], hours: { all: [], th: {} } }, w = { hours: hs }, i, c, k, rows, a;
      f.view_start = okHm(s.view_start) ? s.view_start : DEFAULTS.view_start;
      f.view_end = okHm(s.view_end, true) ? s.view_end : DEFAULTS.view_end;
      f.default_len = (typeof s.default_len === 'number' && s.default_len >= 5 && s.default_len <= 240 && s.default_len % 5 === 0) ? s.default_len : DEFAULTS.default_len;
      f.snap = (s.snap === 5 || s.snap === 10 || s.snap === 15 || s.snap === 30) ? s.snap : DEFAULTS.snap;
      f.week_start = s.week_start === 0 ? 0 : 1;
      for (i = 0; i < cl.length; i++) { c = normCourse(cl[i]); if (c && f.courses.indexOf(c) < 0) f.courses.push(c); }
      f.lunch = { on: L.on !== false, start: okHm(L.start) ? L.start : DEFAULTS.lunch.start, end: okHm(L.end, true) ? L.end : DEFAULTS.lunch.end };
      for (i = 0; i < 7; i++) f.hours.all.push(setCell(hours(w, null, i), '09:00', '20:00'));
      for (k in hs) {
        if (has(hs, k) && k !== 'all' && isObj(hs[k])) {
          rows = [];
          for (i = 0; i < 7; i++) {
            a = f.hours.all[i];
            rows.push(has(hs[k], String(i)) ? setCell(hours(w, k, i), a.s, a.e) : { k: 'def', s: a.s, e: a.e });
          }
          f.hours.th[k] = rows;
        }
      }
      return f;
    }
    function setRows(f, id) {   /* 그 치료사의 요일 7칸 (없으면 모두 "전체를 따름"으로 만들어 창 모양에 넣음) */
      var o = f.hours.th, r, i;
      if (!has(o, id)) { r = []; for (i = 0; i < 7; i++) r.push({ k: 'def', s: f.hours.all[i].s, e: f.hours.all[i].e }); o[id] = r; }
      return o[id];
    }
    function setOut(f) {   /* 창 모양 → 서버에 저장되는 모양 (치료사는 "전체를 따름"이 아닌 요일이 있을 때만) */
      var o = { view_start: f.view_start, view_end: f.view_end, default_len: f.default_len, snap: f.snap, week_start: f.week_start, courses: f.courses.slice(),
        lunch: { on: f.lunch.on === true, start: f.lunch.start, end: f.lunch.end }, hours: { all: {} } }, i, k, rows, t, any, r;
      for (i = 0; i < 7; i++) { r = f.hours.all[i]; o.hours.all[String(i)] = r.k === 'on' ? [r.s, r.e] : null; }
      for (k in f.hours.th) {
        if (has(f.hours.th, k)) {
          rows = f.hours.th[k]; t = {}; any = false;
          for (i = 0; i < 7; i++) { r = rows[i]; if (r.k !== 'def') { any = true; t[String(i)] = r.k === 'on' ? [r.s, r.e] : null; } }
          if (any) o.hours[k] = t;
        }
      }
      return o;
    }
    function canonStr(v) {   /* 키 순서와 상관없이 같은 값이면 같은 글 */
      var k, a = [];
      if (Array.isArray(v)) return '[' + v.map(canonStr).join(',') + ']';
      if (v && typeof v === 'object') {
        for (k in v) { if (has(v, k)) a.push(k); }
        a.sort();
        return '{' + a.map(function (x) { return JSON.stringify(x) + ':' + canonStr(v[x]); }).join(',') + '}';
      }
      return JSON.stringify(v);
    }
    function setDiff(f0, f1) {   /* 달라진 항목만 서버 모양으로 (운영 시간·점심은 통째로) */
      var a = setOut(f0), b = setOut(f1), d = {}, n = 0, i, k;
      for (i = 0; i < SET_KEYS.length; i++) { k = SET_KEYS[i]; if (canonStr(a[k]) !== canonStr(b[k])) { d[k] = b[k]; n++; } }
      return { data: d, n: n };
    }
    function rowBad(r) { return r.k === 'on' && (!okHm(r.s) || !okHm(r.e, true) || parseHm(r.s) >= parseHm(r.e)); }
    function setCheck(f) {   /* 서버가 거절할 값을 미리 찾음: null = 통과 · 아니면 { err, f(칸 번호 또는 'hr'), tgt, dow } — 창에 보이는 순서대로 처음 틀린 곳 */
      var i, k, d, vm = '보이는 시간이 올바르지 않습니다 (시작이 끝보다 1시간 이상 빨라야 합니다).', hr = '운영 시간이 올바르지 않습니다 (여는 시각이 닫는 시각보다 빨라야 합니다).', L = f.lunch;
      if (!okHm(f.view_start)) return { err: vm, f: 'rsvSVs' };
      if (!okHm(f.view_end, true) || parseHm(f.view_end) - parseHm(f.view_start) < 60) return { err: vm, f: 'rsvSVe' };
      if (L.on === true && (!okHm(L.start) || !okHm(L.end, true) || parseHm(L.start) >= parseHm(L.end))) return { err: '점심시간이 올바르지 않습니다 (시작이 끝보다 빨라야 합니다).', f: 'rsvSLs' };
      for (i = 0; i < 7; i++) { d = SET_DOW[i]; if (rowBad(f.hours.all[d])) return { err: hr, f: 'hr', tgt: 'all', dow: d }; }
      for (k in f.hours.th) {
        if (has(f.hours.th, k)) { for (i = 0; i < 7; i++) { d = SET_DOW[i]; if (rowBad(f.hours.th[k][d])) return { err: hr, f: 'hr', tgt: k, dow: d }; } }
      }
      if (typeof f.default_len !== 'number' || f.default_len < 5 || f.default_len > 240 || f.default_len % 5 !== 0) return { err: '기본 길이는 5~240분 사이의 5분 단위로 입력해 주세요.', f: 'rsvSLen' };
      if (f.courses.length > 60) return { err: '코스는 60개까지 등록할 수 있습니다.', f: 'rsvSCourses' };
      return null;
    }
    function parseCourses(text) {   /* 코스 칸의 글 → { list: 정리한 이름(중복 없이 순서대로), bad: 어긋난 글 } — 줄·공백·쉼표·세미콜론으로 나누고 "J15 + C5" 처럼 같은 줄 안의 + 주변 공백은 이름 안으로(줄바꿈은 이어 붙이지 않음) */
      var o = { list: [], bad: [] }, a, i, c;
      if (typeof text !== 'string') return o;
      a = text.replace(/[^\S\r\n]*\+[^\S\r\n]*/g, '+').split(/[\s,;，、]+/);
      for (i = 0; i < a.length; i++) {
        if (!a[i]) continue;
        c = normCourse(a[i]);
        if (!c) { if (o.bad.indexOf(a[i]) < 0) o.bad.push(a[i]); }
        else if (o.list.indexOf(c) < 0) o.list.push(c);
      }
      return o;
    }

    return {
      rsvKst: kst, rsvAt: at, rsvIso: iso, rsvAddDays: addDays, rsvWeekStart: weekStart, rsvMonthGrid: monthGrid, rsvRange: range,
      rsvDefaultView: defaultView, rsvLanes: lanes, rsvSnap: snap, rsvMove: move, rsvResize: resize, rsvNormCourse: normCourse,
      rsvParseTitle: parseTitle, rsvItemTitle: itemTitle, rsvHours: hours, rsvLunch: lunch, rsvVisible: visible, rsvWarnings: warnings,
      rsvUndoOf: undoOf, rsvUndoRebase: undoRebase, rsvLogText: logText, rsvLogHas: logHas, rsvTrashLeft: trashLeft, rsvHm: hm, rsvParseHm: parseHm,
      rsvSetForm: setForm, rsvSetRows: setRows, rsvSetOut: setOut, rsvSetDiff: setDiff, rsvSetCheck: setCheck, rsvParseCourses: parseCourses, RSV_SET_DOW: SET_DOW, RSV_DEFAULTS: DEFAULTS, RSV_STATUS: STATUS
    };
  })();
  var rsvKst = RSV.rsvKst, rsvAt = RSV.rsvAt, rsvIso = RSV.rsvIso, rsvAddDays = RSV.rsvAddDays, rsvWeekStart = RSV.rsvWeekStart,
    rsvMonthGrid = RSV.rsvMonthGrid, rsvRange = RSV.rsvRange, rsvDefaultView = RSV.rsvDefaultView, rsvLanes = RSV.rsvLanes,
    rsvSnap = RSV.rsvSnap, rsvMove = RSV.rsvMove, rsvResize = RSV.rsvResize, rsvNormCourse = RSV.rsvNormCourse,
    rsvParseTitle = RSV.rsvParseTitle, rsvItemTitle = RSV.rsvItemTitle, rsvHours = RSV.rsvHours, rsvLunch = RSV.rsvLunch,
    rsvVisible = RSV.rsvVisible, rsvWarnings = RSV.rsvWarnings, rsvUndoOf = RSV.rsvUndoOf, rsvUndoRebase = RSV.rsvUndoRebase, rsvLogText = RSV.rsvLogText, rsvLogHas = RSV.rsvLogHas, rsvTrashLeft = RSV.rsvTrashLeft, rsvHm = RSV.rsvHm,
    rsvParseHm = RSV.rsvParseHm, rsvSetForm = RSV.rsvSetForm, rsvSetRows = RSV.rsvSetRows, rsvSetOut = RSV.rsvSetOut, rsvSetDiff = RSV.rsvSetDiff, rsvSetCheck = RSV.rsvSetCheck, rsvParseCourses = RSV.rsvParseCourses, RSV_SET_DOW = RSV.RSV_SET_DOW,
    RSV_DEFAULTS = RSV.RSV_DEFAULTS, RSV_STATUS = RSV.RSV_STATUS;
  /* ===== RSV-CORE-END ===== */

  /* ================= 예약 (v48): 화면 틀 · 서버에서 불러오기 · 실시간 =================
     S.rsv = { loaded, err, missing, stale, ther[], settings, items{id→행}, blocks{id→행}, view, date, filters, undo[], … }
     · 화면을 열 때마다 보이는 범위(앞뒤 7일 더)를 서버에서 불러오고, 열려 있는 동안 1분마다 · 창이 다시 보일 때 · 인터넷이 다시 연결될 때 다시 확인
     · 다른 직원의 변경은 실시간 알림 내용으로 바로 반영(같거나 옛 버전은 무시). 불러오는 도중에 알림이 끼어들면 그 응답은 옛 모습일 수 있어 버리고 다시 불러옴
     · 서버는 한 번에 1000건까지만 돌려주고 나머지는 말없이 자르므로, 쪽을 나눠 빠짐없이 받음 */
  var RSV_VIEWS = ['day', 'week', 'month'], RSV_PAGE = 1000;
  function rsvToday() { var k = rsvKst(Date.now()); return k ? k.ymd : ymd(new Date()); }
  function rsvWidth() { var m = $('#main'), w = m ? m.clientWidth : 0; return w || (NARROW.matches ? 390 : 1100); }   // 아직 화면에 배치되기 전(0)이면 좁은 창인지로 대신 판단
  function rsvShown() { return !!$('#rsvbody'); }
  function rsvInit() {
    if (S.rsv) return S.rsv;
    var sv = lsGet('noble-rsv-view');
    S.rsv = {
      loaded: false, err: '', missing: false, stale: false, ther: [], settings: RSV_DEFAULTS, items: {}, blocks: {},
      view: RSV_VIEWS.indexOf(sv) > -1 ? sv : rsvDefaultView(rsvWidth()), date: rsvToday(), filters: { ther: {} }, undo: [],
      loading: null, again: false, dirty: false, tries: 0, watch: null, soon: null, onOnline: null, purged: false,
      win: null, fresh: false, narrow: false, scrollNow: true, sv: '', onResize: null,   // win = 지금 받아 둔 기간(ms) · fresh = 날짜를 옮긴 뒤 아직 응답 전 · narrow/sv/scrollNow = 그리기 상태
      busy: {}, open: null,                                                              // busy = 상태·삭제·이동을 서버에 보내는 중인 예약 · open = 지금 열려 있는 예약 창(수정·상세)
      drag: null, swallow: 0, undoing: false, set: null                                  // drag = 끌고 있는 중(6단계) · swallow = 끌기를 끝낸 시각(이어 오는 click 을 한 번 삼킴) · undoing = 되돌리기를 서버에 보내 답을 기다리는 중 · set = 열려 있는 설정 창(7단계)
    };
    return S.rsv;
  }
  function rsvFetchAll(make) {   // make(a, z): 그 번째 줄들(a~z)을 요청하는 질의 → 모든 쪽을 이어 붙여 { data, error } 로
    var all = [];
    function next(i) {
      return make(i * RSV_PAGE, i * RSV_PAGE + RSV_PAGE - 1).then(function (r) {
        if (r.error) return r;
        var d = r.data || []; all = all.concat(d);
        if (d.length < RSV_PAGE || i >= 19) return { data: all, error: null };   // 마지막 쪽이거나 안전 장치(최대 20쪽 = 2만 건)
        return next(i + 1);
      });
    }
    return next(0);
  }
  function rsvLoad() {
    var R = rsvInit();
    if (R.loading) { R.again = true; return R.loading; }   // 이미 불러오는 중이면 그것이 끝난 뒤 한 번 더 (요청이 겹치지 않게)
    var rg = rsvRange(R.view, R.date, R.settings.week_start);
    R.dirty = false;
    function win(q) { return q.is('deleted_at', null).lt('start_at', rg.fetchTo).gt('end_at', rg.fetchFrom).order('start_at', { ascending: true }).order('id', { ascending: true }); }
    R.loading = Promise.all([
      sb.from('rsv_therapists').select('*').order('sort', { ascending: true }).order('name', { ascending: true }),
      sb.from('rsv_settings').select('*').eq('id', 1).maybeSingle(),
      rsvFetchAll(function (a, z) { return win(sb.from('rsv_items').select('*')).range(a, z); }),
      rsvFetchAll(function (a, z) { return win(sb.from('rsv_blocks').select('*')).range(a, z); })
    ]).then(function (r) { return { r: r, e: null }; }, function (e) { return { r: null, e: e }; }).then(function (x) {
      R.loading = null;
      if (x.r) rsvLoaded(x.r, rg); else rsvFailed(x.e);
      if (R.again) { R.again = false; rsvLoad(); }
    });
    return R.loading;
  }
  function rsvLoaded(r, rg) {
    var R = S.rsv, bad = r[0].error || r[1].error || r[2].error || r[3].error;
    if (bad) { rsvFailed(bad); return; }
    if (R.dirty && R.tries < 2) { R.tries++; R.again = true; return; }   // 불러오는 사이 실시간 알림이 끼어들었음 → 이 응답은 그 변경보다 옛 모습일 수 있으니 버리고 다시 (알림이 계속 와도 2번까지만)
    R.tries = 0;
    R.ther = r[0].data || [];
    var st = r[1].data && r[1].data.data;
    R.settings = Object.assign({}, RSV_DEFAULTS, st && typeof st === 'object' ? st : {});
    R.items = {}; (r[2].data || []).forEach(function (x) { R.items[x.id] = x; });
    R.blocks = {}; (r[3].data || []).forEach(function (x) { R.blocks[x.id] = x; });
    R.loaded = true; R.err = ''; R.missing = false; R.stale = false; R.fresh = false;
    R.win = rg ? { from: Date.parse(rg.fetchFrom), to: Date.parse(rg.fetchTo) } : null;   // 이 응답이 덮는 기간
    if (rsvShown()) rsvRender();
    rsvSetRefresh(R);
    rsvCheckOpen();
    rsvPurgeOnce();
  }
  function rsvFailed(e) {
    var R = S.rsv, m = errMsg(e) + ' ' + ((e && e.code) || '');
    R.fresh = false;
    if (qMissing(m)) { R.missing = true; R.loaded = false; R.err = ''; R.stale = false; R.items = {}; R.blocks = {}; R.ther = []; R.win = null; }   // 업데이트 12(SQL)를 아직 안 올림
    else if (!R.loaded) { R.missing = false; R.err = errMsg(e); }                                                                      // 처음부터 못 불러옴
    else R.stale = true;                                                                                                              // 보던 내용은 그대로 두고 경고만
    if (rsvShown()) rsvRender();
  }
  function rsvLoadSoon() { var R = S.rsv; if (!R) return; clearTimeout(R.soon); R.soon = setTimeout(function () { if (S.me && S.rsv) rsvLoad(); }, 120); }
  /* 하루에 한 번(이 기기 기준), 첫 불러오기에 성공한 뒤 오래된 휴지통·기록 정리. 청소일 뿐이라 실패해도 조용히(내일 다시) */
  function rsvPurgeOnce() {
    var R = S.rsv, today = rsvToday();
    if (R.purged) return; R.purged = true;
    if (lsGet('noble-rsv-purge') === today) return;
    lsSet('noble-rsv-purge', today);
    sb.rpc('rsv_purge_old').then(function () {}, function () {});
  }
  /* 다른 직원의 변경 (실시간) */
  function rsvApply(table, p) {
    var R = S.rsv; if (!S.me || !R) return;
    R.dirty = true;                                        // 불러오는 중이던 응답은 옛 모습일 수 있음 (rsvLoaded 가 보고 다시 불러옴)
    if (!R.loaded) return;                                 // 아직 한 번도 못 불러왔으면 알림 내용은 쓰지 않음 (불러올 때 서버 기준으로 받음)
    var row = p.new || {}, old = p.old || {}, id = row.id || old.id;
    if (table === 'rsv_items' || table === 'rsv_blocks') {
      var map = table === 'rsv_items' ? R.items : R.blocks;
      if (!id) return;
      if (p.eventType === 'DELETE' || row.deleted_at) delete map[id];                                 // 휴지통으로 갔거나 완전히 지워짐
      else if (row.id) {
        var cur = map[id];
        if (cur && typeof cur.version === 'number' && typeof row.version === 'number' && cur.version >= row.version) return;   // 같거나 옛 버전 (내가 방금 저장한 것의 되돌아온 알림 포함)
        map[id] = row;
      }
    } else if (table === 'rsv_therapists') {
      if (p.eventType === 'DELETE' || !row.id) { rsvLoadSoon(); return; }
      var found = false;
      R.ther = R.ther.map(function (t) { if (t.id === row.id) { found = true; return row; } return t; });
      if (!found) R.ther.push(row);
      R.ther.sort(function (a, b) { return (a.sort - b.sort) || String(a.name).localeCompare(String(b.name), 'ko'); });
      rsvSetRefresh(R);
    } else if (table === 'rsv_settings') {
      if (!row.data || typeof row.data !== 'object') { rsvLoadSoon(); return; }                      // 내용이 오지 않았으면 서버에서 다시
      R.settings = Object.assign({}, RSV_DEFAULTS, row.data);
    }
    if (rsvShown()) rsvRender();
    rsvCheckOpen();
  }
  /* 화면: 일·주·월 달력 (v48 4단계)
     · 시간 눈금은 1분 = 1.4px. 주·일 보기는 열마다 예약을 한국 시간 기준으로 얹고, 겹치면 좌우 칸으로 나눔
     · 보이는 시간 범위는 설정값에 "이 기간의(치료사 단추와 상관없이) 모든 예약"이 들어가도록 늘림 → 단추를 눌러도 눈금이 흔들리지 않음
     · 아직 받아 두지 않은 기간은 빈 달력 대신 "불러오는 중"/"불러오지 못했습니다"를 보여 줌 (예약이 없는 것처럼 보이면 안 되므로) */
  var RSV_PXM = 1.4, RSV_MINH = 34, RSV_SHORT = 36, RSV_GRAY = '#6b7280', RSV_DOWN = ['일', '월', '화', '수', '목', '금', '토'];   // v49: 이름이 2줄까지 보이도록 최소 높이(RSV_MINH)를 18→34로 늘림
  function rsvPx(n) { return (Math.round(n * 100) / 100) + 'px'; }
  function rsvPct(n) { return (Math.round(n * 100) / 100) + '%'; }
  function rsvColor(c) { return typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c) ? c : RSV_GRAY; }   // 스타일에 직접 넣는 값이라 모양이 맞는 것만
  function rsvNarrow() { return rsvWidth() < 720; }
  function rsvMs(x) { var k = rsvKst(x); return k ? rsvAt(k.ymd, k.min) : NaN; }                         // 분 단위로 맞춘 시각(ms)
  function rsvParts(d) { return rsvKst(rsvAt(d, 0)) || { y: 0, m: 0, d: 0, dow: 0 }; }
  function rsvDow(d) { return rsvParts(d).dow; }
  function rsvAddMonths(d, n) {                                                                           // 같은 일(없으면 그 달 마지막 날)로 n달 옮김
    var p = rsvParts(d), t = p.y * 12 + (p.m - 1) + n, y = Math.floor(t / 12), m = t % 12 + 1, last = new Date(Date.UTC(y, m, 0)).getUTCDate(), dd = Math.min(p.d, last);
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
  }
  function rsvSpan(it) {   // 한 예약이 놓이는 날짜(한국 시간)와 그날의 시작·끝(분). 못 읽으면 null
    var a = rsvKst(it.start_at), b = rsvKst(it.end_at), len;
    if (!a || !b) return null;
    len = Math.round((rsvAt(b.ymd, b.min) - rsvAt(a.ymd, a.min)) / 60000);
    return { ymd: a.ymd, s: a.min, e: a.min + (len > 0 ? len : 1) };
  }
  function rsvByDay(days) {   // { 날짜: [{ it, sp }] } — 그 날짜에 시작하는 예약(치료사 단추와 상관없이 전부), 시간 순(같은 시각은 먼저 만든 순)
    var R = S.rsv, out = {};
    days.forEach(function (d) { out[d] = []; });
    Object.keys(R.items).forEach(function (k) { var it = R.items[k], sp = rsvSpan(it); if (sp && out[sp.ymd]) out[sp.ymd].push({ it: it, sp: sp }); });
    days.forEach(function (d) {
      out[d].sort(function (a, b) {
        var ca = a.it.created_at || '', cb = b.it.created_at || '';
        return (a.sp.s - b.sp.s) || (ca < cb ? -1 : ca > cb ? 1 : 0) || (a.it.id < b.it.id ? -1 : 1);
      });
    });
    return out;
  }
  function rsvTher(id) { var L = S.rsv.ther, i; for (i = 0; i < L.length; i++) { if (L[i].id === id) return L[i]; } return null; }
  function rsvOn(id) { return S.rsv.filters.ther[id] !== false; }   // 단추로 끄지 않았으면 켜짐 (목록에 없는 치료사도 켜짐)
  function rsvChips(byDay) {   // 단추로 보이는 치료사: 쓰는 치료사 + (안 써도) 이 기간에 예약이 있는 치료사
    var used = {};
    Object.keys(byDay).forEach(function (d) { byDay[d].forEach(function (x) { used[x.it.therapist_id] = true; }); });
    return S.rsv.ther.filter(function (t) { return t.active !== false || used[t.id]; });
  }
  function rsvAxis(byDay, days) {   // 보이는 시간 범위 [시작분, 끝분]
    var list = [];
    days.forEach(function (d) { byDay[d].forEach(function (x) { list.push(x.it); }); });
    return rsvVisible(S.rsv.settings, list);
  }
  function rsvOpen(ids, d) {   // 그 날의 운영 시간 [시작분, 끝분] | null(쉬는 날). 여러 치료사가 보이면 합침
    var st = S.rsv.settings, dow = rsvDow(d), lo = null, hi = null, i, h;
    if (!ids.length) return rsvHours(st, null, dow);
    for (i = 0; i < ids.length; i++) {
      h = rsvHours(st, ids[i], dow);
      if (h) { lo = lo === null ? h[0] : Math.min(lo, h[0]); hi = hi === null ? h[1] : Math.max(hi, h[1]); }
    }
    return lo === null ? null : [lo, hi];
  }
  function rsvOffHtml(open, vs, ve) {   // 운영 시간 밖(또는 쉬는 날) 음영
    var a, b, out = '';
    function box(f, t) { return '<div class="rsv-off" style="top:' + rsvPx((f - vs) * RSV_PXM) + ';height:' + rsvPx((t - f) * RSV_PXM) + '"></div>'; }
    if (!open) return box(vs, ve);
    a = Math.max(open[0], vs); b = Math.min(open[1], ve);
    if (b <= a) return box(vs, ve);
    if (a > vs) out += box(vs, a);
    if (b < ve) out += box(b, ve);
    return out;
  }
  function rsvBlockList() {   // 휴무·마감 블록을 시작 순으로 (시각을 못 읽거나 끝이 시작보다 이르면 뺌)
    var R = S.rsv;
    return Object.keys(R.blocks).map(function (k) { var b = R.blocks[k]; return { b: b, s: rsvMs(b.start_at), e: rsvMs(b.end_at) }; })
      .filter(function (x) { return x.e > x.s; }).sort(function (p, q) { return (p.s - q.s) || (p.b.id < q.b.id ? -1 : 1); });
  }
  function rsvBlockText(b) { return String(b.reason || '').replace(/^\s+|\s+$/g, '') || '휴무'; }
  function rsvBlocksHtml(c, x) {   // 한 열 안의 휴무·마감 (그날 보이는 범위로 잘라서). 병원 전체 휴무는 모든 열에, 치료사 휴무는 그 치료사 열(주 보기는 켜진 치료사)에만
    var a = rsvAt(c.date, x.vs), z = rsvAt(c.date, x.ve), out = '';
    x.blocks.forEach(function (k) {
      var b = k.b, tid = b.therapist_id, cs, ce, th;
      if (tid && (c.th === null ? !rsvOn(tid) : tid !== c.th)) return;
      cs = Math.max(k.s, a); ce = Math.min(k.e, z);
      if (!(ce > cs)) return;
      th = rsvTher(tid);
      out += '<div class="rsv-blk' + (tid ? '' : ' all') + '" data-bid="' + esc(b.id) + '" role="button" tabindex="0" aria-label="' + esc('휴무·마감: ' + rsvBlockText(b) + ' · ' + (tid ? (th ? th.name : '(알 수 없음)') : '병원 전체') + ', 눌러서 수정') + '" style="top:' + rsvPx((cs - a) / 60000 * RSV_PXM) + ';height:' + rsvPx((ce - cs) / 60000 * RSV_PXM) + '"><span class="rsv-blk-t">' + esc(rsvBlockText(b)) + '</span>' +
        (x.week && tid ? '<span class="rsv-blk-s">' + esc(th ? th.name : '(알 수 없음)') + '</span>' : '') + '</div>';
    });
    return out;
  }
  function rsvEvHtml(r, l, x) {   // 예약 블록 한 개 (이름·코스 한 줄 · 높이가 36px 이상이면 시간(·치료사) · 취소/노쇼는 글자 · 그 밖에는 ✓ 내원 단추)
    var it = r.it, sp = r.sp, th = rsvTher(it.therapist_id), tn = th ? th.name : '(알 수 없음)', ln = l || { lane: 0, lanes: 1 },
      top = (sp.s - x.vs) * RSV_PXM, hh = Math.max(RSV_MINH, (sp.e - sp.s) * RSV_PXM), name = rsvItemTitle(it) || '(이름 없음)', stt = it.status,
      time = rsvHm(sp.s) + '–' + rsvHm(sp.e > 1440 ? sp.e - 1440 : sp.e), tail;
    if (top + hh > x.H) hh = Math.max(1, x.H - top);   // 열 밖으로 삐져나가지 않게
    tail = (stt === '취소' || stt === '노쇼') ? '<span class="rsv-ev-st">' + esc(stt) + '</span>'
      : '<button type="button" class="rsv-ok" data-rsv-ok aria-pressed="' + (stt === '내원' ? 'true' : 'false') + '" aria-label="내원 확인">' + svg('check') + '</button>';
    return '<div class="rsv-ev' + (ln.lanes >= 4 ? ' tight' : '') + (S.rsv.busy[it.id] ? ' pending' : '') + '" data-id="' + esc(it.id) + '" data-th="' + esc(it.therapist_id || '') + '" data-status="' + esc(stt) + '" role="button" tabindex="0" aria-label="' + esc(name + ', ' + time + ', ' + tn + ', ' + stt) +
      '" style="top:' + rsvPx(top) + ';height:' + rsvPx(hh) + ';left:' + rsvPct(ln.lane / ln.lanes * 100) + ';width:' + rsvPct(100 / ln.lanes) + ';--c:' + rsvColor(th && th.color) + '">' +
      '<span class="rsv-ev-t">' + esc(name) + '</span>' + (hh >= RSV_SHORT ? '<span class="rsv-ev-s">' + esc(time + (x.week ? ' · ' + tn : '')) + '</span>' : '') + tail + '<span class="rsv-rz" aria-hidden="true"></span></div>';
  }
  function rsvColHtml(c, x) {   // 날짜(또는 날짜+치료사) 한 열
    var s = rsvOffHtml(c.open, x.vs, x.ve), isT = c.date === x.today, ln, a, b;
    if (c.open && x.lu) {
      a = Math.max(x.lu[0], x.vs); b = Math.min(x.lu[1], x.ve);
      if (b > a) s += '<div class="rsv-lunch" style="top:' + rsvPx((a - x.vs) * RSV_PXM) + ';height:' + rsvPx((b - a) * RSV_PXM) + '"></div>';
    }
    s += rsvBlocksHtml(c, x);
    ln = rsvLanes(c.rows.map(function (r) { return { id: r.it.id, s: r.sp.s, e: r.sp.e }; }));
    c.rows.forEach(function (r) { s += rsvEvHtml(r, ln[r.it.id], x); });
    if (isT && x.nowMin >= x.vs && x.nowMin < x.ve) s += '<div class="rsv-now" style="top:' + rsvPx((x.nowMin - x.vs) * RSV_PXM) + '"></div>';
    return '<div class="rsv-col' + (isT ? ' today' : '') + (c.open ? '' : ' closed') + '" data-date="' + c.date + '"' + (c.th === null ? '' : ' data-th="' + esc(c.th) + '"') + ' style="height:' + rsvPx(x.H) + '">' + s + '</div>';
  }
  function rsvGridHtml(R, rg, byDay, chips) {   // 주 보기(날짜마다 한 열) · 일 보기(치료사마다 한 열)
    var week = R.view === 'week', days = rg.days, ax = rsvAxis(byDay, days), st = R.settings, nk = rsvKst(Date.now()), cols = [], hdr = '', gut = '', body = '', h, d0, seen, unk,
      onIds = chips.filter(function (t) { return rsvOn(t.id); }).map(function (t) { return t.id; }),
      x = { vs: ax[0], ve: ax[1], H: (ax[1] - ax[0]) * RSV_PXM, week: week, today: rsvToday(), nowMin: nk ? nk.min : -1, lu: rsvLunch(st), blocks: rsvBlockList() };
    if (week) {
      days.forEach(function (d) {
        cols.push({ date: d, th: null, name: '', color: '', open: rsvOpen(onIds, d), rows: byDay[d].filter(function (y) { return rsvOn(y.it.therapist_id); }) });
      });
    } else {
      d0 = days[0]; seen = {}; unk = [];
      chips.forEach(function (t) {
        if (rsvOn(t.id)) cols.push({ date: d0, th: t.id, name: t.name, color: t.color, open: rsvHours(st, t.id, rsvDow(d0)), rows: byDay[d0].filter(function (y) { return y.it.therapist_id === t.id; }) });
      });
      byDay[d0].forEach(function (y) { var k = y.it.therapist_id || ''; if (!rsvTher(k) && !seen[k]) { seen[k] = 1; unk.push(k); } });   // 치료사 정보가 없는 예약도 숨기지 않고 열을 따로
      unk.sort();
      unk.forEach(function (k) { cols.push({ date: d0, th: k, name: '(알 수 없음)', color: RSV_GRAY, open: rsvHours(st, null, rsvDow(d0)), rows: byDay[d0].filter(function (y) { return (y.it.therapist_id || '') === k; }) }); });
    }
    if (!cols.length) return '<div class="rsv-empty muted">표시할 치료사가 없습니다. 위의 치료사 단추를 눌러 켜 주세요.</div>';
    cols.forEach(function (c) {
      var p = rsvParts(c.date);
      if (week) hdr += '<button type="button" class="rsv-dh' + (c.date === x.today ? ' today' : '') + '" data-date="' + c.date + '" aria-label="' + esc(p.m + '월 ' + p.d + '일 ' + RSV_DOWN[p.dow] + '요일 하루 보기') + '"><span class="rsv-dn">' + p.d + '</span><span class="rsv-dw">' + RSV_DOWN[p.dow] + '</span></button>';
      else hdr += '<div class="rsv-dh" data-th="' + esc(c.th) + '"><i class="rsv-dot" style="background:' + rsvColor(c.color) + '"></i><span>' + esc(c.name) + '</span></div>';
      body += rsvColHtml(c, x);
    });
    for (h = Math.ceil(x.vs / 60); h * 60 < x.ve; h++) gut += '<span class="rsv-hr" style="top:' + rsvPx((h * 60 - x.vs) * RSV_PXM) + '">' + rsvHm(h * 60) + '</span>';
    return '<div class="rsv-grid" data-vs="' + x.vs + '" data-ve="' + x.ve + '" style="--n:' + cols.length + '"><div class="rsv-hdrow"><div class="rsv-corner"></div>' + hdr + '</div>' +
      '<div class="rsv-cols"><div class="rsv-gutter" style="height:' + rsvPx(x.H) + '" aria-hidden="true">' + gut + '</div>' + body + '</div></div>';
  }
  function rsvMonthHtml(R, rg, byDay) {   // 6주 × 7일 · 날짜마다 건수 · 앞 3건 미리보기 + "+N" · 휴무 이유 · 칸을 누르면 그날 하루 보기
    var today = rsvToday(), cm = rsvParts(R.date).m, days = rg.days, blocks = rsvBlockList(), head = '', cells = '', i;
    for (i = 0; i < 7; i++) head += '<div class="rsv-dh">' + RSV_DOWN[rsvDow(days[i])] + '</div>';
    days.forEach(function (d) {
      var rows = byDay[d].filter(function (y) { return rsvOn(y.it.therapist_id); }), n = rows.length, p = rsvParts(d), a = rsvAt(d, 0), z = rsvAt(d, 1440), bl = [], mb = '', lab;
      blocks.forEach(function (k) { if (k.s < z && k.e > a && !(k.b.therapist_id && !rsvOn(k.b.therapist_id))) bl.push(rsvBlockText(k.b)); });
      bl.slice(0, 2).forEach(function (t) { mb += '<span class="rsv-mb">' + esc(t) + '</span>'; });
      lab = p.m + '월 ' + p.d + '일 ' + RSV_DOWN[p.dow] + '요일' + (n ? ', 예약 ' + n + '건' : '') + (bl.length ? ', ' + bl.join(', ') : '');
      cells += '<button type="button" class="rsv-cell' + (d === today ? ' today' : '') + (p.m !== cm ? ' out' : '') + '" data-date="' + d + '" aria-label="' + esc(lab) + '"><span class="rsv-dn">' + p.d + '</span>' +
        (n ? '<span class="rsv-cnt">' + n + '</span>' : '') + mb +
        rows.slice(0, 3).map(function (y) {
          var th = rsvTher(y.it.therapist_id);
          return '<span class="rsv-mi" data-id="' + esc(y.it.id) + '" data-status="' + esc(y.it.status) + '" style="--c:' + rsvColor(th && th.color) + '"><b>' + rsvHm(y.sp.s) + '</b> ' + esc(rsvItemTitle(y.it) || '(이름 없음)') + '</span>';
        }).join('') + (n > 3 ? '<span class="rsv-more">+' + (n - 3) + '</span>' : '') + '</button>';
    });
    return '<div class="rsv-days">' + head + '</div><div class="rsv-month">' + cells + '</div>';
  }
  function rsvTitle(R, rg) {
    var a, b;
    if (R.view === 'month') { a = rsvParts(R.date); return a.y + '년 ' + a.m + '월'; }
    if (R.view === 'day') { a = rsvParts(R.date); return a.y + '년 ' + a.m + '월 ' + a.d + '일 (' + RSV_DOWN[a.dow] + ')'; }
    a = rsvParts(rg.days[0]); b = rsvParts(rg.days[6]);
    return a.y + '년 ' + a.m + '월 ' + a.d + '일 – ' + (a.y !== b.y ? b.y + '년 ' + b.m + '월 ' : a.m !== b.m ? b.m + '월 ' : '') + b.d + '일';
  }
  function rsvStripHtml(R) {   // 좁은 화면 하루 보기: 이번 주 7일 날짜 띠
    var today = rsvToday(), days = rsvRange('week', R.date, R.settings.week_start).days;
    return '<div class="rsv-strip" role="group" aria-label="이번 주 날짜">' + days.map(function (d) {
      var p = rsvParts(d);
      return '<button type="button" data-date="' + d + '" aria-pressed="' + (d === R.date ? 'true' : 'false') + '"' + (d === today ? ' aria-current="date"' : '') + ' aria-label="' + esc(p.m + '월 ' + p.d + '일 ' + RSV_DOWN[p.dow] + '요일') + '"><span>' + RSV_DOWN[p.dow] + '</span><b>' + p.d + '</b></button>';
    }).join('') + '</div>';
  }
  function rsvTopHtml(R, rg, chips, narrow) {   // 머리글: 이전·오늘·다음 / 날짜 글자 / 일·주·월 / 되돌리기·예약 추가·더보기 / 치료사 단추 / (좁은 화면) 날짜 띠
    var h = '<div class="rsv-top"><div class="rsv-head"><div class="rsv-nav" role="group" aria-label="날짜 이동">';
    [['prev', '이전', '‹'], ['today', '오늘', '오늘'], ['next', '다음', '›']].forEach(function (n) { h += '<button type="button" class="btn btn-line sm" data-rnav="' + n[0] + '" aria-label="' + n[1] + '">' + n[2] + '</button>'; });
    h += '</div><h2 class="rsv-title" aria-live="polite">' + esc(rsvTitle(R, rg)) + '</h2><div class="rsv-views" role="group" aria-label="보기">';
    [['day', '일'], ['week', '주'], ['month', '월']].forEach(function (v) { h += '<button type="button" data-rv="' + v[0] + '" aria-pressed="' + (R.view === v[0] ? 'true' : 'false') + '">' + v[1] + '</button>'; });
    h += '</div><div class="rsv-acts"><button type="button" class="icon-btn" id="rsvUndo" aria-label="되돌리기" title="' + esc(rsvUndoTitle(R)) + '"' + (R.undo.length ? '' : ' disabled') + '>' + svg('undo') + '</button>' +
      (DESKTOP.matches && !S.solo ? '<button type="button" class="icon-btn" id="rsvWin" aria-label="예약 화면을 새 창으로 열기" title="예약 화면만 따로 새 창으로 띄워 두기 (데스크 PC 옆 화면 등에 두고 볼 수 있습니다)">' + svg('pop') + '</button>' : '') +
      '<button type="button" class="btn btn-navy sm" id="rsvAdd">' + svg('plus') + '<span>예약</span></button>' +
      '<button type="button" class="icon-btn" id="rsvMore" aria-label="더보기" aria-haspopup="menu">' + svg('more') + '</button></div></div>';
    if (chips.length) {
      h += '<div class="rsv-thers" role="group" aria-label="치료사 표시">';
      chips.forEach(function (t) { h += '<button type="button" class="rsv-ther' + (t.active === false ? ' inactive' : '') + '" data-th="' + esc(t.id) + '" aria-pressed="' + (rsvOn(t.id) ? 'true' : 'false') + '"><i class="rsv-dot" style="background:' + rsvColor(t.color) + '"></i>' + esc(t.name) + '</button>'; });
      h += '</div>';
    }
    if (narrow && R.view === 'day') h += rsvStripHtml(R);
    return h + '</div>';
  }
  function rsvCovered(rg) { var w = S.rsv.win; return !!(w && w.from <= rsvAt(rg.from, 0) && rsvAt(rg.to, 0) <= w.to); }   // 보이는 기간이 받아 둔 기간 안인가
  function rsvScreenHtml() {
    var R = S.rsv, rg = rsvRange(R.view, R.date, R.settings.week_start), byDay = rsvByDay(rg.days), chips = rsvChips(byDay), narrow = R.narrow, covered = rsvCovered(rg),
      gap = !covered && R.stale && !(R.loading || R.again || R.fresh), inner;   // 못 받은 기간: 받는 중이면 "불러오는 중", 받기에 실패했으면 "불러오지 못했습니다"
    if (!covered) inner = gap ? '<div class="rsv-gap"><p>이 기간의 예약을 아직 불러오지 못했습니다.</p><button class="btn btn-line" id="rsvRetry">다시 불러오기</button></div>' : '<div class="rsv-loading muted">불러오는 중…</div>';
    else if (R.view === 'month') inner = rsvMonthHtml(R, rg, byDay);
    else inner = rsvGridHtml(R, rg, byDay, chips);
    return rsvTopHtml(R, rg, chips, narrow) +
      (R.stale ? '<div class="rsv-stale" role="status">최신 상태가 아닐 수 있습니다. 인터넷 연결을 확인하는 중이며 자동으로 다시 시도합니다.' + (gap ? '' : ' <button class="btn btn-line sm" id="rsvRetry">다시 불러오기</button>') + '</div>' : '') +
      '<div class="rsv-sc"><div class="rsv-view' + (narrow ? ' rsv-narrow' : '') + '">' + inner + '</div></div>';
  }
  function rsvFocusSel(body) {   // 다시 그리기 전에 포커스가 있던 단추를 찾아 둠 (키보드로 쓰는 사람이 자리를 잃지 않게)
    var a = document.activeElement, v;
    if (!a || a === document.body || !body.contains(a)) return '';
    if (a.id && /^rsv[A-Za-z]+$/.test(a.id)) return '#' + a.id;
    if ((v = a.getAttribute('data-rv'))) return '[data-rv="' + v + '"]';
    if ((v = a.getAttribute('data-rnav'))) return '[data-rnav="' + v + '"]';
    v = a.getAttribute('data-th') || ''; if (a.classList.contains('rsv-ther') && /^[\w-]+$/.test(v)) return '.rsv-ther[data-th="' + v + '"]';
    v = a.getAttribute('data-id') || ''; if (a.classList.contains('rsv-ev') && /^[\w-]+$/.test(v)) return '.rsv-ev[data-id="' + v + '"]';
    v = a.getAttribute('data-date') || ''; if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return (a.closest('.rsv-strip') ? '.rsv-strip ' : a.classList.contains('rsv-cell') ? '.rsv-cell' : '.rsv-dh') + '[data-date="' + v + '"]';
    return '';
  }
  function rsvFocusEl(el) { if (!el) return; try { el['focus']({ preventScroll: true }); } catch (e) { try { el['focus'](); } catch (e2) { /* 포커스를 못 옮겨도 그림은 그대로 */ } } }
  function renderRsv() {
    var main = $('#main'), R; main.style.justifyContent = '';
    R = rsvInit(); R.scrollNow = true; R.sv = '';   // 화면을 열 때마다 맨 위에서 시작해 지금 시각 쪽으로
    main.innerHTML = header('예약') + '<div class="pane-body rsv-body" id="rsvbody"></div>';
    $('#rsvbody', main).addEventListener('click', rsvClick);
    $('#rsvbody', main).addEventListener('keydown', rsvBodyKey);
    $('#rsvbody', main).addEventListener('pointerdown', rsvPointerDown);
    rsvRender();      // 이미 불러온 내용이 있으면 먼저 보여 주고
    rsvLoad(); rsvWatch();   // 서버 내용으로 맞춤
  }
  function rsvRender() {
    var body = $('#rsvbody'); if (!body) return;
    var R = S.rsv, html, fk, sc, st, sl, now, a, b, gone;
    if (R.drag) {   // 끄는 중에는 화면을 다시 그리지 않음(끄는 블록이 사라지지 않게) — 끝난 뒤 한 번에. 끌던 예약이 바뀌었거나 사라졌으면 끌기를 취소하고 그림
      if (rsvDragGone(R)) { gone = R.drag.id; rsvDragEnd(false, true); toast(R.items[gone] ? '끌던 예약이 다른 직원에 의해 바뀌어 옮기기를 취소했습니다.' : '끌던 예약이 삭제되었거나 다른 날짜로 옮겨졌습니다. 옮기기를 취소했습니다.'); }
      else { R.drag.late = true; return; }
    }
    fk = rsvFocusSel(body); sc = $('.rsv-sc', body); st = sc ? sc.scrollTop : 0; sl = sc ? sc.scrollLeft : 0;
    R.narrow = rsvNarrow();
    if (R.sv !== R.view) { st = 0; sl = 0; R.sv = R.view; }   // 보기를 바꾸면 맨 위부터 (날짜만 넘길 때는 보던 시간대 그대로)
    body.setAttribute('data-view', R.view);
    if (R.missing) html = '<div class="rsv-notice"><p>예약 기능 업데이트(SQL)가 아직 적용되지 않았습니다. 관리자에게 알려 주세요.</p><button class="btn btn-line" id="rsvRetry">다시 확인</button></div>';
    else if (!R.loaded) html = R.err ? '<div class="rsv-error"><p>' + esc(R.err) + '</p><button class="btn btn-line" id="rsvRetry">다시 불러오기</button></div>' : '<div class="rsv-loading muted">불러오는 중…</div>';
    else html = rsvScreenHtml();
    body.innerHTML = html;
    sc = $('.rsv-sc', body);
    if (sc) {
      sc.scrollTop = st; sc.scrollLeft = sl;
      if (R.scrollNow && $('.rsv-grid', body)) {   // 처음 열었을 때·"오늘"을 눌렀을 때: 지금 시각 줄이 화면 위쪽 1/3 쯤에 오게 (실제 화면에서만 의미 있음)
        R.scrollNow = false; now = $('.rsv-now', body);
        if (now) { a = now.getBoundingClientRect(); b = sc.getBoundingClientRect(); sc.scrollTop += (a.top - b.top) - Math.round(sc.clientHeight / 3); }
      }
    }
    if (fk) rsvFocusEl($(fk, body));
  }
  /* 눌림 처리 (한 곳에서) */
  function rsvClick(e) {
    var R = S.rsv, t = e.target, b;
    if (!R || !t || !t.closest) return;
    if (R.swallow) { b = Date.now() - R.swallow; R.swallow = 0; if (b < 400) return; }   // 끌기를 끝낸 직후 브라우저가 이어 보내는 click 은 무시 (새 예약·상세 창이 뜨지 않게)
    if (t.closest('#rsvRetry')) { rsvLoad(); return; }
    if ((b = t.closest('[data-rnav]'))) { rsvStep(b.getAttribute('data-rnav')); return; }
    if ((b = t.closest('[data-rv]'))) { rsvGo(b.getAttribute('data-rv'), R.date, true); return; }          // 보기 단추: 고른 보기를 이 기기에 기억
    if ((b = t.closest('.rsv-ther'))) { rsvToggle(b.getAttribute('data-th')); return; }
    if ((b = t.closest('.rsv-strip [data-date]'))) { rsvGo('day', b.getAttribute('data-date'), false); return; }
    if ((b = t.closest('.rsv-dh[data-date]'))) { rsvGo('day', b.getAttribute('data-date'), false); return; }   // 날짜를 눌러 들어간 하루 보기는 기억하지 않음
    if (t.closest('#rsvAdd')) { rsvItemSheet({}); return; }
    if (t.closest('#rsvWin')) { openRsvWindow(); return; }
    if (t.closest('#rsvUndo')) { rsvUndo(); return; }
    if (t.closest('#rsvMore')) { rsvMoreMenu(); return; }
    if ((b = t.closest('[data-rsv-ok]'))) { rsvToggleOk(b); return; }                                      // ✓ 내원 단추는 예약 블록 안에 있으므로 블록보다 먼저
    if ((b = t.closest('.rsv-ev') || t.closest('.rsv-mi'))) { rsvDetailSheet(b.getAttribute('data-id')); return; }   // 월 보기의 미리보기 줄도 같은 상세 창 (칸 전체를 누르는 것보다 먼저)
    if ((b = t.closest('.rsv-blk'))) { b = R.blocks[b.getAttribute('data-bid')]; if (b) rsvBlockSheet({ block: b }); return; }   // 휴무·마감 블록 = 수정 창 (새 예약이 아님)
    if ((b = t.closest('.rsv-cell'))) { rsvGo('day', b.getAttribute('data-date'), false); return; }
    if ((b = t.closest('.rsv-col'))) { rsvBlankClick(b, e); }                                              // 빈 곳 = 그 자리에 새 예약
  }
  function rsvGo(view, date, persist) {
    var R = S.rsv; if (!R) return;
    if (RSV_VIEWS.indexOf(view) < 0) view = R.view;
    if (persist) lsSet('noble-rsv-view', view);
    R.view = view; R.date = date; R.fresh = true;
    rsvRender();   // 이미 받아 둔 기간이면 바로 그리고, 아니면 "불러오는 중"
    rsvLoad();     // 어느 쪽이든 서버에서 다시 (다음에 넘길 때를 위한 앞뒤 여분도 함께 받아 둠)
  }
  function rsvStep(kind) {
    var R = S.rsv, n = kind === 'prev' ? -1 : 1, d = R.date;
    if (kind === 'today') { R.scrollNow = true; d = rsvToday(); }
    else if (R.view === 'month') d = rsvAddMonths(d, n);
    else d = rsvAddDays(d, (R.view === 'week' ? 7 : 1) * n);
    rsvGo(R.view, d, false);
  }
  function rsvToggle(id) { var f = S.rsv.filters.ther; if (!id) return; f[id] = (f[id] === false); rsvRender(); }
  /* 키보드: ← → 로 이전·다음, T(한글 자판이면 ㅅ)로 오늘. 예약 화면이 열려 있고 열린 창·입력칸이 없을 때만 */
  function rsvKey(e) {
    var k = e.key, a = document.activeElement, t;
    if (!S.rsv || !S.me || !rsvShown() || S.rsv.drag || e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey || e.isComposing || $('.modal')) return;   // 끄는 중에는 날짜를 넘기지 않음
    if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a['isContentEditable'])) return;
    if (k === 'ArrowLeft') t = 'prev'; else if (k === 'ArrowRight') t = 'next';
    else if (k === 't' || k === 'T' || k === 'ㅅ') t = 'today'; else return;
    e.preventDefault(); rsvStep(t);
  }
  document.addEventListener('keydown', rsvKey);
  /* Ctrl+Z · ⌘+Z (한글 자판이면 ㅋ): 되돌리기. 예약 화면이 열려 있고 열린 창·입력칸 커서·끌기가 없을 때만 (입력칸 안의 Ctrl+Z 는 글자 되돌리기라서 건드리지 않음) */
  function rsvUndoKey(e) {
    var k = e.key, a = document.activeElement;
    if (!S.rsv || !S.me || !rsvShown() || S.rsv.drag || e.defaultPrevented || e.isComposing || e.altKey || e.shiftKey || !(e.ctrlKey || e.metaKey) || $('.modal')) return;
    if (k !== 'z' && k !== 'Z' && k !== 'ㅋ') return;
    if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a['isContentEditable'])) return;
    e.preventDefault(); rsvUndo();
  }
  document.addEventListener('keydown', rsvUndoKey);
  /* 창 폭이 바뀌어 좁은 화면 ↔ 넓은 화면이 달라지면 다시 그림 (날짜 띠·글자 크기). 고른 보기는 그대로 */
  function rsvLayout() { var R = S.rsv; if (R && rsvShown() && rsvNarrow() !== R.narrow) rsvRender(); }
  /* 예약 화면이 열려 있는 동안만: 1분마다 다시 확인(실시간 연결이 끊겼을 때 대비) · 인터넷이 다시 연결되면 바로. 화면을 벗어나면 rsvLeave 가 정리 */
  function rsvWatch() {
    var R = S.rsv;
    if (R.watch) { clearInterval(R.watch); R.watch = null; }
    R.watch = setInterval(function () {
      if (!rsvShown()) { rsvLeave(); return; }   // 다른 화면으로 갔으면 스스로 정리
      if (document.visibilityState !== 'visible') return;
      rsvLoad();
    }, 60000);
    if (!R.onOnline) { R.onOnline = function () { if (rsvShown()) rsvLoad(); }; window.addEventListener('online', R.onOnline); }
    if (!R.onResize) { R.onResize = rsvLayout; window.addEventListener('resize', R.onResize); }
  }
  function rsvLeave() {
    var R = S.rsv; if (!R) return;
    if (R.drag) rsvDragEnd(false, true);   // 다른 화면으로 가면 끌기·미리보기·타이머를 모두 정리 (이동 없음)
    if (R.watch) { clearInterval(R.watch); R.watch = null; }
    if (R.onOnline) { window.removeEventListener('online', R.onOnline); R.onOnline = null; }
    if (R.onResize) { window.removeEventListener('resize', R.onResize); R.onResize = null; }
    clearTimeout(R.soon); R.soon = null;
  }

  /* ================= 예약 (v48 5단계): 예약 만들기 · 수정 · 상세 · 상태 · 삭제 =================
     · 저장·상태·삭제는 서버가 받아들인 뒤에만 화면에 반영 (되돌아온 실시간 알림은 같은 버전이라 무시됨). 서버가 거절하면 이유를 보여 주고 창은 그대로
     · 새 예약 창을 열 때마다 client_id 를 한 번만 만듦 → 저장이 실패해 다시 눌러도 같은 요청이라 서버에 두 건이 생기지 않음
     · 저장 전 경고(겹침·같은 환자·운영 시간·점심·휴무·기간끝)는 막지 않고 알려만 줌. 받아 둔 기간 밖 날짜는 그 날만 서버에서 따로 확인
     · 열어 둔 예약을 다른 직원이 바꾸면 창에 "바뀜" 표시. 내가 본 버전이 낡아 저장이 거절되면 최신 내용으로 창을 다시 엶
     · 창 안의 글은 모두 esc 하거나 textContent/value 로만 넣음 (이름·메모·서버 오류 글에 태그가 있어도 글자 그대로) */
  var RSV_LENS = [15, 30, 45, 60, 90], RSV_KEYS = ['therapist_id', 'patient_name', 'chart_no', 'start_at', 'end_at', 'status', 'ins_kind', 'ins_round', 'ins_end', 'course', 'memo'];
  function rsvUuid() {   // 무작위 식별 번호 (v4)
    var a = [], i, c = window.crypto, u;
    try { if (c && c.getRandomValues) { u = new Uint8Array(16); c.getRandomValues(u); for (i = 0; i < 16; i++) a.push(u[i]); } } catch (e) { a = []; }
    if (a.length !== 16) { a = []; for (i = 0; i < 16; i++) a.push(Math.floor(Math.random() * 256)); }
    a[6] = (a[6] & 15) | 64; a[8] = (a[8] & 63) | 128;
    return a.map(function (x, k) { return ((k === 4 || k === 6 || k === 8 || k === 10) ? '-' : '') + (x < 16 ? '0' : '') + x.toString(16); }).join('');
  }
  function rsvTrim(v) { return String(v == null ? '' : v).replace(/^\s+|\s+$/g, ''); }
  function rsvVal(m, sel) { var e = $(sel, m); return e ? rsvTrim(e.value) : ''; }
  function rsvOne(d) { return Array.isArray(d) ? d[0] : d; }
  function rsvMD(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s || '') ? s.slice(5, 7) + '/' + s.slice(8, 10) : ''; }
  function rsvBefore(it) { var o = {}, i; for (i = 0; i < RSV_KEYS.length; i++) o[RSV_KEYS[i]] = (it[RSV_KEYS[i]] === undefined ? null : it[RSV_KEYS[i]]); return o; }   // 되돌리기용: 그때의 전체 모습
  function rsvPress(box, attr, val) { if (!box) return; $$('[' + attr + ']', box).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute(attr) === String(val) ? 'true' : 'false'); }); }
  function rsvPressed(box, attr) { var b = box ? $('[' + attr + '][aria-pressed="true"]', box) : null; return b ? b.getAttribute(attr) : ''; }
  function rsvTimeMin(v) { var s = String(v || ''); if (/^\d{2}:\d{2}:\d{2}/.test(s)) s = s.slice(0, 5); return rsvParseHm(s); }
  function rsvErrRaw(e) { return String((e && (e.message || e.error_description || e.error)) || e || ''); }
  function rsvIsConflict(e) { return /VERSION_CONFLICT/.test(rsvErrRaw(e)); }
  function rsvErrText(e) {   // 서버 오류 → 사람이 읽을 글 (내부 표시 VERSION_CONFLICT: 는 떼고, SQL 미적용이면 안내)
    var raw = rsvErrRaw(e) + ' ' + ((e && e.code) || '');
    if (qMissing(raw)) return '예약 기능 업데이트(SQL)가 아직 적용되지 않았습니다. 관리자에게 알려 주세요.';
    return errMsg(e).replace(/^VERSION_CONFLICT:\s*/, '');
  }
  function rsvSetErr(m, msg) { var e = $('#rsvErr', m); if (e) e.textContent = msg || ''; }
  function rsvFocusId(m, id) { var e = id ? $('#' + id, m) : null; if (e && /^(INPUT|TEXTAREA)$/.test(e.tagName)) rsvFocusEl(e); }
  function rsvPickTher(want) {   // 쓰는 치료사 중: 원하는 치료사 → 지금 켜져 있는 첫 치료사 → 첫 치료사
    var L = S.rsv.ther.filter(function (t) { return t.active !== false; }), i;
    if (want) { for (i = 0; i < L.length; i++) { if (L[i].id === want) return want; } }
    for (i = 0; i < L.length; i++) { if (rsvOn(L[i].id)) return L[i].id; }
    return L.length ? L[0].id : '';
  }
  function rsvThChoices(cur) {   // 고를 수 있는 치료사: 쓰는 치료사 + (수정 중이면) 그 예약의 지금 치료사
    var L = S.rsv.ther.filter(function (t) { return t.active !== false || t.id === cur; });
    if (cur && !rsvTher(cur)) L.push({ id: cur, name: '(알 수 없음)', color: RSV_GRAY });
    return L;
  }
  function rsvDefaults(o) {   // 새 예약의 처음 값: 날짜(보이는 기간에 오늘이 있으면 오늘, 없으면 보고 있는 날짜) · 치료사 · 그날 운영 시작 시각 · 기본 길이
    var R = S.rsv, st = R.settings, today = rsvToday(), date = o.date, th, hr, len, min, a, b, vs;
    if (!date) {
      if (R.view === 'month') { a = rsvParts(today); b = rsvParts(R.date); date = (a.y === b.y && a.m === b.m) ? today : R.date; }
      else date = rsvRange(R.view, R.date, st.week_start).days.indexOf(today) > -1 ? today : R.date;
    }
    th = rsvPickTher(o.th || '');
    hr = rsvHours(st, th || null, rsvDow(date));
    vs = rsvParseHm(st.view_start);
    min = typeof o.min === 'number' ? o.min : (hr ? hr[0] : (vs !== null && vs < 1440 ? vs : 540));
    len = (typeof o.len === 'number' && o.len >= 1 && o.len <= 720) ? Math.round(o.len)   // 끌어서 지정한 길이
      : ((typeof st.default_len === 'number' && st.default_len >= 1 && st.default_len <= 720) ? Math.round(st.default_len) : 30);
    if (min + len > 1440) min = Math.max(0, 1440 - len);
    return { th: th, date: date, min: min, len: len };
  }
  function rsvFromRow(it) {   // 예약 한 건 → 창의 칸 값
    var a = rsvKst(it.start_at), len = Math.round((rsvMs(it.end_at) - rsvMs(it.start_at)) / 60000);
    return { th: it.therapist_id || '', date: a ? a.ymd : '', start: a ? rsvHm(a.min) : '', len: len > 0 ? len : 30, name: it.patient_name || '', chart: it.chart_no || '',
      ins: it.ins_kind === '자보' ? '자보' : '일반', round: it.ins_round ? String(it.ins_round) : '', end: it.ins_end || '', course: it.course || '', status: it.status || '예약', memo: it.memo || '' };
  }
  function rsvSheetBody(isEdit, thList, courses) {
    var h = '<div class="rsv-form">';
    h += '<div class="rsv-changed" id="rsvChanged" role="status" hidden><span id="rsvChangedT"></span> <button type="button" class="btn btn-line sm" id="rsvReload">최신 내용 보기</button></div>';
    if (!isEdit) h += '<div class="field"><label for="rsvQuick">빠른 입력</label><div class="rsv-quick"><input class="input" id="rsvQuick" autocomplete="off" enterkeyhint="done" placeholder="예) 홍길동 C10 · 홍길동 자보도수-5회 · 홍길동 킵"><button type="button" class="btn btn-line sm" id="rsvQuickGo">채우기</button></div><p class="muted small rsv-hint" id="rsvQuickHint" role="status"></p></div>';
    h += '<div class="field"><label id="rsvThL">치료사</label><div class="seg sm" id="rsvTh" role="group" aria-labelledby="rsvThL">' +
      (thList.length ? thList.map(function (t) { return '<button type="button" data-th="' + esc(t.id) + '" aria-pressed="false"><span class="rsv-dot" style="background:' + rsvColor(t.color) + '"></span>' + esc(t.name) + '</button>'; }).join('')
        : '<span class="muted small">사용 중인 치료사가 없습니다. 설정에서 치료사를 먼저 추가해 주세요.</span>') + '</div></div>';
    h += '<div class="row2"><div class="field"><label for="rsvDate">날짜</label><input class="input" type="date" id="rsvDate"></div><div class="field"><label for="rsvStart">시작</label><input class="input" type="time" id="rsvStart"></div></div>';
    h += '<div class="field"><label for="rsvLenN">길이(분)</label><div class="rsv-lenrow"><div class="seg sm" id="rsvLen" role="group" aria-label="길이">' +
      RSV_LENS.map(function (n) { return '<button type="button" data-len="' + n + '" aria-pressed="false">' + n + '</button>'; }).join('') +
      '</div><input class="input rsv-lenn" id="rsvLenN" inputmode="numeric" maxlength="3" autocomplete="off"><span class="muted rsv-end" id="rsvEnd" aria-live="polite"></span></div></div>';
    h += '<div class="field rsv-namef"><label for="rsvName">환자 이름</label><input class="input" id="rsvName" maxlength="40" autocomplete="off"><div class="rsv-sug" id="rsvSug" role="listbox" aria-label="환자 목록" hidden></div></div>';
    h += '<div class="field"><label for="rsvChart">차트번호 <span class="muted small">(선택)</span></label><input class="input" id="rsvChart" maxlength="30" autocomplete="off"></div>';
    h += '<div class="field"><label id="rsvInsL">구분</label><div class="seg sm" id="rsvIns" role="group" aria-labelledby="rsvInsL"><button type="button" data-ins="일반" aria-pressed="true">일반</button><button type="button" data-ins="자보" aria-pressed="false">자보</button></div></div>';
    h += '<div class="row2" id="rsvInsRow" hidden><div class="field"><label for="rsvRound">자보 회차</label><input class="input" id="rsvRound" inputmode="numeric" maxlength="3" autocomplete="off"></div><div class="field"><label for="rsvInsEnd">기간끝</label><input class="input" type="date" id="rsvInsEnd"></div></div>';
    h += '<div class="field"><label for="rsvCourse">코스</label><input class="input" id="rsvCourse" maxlength="30" autocomplete="off" autocapitalize="characters" placeholder="예) C10, J15+C5"><div class="rsv-courses" id="rsvCourses">' +
      courses.map(function (c) { return '<button type="button" class="rsv-chip" data-course="' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>'; }).join('') + '</div><p class="muted small rsv-hint" id="rsvCourseHint" role="status"></p></div>';
    h += '<div class="field"><label id="rsvStL">상태</label><div class="seg sm" id="rsvSt" role="group" aria-labelledby="rsvStL">' +
      RSV_STATUS.map(function (s) { return '<button type="button" data-st="' + s + '" aria-pressed="false">' + s + '</button>'; }).join('') + '</div></div>';
    h += '<div class="field"><label for="rsvMemo">메모</label><textarea class="input rsv-memo" id="rsvMemo" rows="2" maxlength="500"></textarea><p class="muted small">진단명·주민번호 같은 민감한 개인정보는 적지 마세요.</p></div>';
    return h + '<p class="err" id="rsvErr" role="alert"></p><div class="sheet-actions"><button type="button" class="btn btn-line" data-close>취소</button><button type="button" class="btn btn-navy" id="rsvSave">저장</button></div></div>';
  }
  function rsvFormSet(ctx, f) {   // 창의 칸을 한꺼번에 채움 (프로그램으로 넣는 값이라 입력 알림은 가지 않음)
    var m = ctx.el;
    rsvPress($('#rsvTh', m), 'data-th', f.th);
    $('#rsvDate', m).value = f.date; $('#rsvStart', m).value = f.start; $('#rsvLenN', m).value = String(f.len);
    $('#rsvName', m).value = f.name; $('#rsvChart', m).value = f.chart; $('#rsvRound', m).value = f.round; $('#rsvInsEnd', m).value = f.end;
    $('#rsvCourse', m).value = f.course; $('#rsvMemo', m).value = f.memo;
    rsvPress($('#rsvIns', m), 'data-ins', f.ins); rsvPress($('#rsvSt', m), 'data-st', f.status);
    rsvFormSync(ctx);
  }
  function rsvFormSync(ctx) {   // 칸 값에서 따라 나오는 표시: 끝 시각 · 길이 단추 · 자보 칸 · 코스 단추와 안내
    var m = ctx.el, s = rsvTimeMin(rsvVal(m, '#rsvStart')), ls = rsvVal(m, '#rsvLenN'), n = /^\d{1,3}$/.test(ls) ? parseInt(ls, 10) : 0, norm = rsvNormCourse(rsvVal(m, '#rsvCourse'));
    $('#rsvEnd', m).textContent = (s !== null && s < 1440 && n >= 1) ? (s + n > 1440 ? '자정을 넘깁니다' : '끝 ' + rsvHm(s + n)) : '';
    rsvPress($('#rsvLen', m), 'data-len', n);
    $('#rsvInsRow', m).hidden = rsvPressed($('#rsvIns', m), 'data-ins') !== '자보';
    rsvPress($('#rsvCourses', m), 'data-course', norm);
    $('#rsvCourseHint', m).textContent = (norm && ctx.courses.indexOf(norm) < 0) ? '목록에 없는 코스입니다 (그대로 저장됩니다).' : '';
  }
  function rsvFormRead(ctx) {   // 칸 → 서버로 보낼 값. 틀린 곳이 있으면 { err, f(칸 id) }
    var m = ctx.el, th = rsvPressed($('#rsvTh', m), 'data-th'), date = rsvVal(m, '#rsvDate'), s = rsvTimeMin(rsvVal(m, '#rsvStart')), ls = rsvVal(m, '#rsvLenN'),
      len = /^\d{1,3}$/.test(ls) ? parseInt(ls, 10) : 0, name = rsvVal(m, '#rsvName'), chart = rsvVal(m, '#rsvChart'), cs = rsvVal(m, '#rsvCourse'), course = rsvNormCourse(cs),
      kind = rsvPressed($('#rsvIns', m), 'data-ins') === '자보' ? '자보' : '일반', rs = rsvVal(m, '#rsvRound'), ie = rsvVal(m, '#rsvInsEnd'), status = rsvPressed($('#rsvSt', m), 'data-st'),
      memo = rsvVal(m, '#rsvMemo'), round = null, iend = null, data;
    function bad(msg, id) { return { err: msg, f: id }; }
    if (!th) return bad('치료사를 선택해 주세요.', 'rsvTh');
    if (!date) return bad('날짜를 입력해 주세요.', 'rsvDate');
    if (!isFinite(rsvAt(date, 0))) return bad('날짜 형식을 확인해 주세요.', 'rsvDate');
    if (s === null || s >= 1440) return bad('시작 시각을 입력해 주세요.', 'rsvStart');
    if (!(len >= 1 && len <= 720)) return bad('길이(분)는 1~720 사이의 숫자로 입력해 주세요.', 'rsvLenN');
    if (s + len > 1440) return bad('자정을 넘길 수 없습니다. 시작 시각이나 길이를 줄여 주세요.', 'rsvLenN');
    if (!name) return bad('환자 이름을 입력해 주세요.', 'rsvName');
    if (name.length > 40) return bad('환자 이름은 40자 이하로 입력해 주세요.', 'rsvName');
    if (chart.length > 30) return bad('차트번호는 30자 이하로 입력해 주세요.', 'rsvChart');
    if (cs && !course) return bad('코스 형식이 올바르지 않습니다. 영문·숫자로 입력해 주세요 (예: C10, J15+C5).', 'rsvCourse');
    if (kind === '자보') {
      if (rs) { if (!/^\d{1,3}$/.test(rs) || parseInt(rs, 10) < 1) return bad('자보 회차는 1~999 사이의 숫자로 입력해 주세요.', 'rsvRound'); round = parseInt(rs, 10); }
      if (ie) { if (!isFinite(rsvAt(ie, 0))) return bad('자보 기간끝 날짜를 확인해 주세요.', 'rsvInsEnd'); iend = ie; }
    }
    if (memo.length > 500) return bad('메모는 500자 이하로 입력해 주세요.', 'rsvMemo');
    if (RSV_STATUS.indexOf(status) < 0) status = '예약';
    data = { therapist_id: th, patient_name: name, chart_no: chart || null, start_at: rsvIso(date, s), end_at: rsvIso(date, s + len), status: status, ins_kind: kind, ins_round: round, ins_end: iend, course: course || null, memo: memo || null };
    return { data: data, cand: { id: ctx.id || undefined, therapist_id: th, patient_name: name, chart_no: chart || null, start_at: data.start_at, end_at: data.end_at, status: status, ins_kind: kind, ins_end: iend } };
  }
  function rsvItemSheet(o) {   // 새 예약({ date, th, min, len }) 또는 수정({ item }) 창
    var R = S.rsv, it = o.item || null, isEdit = !!it, d = isEdit ? null : rsvDefaults(o), m, ctx, courses = [];
    (Array.isArray(R.settings.courses) ? R.settings.courses : RSV_DEFAULTS.courses).forEach(function (c) { var n = rsvNormCourse(c); if (n && courses.indexOf(n) < 0) courses.push(n); });
    m = sheet(isEdit ? '예약 수정' : '새 예약', rsvSheetBody(isEdit, rsvThChoices(isEdit ? it.therapist_id : ''), courses));
    ctx = { el: m, isEdit: isEdit, id: isEdit ? it.id : '', ver: isEdit ? it.version : 0, base: isEdit ? rsvBefore(it) : null, cid: isEdit ? '' : rsvUuid(), courses: courses,
      busy: false, gone: false, warnEl: null, seq: 0, deb: null, sug: {}, auto: { ins: false, course: false } };
    R.open = { kind: isEdit ? 'edit' : 'new', id: ctx.id, el: m, ctx: ctx };
    rsvFormSet(ctx, isEdit ? rsvFromRow(it) : { th: d.th, date: d.date, start: rsvHm(d.min), len: d.len, name: '', chart: '', ins: '일반', round: '', end: '', course: '', status: '예약', memo: '' });
    m.addEventListener('click', function (e) {
      var t = e.target, b;
      if (!t || !t.closest) return;
      if ((b = t.closest('#rsvTh [data-th]'))) { rsvPress($('#rsvTh', m), 'data-th', b.getAttribute('data-th')); return; }
      if ((b = t.closest('#rsvLen [data-len]'))) { $('#rsvLenN', m).value = b.getAttribute('data-len'); rsvFormSync(ctx); return; }
      if ((b = t.closest('#rsvIns [data-ins]'))) { ctx.auto.ins = false; rsvPress($('#rsvIns', m), 'data-ins', b.getAttribute('data-ins')); rsvFormSync(ctx); return; }
      if ((b = t.closest('#rsvSt [data-st]'))) { rsvPress($('#rsvSt', m), 'data-st', b.getAttribute('data-st')); return; }
      if ((b = t.closest('#rsvCourses [data-course]'))) { ctx.auto.course = false; $('#rsvCourse', m).value = b.getAttribute('aria-pressed') === 'true' ? '' : b.getAttribute('data-course'); rsvFormSync(ctx); return; }
      if ((b = t.closest('.rsv-sug-i'))) { rsvPick(ctx, b.getAttribute('data-pid')); return; }
      if (t.closest('#rsvQuickGo')) { rsvQuickApply(ctx); return; }
      if (t.closest('#rsvReload')) { rsvReloadForm(ctx); return; }
      if (t.closest('#rsvSave')) { rsvSaveClick(ctx); }
    });
    function onInput(e) {
      var id = e.target && e.target.id;
      if (id === 'rsvName') rsvSuggest(ctx);
      else if (id === 'rsvLenN' || id === 'rsvStart') rsvFormSync(ctx);
      else if (id === 'rsvCourse') { ctx.auto.course = false; rsvFormSync(ctx); }
      else if (id === 'rsvRound' || id === 'rsvInsEnd') ctx.auto.ins = false;
    }
    m.addEventListener('input', onInput); m.addEventListener('change', onInput);
    m.addEventListener('keydown', function (e) {
      var t = e.target;
      if (e.key === 'Enter' && t && t.id === 'rsvQuick' && !e.isComposing) { e.preventDefault(); rsvQuickApply(ctx); return; }
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && t && (t.id === 'rsvName' || (t.classList && t.classList.contains('rsv-sug-i')))) rsvSugMove(ctx, t, e.key === 'ArrowDown' ? 1 : -1, e);
    });
    return ctx;
  }
  /* 빠른 입력: "홍길동 자보도수-5회(12.04기간끝)" 같은 한 줄을 칸별 값으로 풀어 채움 (저장은 하지 않음 · 이 칸들은 통째로 바꿈) */
  function rsvQuickApply(ctx) {
    var R = S.rsv, m = ctx.el, txt = $('#rsvQuick', m) ? $('#rsvQuick', m).value : '', hint = $('#rsvQuickHint', m), p, parts = [], fl;
    if (!rsvTrim(txt)) { if (hint) hint.textContent = ''; return; }
    p = rsvParseTitle(txt, { refYmd: rsvVal(m, '#rsvDate'), courses: R.settings.courses });
    $('#rsvName', m).value = p.name; $('#rsvCourse', m).value = p.course; $('#rsvMemo', m).value = p.memo;
    rsvPress($('#rsvSt', m), 'data-st', p.status); rsvPress($('#rsvIns', m), 'data-ins', p.ins_kind);
    $('#rsvRound', m).value = p.ins_round ? String(p.ins_round) : ''; $('#rsvInsEnd', m).value = p.ins_end || '';
    ctx.auto.ins = false; ctx.auto.course = false; clearTimeout(ctx.deb); ctx.seq++; rsvSugShow(ctx, []);
    rsvFormSync(ctx);
    fl = p.flags || [];
    parts.push(p.name ? '이름 ' + p.name : '이름을 찾지 못했습니다');
    if (p.course) parts.push('코스 ' + p.course + (fl.indexOf('unlisted') > -1 ? ' (목록에 없는 코스)' : ''));
    if (p.ins_kind === '자보') parts.push('자보' + (p.ins_round ? ' ' + p.ins_round + '회차' : '') + (p.ins_end ? ' · 기간끝 ' + rsvMD(p.ins_end) : ''));
    if (p.status === '킵') parts.push('킵');
    if (p.memo) parts.push('메모 ' + p.memo);
    if (fl.indexOf('longname') > -1) parts.push('이름이 깁니다(12자 넘음)');
    if (fl.indexOf('oddname') > -1) parts.push('이름에 이상한 글자가 있습니다');
    if (fl.indexOf('baddate') > -1) parts.push('기간끝 날짜를 읽지 못했습니다');
    if (hint) hint.textContent = parts.join(' · ');
  }
  /* 환자 이름 자동완성: 글자를 치다 잠깐 멈추면 환자 목록에서 찾고, 그 환자들의 마지막 예약(취소·노쇼 제외)을 함께 보여 줌.
     늦게 도착한 옛 질문의 답이나 창이 닫힌 뒤의 답은 버림 (질문마다 번호를 매겨 가장 나중 것만 씀) */
  function rsvLike(s) { return s.replace(/[\\%_]/g, '\\$&'); }
  function rsvSuggest(ctx) {
    var m = ctx.el, q = rsvVal(m, '#rsvName'), seq = ++ctx.seq;
    clearTimeout(ctx.deb);
    if (!q) { rsvSugShow(ctx, []); return; }
    ctx.deb = setTimeout(function () {
      if (seq !== ctx.seq || !document.body.contains(m)) return;
      sb.from('rsv_patients').select('*').ilike('name', '%' + rsvLike(q) + '%').order('name', { ascending: true }).limit(8).then(function (r) {
        var ps, ids;
        if (seq !== ctx.seq || !document.body.contains(m)) return;
        ps = (!r.error && r.data) || [];
        if (!ps.length) { rsvSugShow(ctx, []); return; }
        ids = ps.map(function (p) { return p.id; });
        sb.from('rsv_items').select('*').in('patient_id', ids).is('deleted_at', null).order('start_at', { ascending: false }).limit(200).then(function (r2) {
          var last = {}, known = !r2.error;
          if (seq !== ctx.seq || !document.body.contains(m)) return;
          ((known && r2.data) || []).forEach(function (x) { if (x.status !== '취소' && x.status !== '노쇼' && !last[x.patient_id]) last[x.patient_id] = x; });
          rsvSugShow(ctx, ps.map(function (p) { return { p: p, last: known ? (last[p.id] || null) : false }; }));
        }, function () { if (seq === ctx.seq && document.body.contains(m)) rsvSugShow(ctx, ps.map(function (p) { return { p: p, last: false }; })); });
      }, function () { if (seq === ctx.seq && document.body.contains(m)) rsvSugShow(ctx, []); });
    }, 250);
  }
  function rsvSugShow(ctx, list) {
    var box = $('#rsvSug', ctx.el);
    if (!box) return;
    ctx.sug = {};
    if (!list.length) { box.innerHTML = ''; box.hidden = true; return; }
    box.innerHTML = list.map(function (x) {
      var l = x.last, info = l ? '마지막 ' + (rsvKst(l.start_at) ? rsvMD(rsvKst(l.start_at).ymd) : '') + ' · ' + (l.ins_kind === '자보' ? '자보' + (l.ins_round ? ' ' + l.ins_round + '회차' : '') : '일반') + (l.course ? ' · ' + l.course : '') : (l === null ? '이전 예약 없음' : '');
      ctx.sug[x.p.id] = x;
      return '<button type="button" class="rsv-sug-i" role="option" data-pid="' + esc(x.p.id) + '"><span class="rsv-sug-n">' + esc(x.p.name) + '</span>' + (x.p.chart_no ? '<span class="rsv-sug-c">' + esc(x.p.chart_no) + '</span>' : '') + (info ? '<span class="rsv-sug-l">' + esc(info) + '</span>' : '') + '</button>';
    }).join('');
    box.hidden = false;
  }
  function rsvSugMove(ctx, t, dir, e) {   // ↑ ↓ 로 목록 위를 오감
    var L = $$('.rsv-sug-i', ctx.el), n;
    if (!L.length) return;
    n = t.id === 'rsvName' ? (dir > 0 ? 0 : -1) : L.indexOf(t) + dir;
    e.preventDefault();
    if (n < 0) rsvFocusEl($('#rsvName', ctx.el)); else if (n < L.length) rsvFocusEl(L[n]);
  }
  function rsvPick(ctx, pid) {   // 목록에서 환자를 고름 → 이름·차트번호 + 마지막 예약 기준 구분·회차(+1)·기간끝·코스
    var m = ctx.el, x = ctx.sug[pid], l, kind, round;
    if (!x) return;
    clearTimeout(ctx.deb); ctx.seq++;
    $('#rsvName', m).value = x.p.name; $('#rsvChart', m).value = x.p.chart_no || '';
    l = x.last;
    if (l) {
      kind = l.ins_kind === '자보' ? '자보' : '일반';
      round = (kind === '자보' && l.ins_round >= 1) ? Math.min(999, l.ins_round + 1) : '';
      rsvPress($('#rsvIns', m), 'data-ins', kind);
      $('#rsvRound', m).value = round === '' ? '' : String(round); $('#rsvInsEnd', m).value = kind === '자보' ? (l.ins_end || '') : '';
      ctx.auto.ins = true;
      if (!rsvVal(m, '#rsvCourse') || ctx.auto.course) { $('#rsvCourse', m).value = l.course || ''; ctx.auto.course = !!l.course; }
    } else {   // 이전 예약이 없으면: 앞 환자를 골라 자동으로 채웠던 값만 되돌림 (내가 직접 고른 값은 그대로)
      if (ctx.auto.ins) { rsvPress($('#rsvIns', m), 'data-ins', '일반'); $('#rsvRound', m).value = ''; $('#rsvInsEnd', m).value = ''; ctx.auto.ins = false; }
      if (ctx.auto.course) { $('#rsvCourse', m).value = ''; ctx.auto.course = false; }
    }
    rsvSugShow(ctx, []);
    rsvFormSync(ctx);
  }
  /* 저장 전 경고 */
  function rsvWarnList(cand) {   // → Promise<경고 목록>. 받아 둔 기간 안의 날짜는 가진 내용으로, 밖이면 그 날만 서버에서 따로 받아 확인
    var R = S.rsv, k = rsvKst(cand.start_at), a, z, c0 = { items: R.items, blocks: R.blocks, settings: R.settings, therapists: R.ther }, unchecked;
    if (!k) return Promise.resolve([]);
    a = rsvAt(k.ymd, 0); z = rsvAt(rsvAddDays(k.ymd, 1), 0);
    if (R.loaded && R.win && R.win.from <= a && z <= R.win.to) return Promise.resolve(rsvWarnings(cand, c0));
    unchecked = { code: 'unchecked', text: '그 날짜의 기존 예약을 확인하지 못했습니다 (인터넷 연결을 확인해 주세요). 겹침 여부는 확인되지 않았습니다.', refs: [] };
    function day(q) { return q.is('deleted_at', null).lt('start_at', rsvIso(rsvAddDays(k.ymd, 1), 0)).gt('end_at', rsvIso(k.ymd, 0)).limit(1000); }
    return Promise.all([day(sb.from('rsv_items').select('*')), day(sb.from('rsv_blocks').select('*'))]).then(function (r) {
      if (r[0].error || r[1].error) return rsvWarnings(cand, c0).concat([unchecked]);
      return rsvWarnings(cand, { items: r[0].data || [], blocks: r[1].data || [], settings: R.settings, therapists: R.ther });
    }, function () { return rsvWarnings(cand, c0).concat([unchecked]); });
  }
  function rsvConfirmWarn(ctx, list, onOk, o) {   // 확인창: 돌아가기(기본 · Esc 도 같음) / 그래도 저장·이동. ctx 가 없으면(끌어서 옮길 때) 저장 창 관련 처리는 건너뜀
    var op = o || {}, w = sheet(op.title || '저장 전 확인', '<p class="muted small">' + esc(op.note || '아래 내용을 확인해 주세요. 그래도 저장할 수 있습니다.') + '</p><ul class="rsv-warns">' +
      list.map(function (x) { return '<li data-code="' + esc(x.code) + '">' + esc(x.text) + '</li>'; }).join('') +
      '</ul><div class="sheet-actions"><button type="button" class="btn btn-line" id="rsvWarnBack">돌아가기</button><button type="button" class="btn btn-navy" id="rsvWarnOk">' + esc(op.ok || '그래도 저장') + '</button></div>');
    if (ctx) ctx.warnEl = w;
    function onClick(e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest('#rsvWarnOk')) { closeSheet(w); onOk(); }
      else if (t.closest('#rsvWarnBack')) { closeSheet(w); if (ctx) rsvFocusEl($('#rsvSave', ctx.el)); }
    }
    w.addEventListener('click', onClick);
    rsvFocusEl($('#rsvWarnBack', w));   // Esc 가 이 확인창만 닫도록 포커스를 안으로 (아래 창이 아니라)
  }
  function rsvSaveClick(ctx) {
    var R = S.rsv, m = ctx.el, btn = $('#rsvSave', m), r;
    if (!R || ctx.busy || ctx.gone || (ctx.warnEl && document.body.contains(ctx.warnEl))) return;
    r = rsvFormRead(ctx);
    if (r.err) { rsvSetErr(m, r.err); rsvFocusId(m, r.f); return; }
    rsvSetErr(m, '');
    ctx.busy = true; if (btn) btn.disabled = true;
    rsvWarnList(r.cand).then(function (list) {
      ctx.busy = false; if (btn) btn.disabled = ctx.gone;
      if (S.rsv !== R || !document.body.contains(m)) return;
      if (!list.length) rsvDoSave(ctx, r.data);
      else rsvConfirmWarn(ctx, list, function () { rsvDoSave(ctx, r.data); });
    });
  }
  function rsvDoSave(ctx, data) {
    var R = S.rsv, m = ctx.el, btn = $('#rsvSave', m), p = {}, k;
    for (k in data) { if (Object.prototype.hasOwnProperty.call(data, k)) p[k] = data[k]; }
    if (ctx.isEdit) { p.id = ctx.id; p.version = ctx.ver; } else p.client_id = ctx.cid;
    ctx.busy = true; if (btn) btn.disabled = true; rsvSetErr(m, '');
    sb.rpc('rsv_item_save', { p_data: p }).then(function (r) { return r; }, function (e) { return { data: null, error: e }; }).then(function (r) {
      var row;
      ctx.busy = false; if (btn) btn.disabled = ctx.gone;
      if (S.rsv !== R) return;
      if (r.error) { rsvSaveFailed(ctx, r.error); return; }
      row = rsvOne(r.data);
      if (!row || !row.id) { rsvSetErr(m, '저장 결과를 확인하지 못했습니다. 화면을 새로 고쳐 확인해 주세요.'); rsvLoad(); return; }
      rsvSaved(ctx, row);
    });
  }
  function rsvSaved(ctx, row) {
    var R = S.rsv, m = ctx.el, same = ctx.isEdit && row.version === ctx.ver, sp = rsvSpan(row), md = sp ? rsvMD(sp.ymd) : '', outside = !!sp && rsvRange(R.view, R.date, R.settings.week_start).days.indexOf(sp.ymd) < 0;
    if (R.open && R.open.el === m) R.open = null;
    closeSheet(m);
    if (same) { toast('바뀐 내용이 없습니다.'); return; }
    rsvPut(row);
    rsvPushUndo(R, ctx.isEdit ? { op: 'save', id: row.id, ver: row.version, before: ctx.base, after: row, label: row.patient_name + ' 예약 수정' } : { op: 'create', id: row.id, ver: row.version, label: row.patient_name + ' 예약 만들기' });
    toast(esc(row.patient_name) + ' 예약을 ' + (ctx.isEdit ? '수정했습니다' : '만들었습니다') + (sp ? ' (' + md + ' ' + rsvHm(sp.s) + ')' : '') + (outside ? ' · 눌러서 보기' : ''),
      outside ? function () { if (S.rsv === R && rsvShown()) rsvGo(R.view, sp.ymd, false); } : null);
  }
  function rsvSaveFailed(ctx, e) {
    var R = S.rsv, m = ctx.el;
    if (rsvIsConflict(e)) {   // 내가 본 버전이 낡음 → 안내하고 최신으로 다시 불러와 그 내용으로 창을 다시 엶
      toast(esc(rsvErrText(e)) + ' 최신 내용으로 다시 엽니다.');
      rsvLoad().then(function () {
        var cur;
        if (S.rsv !== R || !document.body.contains(m)) return;
        cur = R.items[ctx.id];
        if (R.open && R.open.el === m) R.open = null;
        closeSheet(m);
        if (cur) rsvItemSheet({ item: cur }); else toast('이 예약을 찾을 수 없습니다. 삭제되었거나 다른 날짜로 옮겨졌을 수 있습니다.');
      });
      return;
    }
    rsvSetErr(m, rsvErrText(e));
    rsvCheckOpen();
  }
  function rsvReloadForm(ctx) {   // 열어 둔 사이 다른 직원이 바꾼 내용으로 칸을 다시 채움
    var cur = S.rsv.items[ctx.id];
    if (!cur) return;
    ctx.ver = cur.version; ctx.base = rsvBefore(cur);
    rsvFormSet(ctx, rsvFromRow(cur));
    ctx.auto.ins = false; ctx.auto.course = false;   // 이제 칸의 값은 서버가 준 값 — 환자를 다시 고를 때 "자동으로 채웠던 값"으로 지우면 안 됨
    $('#rsvChanged', ctx.el).hidden = true; rsvSetErr(ctx.el, '');
  }
  function rsvUndoTitle(R) { var en = R.undo[R.undo.length - 1]; return en ? '되돌리기: ' + (en.label || '') + ' (Ctrl+Z)' : '되돌리기 (Ctrl+Z)'; }   // 단추 이름표: 무엇을 되돌리는지
  function rsvUndoSync(R) { var b = $('#rsvUndo'); if (!b) return; b.disabled = !R.undo.length; b.title = rsvUndoTitle(R); }
  function rsvPushUndo(R, en) { R.undo.push(en); while (R.undo.length > 20) R.undo.shift(); rsvUndoSync(R); }
  /* 되돌리기: 맨 위 동작 하나를 거꾸로 하는 서버 호출. 서버가 받아들인 뒤에만 화면에 반영 · 연타해도 1번 · 그 예약이 처리 중이면 미룸.
     같은 예약을 연달아 되돌려도 서버 버전이 어긋나지 않게 아래 동작의 기대 버전을 이어 달음(rsvUndoRebase). 되돌림도 서버 기록에 남음 */
  function rsvUndo() {
    var R = S.rsv, en, u, id;
    if (!R || R.undoing) return;
    if (!R.undo.length) { toast('되돌릴 내용이 없습니다.'); return; }
    en = R.undo[R.undo.length - 1]; id = en.id;
    if (R.busy[id]) { toast('이 예약을 처리하는 중입니다. 잠시 뒤에 다시 눌러 주세요.'); return; }
    u = rsvUndoOf(en);
    if (!u) { R.undo.pop(); rsvUndoSync(R); toast('이 동작은 되돌릴 수 없어 목록에서 뺐습니다.'); return; }
    R.undoing = true; R.busy[id] = true; if (rsvShown()) rsvRender();
    sb.rpc(u.rpc, u.args).then(function (r) { return r; }, function (e) { return { data: null, error: e }; }).then(function (r) {
      var row, i, sp, outside;
      delete R.busy[id]; R.undoing = false;
      if (S.rsv !== R) return;   // 그 사이 로그아웃·다른 사람 로그인: 이 결과를 새 화면에 쓰지 않음
      i = R.undo.lastIndexOf(en);
      if (r.error) { rsvUndoFailed(R, en, i, r.error); return; }
      row = rsvOne(r.data);
      if (i >= 0) { if (row && row.id) rsvUndoRebase(R.undo, i, row.version); R.undo.splice(i, 1); }
      rsvUndoSync(R);
      if (!row || !row.id) { toast('되돌린 결과를 확인하지 못했습니다. 화면을 확인해 주세요.'); rsvLoad(); if (rsvShown()) rsvRender(); return; }
      rsvPut(row);
      sp = row.deleted_at ? null : rsvSpan(row);
      outside = !!sp && rsvRange(R.view, R.date, R.settings.week_start).days.indexOf(sp.ymd) < 0;
      toast('되돌렸습니다: ' + esc(en.label || '') + (outside ? ' · 눌러서 보기' : ''), outside ? function () { if (S.rsv === R && rsvShown()) rsvGo(R.view, sp.ymd, false); } : null);
    });
  }
  function rsvUndoFailed(R, en, i, e) {
    var lab = esc(en.label || '');
    if (rsvIsConflict(e)) { if (i >= 0) R.undo.splice(i, 1); toast(lab + ': 다른 직원이 이미 바꿨습니다 (되돌리지 않음)'); rsvLoad(); }   // 덮어쓰지 않음 · 이 항목은 빼고 최신 내용을 다시 받음
    else if (e && e.code) { if (i >= 0) R.undo.splice(i, 1); toast(lab + ': ' + esc(rsvErrText(e)) + ' (되돌리지 않음)'); }                    // 서버가 이유를 대고 거절 → 다시 해도 같으므로 뺌
    else toast('되돌리지 못했습니다. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.');                                                              // 서버에 닿지 못함 → 목록에 남겨 다시 누르면 되도록
    rsvUndoSync(R); if (rsvShown()) rsvRender();
  }
  function rsvPut(row) {   // 서버가 돌려준 최신 모습을 화면에 반영 (더 새 버전이 이미 있으면 그대로 둠)
    var R = S.rsv, cur;
    if (!R || !row || !row.id) return;
    if (row.deleted_at) delete R.items[row.id];
    else { cur = R.items[row.id]; if (!(cur && typeof cur.version === 'number' && typeof row.version === 'number' && cur.version > row.version)) R.items[row.id] = row; }
    if (rsvShown()) rsvRender();
    rsvCheckOpen();
  }
  /* 상세 창 · 상태 · 삭제 */
  function rsvDetailFill(m, it) {
    var th = rsvTher(it.therapist_id), sp = rsvSpan(it), p = sp ? rsvParts(sp.ymd) : null, h = '', t;
    h += '<h3 class="rsv-det-n">' + esc(it.patient_name || '(이름 없음)') + (it.course ? ' <span class="rsv-det-c">' + esc(it.course) + '</span>' : '') + '</h3>';
    if (sp) h += '<p class="rsv-det-t">' + esc(p.m + '/' + p.d + ' (' + RSV_DOWN[p.dow] + ') ' + rsvHm(sp.s) + '–' + rsvHm(sp.e > 1440 ? sp.e - 1440 : sp.e) + ' · ' + (sp.e - sp.s) + '분') + '</p>';
    h += '<p class="rsv-det-th"><span class="rsv-dot" style="background:' + rsvColor(th && th.color) + '"></span>' + esc(th ? th.name : '(알 수 없음)') + '</p>';
    if (it.chart_no) h += '<p class="rsv-det-r"><span class="muted">차트번호</span> ' + esc(it.chart_no) + '</p>';
    if (it.ins_kind === '자보') h += '<p class="rsv-det-r">' + esc('자보' + (it.ins_round ? ' ' + it.ins_round + '회차' : '') + (it.ins_end ? ' · 기간끝 ' + rsvMD(it.ins_end) : '')) + '</p>';
    if (it.memo) h += '<p class="rsv-det-m">' + esc(it.memo) + '</p>';
    t = $('#rsvDet', m); if (t) t.innerHTML = h;
    rsvPress($('#rsvDetSt', m), 'data-st', it.status);
  }
  function rsvDetailSheet(id) {
    var R = S.rsv, it = R && R.items[id], m;
    if (!it) return;
    m = sheet('예약 상세', '<div class="rsv-det" id="rsvDet"></div><div class="field"><label id="rsvDetL">상태</label><div class="seg sm rsv-detst" id="rsvDetSt" role="group" aria-labelledby="rsvDetL">' +
      RSV_STATUS.map(function (s) { return '<button type="button" data-st="' + s + '" aria-pressed="false">' + s + '</button>'; }).join('') +
      '</div></div><p class="err" id="rsvErr" role="alert"></p><div class="sheet-actions"><button type="button" class="btn btn-danger" id="rsvDel">삭제</button><button type="button" class="btn btn-line" id="rsvDetHist">기록</button><button type="button" class="btn btn-navy" id="rsvEdit">수정</button></div>');
    R.open = { kind: 'detail', id: id, el: m, ctx: null };
    rsvDetailFill(m, it);
    m.addEventListener('click', function (e) {
      var t = e.target, b, cur;
      if (!t || !t.closest) return;
      if ((b = t.closest('#rsvDetSt [data-st]'))) { rsvSetStatus(id, b.getAttribute('data-st')); return; }
      if (t.closest('#rsvDetHist')) { rsvHistorySheet(id); return; }
      if (t.closest('#rsvEdit')) { cur = R.items[id]; if (!cur) return; if (R.open && R.open.el === m) R.open = null; closeSheet(m); rsvItemSheet({ item: cur }); return; }
      if ((b = t.closest('#rsvDel'))) { if (!confirmInline(b, '한 번 더 누르면 삭제됩니다')) return; rsvDeleteItem(id); }
    });
  }
  function rsvFail(R, e) {   // 상태·삭제가 거절·실패했을 때: 이유 안내 (내가 본 버전이 낡았으면 최신으로 다시 불러옴)
    if (rsvIsConflict(e)) { toast(esc(rsvErrText(e)) + ' 최신 내용으로 다시 불러옵니다.'); rsvLoad(); return; }
    toast(esc(rsvErrText(e)));
  }
  function rsvSetStatus(id, st) {
    var R = S.rsv, it = R && R.items[id], before;
    if (!it || R.busy[id] || it.status === st || RSV_STATUS.indexOf(st) < 0) return;
    R.busy[id] = true; before = rsvBefore(it);
    sb.rpc('rsv_item_status', { p_id: id, p_status: st, p_version: it.version }).then(function (r) { return r; }, function (e) { return { data: null, error: e }; }).then(function (r) {
      var row;
      delete R.busy[id];
      if (S.rsv !== R) return;
      if (r.error) { rsvFail(R, r.error); return; }
      row = rsvOne(r.data);
      if (!row || !row.id) { rsvLoad(); return; }
      if (row.version !== it.version) rsvPushUndo(R, { op: 'status', id: id, ver: row.version, before: before, after: row, label: (row.patient_name || '') + ' 상태 ' + st });
      rsvPut(row);
    });
  }
  function rsvToggleOk(btn) {   // ✓ 단추: 내원 ↔ 예약
    var ev = btn.closest('.rsv-ev'), id = ev && ev.getAttribute('data-id'), it = id && S.rsv.items[id];
    if (it) rsvSetStatus(id, it.status === '내원' ? '예약' : '내원');
  }
  function rsvDeleteItem(id) {
    var R = S.rsv, it = R && R.items[id];
    if (!it || R.busy[id]) return;
    R.busy[id] = true;
    sb.rpc('rsv_item_delete', { p_id: id, p_version: it.version }).then(function (r) { return r; }, function (e) { return { data: null, error: e }; }).then(function (r) {
      var row;
      delete R.busy[id];
      if (S.rsv !== R) return;
      if (r.error) { rsvFail(R, r.error); return; }
      row = rsvOne(r.data);
      if (R.open && R.open.id === id) { closeSheet(R.open.el); R.open = null; }
      rsvPushUndo(R, { op: 'delete', id: id, ver: row && row.version, label: (it.patient_name || '') + ' 예약 삭제' });
      if (row && row.id) rsvPut(row); else { delete R.items[id]; if (rsvShown()) rsvRender(); }
      toast('예약을 삭제했습니다. 30일 안에는 휴지통에서 되살릴 수 있습니다.');
    });
  }
  /* 열어 둔 창과 실시간 변경: 상세는 바로 새 내용으로 · 수정 창은 "바뀜" 표시(내가 쓰던 칸은 건드리지 않음) · 지워졌으면 알림 */
  function rsvCheckOpen() {
    var R = S.rsv, o = R && R.open, cur, bn, tx, rl, sv;
    if (!o) return;
    if (!o.el || !document.body.contains(o.el)) { R.open = null; return; }
    if (o.kind === 'new') return;
    cur = R.items[o.id];
    if (o.kind === 'detail') {
      if (!cur) { closeSheet(o.el); R.open = null; toast('이 예약이 삭제되었거나 다른 날짜로 옮겨졌습니다.'); return; }
      rsvDetailFill(o.el, cur);
      return;
    }
    if (o.ctx.busy) return;   // 내 저장이 오가는 중 되돌아온 알림은 곧 결과가 정리하므로 표시하지 않음
    bn = $('#rsvChanged', o.el); tx = $('#rsvChangedT', o.el); rl = $('#rsvReload', o.el); sv = $('#rsvSave', o.el);
    if (!cur) {
      o.ctx.gone = true; tx.textContent = '이 예약이 삭제되었거나 다른 날짜로 옮겨졌습니다. 더 이상 저장할 수 없습니다.'; rl.hidden = true; sv.disabled = true; bn.hidden = false;
    } else if (cur.version !== o.ctx.ver) {
      tx.textContent = '이 예약이 다른 직원에 의해 바뀌었습니다. 아래는 바뀌기 전 모습입니다.'; rl.hidden = false; bn.hidden = false;
    }
  }
  /* 달력에서: 빈 칸을 누르면 그 자리(이동 단위로 내림)의 새 예약 · 예약 블록에서 Enter/Space 면 상세 */
  function rsvBlankClick(col, e) {
    var R = S.rsv, g = col.closest('.rsv-grid'), date = col.getAttribute('data-date'), vs = g ? parseInt(g.getAttribute('data-vs'), 10) : NaN, ve = g ? parseInt(g.getAttribute('data-ve'), 10) : NaN,
      unit = R.settings.snap, y, min;
    if (!isFinite(rsvAt(date, 0))) return;
    if (isFinite(vs) && isFinite(ve) && typeof e.clientY === 'number') {
      y = e.clientY - col.getBoundingClientRect().top;
      if (y === y) {
        min = vs + Math.round(y / RSV_PXM * 100) / 100;   // 소수 오차로 정각이 한 칸 밀리지 않게 두 자리에서 반올림한 뒤 내림
        if (min < vs) min = vs; if (min > ve - 1) min = ve - 1;
        min = rsvSnap(min, typeof unit === 'number' && unit > 0 ? unit : 15, 'floor');
      }
    }
    rsvItemSheet({ date: date, th: col.getAttribute('data-th') || '', min: min });
  }
  function rsvBodyKey(e) {
    var t = e.target, ev;
    if (!t || !t.closest || e.defaultPrevented || e.isComposing || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    if (t.closest('[data-rsv-ok]')) return;   // ✓ 단추는 자기 동작대로
    ev = t.closest('.rsv-ev');
    if (!ev) {
      ev = t.closest('.rsv-blk'); if (!ev || !S.rsv) return;
      e.preventDefault(); ev = S.rsv.blocks[ev.getAttribute('data-bid')]; if (ev) rsvBlockSheet({ block: ev });
      return;
    }
    e.preventDefault(); rsvDetailSheet(ev.getAttribute('data-id'));
  }

  /* ================= 예약 (v48 7단계): ⋯ 메뉴 · 휴무·마감 · 변경 기록 · 휴지통 · 설정 =================
     · ⋯ 메뉴("예약 메뉴" 창): 휴무·마감 추가 · 변경 기록 · 휴지통 · (내 계정에 치료사가 연결돼 있으면) 내 예약만 보기 · (관리자만) 설정
     · 휴무·마감: 대상(병원 전체 / 치료사 한 명) · 종일(시작~끝 날짜, 끝 날짜 포함) 또는 시간 지정 · 이유(40자). 달력의 블록을 누르면 수정·삭제 창.
       서버가 받아들인 뒤에만 화면에 반영 · 새로 만들 때 client_id 를 한 번만 만들어 실패 뒤 다시 눌러도 한 건 · 서버가 거절하면 이유를 창 안에 */
  function rsvMine(R) { var i; if (!S.me) return null; for (i = 0; i < R.ther.length; i++) { if (R.ther[i].profile_id && R.ther[i].profile_id === S.me.id) return R.ther[i]; } return null; }   // 내 계정에 연결된 치료사
  function rsvMineOn(R, mine) { return R.ther.every(function (t) { return t.id === mine.id ? rsvOn(t.id) : !rsvOn(t.id); }); }                                                                  // 지금 "내 치료사만" 켜져 있나
  function rsvMineToggle() {
    var R = S.rsv, mine = R && rsvMine(R), f = {};
    if (!mine) return;
    if (!rsvMineOn(R, mine)) R.ther.forEach(function (t) { if (t.id !== mine.id) f[t.id] = false; });
    R.filters.ther = f; if (rsvShown()) rsvRender();
  }
  function rsvMoreMenu() {
    var R = S.rsv, mine = R && rsvMine(R), on = !!mine && rsvMineOn(R, mine), m, h;
    if (!R) return;
    h = '<div class="rsv-menu" role="menu"><button type="button" role="menuitem" id="rsvMBlock" data-m="block">휴무·마감 추가</button><button type="button" role="menuitem" id="rsvMHist" data-m="hist">변경 기록</button>' +
      '<button type="button" role="menuitem" id="rsvMTrash" data-m="trash">휴지통</button>' +
      (mine ? '<button type="button" role="menuitem" id="rsvMMine" data-m="mine">' + (on ? '모든 치료사 보기' : '내 예약만 보기') + '</button>' : '') +
      (S.me && S.me.role === 'admin' ? '<button type="button" role="menuitem" id="rsvMSet" data-m="set">설정</button>' : '') + '</div>';
    m = sheet('예약 메뉴', h);
    m.addEventListener('click', function (e) {
      var b = e.target && e.target.closest && e.target.closest('.rsv-menu [data-m]'), k;
      if (!b) return;
      k = b.getAttribute('data-m'); closeSheet(m);
      if (k === 'block') rsvBlockSheet({}); else if (k === 'hist') rsvHistorySheet(); else if (k === 'trash') rsvTrashSheet(); else if (k === 'mine') rsvMineToggle(); else if (k === 'set') rsvSettingsSheet();
    });
    rsvFocusEl($('#rsvMBlock', m));
  }
  /* 휴무·마감 */
  function rsvPutBlock(row) {   // 서버가 돌려준 블록을 화면에 반영 (지워진 것이면 뺌)
    var R = S.rsv;
    if (!R || !row || !row.id) return;
    if (row.deleted_at) delete R.blocks[row.id]; else R.blocks[row.id] = row;
    if (rsvShown()) rsvRender();
  }
  function rsvBlockBody(isEdit, thList) {
    var h = '<div class="rsv-form"><div class="field"><label id="rsvBThL">대상</label><div class="seg sm" id="rsvBTh" role="group" aria-labelledby="rsvBThL"><button type="button" data-th="" aria-pressed="false">병원 전체</button>' +
      thList.map(function (t) { return '<button type="button" data-th="' + esc(t.id) + '" aria-pressed="false"><span class="rsv-dot" style="background:' + rsvColor(t.color) + '"></span>' + esc(t.name) + '</button>'; }).join('') + '</div></div>';
    h += '<div class="field"><label id="rsvBKL">시간</label><div class="seg sm" id="rsvBK" role="group" aria-labelledby="rsvBKL"><button type="button" data-k="all" aria-pressed="false">종일</button><button type="button" data-k="time" aria-pressed="false">시간 지정</button></div></div>';
    h += '<div class="row2"><div class="field"><label for="rsvBD1">시작 날짜</label><input class="input" type="date" id="rsvBD1"></div><div class="field"><label for="rsvBD2">끝 날짜</label><input class="input" type="date" id="rsvBD2"></div></div>';
    h += '<div class="row2" id="rsvBTimes"><div class="field"><label for="rsvBT1">시작 시각</label><input class="input" type="time" id="rsvBT1"></div><div class="field"><label for="rsvBT2">끝 시각</label><input class="input" type="time" id="rsvBT2"></div></div>';
    h += '<div class="field"><label for="rsvBReason">이유 <span class="muted small">(선택)</span></label><input class="input" id="rsvBReason" maxlength="40" autocomplete="off" placeholder="예) 연차, 교육, 점심, 휴진"></div>';
    return h + '<p class="err" id="rsvErr" role="alert"></p><div class="sheet-actions">' + (isEdit ? '<button type="button" class="btn btn-danger" id="rsvBDel">삭제</button>' : '<button type="button" class="btn btn-line" data-close>취소</button>') + '<button type="button" class="btn btn-navy" id="rsvBSave">저장</button></div></div>';
  }
  function rsvBlockFrom(b, date) {   // 창에 채울 값: 있는 블록이면 그 값, 새 블록이면 처음 값 (끝 날짜는 "그 날 포함")
    var R = S.rsv, f = { th: '', kind: 'all', d1: date || '', d2: '', t1: '12:00', t2: '13:00', reason: '' }, a, z, today, rg;
    if (b) {
      a = rsvKst(b.start_at);
      if (a) {
        f.th = b.therapist_id || ''; f.reason = b.reason || ''; f.d1 = a.ymd;
        if (b.all_day === true) { z = rsvKst(rsvMs(b.end_at) - 60000); f.d2 = z ? z.ymd : a.ymd; }
        else { f.kind = 'time'; z = rsvKst(b.end_at); f.t1 = rsvHm(a.min); if (z) { f.d2 = z.ymd; f.t2 = rsvHm(z.min); } else f.d2 = a.ymd; }
        return f;
      }
    }
    if (!f.d1) { today = rsvToday(); rg = rsvRange(R.view, R.date, R.settings.week_start); f.d1 = rg.days.indexOf(today) > -1 ? today : R.date; }
    f.d2 = f.d1;
    return f;
  }
  function rsvBlockSync(m) { var t = $('#rsvBTimes', m); if (t) t.hidden = rsvPressed($('#rsvBK', m), 'data-k') !== 'time'; }
  function rsvBlockRead(m) {   // 창의 값을 검사해 서버로 보낼 모양으로 → { err, f, data }
    var th = rsvPressed($('#rsvBTh', m), 'data-th'), time = rsvPressed($('#rsvBK', m), 'data-k') === 'time', d1 = $('#rsvBD1', m).value, d2 = $('#rsvBD2', m).value, reason = rsvTrim($('#rsvBReason', m).value), t1, t2, s, e,
      okD = function (d) { return /^\d{4}-\d{2}-\d{2}$/.test(d) && isFinite(rsvAt(d, 0)); };
    if (!okD(d1)) return { err: '시작 날짜를 입력해 주세요.', f: 'rsvBD1' };
    if (!okD(d2)) return { err: '끝 날짜를 입력해 주세요.', f: 'rsvBD2' };
    if (d2 < d1) return { err: '끝 날짜는 시작 날짜보다 빠를 수 없습니다.', f: 'rsvBD2' };
    if (time) {
      t1 = rsvTimeMin($('#rsvBT1', m).value); t2 = rsvTimeMin($('#rsvBT2', m).value);
      if (typeof t1 !== 'number' || typeof t2 !== 'number') return { err: '시각을 입력해 주세요.', f: typeof t1 !== 'number' ? 'rsvBT1' : 'rsvBT2' };
      s = rsvAt(d1, t1); e = rsvAt(d2, t2);
      if (!(e > s)) return { err: '끝 시각은 시작 시각보다 늦어야 합니다.', f: 'rsvBT2' };
    } else { s = rsvAt(d1, 0); e = rsvAt(rsvAddDays(d2, 1), 0); }
    if (e - s > 31 * 86400000) return { err: '휴무·마감은 최대 31일까지 지정할 수 있습니다.', f: 'rsvBD2' };
    if (reason.length > 40) return { err: '이유는 40자 이하로 입력해 주세요.', f: 'rsvBReason' };
    return { err: '', f: '', data: { therapist_id: th || null, start_at: new Date(s).toISOString(), end_at: new Date(e).toISOString(), all_day: !time, reason: reason || null } };
  }
  function rsvBlockSheet(o) {   // 새 휴무·마감({ date }) 또는 수정({ block }) 창
    var R = S.rsv, b = o.block || null, isEdit = !!b, m, ctx, f;
    m = sheet(isEdit ? '휴무·마감 수정' : '휴무·마감 추가', rsvBlockBody(isEdit, rsvThChoices(isEdit ? (b.therapist_id || '') : '')));
    f = rsvBlockFrom(b, o.date);
    ctx = { el: m, id: isEdit ? b.id : '', cid: isEdit ? '' : rsvUuid(), busy: false, d1: f.d1 };
    rsvPress($('#rsvBTh', m), 'data-th', f.th); rsvPress($('#rsvBK', m), 'data-k', f.kind);
    $('#rsvBD1', m).value = f.d1; $('#rsvBD2', m).value = f.d2; $('#rsvBT1', m).value = f.t1; $('#rsvBT2', m).value = f.t2; $('#rsvBReason', m).value = f.reason;
    rsvBlockSync(m);
    m.addEventListener('click', function (e) {
      var t = e.target, x;
      if (!t || !t.closest) return;
      if ((x = t.closest('#rsvBTh [data-th]'))) { rsvPress($('#rsvBTh', m), 'data-th', x.getAttribute('data-th')); return; }
      if ((x = t.closest('#rsvBK [data-k]'))) { rsvPress($('#rsvBK', m), 'data-k', x.getAttribute('data-k')); rsvBlockSync(m); return; }
      if (t.closest('#rsvBSave')) { rsvBlockSave(R, ctx); return; }
      if ((x = t.closest('#rsvBDel'))) { if (!confirmInline(x, '한 번 더 누르면 삭제됩니다')) return; rsvBlockDelete(R, ctx); }
    });
    m.addEventListener('input', function (e) {
      var v;
      if (!e.target || e.target.id !== 'rsvBD1') return;
      v = e.target.value;   // 끝 날짜가 시작 날짜와 같았으면(하루짜리) 시작 날짜를 바꿀 때 따라감
      if (/^\d{4}-\d{2}-\d{2}$/.test(v) && $('#rsvBD2', m).value === ctx.d1) $('#rsvBD2', m).value = v;
      ctx.d1 = v;
    });
  }
  function rsvBlockSave(R, ctx) {
    var m = ctx.el, btn = $('#rsvBSave', m), r;
    if (S.rsv !== R || ctx.busy) return;
    r = rsvBlockRead(m);
    if (r.err) { rsvSetErr(m, r.err); rsvFocusId(m, r.f); return; }
    rsvSetErr(m, '');
    if (ctx.id) r.data.id = ctx.id; else r.data.client_id = ctx.cid;
    ctx.busy = true; if (btn) btn.disabled = true;
    sb.rpc('rsv_block_save', { p_data: r.data }).then(function (x) { return x; }, function (e) { return { data: null, error: e }; }).then(function (x) {
      var row;
      ctx.busy = false; if (btn) btn.disabled = false;
      if (S.rsv !== R) return;
      if (x.error) { rsvSetErr(m, rsvErrText(x.error)); return; }
      row = rsvOne(x.data);
      if (!row || !row.id) { rsvSetErr(m, '저장 결과를 확인하지 못했습니다. 화면을 새로 고쳐 확인해 주세요.'); rsvLoad(); return; }
      closeSheet(m); rsvPutBlock(row);
      toast(ctx.id ? '휴무·마감을 수정했습니다' : '휴무·마감을 추가했습니다');
    });
  }
  function rsvBlockDelete(R, ctx) {
    var m = ctx.el;
    if (S.rsv !== R || ctx.busy || !ctx.id) return;
    ctx.busy = true;
    sb.rpc('rsv_block_delete', { p_id: ctx.id }).then(function (x) { return x; }, function (e) { return { data: null, error: e }; }).then(function (x) {
      var row;
      ctx.busy = false;
      if (S.rsv !== R) return;
      if (x.error) { rsvSetErr(m, rsvErrText(x.error)); return; }
      row = rsvOne(x.data);
      closeSheet(m);
      if (row && row.id) rsvPutBlock(row); else { delete R.blocks[ctx.id]; if (rsvShown()) rsvRender(); }
      toast('휴무·마감을 삭제했습니다');
    });
  }

  /* 변경 기록 (⋯ → 변경 기록 · 예약 상세의 "기록"): 서버의 rsv_log 를 직접 읽음(읽기만 허용, 쓰기는 서버 함수가 알아서 남김).
     전체 = 최근 3개월 · 한 예약 = 그 예약의 전체 기록 · 100건씩 "더 보기"(받는 사이 새 기록이 끼어들어도 같은 번호는 한 번만) ·
     메모 글은 적지 않음(rsvLogText) · 치료사/직원 걸러 보기는 읽어 둔 기록 안에서만(서버에 다시 묻지 않음) */
  var RSV_LOG_PAGE = 100, RSV_LOG_DAYS = 92;
  function rsvWho(id) { var p; if (!id) return '시스템'; p = S.profiles && S.profiles[id]; return p && p.name ? p.name : '(알 수 없음)'; }   // 기록 · 휴지통의 "한 사람" (계정 없는 기록 = 시스템)
  function rsvStamp(at) { var k = rsvKst(at); return k ? rsvMD(k.ymd) + ' ' + rsvHm(k.min) : ''; }                                     // 한국 시각 11/24 09:12
  function rsvHistBody(item) {
    var h = '<div class="rsv-hist" id="rsvHist"><p class="muted small" id="rsvHNote">' + (item ? '이 예약의 변경 기록 · 최신순' : '최근 3개월 · 최신순') + '</p>';
    if (!item) {
      h += '<div class="row2 rsv-hf"><select class="input" id="rsvHTh" aria-label="치료사"><option value="">전체 치료사</option>' +
        S.rsv.ther.map(function (t) { return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>'; }).join('') + '</select>' +
        '<select class="input" id="rsvHWho" aria-label="직원"><option value="">전체 직원</option></select></div>';
    }
    return h + '<p class="muted small" id="rsvHCount" aria-live="polite"></p><p class="err" id="rsvErr" role="alert"></p><button type="button" class="btn btn-line sm" id="rsvHRetry" hidden>다시 시도</button>' +
      '<p class="muted" id="rsvHLoad">불러오는 중…</p><ul class="rsv-log" id="rsvHList" aria-label="변경 기록"></ul><p class="muted" id="rsvHEmpty" hidden></p>' +
      '<button type="button" class="btn btn-line rsv-more" id="rsvHMore" hidden>더 보기</button></div>';
  }
  function rsvHistRow(en) {
    var t = rsvLogText(en, S.rsv.ther);
    return '<li class="rsv-log-i" data-lid="' + esc(en.id) + '" data-act="' + esc(en.action) + '"><span class="rsv-log-h">' + esc(t.head) + '</span>' + (t.detail ? '<span class="rsv-log-d">' + esc(t.detail) + '</span>' : '') +
      '<span class="rsv-log-m">' + esc(rsvStamp(en.at)) + ' · ' + esc(rsvWho(en.actor)) + '</span></li>';
  }
  function rsvHistWho(ctx) {   // 직원 칸: 읽어 둔 기록에 나온 직원(가나다순). 고른 직원은 그대로 유지
    var sel = $('#rsvHWho', ctx.el), seen = {}, L = [], i, id;
    if (!sel) return;
    for (i = 0; i < ctx.rows.length; i++) {
      id = ctx.rows[i].actor;
      if (id && !seen[id] && S.profiles && S.profiles[id] && S.profiles[id].name) { seen[id] = true; L.push({ id: id, name: S.profiles[id].name }); }
    }
    L.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
    sel.innerHTML = '<option value="">전체 직원</option>' + L.map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.name) + '</option>'; }).join('');
    sel.value = ctx.who;
    if (sel.value !== ctx.who) ctx.who = sel.value;
  }
  function rsvHistShow(ctx) {
    var m = ctx.el, f = ctx.rows.filter(function (en) { return (!ctx.who || en.actor === ctx.who) && rsvLogHas(en, ctx.th); }), filt = !!(ctx.th || ctx.who), empty = $('#rsvHEmpty', m), more = $('#rsvHMore', m), retry = $('#rsvHRetry', m);
    $('#rsvHLoad', m).hidden = !ctx.busy || ctx.rows.length > 0;
    rsvSetErr(m, ctx.err); retry.hidden = !ctx.err;
    $('#rsvHCount', m).textContent = ctx.loaded ? f.length + '건' + (ctx.more ? ' · 더 있음' : '') : '';
    $('#rsvHList', m).innerHTML = f.map(rsvHistRow).join('');
    empty.hidden = !(ctx.loaded && !f.length);
    empty.textContent = !filt ? (ctx.item ? '이 예약의 기록이 없습니다' : '최근 3개월 안의 기록이 없습니다') : ctx.more ? '불러온 기록 중에는 없습니다. "더 보기"로 더 찾아 보세요.' : '조건에 맞는 기록이 없습니다';
    more.hidden = !ctx.more; more.disabled = ctx.busy;
    rsvKeepFocus(m);
  }
  function rsvHistLoad(R, ctx) {
    var q;
    if (S.rsv !== R || ctx.busy) return;
    ctx.busy = true; ctx.err = ''; rsvHistShow(ctx);
    q = sb.from('rsv_log').select('*');
    q = ctx.item ? q.eq('item_id', ctx.item) : q.gte('at', new Date(Date.now() - RSV_LOG_DAYS * 86400000).toISOString());
    q.order('at', { ascending: false }).order('id', { ascending: false }).range(ctx.off, ctx.off + RSV_LOG_PAGE).then(function (r) { return r; }, function (e) { return { data: null, error: e }; }).then(function (r) {
      var rows, i, en;
      ctx.busy = false;
      if (S.rsv !== R || !document.body.contains(ctx.el)) return;   // 그 사이 창을 닫았거나 로그아웃 → 쓰지 않음
      if (r.error) { ctx.err = '기록을 불러오지 못했습니다. ' + rsvErrText(r.error); rsvHistShow(ctx); return; }
      rows = Array.isArray(r.data) ? r.data : [];
      ctx.more = rows.length > RSV_LOG_PAGE;   // 한 건 더 달라고 했으므로 남는 게 있으면 더 있다는 뜻
      for (i = 0; i < rows.length && i < RSV_LOG_PAGE; i++) {
        en = rows[i];
        if (en && typeof en === 'object' && en.id !== undefined && en.id !== null && !ctx.ids[en.id]) { ctx.ids[en.id] = true; ctx.rows.push(en); }   // 받는 사이 새 기록이 끼어들어 밀린 것은 한 번만
      }
      ctx.off += RSV_LOG_PAGE; ctx.loaded = true;
      rsvHistWho(ctx); rsvHistShow(ctx);
    });
  }
  function rsvHistorySheet(itemId) {   // itemId 가 있으면 그 예약의 기록만
    var R = S.rsv, m, ctx;
    if (!R) return;
    m = sheet(itemId ? '예약 기록' : '변경 기록', rsvHistBody(itemId));
    ctx = { el: m, item: itemId || '', rows: [], ids: {}, off: 0, more: false, busy: false, loaded: false, err: '', th: '', who: '' };
    m.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || (t.id !== 'rsvHTh' && t.id !== 'rsvHWho')) return;
      ctx.th = $('#rsvHTh', m).value; ctx.who = $('#rsvHWho', m).value; rsvHistShow(ctx);
    });
    m.addEventListener('click', function (e) { var t = e.target; if (t && t.closest && t.closest('#rsvHMore, #rsvHRetry')) rsvHistLoad(R, ctx); });
    rsvFocusEl(itemId ? $('[data-close]', m) : $('#rsvHTh', m));   // Esc 가 이 창만 닫도록 포커스를 안으로
    rsvHistLoad(R, ctx);
  }

  function rsvKeepFocus(m) {   // 목록을 다시 그려 누르던 단추가 사라져도 커서가 창 안에 남게 (Esc 가 이 창을 닫도록). 위에 다른 창이 떠 있으면 건드리지 않음
    var ms = $$('.modal'), a = document.activeElement;
    if (!m || !document.body.contains(m) || ms[ms.length - 1] !== m || (a && m.contains(a))) return;
    rsvFocusEl($('[data-close]', m));
  }
  /* 휴지통 (⋯ → 휴지통): 삭제한 지 30일 안의 예약을 서버에서 직접 읽어(읽기만 허용) 서버 함수 rsv_item_restore 로 되살림.
     다른 예약과 겹치면 확인창("그래도 복원") · 서버가 거절하면 이유를 창 안에 + 목록 다시 읽기 · 인터넷 문제는 목록을 그대로 두고 다시 누르면 됨 · 복원도 ↶ 에 쌓임(되돌리면 다시 삭제) */
  var RSV_TRASH_MAX = 200;
  function rsvTrashBody() {
    return '<div class="rsv-hist" id="rsvTrash"><p class="muted small" id="rsvTNote">삭제한 지 30일 안의 예약만 되살릴 수 있습니다 · 최근 삭제 순</p><p class="muted small" id="rsvTCount" aria-live="polite"></p>' +
      '<p class="err" id="rsvErr" role="alert"></p><button type="button" class="btn btn-line sm" id="rsvTRetry" hidden>다시 시도</button><p class="muted" id="rsvTLoad">불러오는 중…</p>' +
      '<ul class="rsv-trash" id="rsvTList" aria-label="삭제한 예약"></ul><p class="muted" id="rsvTEmpty" hidden>휴지통이 비어 있습니다</p></div>';
  }
  function rsvTrashRow(it, now, off) {
    var left = rsvTrashLeft(it.deleted_at, now), lt = left !== left ? '' : left <= 1 ? '오늘 안에 만료' : left + '일 남음', name = it.patient_name || '(이름 없음)';
    return '<li class="rsv-tr-i" data-id="' + esc(it.id) + '"><span class="rsv-tr-n">' + esc(name) + '</span><span class="rsv-tr-w">' + esc(rsvLogText({ action: 'delete', before: it, after: null }, S.rsv.ther).detail) + '</span>' +
      '<span class="rsv-tr-m">' + esc('삭제 ' + rsvStamp(it.deleted_at) + ' · ' + rsvWho(it.deleted_by) + (lt ? ' · ' + lt : '')) + '</span>' +
      '<button type="button" class="btn btn-line sm" data-restore="' + esc(it.id) + '" aria-label="' + esc(name) + ' 복원"' + (off ? ' disabled' : '') + '>복원</button></li>';
  }
  function rsvTrashShow(ctx) {
    var m = ctx.el, now = Date.now(), off = !!(ctx.look || ctx.acting);
    if (!document.body.contains(m)) return;
    $('#rsvTLoad', m).hidden = !ctx.busy || ctx.loaded;
    rsvSetErr(m, ctx.err); $('#rsvTRetry', m).hidden = !ctx.loadErr;
    $('#rsvTCount', m).textContent = ctx.loaded ? ctx.rows.length + '건' + (ctx.cap ? ' · 최근 ' + RSV_TRASH_MAX + '건까지만 보입니다' : '') : '';
    $('#rsvTList', m).innerHTML = ctx.rows.map(function (x) { return rsvTrashRow(x, now, off); }).join('');
    $('#rsvTEmpty', m).hidden = !(ctx.loaded && !ctx.rows.length);
    rsvKeepFocus(m);
  }
  function rsvTrashLoad(R, ctx, keepErr) {
    if (S.rsv !== R || ctx.busy) return;
    ctx.busy = true; ctx.loadErr = false; if (!keepErr) ctx.err = ''; rsvTrashShow(ctx);
    sb.from('rsv_items').select('*').gte('deleted_at', new Date(Date.now() - 30 * 86400000).toISOString()).order('deleted_at', { ascending: false }).limit(RSV_TRASH_MAX)
      .then(function (r) { return r; }, function (e) { return { data: null, error: e }; }).then(function (r) {
        var rows;
        ctx.busy = false;
        if (S.rsv !== R || !document.body.contains(ctx.el)) return;
        if (r.error) { ctx.err = '휴지통을 불러오지 못했습니다. ' + rsvErrText(r.error); ctx.loadErr = true; rsvTrashShow(ctx); return; }
        rows = Array.isArray(r.data) ? r.data : [];
        ctx.cap = rows.length >= RSV_TRASH_MAX; ctx.loaded = true;
        ctx.rows = rows.filter(function (x) { return x && typeof x === 'object' && x.id && x.deleted_at; });
        rsvTrashShow(ctx);
      });
  }
  function rsvTrashRestore(R, ctx, id) {   // 겹침을 먼저 확인(겹칠 때만 확인창) → 서버에 복원
    var it = null, i;
    if (S.rsv !== R || ctx.look || ctx.acting) return;
    for (i = 0; i < ctx.rows.length; i++) { if (ctx.rows[i].id === id) it = ctx.rows[i]; }
    if (!it) return;
    ctx.look = true; ctx.err = ''; rsvTrashShow(ctx);
    rsvWarnList(it).then(function (list) {
      ctx.look = false;
      if (S.rsv !== R || !document.body.contains(ctx.el)) return;   // 그 사이 창을 닫았거나 로그아웃 → 아무것도 하지 않음
      rsvTrashShow(ctx);
      if (!list.length) rsvTrashDo(R, ctx, it);
      else rsvConfirmWarn(null, list, function () { rsvTrashDo(R, ctx, it); }, { title: '복원 전 확인', ok: '그래도 복원', note: '아래 내용을 확인해 주세요. 그래도 복원할 수 있습니다.' });
    });
  }
  function rsvTrashDo(R, ctx, it) {
    var id = it.id;
    if (S.rsv !== R || ctx.look || ctx.acting || !document.body.contains(ctx.el)) return;
    if (R.busy[id]) { ctx.err = '이 예약을 처리하는 중입니다. 잠시 뒤에 다시 눌러 주세요.'; rsvTrashShow(ctx); return; }
    ctx.acting = id; R.busy[id] = true; ctx.err = ''; rsvTrashShow(ctx);
    sb.rpc('rsv_item_restore', { p_id: id }).then(function (r) { return r; }, function (e) { return { data: null, error: e }; }).then(function (r) {
      var row, sp, outside, here = document.body.contains(ctx.el);
      delete R.busy[id]; ctx.acting = '';
      if (S.rsv !== R) return;
      if (r.error) {
        if (!here) { toast(esc(rsvErrText(r.error))); return; }
        ctx.err = rsvErrText(r.error);
        if (r.error.code) rsvTrashLoad(R, ctx, true); else rsvTrashShow(ctx);   // 서버가 이유를 대고 거절 → 목록이 낡았을 수 있어 다시 읽음 / 인터넷 문제 → 그대로 두고 다시 누르면 됨
        return;
      }
      row = rsvOne(r.data);
      if (!row || !row.id) {
        if (here) { ctx.err = '복원 결과를 확인하지 못했습니다. 목록과 달력을 확인해 주세요.'; rsvTrashLoad(R, ctx, true); }
        rsvLoad(); return;
      }
      ctx.rows = ctx.rows.filter(function (x) { return x.id !== id; });
      rsvPushUndo(R, { op: 'restore', id: id, ver: row.version, label: (row.patient_name || '') + ' 예약 복원' });
      rsvPut(row); rsvTrashShow(ctx);
      sp = rsvSpan(row);
      outside = !!sp && rsvRange(R.view, R.date, R.settings.week_start).days.indexOf(sp.ymd) < 0;
      toast('복원했습니다: ' + esc(row.patient_name || '') + (outside ? ' · 눌러서 보기' : ''), outside ? function () { if (S.rsv === R && rsvShown()) rsvGo(R.view, sp.ymd, false); } : null);
    });
  }
  function rsvTrashSheet() {
    var R = S.rsv, m, ctx;
    if (!R) return;
    m = sheet('휴지통', rsvTrashBody());
    ctx = { el: m, rows: [], busy: false, loaded: false, loadErr: false, look: false, acting: '', err: '', cap: false };
    m.addEventListener('click', function (e) {
      var t = e.target, b;
      if (!t || !t.closest) return;
      if (t.closest('#rsvTRetry')) { rsvTrashLoad(R, ctx, false); return; }
      b = t.closest('[data-restore]'); if (b) rsvTrashRestore(R, ctx, b.getAttribute('data-restore'));
    });
    rsvFocusEl($('[data-close]', m));   // Esc 가 이 창만 닫도록 포커스를 안으로
    rsvTrashLoad(R, ctx, false);
  }

  /* 설정 (⋯ → 설정, 관리자만): 치료사 추가·수정(이름 · 색 · 순서 · 사용/중지 · 연결할 직원 계정)
     · 서버 함수 rsv_therapist_save 로만 저장(서버가 관리자인지 다시 확인) · 수정은 "창을 열었을 때와 달라진 항목"만 보냄(그 사이 남이 바꾼 칸을 덮어쓰지 않음) · 서버가 받아들인 뒤에만 화면에 반영
     · 열려 있는 설정 창의 목록은 실시간 알림·다시 불러오기로 바뀌어도 따라감 */
  var RSV_COLORS = ['#2f80ed', '#e0852b', '#27ae60', '#9b51e0', '#eb5757', '#00a5a8', '#d4a017', '#e84393'];
  var RSV_TABS = [['th', '치료사'], ['hr', '운영 시간'], ['cs', '기본값·코스']], RSV_SNAPS = [5, 10, 15, 30];
  function rsvThMeta(t) {   // 목록의 둘째 줄: 사용/중지 · 연결된 직원 계정
    var p = t.profile_id && S.profiles ? S.profiles[t.profile_id] : null;
    return (t.active === false ? '중지' : '사용') + ' · ' + (t.profile_id ? '계정: ' + (p && p.name ? p.name : '(알 수 없음)') : '계정 연결 없음');
  }
  function rsvSetThRow(t) {
    return '<li class="rsv-set-i' + (t.active === false ? ' off' : '') + '" data-th="' + esc(t.id) + '"><i class="rsv-dot" style="background:' + rsvColor(t.color) + '"></i>' +
      '<span class="rsv-set-t"><span class="rsv-set-n">' + esc(t.name) + '</span><span class="rsv-set-m">' + esc(rsvThMeta(t)) + '</span></span>' +
      '<button type="button" class="btn btn-line sm" data-thedit="' + esc(t.id) + '" aria-label="' + esc(t.name + ' 수정') + '">수정</button></li>';
  }
  function rsvSetBody() {
    var tabs = '', i;
    for (i = 0; i < RSV_TABS.length; i++) tabs += '<button type="button" data-tab="' + RSV_TABS[i][0] + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' + RSV_TABS[i][1] + '</button>';
    return '<div class="rsv-set" id="rsvSet"><div class="seg sm rsv-set-tabs" id="rsvSTabs" role="group" aria-label="설정 구분">' + tabs + '</div>' +
      '<div id="rsvSPth"><div class="rsv-set-hd"><h3>치료사</h3><button type="button" class="btn btn-line sm" id="rsvSTAdd">+ 치료사 추가</button></div>' +
      '<ul class="rsv-set-list" id="rsvSTList" aria-label="치료사 목록"></ul><p class="muted" id="rsvSTEmpty" hidden>등록된 치료사가 없습니다. "+ 치료사 추가"를 눌러 먼저 추가해 주세요.</p>' +
      '<p class="muted small">순서는 숫자가 작을수록 앞에 나옵니다. 치료사를 "중지"하면 새 예약의 치료사 목록에서 빠지지만 이전 예약은 그대로 남습니다. 치료사는 추가·수정할 때마다 바로 저장됩니다.</p></div>' +
      '<div id="rsvSPhr" hidden></div><div id="rsvSPcs" hidden></div>' +
      '<p class="err" id="rsvErr" role="alert"></p><div class="sheet-actions"><button type="button" class="btn btn-line" data-close>닫기</button><button type="button" class="btn btn-navy" id="rsvSSave" hidden>저장</button></div></div>';
  }
  function rsvSetThShow(ctx) {
    var L = S.rsv ? S.rsv.ther : [];
    $('#rsvSTList', ctx.el).innerHTML = L.map(rsvSetThRow).join('');
    $('#rsvSTEmpty', ctx.el).hidden = L.length > 0;
    rsvKeepFocus(ctx.el);
  }
  function rsvSetRefresh(R) {   // 열려 있는 설정 창이 있으면 치료사 목록·운영 시간 대상 단추를 지금 상태로 다시 그림 (다른 칸의 입력은 건드리지 않음)
    var c = R && R.set;
    if (c && c.el && document.body.contains(c.el)) { rsvSetHtShow(c); rsvSetThShow(c); }   // 마지막에 커서 자리를 챙김
  }
  /* ===== 설정 창 2단계 (v48 7단계): 운영 시간 · 점심 · 보이는 시간 · 기본 길이 · 이동 단위 · 주 시작 · 코스 =====
     · 창은 탭 3개(치료사 / 운영 시간 / 기본값·코스). 치료사 탭은 추가·수정할 때마다 바로 저장, 나머지 두 탭은 "저장" 한 번에 — 바뀐 항목만 서버로
     · 열 때의 설정(ctx.f0)과 고치는 중인 값(ctx.f)을 따로 둠: 열려 있는 동안 다른 곳에서 설정이 바뀌어도 내 입력은 그대로이고, 보낼 때는 내가 고친 항목만 (남의 변경을 덮어쓰지 않음)
     · 운영 시간은 대상(전체 / 치료사별)마다 요일 7칸. 대상을 바꾸거나 탭을 오가도 고친 내용은 ctx.f 에 남음. 치료사 칸은 "전체와 같음" · 운영 · 쉼
     · 24:00(자정)은 시각 칸(type=time)에 담을 수 없어 비어 보임 → 그 칸이 비어 있고 원래 값이 24:00 이면 24:00 으로 봄("자정까지" 표시)
     · 순수한 계산(모양 바꾸기·달라진 항목·검사)은 위쪽 RSV-CORE 에 있고(rsvSetForm 등), 여기는 화면과 연결만 */
  function rsvSetTab(ctx, k) {   // 탭 바꾸기: 눌린 표시 · 보이는 판 · 저장 단추(치료사 탭에서는 숨김)
    var m = ctx.el, i;
    rsvPress($('#rsvSTabs', m), 'data-tab', k);
    for (i = 0; i < RSV_TABS.length; i++) $('#rsvSP' + RSV_TABS[i][0], m).hidden = RSV_TABS[i][0] !== k;
    $('#rsvSSave', m).hidden = k === 'th';
  }
  function rsvSetHrBody() {
    return '<div class="rsv-set-sec"><h3>보이는 시간</h3><div class="row2"><div class="field"><label for="rsvSVs">시작</label><input class="input" type="time" id="rsvSVs"></div>' +
      '<div class="field"><label for="rsvSVe">끝 <span class="muted small" id="rsvSVeZ" hidden>(비워 두면 자정까지)</span></label><input class="input" type="time" id="rsvSVe"></div></div>' +
      '<p class="muted small">달력 세로축에 보이는 시간 범위입니다. 이 범위 밖에 예약이 있으면 그만큼 자동으로 넓어집니다.</p></div>' +
      '<div class="rsv-set-sec"><h3>점심시간</h3><label class="chk-row"><input type="checkbox" id="rsvSLOn"> 점심시간 표시</label>' +
      '<div class="row2"><div class="field"><label for="rsvSLs">시작</label><input class="input" type="time" id="rsvSLs"></div><div class="field"><label for="rsvSLe">끝</label><input class="input" type="time" id="rsvSLe"></div></div>' +
      '<p class="muted small">운영일 달력에 점심시간 띠를 표시하고, 그 시간에 예약을 잡으면 저장 전에 알려 줍니다 (막지는 않습니다).</p></div>' +
      '<div class="rsv-set-sec"><h3>운영 시간</h3><div class="seg sm" id="rsvSHT" role="group" aria-label="운영 시간 대상"></div><div class="rsv-hr" id="rsvSHR"></div>' +
      '<p class="muted small">쉬는 날과 운영 시간 밖은 달력에 회색으로 보이고, 그 시간에 예약을 잡으면 저장 전에 알려 줍니다. 치료사별로 정하면 그 치료사에게만 적용되고, "전체와 같음"은 전체(기본) 표를 따릅니다.</p></div>';
  }
  function rsvSetCsBody() {
    return '<div class="field"><label for="rsvSLen">새 예약의 기본 길이 <span class="muted small">(분 · 5~240 · 5분 단위)</span></label><input class="input" id="rsvSLen" inputmode="numeric" maxlength="3" autocomplete="off"></div>' +
      '<div class="field"><label id="rsvSSnapL">끌어서 옮길 때 단위 <span class="muted small">(분)</span></label><div class="seg sm" id="rsvSSnap" role="group" aria-labelledby="rsvSSnapL">' +
      RSV_SNAPS.map(function (n) { return '<button type="button" data-snap="' + n + '" aria-pressed="false">' + n + '</button>'; }).join('') + '</div></div>' +
      '<div class="field"><label id="rsvSWkL">한 주의 시작</label><div class="seg sm" id="rsvSWk" role="group" aria-labelledby="rsvSWkL"><button type="button" data-wk="1" aria-pressed="false">월요일</button><button type="button" data-wk="0" aria-pressed="false">일요일</button></div></div>' +
      '<div class="field"><label for="rsvSCourses">코스 목록</label><textarea class="input" id="rsvSCourses" rows="7" autocomplete="off" spellcheck="false"></textarea>' +
      '<p class="muted small">한 줄에 하나씩 (쉼표로 나눠도 됩니다). 영문 대문자·숫자, 조합은 +로 이어 씁니다 (예: C10, J15+C5). 새 예약 창의 코스 단추와 빠른 입력에 쓰입니다.</p></div>';
  }
  function rsvSetHrList(ctx) { return ctx.tgt ? rsvSetRows(ctx.f, ctx.tgt) : ctx.f.hours.all; }   // 지금 대상의 요일 7칸(고치는 중인 값)
  function rsvSetHrRowHtml(d, th) {
    var n = RSV_DOWN[d];
    return '<div class="rsv-hr-r" data-dow="' + d + '"><span class="rsv-hr-d">' + n + '</span>' +
      '<select class="input rsv-hr-k" aria-label="' + n + '요일 운영 여부">' + (th ? '<option value="def">전체와 같음</option>' : '') + '<option value="on">운영</option><option value="off">쉼</option></select>' +
      '<span class="rsv-hr-t"><input class="input rsv-hr-s" type="time" aria-label="' + n + '요일 여는 시각"><span aria-hidden="true">~</span><input class="input rsv-hr-e" type="time" aria-label="' + n + '요일 닫는 시각"><span class="muted small rsv-hr-z" hidden>(자정까지)</span></span>' +
      '<span class="muted small rsv-hr-n" hidden></span></div>';
  }
  function rsvSetHrFill(row, r, a) {   // 한 줄을 고치는 중인 값 r 로 채움 (a = 전체 표의 같은 요일 — "전체와 같음" 옆에 보여 줄 시각)
    $('.rsv-hr-k', row).value = r.k;
    $('.rsv-hr-s', row).value = r.s; $('.rsv-hr-e', row).value = r.e === '24:00' ? '' : r.e;
    $('.rsv-hr-t', row).hidden = r.k !== 'on'; $('.rsv-hr-z', row).hidden = !(r.k === 'on' && r.e === '24:00');
    $('.rsv-hr-n', row).hidden = r.k !== 'def'; if (r.k === 'def') $('.rsv-hr-n', row).textContent = a.k === 'on' ? a.s + '~' + a.e : '쉼';
  }
  function rsvSetHrShow(ctx) {   // 지금 대상의 7줄을 고치는 중인 값대로 그림
    var box = $('#rsvSHR', ctx.el), L = rsvSetHrList(ctx), a = ctx.f.hours.all, h = '', i, d;
    for (i = 0; i < 7; i++) h += rsvSetHrRowHtml(RSV_SET_DOW[i], !!ctx.tgt);
    box.innerHTML = h;
    for (i = 0; i < 7; i++) { d = RSV_SET_DOW[i]; rsvSetHrFill($('.rsv-hr-r[data-dow="' + d + '"]', box), L[d], a[d]); }
  }
  function rsvSetHrReadRow(row, r) {   // 화면의 한 줄 → 고치는 중인 값 (시각은 모양만 보고 담음 — 틀렸는지는 저장할 때 검사. 닫는 시각이 비었고 원래 24:00 이면 24:00)
    var e = $('.rsv-hr-e', row).value;
    r.k = $('.rsv-hr-k', row).value; r.s = $('.rsv-hr-s', row).value; r.e = (e === '' && r.e === '24:00') ? '24:00' : e;
  }
  function rsvSetHrReadAll(ctx) {
    var L = rsvSetHrList(ctx), i, d;
    for (i = 0; i < 7; i++) { d = RSV_SET_DOW[i]; rsvSetHrReadRow($('.rsv-hr-r[data-dow="' + d + '"]', ctx.el), L[d]); }
  }
  function rsvSetHrChange(ctx, row) {   // 요일 한 줄의 운영/쉼/전체와 같음을 바꿈
    var d = Number(row.getAttribute('data-dow')), r = rsvSetHrList(ctx)[d], a = ctx.f.hours.all[d], was = r.k;
    rsvSetHrReadRow(row, r);
    if (was === 'def' && r.k === 'on' && a.k === 'on') { r.s = a.s; r.e = a.e; }   // "전체와 같음" → 운영: 전체의 시각에서 시작
    rsvSetHrFill(row, r, a);
  }
  function rsvSetHrGo(ctx, id) {   // 운영 시간 대상(전체 / 치료사) 바꾸기: 보이던 7줄을 담아 두고 새 대상의 7줄을 그림
    rsvSetHrReadAll(ctx);
    ctx.tgt = id;
    rsvPress($('#rsvSHT', ctx.el), 'data-ht', id);
    rsvSetHrShow(ctx);
  }
  function rsvSetHtShow(ctx) {   // 대상 단추: 전체(기본) + 모든 치료사 (중지한 치료사는 "(중지)") — 고른 대상은 그대로
    var L = S.rsv ? S.rsv.ther : [], box = $('#rsvSHT', ctx.el), h = '<button type="button" data-ht="" aria-pressed="false">전체(기본)</button>', i;
    for (i = 0; i < L.length; i++) h += '<button type="button" data-ht="' + esc(L[i].id) + '" aria-pressed="false">' + esc(L[i].name) + (L[i].active === false ? ' (중지)' : '') + '</button>';
    box.innerHTML = h;
    rsvPress(box, 'data-ht', ctx.tgt);
  }
  function rsvSetLunchLock(m) { var off = !$('#rsvSLOn', m).checked; $('#rsvSLs', m).disabled = off; $('#rsvSLe', m).disabled = off; }
  function rsvSetFill(ctx) {   // 처음 값을 화면에 채움
    var m = ctx.el, f = ctx.f;
    $('#rsvSVs', m).value = f.view_start; $('#rsvSVe', m).value = f.view_end === '24:00' ? '' : f.view_end; $('#rsvSVeZ', m).hidden = f.view_end !== '24:00';
    $('#rsvSLOn', m).checked = f.lunch.on; $('#rsvSLs', m).value = f.lunch.start; $('#rsvSLe', m).value = f.lunch.end === '24:00' ? '' : f.lunch.end; rsvSetLunchLock(m);
    $('#rsvSLen', m).value = String(f.default_len); rsvPress($('#rsvSSnap', m), 'data-snap', f.snap); rsvPress($('#rsvSWk', m), 'data-wk', f.week_start);
    $('#rsvSCourses', m).value = f.courses.join('\n');
    rsvSetHtShow(ctx); rsvSetHrShow(ctx);
  }
  function rsvSetRead(ctx) {   // 창의 값 → 고치는 중인 값 f (틀려도 그대로 담음 — 검사는 rsvSetCheck 가) · 코스 이름 중 어긋난 것
    var m = ctx.el, f = ctx.f, ve = $('#rsvSVe', m).value, le = $('#rsvSLe', m).value, len = rsvTrim($('#rsvSLen', m).value), cp = rsvParseCourses($('#rsvSCourses', m).value);
    rsvSetHrReadAll(ctx);
    f.view_start = $('#rsvSVs', m).value; f.view_end = (ve === '' && ctx.f0.view_end === '24:00') ? '24:00' : ve;
    f.lunch = $('#rsvSLOn', m).checked ? { on: true, start: $('#rsvSLs', m).value, end: (le === '' && ctx.f0.lunch.end === '24:00') ? '24:00' : le } : { on: false, start: ctx.f0.lunch.start, end: ctx.f0.lunch.end };   // 끄면 시각 칸은 보지 않고 원래 시각을 그대로
    f.default_len = /^\d{1,3}$/.test(len) ? parseInt(len, 10) : null;
    f.snap = parseInt(rsvPressed($('#rsvSSnap', m), 'data-snap'), 10); f.week_start = rsvPressed($('#rsvSWk', m), 'data-wk') === '0' ? 0 : 1;
    f.courses = cp.list;
    return { f: f, bad: cp.bad };
  }
  function rsvSetShowErr(ctx, c) {   // 틀린 칸이 있는 탭(·대상)으로 가서 안내 + 그 칸에 커서
    var m = ctx.el, msg = c.err, tgt, el;
    if (c.f === 'hr') {
      tgt = c.tgt === 'all' ? '' : c.tgt;
      rsvSetTab(ctx, 'hr'); rsvSetHrGo(ctx, tgt);
      msg = (tgt ? (rsvTher(tgt) ? rsvTher(tgt).name : '(알 수 없음)') : '전체') + ' ' + RSV_DOWN[c.dow] + '요일: ' + msg;
      el = $('.rsv-hr-r[data-dow="' + c.dow + '"] .rsv-hr-s', m);
    } else {
      rsvSetTab(ctx, (c.f === 'rsvSLen' || c.f === 'rsvSCourses') ? 'cs' : 'hr');
      el = $('#' + c.f, m);
    }
    rsvSetErr(m, msg); rsvFocusEl(el);
    try { if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' }); } catch (e) { /* 스크롤은 덤 */ }
  }
  function rsvSetSave(R, ctx) {
    var m = ctx.el, btn = $('#rsvSSave', m), r, c, d;
    if (S.rsv !== R || ctx.busy) return;
    rsvSetErr(m, '');
    r = rsvSetRead(ctx); c = rsvSetCheck(r.f);
    if ((!c || c.f === 'rsvSCourses') && r.bad.length) c = { err: '코스 이름이 올바르지 않습니다 (영문 대문자·숫자, 예: C10, J15+C5): ' + r.bad[0], f: 'rsvSCourses' };
    if (c) { rsvSetShowErr(ctx, c); return; }
    d = rsvSetDiff(ctx.f0, r.f);
    if (!d.n) { toast('바뀐 내용이 없습니다'); return; }
    ctx.busy = true; if (btn) btn.disabled = true;
    sb.rpc('rsv_settings_save', { p_data: d.data }).then(function (x) { return x; }, function (e) { return { data: null, error: e }; }).then(function (x) {
      var row;
      ctx.busy = false; if (btn) btn.disabled = false;
      if (S.rsv !== R) return;
      if (x.error) { rsvSetErr(m, rsvErrText(x.error)); return; }
      row = rsvOne(x.data);
      if (!row || !row.data || typeof row.data !== 'object') { rsvSetErr(m, '저장 결과를 확인하지 못했습니다. 화면을 새로 고쳐 확인해 주세요.'); rsvLoad(); return; }
      closeSheet(m);
      rsvApply('rsv_settings', { eventType: 'UPDATE', new: row, old: { id: row.id } });
      toast('설정을 저장했습니다');
    });
  }
  function rsvThBody() {
    return '<div class="rsv-form"><div class="field"><label for="rsvTName">이름</label><input class="input" id="rsvTName" maxlength="20" autocomplete="off" placeholder="예) 나성현"></div>' +
      '<div class="row2"><div class="field"><label for="rsvTColor">색</label><input class="input rsv-color" type="color" id="rsvTColor"></div>' +
      '<div class="field"><label for="rsvTSort">순서 <span class="muted small">(작을수록 앞)</span></label><input class="input" id="rsvTSort" inputmode="numeric" autocomplete="off"></div></div>' +
      '<div class="field"><label id="rsvTActL">사용 여부</label><div class="seg sm" id="rsvTAct" role="group" aria-labelledby="rsvTActL"><button type="button" data-on="1" aria-pressed="false">사용</button><button type="button" data-on="0" aria-pressed="false">중지</button></div></div>' +
      '<div class="field"><label for="rsvTProf">연결할 직원 계정 <span class="muted small">(선택)</span></label><select class="input" id="rsvTProf"></select>' +
      '<p class="muted small">연결하면 그 직원은 ⋯ 메뉴에서 "내 예약만 보기"를 쓸 수 있습니다.</p></div>' +
      '<p class="err" id="rsvErr" role="alert"></p><div class="sheet-actions"><button type="button" class="btn btn-line" data-close>취소</button><button type="button" class="btn btn-navy" id="rsvTSave">저장</button></div></div>';
  }
  function rsvThDefaults() {   // 새 치료사의 처음 값: 이름 없음 · 아직 안 쓰는 색 · 순서는 맨 뒤 · 사용 · 계정 연결 없음
    var R = S.rsv, used = {}, mx = null, i, col = null, n;
    R.ther.forEach(function (t) { used[String(t.color).toLowerCase()] = true; n = Number(t.sort); if (isFinite(n) && (mx === null || n > mx)) mx = n; });
    for (i = 0; i < RSV_COLORS.length && col === null; i++) { if (!used[RSV_COLORS[i]]) col = RSV_COLORS[i]; }
    return { name: '', color: col || RSV_COLORS[R.ther.length % RSV_COLORS.length], sort: String(mx === null ? 1 : Math.min(999, mx + 1)), on: true, prof: '' };
  }
  function rsvThProfOptions(t, cur) {   // 연결할 직원 계정: 승인된(사용 중) 직원 · 이미 다른 치료사에 연결된 직원은 고를 수 없음 · 지금 연결된 계정은 (퇴사 등으로 목록에 없어도) 남겨 둠
    var R = S.rsv, used = {}, L = [], has = false, p;
    R.ther.forEach(function (x) { if (x.profile_id && (!t || x.id !== t.id)) used[x.profile_id] = x; });
    Object.keys(S.profiles || {}).forEach(function (k) {
      p = S.profiles[k];
      if (p && p.name && p.active !== false && !p.pending) { L.push({ id: k, name: p.name }); if (k === cur) has = true; }
    });
    if (cur && !has) { p = S.profiles && S.profiles[cur]; L.push({ id: cur, name: p && p.name ? p.name + ' (사용 중지된 계정)' : '(알 수 없는 계정)' }); }
    L.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
    return '<option value="">연결 안 함</option>' + L.map(function (x) {
      var u = used[x.id];
      return '<option value="' + esc(x.id) + '"' + (u ? ' disabled' : '') + '>' + esc(x.name + (u ? ' (' + u.name + '에 연결됨)' : '')) + '</option>';
    }).join('');
  }
  function rsvThRead(m, ctx) {   // 창의 값을 검사 → { err, f } 또는 { same: true } 또는 { data } (새 치료사 = 전부 · 수정 = 번호 + 달라진 항목)
    var R = S.rsv, d = ctx.d, t = ctx.t, name = rsvTrim($('#rsvTName', m).value), color = String($('#rsvTColor', m).value || '').toLowerCase(), sortS = rsvTrim($('#rsvTSort', m).value),
      on = rsvPressed($('#rsvTAct', m), 'data-on') !== '0', prof = $('#rsvTProf', m).value || '', sort, i, o = {}, n = 0;
    if (!name) return { err: '치료사 이름을 입력해 주세요.', f: 'rsvTName' };
    if (name.length > 20) return { err: '치료사 이름은 20자 이하로 입력해 주세요.', f: 'rsvTName' };
    for (i = 0; i < R.ther.length; i++) { if (R.ther[i].name === name && (!t || R.ther[i].id !== t.id)) return { err: '이미 같은 이름의 치료사가 있습니다.', f: 'rsvTName' }; }
    if (!/^-?\d{1,3}$/.test(sortS)) return { err: '순서는 -999~999 사이의 숫자로 입력해 주세요.', f: 'rsvTSort' };
    sort = parseInt(sortS, 10);
    if (!/^#[0-9a-f]{6}$/.test(color)) return { err: '색을 다시 골라 주세요.', f: 'rsvTColor' };
    if (!t) return { data: { name: name, color: color, sort: sort, active: on, profile_id: prof || null } };
    o.id = t.id;
    if (name !== d.name) { o.name = name; n++; }
    if (color !== d.color) { o.color = color; n++; }
    if (sort !== parseInt(d.sort, 10)) { o.sort = sort; n++; }
    if (on !== d.on) { o.active = on; n++; }
    if (prof !== d.prof) { o.profile_id = prof || null; n++; }
    return n ? { data: o } : { same: true };
  }
  function rsvThSave(R, ctx) {
    var m = ctx.el, btn = $('#rsvTSave', m), r;
    if (S.rsv !== R || ctx.busy) return;
    r = rsvThRead(m, ctx);
    if (r.err) { rsvSetErr(m, r.err); rsvFocusId(m, r.f); return; }
    rsvSetErr(m, '');
    if (r.same) { closeSheet(m); toast('바뀐 내용이 없습니다'); return; }
    ctx.busy = true; if (btn) btn.disabled = true;
    sb.rpc('rsv_therapist_save', { p_data: r.data }).then(function (x) { return x; }, function (e) { return { data: null, error: e }; }).then(function (x) {
      var row;
      ctx.busy = false; if (btn) btn.disabled = false;
      if (S.rsv !== R) return;
      if (x.error) { rsvSetErr(m, rsvErrText(x.error)); return; }
      row = rsvOne(x.data);
      if (!row || !row.id) { rsvSetErr(m, '저장 결과를 확인하지 못했습니다. 화면을 새로 고쳐 확인해 주세요.'); rsvLoad(); return; }
      closeSheet(m);
      rsvApply('rsv_therapists', { eventType: ctx.t ? 'UPDATE' : 'INSERT', new: row, old: { id: row.id } });
      toast((ctx.t ? '치료사를 수정했습니다: ' : '치료사를 추가했습니다: ') + esc(row.name));
    });
  }
  function rsvThSheet(R, id) {   // 치료사 추가(id 없음) · 수정
    var t = id ? rsvTher(id) : null, d, m, ctx;
    if (id && !t) return;
    d = t ? { name: t.name, color: rsvColor(t.color).toLowerCase(), sort: String(t.sort), on: t.active !== false, prof: t.profile_id || '' } : rsvThDefaults();
    m = sheet(t ? '치료사 수정' : '치료사 추가', rsvThBody());
    ctx = { el: m, t: t, d: d, busy: false };
    $('#rsvTProf', m).innerHTML = rsvThProfOptions(t, d.prof);
    $('#rsvTName', m).value = d.name; $('#rsvTColor', m).value = d.color; $('#rsvTSort', m).value = d.sort; $('#rsvTProf', m).value = d.prof; rsvPress($('#rsvTAct', m), 'data-on', d.on ? '1' : '0');
    m.addEventListener('click', function (e) {
      var x = e.target, b;
      if (!x || !x.closest) return;
      b = x.closest('#rsvTAct [data-on]'); if (b) { rsvPress($('#rsvTAct', m), 'data-on', b.getAttribute('data-on')); return; }
      if (x.closest('#rsvTSave')) rsvThSave(R, ctx);
    });
  }
  function rsvSettingsSheet() {
    var R = S.rsv, m, ctx;
    if (!R) return;
    m = sheet('예약 설정', rsvSetBody());
    ctx = { el: m, f0: rsvSetForm(R.settings), f: rsvSetForm(R.settings), tgt: '', busy: false };
    R.set = ctx;
    $('#rsvSPhr', m).innerHTML = rsvSetHrBody(); $('#rsvSPcs', m).innerHTML = rsvSetCsBody();   // 나머지 두 탭은 창을 만든 뒤에 채움 (창이 열릴 때 첫 입력칸으로 커서를 옮기지 않도록)
    rsvSetFill(ctx);
    m.addEventListener('click', function (e) {
      var t = e.target, b;
      if (!t || !t.closest) return;
      if (t.closest('#rsvSTAdd')) { rsvThSheet(R, ''); return; }
      b = t.closest('[data-thedit]'); if (b) { rsvThSheet(R, b.getAttribute('data-thedit')); return; }
      b = t.closest('#rsvSTabs [data-tab]'); if (b) { rsvSetTab(ctx, b.getAttribute('data-tab')); return; }
      b = t.closest('#rsvSHT [data-ht]'); if (b) { rsvSetHrGo(ctx, b.getAttribute('data-ht')); return; }
      b = t.closest('#rsvSSnap [data-snap]'); if (b) { rsvPress($('#rsvSSnap', m), 'data-snap', b.getAttribute('data-snap')); return; }
      b = t.closest('#rsvSWk [data-wk]'); if (b) { rsvPress($('#rsvSWk', m), 'data-wk', b.getAttribute('data-wk')); return; }
      if (t.closest('#rsvSSave')) rsvSetSave(R, ctx);
    });
    m.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.id === 'rsvSLOn') rsvSetLunchLock(m);
      else if (t.classList.contains('rsv-hr-k')) rsvSetHrChange(ctx, t.closest('.rsv-hr-r'));
    });
    m.addEventListener('input', function (e) {   // 24:00 로 저장돼 있던 끝 시각 칸: 비어 있으면 "자정까지" 표시, 시각을 넣으면 사라짐
      var t = e.target, row;
      if (!t || !t.closest) return;
      if (t.id === 'rsvSVe') $('#rsvSVeZ', m).hidden = !(t.value === '' && ctx.f0.view_end === '24:00');
      else if (t.classList.contains('rsv-hr-e')) { row = t.closest('.rsv-hr-r'); $('.rsv-hr-z', row).hidden = !(t.value === '' && rsvSetHrList(ctx)[Number(row.getAttribute('data-dow'))].e === '24:00'); }
    });
    rsvSetThShow(ctx);
  }

  /* ================= 예약 (v48 6단계): 마우스로 끌어서 옮기기 · 길이 조절 · 빈 칸을 끌어 새 예약 =================
     · 마우스 왼쪽 버튼만 (터치·펜은 눌러서 상세). 4px 이상 움직여야 끌기 시작 — 그 전에 놓으면 평소 클릭(상세·빈 칸 새 예약)
     · 주·하루 보기: 블록을 끌면 날짜·시각(이동 단위 눈금, 길이는 그대로)·(하루 보기는) 치료사가 바뀜 / 블록 아래 손잡이(.rsv-rz)를 끌면 끝 시각만 바뀜
     · 월 보기: 날짜만 바뀌고 시각·길이·치료사는 그대로 (눈금에 안 맞는 시각도 그대로)
     · 빈 칸을 세로로 끌면 누른 칸~놓은 칸(이동 단위, 양쪽 포함)이 새 예약의 시작·길이가 됨 (누른 칸을 벗어나지 않으면 평소 빈 칸 클릭)
     · 끄는 동안: 원래 자리 점선(.dragging) · 놓일 자리 미리보기(.rsv-ghost) · 위·아래 가장자리 근처 자동 스크롤. Esc·영역 밖에서 놓기·창이 포커스를 잃음·다른 화면으로 감 = 취소
     · 놓으면 저장 전 경고와 같은 검사 → 경고가 있으면 확인창 → 서버 답을 기다리는 동안 새 자리에 먼저 보여 줌 → 거절·충돌이면 원위치 + 이유(글자 그대로) + (충돌이면) 다시 불러옴
     · 끄는 중에는 화면을 다시 그리지 않음(다른 직원의 변경은 끝난 뒤 한 번에). 끌던 예약이 바뀌거나 사라지면 끌기 취소. 처리 중인 예약은 다시 끌 수 없음 */
  var RSV_DRAG_PX = 4, RSV_EDGE = 40, RSV_TICK = 30;
  function rsvDragGone(R) { var d = R.drag, it = d && R.items[d.id]; return !!d && d.kind !== 'select' && (!it || it.version !== d.ver); }   // 끌던 예약이 사라졌거나 다른 버전이 됨
  function rsvMinOn(ms, ymd) { return Math.round((ms - rsvAt(ymd, 0)) / 60000); }                                                        // 그 날 0시부터 몇 분
  function rsvCanTo(th) { var t = rsvTher(th); return !!t && t.active !== false; }                                                       // 옮겨 들어갈 수 있는 치료사 (사용 중지·모르는 치료사는 안 됨)
  function rsvPointerDown(e) {
    var R = S.rsv, t = e.target, ev, id, it, col, grid, d, u, pm;
    if (!R) return;
    R.swallow = 0;   // 새로 누르기 시작하면 앞선 끌기의 click 대기는 끝
    if (!t || !t.closest || R.drag || e.defaultPrevented) return;
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.isPrimary === false || $('.modal')) return;   // 마우스 왼쪽 버튼만 · 창이 열려 있으면 안 함
    if (t.closest('[data-rsv-ok]') || t.closest('#rsvRetry')) return;
    u = R.settings.snap; u = (typeof u === 'number' && u > 0) ? u : 15;
    d = { kind: '', id: '', ver: 0, item: null, sp: null, ev: null, col: null, vs: NaN, ve: NaN, unit: u, grab: 0, a: 0, date: '', th: '', phase: 'down', pid: e.pointerId, x0: e.clientX, y0: e.clientY,
      cx: e.clientX, cy: e.clientY, drop: null, ghost: null, dropEl: null, tick: 0, late: false, off: null };
    ev = t.closest('.rsv-ev') || t.closest('.rsv-mi');
    if (ev) {
      id = ev.getAttribute('data-id'); it = R.items[id];
      if (!it || R.busy[id]) return;   // 서버 답을 기다리는 예약은 다시 끌 수 없음
      d.id = id; d.ver = it.version; d.item = it; d.sp = rsvSpan(it); d.ev = ev;
      if (!d.sp) return;
      if (!ev.classList.contains('rsv-ev')) d.kind = 'month';
      else {
        col = ev.closest('.rsv-col'); grid = ev.closest('.rsv-grid');
        if (!col || !grid) return;
        d.vs = parseInt(grid.getAttribute('data-vs'), 10); d.ve = parseInt(grid.getAttribute('data-ve'), 10);
        if (!isFinite(d.vs) || !isFinite(d.ve)) return;
        d.kind = t.closest('.rsv-rz') ? 'resize' : 'move'; d.col = col;
        d.grab = (e.clientY - col.getBoundingClientRect().top - (parseFloat(ev.style.top) || 0)) / RSV_PXM;   // 블록 윗변에서 잡은 곳까지(분) — 놓을 때도 같은 곳을 잡은 채로
      }
    } else if ((col = t.closest('.rsv-col')) && (grid = col.closest('.rsv-grid'))) {   // 빈 칸(휴무 음영·점심 줄 위도 포함) → 끌어서 범위 선택
      d.vs = parseInt(grid.getAttribute('data-vs'), 10); d.ve = parseInt(grid.getAttribute('data-ve'), 10);
      if (!isFinite(d.vs) || !isFinite(d.ve) || !isFinite(rsvAt(col.getAttribute('data-date'), 0))) return;
      d.kind = 'select'; d.col = col; d.date = col.getAttribute('data-date'); d.th = col.getAttribute('data-th') || '';
      d.a = rsvCellAt(d, e.clientY);
    } else return;
    R.drag = d; rsvDragBind(d);
  }
  function rsvDragBind(d) {
    var sc = $('.rsv-sc'), f = {
      cancel: function (e) { var R = S.rsv; if (R && R.drag && e.pointerId === R.drag.pid) rsvDragEnd(false); },
      key: function (e) { if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); e.stopPropagation(); rsvDragEnd(false); } },
      blur: function () { rsvDragEnd(false); },
      scroll: function () { rsvDragUpdate(); },
      sel: function (e) { e.preventDefault(); }   // 끄는 동안 글자가 선택되지 않게
    };
    document.addEventListener('pointermove', rsvDragMove); document.addEventListener('pointerup', rsvDragUp); document.addEventListener('pointercancel', f.cancel);
    document.addEventListener('keydown', f.key, true); document.addEventListener('selectstart', f.sel); window.addEventListener('blur', f.blur);
    if (sc) sc.addEventListener('scroll', f.scroll);
    d.off = function () {   // 끌기를 끝낼 때 한 번에 정리: 리스너 · 자동 스크롤 타이머 · 미리보기 · 표시
      document.removeEventListener('pointermove', rsvDragMove); document.removeEventListener('pointerup', rsvDragUp); document.removeEventListener('pointercancel', f.cancel);
      document.removeEventListener('keydown', f.key, true); document.removeEventListener('selectstart', f.sel); window.removeEventListener('blur', f.blur);
      if (sc) sc.removeEventListener('scroll', f.scroll);
      if (d.tick) { clearInterval(d.tick); d.tick = 0; }
      if (d.ghost && d.ghost.parentNode) d.ghost.parentNode.removeChild(d.ghost);
      rsvDropMark(d, null);
      $$('.dragging').forEach(function (x) { x.classList.remove('dragging'); });
      document.body.classList.remove('rsv-dragging');
    };
  }
  function rsvCellAt(d, y) {   // 세로 위치 → 그 칸(이동 단위)의 시작 분 (정각이 소수 오차로 한 칸 밀리지 않게 두 자리에서 반올림한 뒤 내림)
    var r = d.col.getBoundingClientRect(), pm = Math.round((d.vs + (y - r.top) / RSV_PXM) * 100) / 100;
    if (pm > d.ve - 1) pm = d.ve - 1;
    if (pm < d.vs) pm = d.vs;
    return Math.floor(pm / d.unit) * d.unit;
  }
  function rsvDragMove(e) {
    var R = S.rsv, d = R && R.drag, dx, dy;
    if (!d || e.pointerId !== d.pid) return;
    if (e.buttons === 0) { rsvDragEnd(false); return; }   // 창 밖에서 버튼을 뗀 채 돌아옴 → 취소
    d.cx = e.clientX; d.cy = e.clientY;
    if (d.phase === 'down') {
      dx = Math.abs(d.cx - d.x0); dy = Math.abs(d.cy - d.y0);
      if (d.kind === 'select' ? !(dy >= RSV_DRAG_PX && rsvCellAt(d, d.cy) !== d.a) : !(dx >= RSV_DRAG_PX || dy >= RSV_DRAG_PX)) return;   // 빈 칸: 세로 4px + 누른 칸 벗어남 / 블록: 가로·세로 어느 쪽이든 4px
      d.phase = 'drag';
      d.ghost = document.createElement('div'); d.ghost.className = 'rsv-ghost' + (d.kind === 'month' ? ' float' : ''); d.ghost.setAttribute('aria-hidden', 'true');
      if (d.ev) d.ev.classList.add('dragging');
      document.body.classList.add('rsv-dragging');
    }
    rsvDragUpdate();
  }
  function rsvDragUp(e) {
    var R = S.rsv, d = R && R.drag;
    if (!d || e.pointerId !== d.pid) return;
    if (d.phase === 'drag') { d.cx = e.clientX; d.cy = e.clientY; rsvDragUpdate(); }   // 놓은 자리 기준으로 마지막으로 한 번 더 계산
    rsvDragEnd(true);
  }
  function rsvDragEnd(commit, quiet) {   // commit: 놓은 자리로 확정 / quiet: 화면을 벗어나는 중이라 그리기·확정 없이 정리만
    var R = S.rsv, d = R && R.drag, was, hit;
    if (!d) return;
    R.drag = null;
    if (d.off) d.off();
    was = d.phase === 'drag';
    hit = (commit && was && !quiet) ? d.drop : null;
    if (was) R.swallow = Date.now();   // 이어서 오는 click 은 삼킴
    if (d.late && !quiet && rsvShown()) rsvRender();   // 끄는 동안 미뤄 둔 그리기
    if (hit) { if (d.kind === 'select') rsvItemSheet({ date: hit.date, th: hit.th, min: hit.start, len: hit.end - hit.start }); else rsvDragCommit(R, d, hit); }
  }
  function rsvDropMark(d, cell) { if (d.dropEl && d.dropEl !== cell) d.dropEl.classList.remove('drop'); if (cell) cell.classList.add('drop'); d.dropEl = cell || null; }
  function rsvDragUpdate() {
    var R = S.rsv, d = R && R.drag, sc, sr, hit = null;
    if (!d || d.phase !== 'drag') return;
    sc = $('.rsv-sc'); sr = sc ? sc.getBoundingClientRect() : null;
    if (sr && d.cx >= sr.left && d.cx <= sr.right && d.cy >= sr.top && d.cy <= sr.bottom) {   // 스크롤 영역 안에서만 놓을 수 있음
      hit = d.kind === 'month' ? rsvHitMonth(d) : d.kind === 'resize' ? rsvHitResize(d) : d.kind === 'select' ? rsvHitSelect(d) : rsvHitMove(d);
    }
    d.drop = hit;
    rsvGhostPut(d, hit);
    rsvDragScroll(d, sc, sr);
  }
  function rsvHitMove(d) {   // 마우스가 있는 열(날짜·치료사)과 15분 눈금에 맞춘 새 시작 → { date, th, col, res }
    var cols = $$('#rsvbody .rsv-col'), col = null, i, r, th, tid, sm, res;
    for (i = 0; i < cols.length; i++) { r = cols[i].getBoundingClientRect(); if (d.cx >= r.left && d.cx < r.right) { col = cols[i]; break; } }
    if (!col) return null;
    r = col.getBoundingClientRect(); th = col.getAttribute('data-th');   // 하루 보기만 열에 치료사가 있음
    tid = (th === null || th === (d.item.therapist_id || '')) ? undefined : th;
    if (tid !== undefined && !rsvCanTo(tid)) return null;   // 사용하지 않는 치료사 열에는 놓을 수 없음 (같은 치료사 안에서는 사용 중지여도 옮길 수 있음)
    sm = d.vs + (d.cy - r.top) / RSV_PXM - d.grab;
    if (sm < d.vs) sm = d.vs;
    if (sm > Math.max(d.vs, d.ve - d.unit)) sm = Math.max(d.vs, d.ve - d.unit);
    res = rsvMove(d.item, col.getAttribute('data-date'), sm, d.unit, tid);
    return { date: col.getAttribute('data-date'), th: th, col: col, res: res };
  }
  function rsvHitResize(d) {   // 끝 시각만: 마우스 높이 → 이동 단위 눈금 (최소 한 칸 · 최대 12시간 · 보이는 범위 끝을 넘지 않음)
    var r = d.col.getBoundingClientRect(), pm = d.vs + (d.cy - r.top) / RSV_PXM, res;
    if (pm > d.ve) pm = d.ve;
    res = rsvResize(d.item, pm, d.unit);
    if (rsvMinOn(Date.parse(res.end_at), d.sp.ymd) > d.ve) res = rsvResize(d.item, rsvSnap(d.ve, d.unit, 'floor'), d.unit);   // 눈금에 맞추다 끝을 넘으면 한 칸 줄임
    return { date: d.sp.ymd, th: d.col.getAttribute('data-th'), col: d.col, res: { start_at: res.start_at, end_at: res.end_at, therapist_id: d.item.therapist_id } };   // 시작·치료사는 그대로
  }
  function rsvHitMonth(d) {   // 월 보기: 마우스가 있는 날짜 칸. 시각·길이·치료사는 그대로
    var cells = $$('#rsvbody .rsv-cell'), i, r, c = null, date;
    for (i = 0; i < cells.length; i++) { r = cells[i].getBoundingClientRect(); if (d.cx >= r.left && d.cx < r.right && d.cy >= r.top && d.cy < r.bottom) { c = cells[i]; break; } }
    if (!c) return null;
    date = c.getAttribute('data-date');
    return { date: date, th: null, cell: c, res: { start_at: rsvIso(date, d.sp.s), end_at: rsvIso(date, d.sp.e), therapist_id: d.item.therapist_id } };
  }
  function rsvHitSelect(d) {   // 빈 칸 끌기: 누른 칸과 지금 칸(둘 다 포함) → 시작·끝(분). 열은 처음 누른 열 그대로
    var b = rsvCellAt(d, d.cy), lo = Math.min(d.a, b), hi = Math.max(d.a, b) + d.unit;
    if (hi - lo > 720) { if (b >= d.a) hi = lo + 720; else lo = hi - 720; }
    if (hi > 1440) hi = 1440;
    return { date: d.date, th: d.th, col: d.col, start: lo, end: hi };
  }
  function rsvGhostPut(d, hit) {   // 미리보기: 주·하루 = 놓일 열 안에 반투명 블록 / 월 = 마우스 옆에 떠 있는 작은 글 + 놓일 칸 강조
    var g = d.ghost, col, s, e, top, hh, H, name, tx, th, tn;
    if (!g) return;
    if (!hit) { if (g.parentNode) g.parentNode.removeChild(g); rsvDropMark(d, null); return; }
    name = d.kind === 'select' ? '새 예약' : (rsvItemTitle(d.item) || '(이름 없음)');
    if (d.kind === 'month') {
      e = d.sp.e; tx = rsvMD(hit.date) + ' ' + rsvHm(d.sp.s) + '–' + rsvHm(e > 1440 ? e - 1440 : e);
      g.innerHTML = '<b>' + esc(name) + '</b> <span>' + esc(tx) + '</span>';
      if (g.parentNode !== document.body) document.body.appendChild(g);
      g.style.left = Math.round(d.cx + 14) + 'px'; g.style.top = Math.round(d.cy + 14) + 'px';
      rsvDropMark(d, hit.cell);
      return;
    }
    col = hit.col;
    if (d.kind === 'select') { s = hit.start; e = hit.end; }
    else { s = rsvMinOn(Date.parse(hit.res.start_at), hit.date); e = s + Math.round((Date.parse(hit.res.end_at) - Date.parse(hit.res.start_at)) / 60000); }
    th = col.getAttribute('data-th'); tn = '';
    if (th !== null && d.kind !== 'select') tn = rsvTher(th) ? rsvTher(th).name : '(알 수 없음)';
    tx = rsvHm(s) + '–' + rsvHm(e > 1440 ? e - 1440 : e) + (tn ? ' · ' + tn : '');
    g.innerHTML = '<b>' + esc(name) + '</b> <span>' + esc(tx) + '</span>';
    H = (d.ve - d.vs) * RSV_PXM; top = (s - d.vs) * RSV_PXM; hh = Math.max(RSV_MINH, (e - s) * RSV_PXM);
    if (top + hh > H) hh = Math.max(1, H - top);
    g.style.top = rsvPx(top); g.style.height = rsvPx(hh);
    if (g.parentNode !== col) col.appendChild(g);
  }
  function rsvEdgeDelta(sr, x, y) {   // 가장자리에 가까울수록 빠르게 (위: 음수, 아래: 양수 · px/틱). 스크롤 영역의 가로 범위 밖이면 0
    var hd = $('.rsv-hdrow'), top, z = RSV_EDGE, r;
    if (x < sr.left || x > sr.right) return 0;
    top = Math.max(sr.top, hd ? hd.getBoundingClientRect().bottom : 0);   // 고정 머리글 아래부터가 실제로 보이는 칸
    if (y < top + z) { r = Math.min(1, (top + z - y) / z); return -Math.max(2, Math.round(20 * r)); }
    if (y > sr.bottom - z) { r = Math.min(1, (y - (sr.bottom - z)) / z); return Math.max(2, Math.round(20 * r)); }
    return 0;
  }
  function rsvDragScroll(d, sc, sr) {   // 가장자리 근처면 타이머를 켜고 벗어나면 끔
    var dl = (sc && sr) ? rsvEdgeDelta(sr, d.cx, d.cy) : 0;
    if (dl && !d.tick) d.tick = setInterval(rsvDragTick, RSV_TICK);
    else if (!dl && d.tick) { clearInterval(d.tick); d.tick = 0; }
  }
  function rsvDragTick() {
    var R = S.rsv, d = R && R.drag, sc, sr, dl;
    if (!d || d.phase !== 'drag') return;
    sc = $('.rsv-sc'); if (!sc) return;
    sr = sc.getBoundingClientRect(); dl = rsvEdgeDelta(sr, d.cx, d.cy);
    if (dl) sc.scrollTop = sc.scrollTop + dl;
    rsvDragUpdate();   // 안 움직인 마우스 밑에서 내용이 흘렀으므로 다시 계산
  }
  function rsvSameSpot(it, res) { return Date.parse(it.start_at) === Date.parse(res.start_at) && Date.parse(it.end_at) === Date.parse(res.end_at) && (it.therapist_id || '') === (res.therapist_id || ''); }
  function rsvDragCommit(R, d, hit) {   // 놓았다: 제자리면 아무것도 안 함 → 저장 전과 같은 경고 검사 → (경고 확인) → 서버에 보냄
    var it = R.items[d.id], res = hit.res, rz = d.kind === 'resize', ver, cand;
    if (!it || it.version !== d.ver || rsvSameSpot(it, res)) return;
    ver = it.version;
    cand = Object.assign({}, it, { start_at: res.start_at, end_at: res.end_at, therapist_id: res.therapist_id });
    rsvWarnList(cand).then(function (list) {
      if (S.rsv !== R) return;
      if (!list.length) rsvDoMove(R, d.id, ver, res, rz);
      else rsvConfirmWarn(null, list, function () { rsvDoMove(R, d.id, ver, res, rz); }, rz
        ? { title: '시간 변경 전 확인', ok: '그래도 변경', note: '아래 내용을 확인해 주세요. 그래도 길이를 바꿀 수 있습니다.' }
        : { title: '이동 전 확인', ok: '그래도 이동', note: '아래 내용을 확인해 주세요. 그래도 이동할 수 있습니다.' });
    });
  }
  function rsvDoMove(R, id, ver, res, rz) {
    var it, mine, before;
    if (S.rsv !== R) return;
    it = R.items[id];
    if (!it || R.busy[id]) return;
    if (it.version !== ver) { toast('그사이 다른 직원이 이 예약을 바꿨습니다. 최신 내용을 확인한 뒤 다시 해 주세요.'); return; }
    before = rsvBefore(it);
    mine = Object.assign({}, it, { start_at: res.start_at, end_at: res.end_at, therapist_id: res.therapist_id });
    R.busy[id] = true; R.items[id] = mine;   // 서버 답을 기다리는 동안 이미 새 자리에 보여 줌
    if (rsvShown()) rsvRender();
    sb.rpc('rsv_item_move', { p_id: id, p_start: res.start_at, p_end: res.end_at, p_therapist: res.therapist_id, p_version: ver }).then(function (r) { return r; }, function (e) { return { data: null, error: e }; }).then(function (r) {
      var row, sp, e;
      delete R.busy[id];
      if (S.rsv !== R) return;
      if (r.error) {   // 거절·실패: 아직 내 임시 표시 그대로면 원위치 (그 사이 더 새 내용이 왔으면 그대로 둠) + 이유(충돌이면 다시 불러옴)
        if (R.items[id] === mine) R.items[id] = it;
        rsvFail(R, r.error);
        if (rsvShown()) rsvRender();
        return;
      }
      row = rsvOne(r.data);
      if (!row || !row.id) { if (R.items[id] === mine) R.items[id] = it; rsvLoad(); if (rsvShown()) rsvRender(); return; }   // 결과를 못 받음 → 서버 기준으로 다시
      if (row.version !== ver) rsvPushUndo(R, { op: 'move', id: id, ver: row.version, before: before, after: row, label: (row.patient_name || '') + (rz ? ' 시간 변경' : ' 예약 이동') });
      rsvPut(row);
      sp = rsvSpan(row);
      if (sp) { e = sp.e > 1440 ? sp.e - 1440 : sp.e; toast(esc(row.patient_name) + (rz ? ' 예약 시간을 바꿨습니다 (' + rsvHm(sp.s) + '–' + rsvHm(e) + ')' : ' 예약을 옮겼습니다 (' + rsvMD(sp.ymd) + ' ' + rsvHm(sp.s) + ')')); }
      else toast(esc(row.patient_name) + (rz ? ' 예약 시간을 바꿨습니다' : ' 예약을 옮겼습니다'));
    });
  }

  /* ================= 실시간 ================= */
  function subscribeRealtime() {
    if (S.channel) sb.removeChannel(S.channel);
    S.channel = sb.channel('noble-' + S.me.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, function (p) {
        var m = p.new;
        if (m.sender_id !== S.me.id && !S.solo) {
          var rr = S.rooms.find(function (x) { return x.id === m.room_id; });
          var ment = (m.mentions || []).indexOf(S.me.id) > -1, viewing = S.room && m.room_id === S.room.id && document.visibilityState === 'visible' && document.hasFocus();
          if ((!rr || !rr.muted || ment) && !viewing && !S.pushOn) playSound();
        }
        if (ND && m.sender_id !== S.me.id && !S.solo) {
          var dr = S.rooms.find(function (x) { return x.id === m.room_id; }), dmen = (m.mentions || []).indexOf(S.me.id) > -1;
          var dview = S.room && m.room_id === S.room.id && document.visibilityState === 'visible' && document.hasFocus();
          if ((!dr || !dr.muted || dmen) && !dview) {
            var dsp = S.profiles[m.sender_id] || {};
            var dgrp = dr && dr.type === 'group';
            deskNotify((dgrp ? dr.name + ' · ' : '') + nameTag(dsp) + (dmen ? ' (나를 언급)' : ''), m.body ? m.body.slice(0, 120) : (m.poll_id ? '투표를 올렸습니다' : '사진·파일을 보냈습니다'), '#room/' + m.room_id,
              { name: nameTag(dsp), room: dgrp ? dr.name : '1:1 대화', avatar: dsp.avatar_url || '', group: false, mention: dmen });
          }
        }
        if (S.room && m.room_id === S.room.id) { addMessage(m); if (m.sender_id !== S.me.id) markRead(); }
        else if (m.sender_id !== S.me.id && !S.solo && !S.pushOn && !ND) {
          var r = S.rooms.find(function (x) { return x.id === m.room_id; });
          var mention = (m.mentions || []).indexOf(S.me.id) > -1;
          if (!r || !r.muted || mention) {
            var sp = S.profiles[m.sender_id] || {}, who = sp.name || '';
            msgPopup((r && r.type === 'group' ? r.name + ' · ' + who : who) + (mention ? ' (나를 언급)' : ''), m.body ? m.body.slice(0, 80) : '사진·파일을 보냈습니다', sp, function () { location.hash = '#room/' + m.room_id; });
          }
        }
        refreshRooms();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, function (p) {
        if (!S.room || p.new.room_id !== S.room.id) return;
        var i = S.messages.findIndex(function (x) { return x.id === p.new.id; }); if (i > -1) { S.messages[i] = p.new; renderMessages(false); }
        refreshRooms();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_members' }, function (p) {
        var row = p.new && p.new.room_id ? p.new : p.old;
        if (S.room && row && row.room_id === S.room.id && p.eventType === 'UPDATE') { S.members[row.user_id] = p.new; updateUnreadCounts(); }
        else if (row && row.user_id === S.me.id && p.eventType !== 'UPDATE') refreshRooms();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, function (p) {
        var row = p.eventType === 'DELETE' ? p.old : p.new;
        if (!S.room || !row || row.room_id !== S.room.id || row.user_id === S.me.id) return;
        var list = S.reacts[row.message_id] = S.reacts[row.message_id] || [];
        var i = list.findIndex(function (x) { return x.user_id === row.user_id && x.emoji === row.emoji; });
        if (p.eventType === 'INSERT' && i < 0) list.push(row); else if (p.eventType === 'DELETE' && i > -1) list.splice(i, 1); else return;
        renderMessages(false);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'polls' }, function (p) {
        if (p.new && S.polls[p.new.id]) fetchPolls([p.new.id]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms' }, function (p) {
        if (S.room && p.new && p.new.id === S.room.id && S.room.info && (S.room.info.notice_id || null) !== (p.new.notice_message_id || null)) refreshRooms();
        else if (p.old && p.new && p.old.name !== undefined && p.old.name !== p.new.name) refreshRooms();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, function (p) {
        loadNotices().then(function () {
          if (p.eventType === 'INSERT' && p.new.author_id !== S.me.id && !S.solo && !S.pushOn) playSound();
          if (ND && p.eventType === 'INSERT' && p.new.author_id !== S.me.id && !S.solo) deskNotify('📢 새 공지', p.new.title, '#notice/' + p.new.id, { name: '📢 새 공지', room: '공지사항' });
          if (p.eventType === 'INSERT' && p.new.author_id !== S.me.id) toast('<b>📢 새 공지</b> ' + esc(p.new.title), function () { location.hash = '#notice/' + p.new.id; });
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ip_requests' }, function (p) {
        if (!isAttMgr()) return;
        loadIpReqs().then(function () {
          if (p.eventType === 'INSERT' && p.new && p.new.status === 'pending') {
            if (!S.solo && !S.pushOn) playSound();
            toast('<b>🛜 병원 주소 등록 요청</b> ' + esc((p.new.names || []).join(', ') + (p.new.label ? ' · ' + p.new.label : '')), gotoIpReqs);
          }
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'care_queue' }, function (p) {
        queueRefreshSoon();
        var row = p.new;
        if (p.eventType === 'INSERT' && row && row.status === 'pending' && row.created_by !== S.me.id) queueAlert(row);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_requests' }, function (p) {
        loadPending();
        if (p.eventType === 'UPDATE' && p.new.user_id === S.me.id && p.old && p.new.status !== '대기') toast('<b>근무 신청 ' + esc(p.new.status) + '</b> ' + esc(p.new.kind + ' ' + p.new.work_date), function () { S.workTab = 'mine'; location.hash = '#work'; });
        if (S.route.tab === 'work' && (S.workTab === 'mine' || S.workTab === 'all')) workList(S.workTab === 'all');   // 출퇴근·신청하기 화면은 그대로 둠
      })
      .subscribe();
    /* 순서표 공지는 따로 만든 채널로 듣는다 — 11번 SQL 을 올리기 전에 앱이 먼저 올라가도(표가 아직 없어도) 위의 기존 실시간(메시지·순서표 등)에 영향이 없게 */
    if (S.nChannel) sb.removeChannel(S.nChannel);
    S.nChannel = sb.channel('noble-qn-' + S.me.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'care_queue_notice' }, function (p) {
        var row = p.new;
        if (row && typeof row.body === 'string') { S.qNotice = row; S.qNoticeErr = ''; if (qShown()) renderQueueBody(); }   // 다른 직원이 고친 공지를 바로 반영 (내 수정 창은 그대로 둠)
        else queueRefreshSoon();   // 지워졌거나 내용이 오지 않은 경우: 다시 불러옴
      })
      .subscribe();
    /* 예약(업데이트 12)도 따로 만든 채널로 듣는다 — 12번 SQL 을 올리기 전에 앱이 먼저 올라가도(표가 아직 없어도) 기존 실시간에 영향이 없게 */
    if (S.rChannel) sb.removeChannel(S.rChannel);
    S.rChannel = ['rsv_items', 'rsv_blocks', 'rsv_therapists', 'rsv_settings'].reduce(function (ch, t) {
      return ch.on('postgres_changes', { event: '*', schema: 'public', table: t }, function (p) { rsvApply(t, p); });
    }, sb.channel('noble-rsv-' + S.me.id)).subscribe();
  }

  /* ================= 시트(모달) ================= */
  function sheet(title, body) {
    var m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', title.replace(/<[^>]+>/g, ''));
    m.innerHTML = '<div class="sheet"><div class="sheet-hd"><h2>' + title + '</h2><button class="icon-btn" data-close aria-label="닫기">' + svg('x') + '</button></div>' + body + '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) closeSheet(m); });
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closeSheet(m); } });
    var f = m.querySelector('input:not([type=checkbox]):not([type=file]),textarea'); setTimeout(function () { if (f) f.focus(); }, 60);
    return m;
  }
  function closeSheet(m) { if (m && m.parentNode) m.remove(); }

  /* PC: 창을 다시 클릭해 앞으로 오면 채팅방 입력창에 커서 */
  window.addEventListener('focus', function () {
    if (!DESKTOP.matches || !S.room || $('.modal')) return;
    setTimeout(function () {
      var t = $('#txt'), a = document.activeElement;
      if (t && (!a || a === document.body)) t.focus();
    }, 30);
  });

  /* PC: 채팅방에서 아무 데나 보고 있다가 글자를 치면 바로 입력창으로 */
  document.addEventListener('keydown', function (e) {
    if (!DESKTOP.matches || !S.room || e.ctrlKey || e.metaKey || e.altKey || $('.modal')) return;
    if (!(e.key && (e.key.length === 1 || e.key === 'Process'))) return;
    var a = document.activeElement, t = $('#txt');
    if (!t || a === t || (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) || (a && a.isContentEditable)) return;
    t.focus();
  }, true);

  /* Ctrl+F (맥은 ⌘F): 채팅방이 열려 있으면 그 방 안 검색 · 방이 없으면 목록의 "대화방·메시지 검색" 칸으로.
     채팅 탭에서만 브라우저 기본 "찾기"를 대신하고, 다른 탭(순서표·근무신청 등)이나 열린 창이 있을 때는 기본 찾기를 그대로 둠 */
  document.addEventListener('keydown', function (e) {
    if (!S.route || S.route.tab !== 'chats' || e.altKey || e.shiftKey || !(e.ctrlKey || e.metaKey) || $('.modal')) return;
    var k = String(e.key || '').toLowerCase();
    if (!(k === 'f' || k === 'ㄹ' || (!/^[a-z]$/.test(k) && e.code === 'KeyF'))) return;   // 한글 입력 상태에서는 키 이름이 'ㄹ'·'Process' 로 올 수 있어 키 위치(KeyF)도 봄
    if (S.room && $('#msgs')) { e.preventDefault(); roomSearchBar(true); return; }
    var q = $('#roomQ'); if (q) { e.preventDefault(); q.focus(); q.select(); }
  }, true);

  /* ESC: 열린 창(시트) 닫기 → 답장 취소 → 방 검색 닫기 → 채팅방 나가기 (새 창이면 창 닫기) */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return;
    if (reactPopEl) { e.preventDefault(); hideReactPop(); return; }
    var ms = $$('.modal'); if (ms.length) { e.preventDefault(); ms[ms.length - 1].remove(); return; }
    var epk = $('#emojiPick'); if (epk && !epk.hidden) { e.preventDefault(); epk.hidden = true; return; }
    if (S.replyTo) { e.preventDefault(); setReply(null); return; }
    var rs = $('#roomSearch'); if (rs && !rs.hidden) { e.preventDefault(); var x = $('#rsX'); if (x) x.click(); else rs.hidden = true; return; }
    if (S.route && S.route.tab === 'chats' && S.route.id) {
      e.preventDefault();
      if (S.solo) { window.close(); return; }
      if (autoRoomOn()) { if (ND && ND.minimize) ND.minimize(); return; }   // 넓은 창: 닫아도 곧바로 다시 열리므로 닫지 않음 · PC 프로그램은 바로 최소화
      location.hash = '#chats';
      return;
    }
    // PC 프로그램 첫 화면(목록 등)에서 ESC = 창 최소화
    if (ND && ND.minimize && !S.solo && !$('.sheet') && !(document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && document.activeElement.value)) {
      e.preventDefault(); ND.minimize();
    }
  });
  /* 확인창 대신 버튼을 두 번 누르게 함 */
  function confirmInline(btn, msg) {
    if (btn.getAttribute('data-armed')) return true;
    var orig = btn.textContent; btn.setAttribute('data-armed', '1'); btn.textContent = msg;
    setTimeout(function () { btn.removeAttribute('data-armed'); btn.textContent = orig; }, 3500);
    return false;
  }

  /* 알림을 눌러 들어온 경우 */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
    navigator.serviceWorker.addEventListener('message', function (e) { if (e.data && e.data.type === 'open' && e.data.url) location.hash = e.data.url; });
  }
  sb.auth.onAuthStateChange(function (ev) { if (ev === 'SIGNED_OUT' && S.me) { S.me = null; renderLogin(); } });
  boot();
})();
