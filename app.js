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
    plus: '<path d="M12 5v14M5 12h14"/>', back: '<path d="M15 18l-6-6 6-6"/>', clip: '<path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>',
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
    check: '<path d="M5 12l5 5 9-10"/>',
    at: '<circle cx="12" cy="12" r="3.6"/><path d="M15.6 12v1.4a2.4 2.4 0 0 0 4.8 0V12a8.4 8.4 0 1 0-3.3 6.7"/>',
    crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M2 6h14a2 2 0 0 1 2 2v14"/>'
  };
  /* 프로필 사진(없으면 이름 첫 글자) */
  function av(p, cls) {
    p = p || {}; var u = p.avatar_url;
    return '<span class="avatar' + (cls ? ' ' + cls : '') + (u ? ' ph' : '') + '"' + (p.id ? ' data-uid="' + p.id + '"' : '') + '>' + (u ? '<img src="' + esc(u) + '" alt="" loading="lazy">' : esc(initial(p.name))) + '</span>';
  }
  var DESKTOP = window.matchMedia('(hover:hover) and (pointer:fine)');
  var NARROW = window.matchMedia('(max-width:860px)');
  var EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '✅'];
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
  if (ND && ND.onOpen) ND.onOpen(function (hash) {
    if (!hash) { if (ND.focusMain) ND.focusMain(); return; }
    var rm = /^#room\/([^/]+)/.exec(hash);
    if (rm) { openRoomWindow(rm[1]); return; }   // 채팅 알림은 항상 새 작은 창
    if (ND.focusMain) ND.focusMain();
    location.hash = hash;
  });
  function deskNotify(title, body, hash) {
    if (!ND) return false;
    ND.notify({ title: title, body: body, hash: hash, silent: soundOn() });
    return true;
  }

  /* 프로필 사진 크게 보기 */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.avatar[data-uid]');
    if (!a || a.closest('.room-item') || a.closest('.mention-box') || a.closest('.pick') || a.closest('.pv')) return;
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
      '<div class="pv-btns">' + (p.id !== S.me.id ? '<button class="btn btn-gold" id="pvDm">1:1 대화</button>' : '<button class="btn btn-gold" id="pvSet">프로필 사진 바꾸기</button>') + '</div></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) m.remove(); });
    m.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); m.remove(); } });
    setTimeout(function () { var x = $('.pv-x', m); if (x) x.focus(); }, 30);
    var dm = $('#pvDm', m); if (dm) dm.onclick = function () { m.remove(); sb.rpc('start_dm', { other: uid }).then(function (r) { if (r.error) { toast(esc(errMsg(r.error))); return; } loadRooms().then(function () { location.hash = '#room/' + r.data; }); }); };
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
    me: null, profiles: {}, rooms: [], notices: [], noticeReads: {}, pendingCount: 0,
    route: { tab: 'chats', id: null }, room: null, members: {}, messages: [], oldestLoaded: null, hasOlder: false,
    urlCache: {}, channel: null, solo: false, polls: {}, pollSel: {}, pollLoading: {}, imgSize: {}, replyTo: null, reacts: {}, replyCache: {}, workTab: 'new', adminMonth: ymd(new Date()).slice(0, 7), adminStatus: '전체', staffQuery: ''
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
        renderShell();
        subscribeRealtime(); checkPush();
        return Promise.all([loadRooms(), loadNotices(), loadPending()]).then(function () { route(); });
      });
    }).catch(function (e) { renderLogin(errMsg(e)); });
  }

  /* ---------------- 화면 틀 ---------------- */
  var TABS = [['chats', '채팅', 'chat'], ['notices', '공지', 'bell'], ['work', '근무신청', 'clock'], ['staff', '직원', 'users'], ['settings', '설정', 'gear']];
  function renderShell() {
    var tabs = TABS.slice(); if (S.me.role === 'admin') tabs.splice(4, 0, ['admin', '관리', 'shield']);
    root.innerHTML = '<div class="app" id="app"><nav class="rail" aria-label="메뉴"><img class="logo" src="logo.svg" alt="노블">' +
      tabs.map(function (t) { return '<a class="tab" href="#' + t[0] + '" data-tab="' + t[0] + '">' + svg(t[2]) + '<span>' + t[1] + '</span><span class="badge" data-badge="' + t[0] + '" hidden></span></a>'; }).join('') +
      '<div class="spacer"></div></nav>' +
      '<section class="list-pane" id="list"></section><section class="main-pane" id="main"></section></div>';
  }
  function setBadges() {
    var chat = S.rooms.reduce(function (a, r) { return a + (r.muted ? 0 : r.unread); }, 0);
    var nt = S.notices.filter(function (n) { return !S.noticeReads[n.id]; }).length;
    var signups = S.me.role === 'admin' ? Object.keys(S.profiles).filter(function (k) { return S.profiles[k].pending; }).length : 0;
    var map = { chats: chat, notices: nt, admin: S.pendingCount + signups, work: S.me.role === 'admin' ? S.pendingCount : 0 };
    $$('[data-badge]').forEach(function (b) { var v = map[b.getAttribute('data-badge')] || 0; b.hidden = !v; b.textContent = v > 99 ? '99+' : v; });
    if (ND && ND.setBadge) ND.setBadge(chat + nt);
    try { if (navigator.setAppBadge) { var tot = chat + nt; tot ? navigator.setAppBadge(tot) : navigator.clearAppBadge(); } } catch (e) {}
  }

  /* ---------------- 라우팅 ---------------- */
  window.addEventListener('hashchange', route);
  function route() {
    if (!S.me) return;
    var h = location.hash.replace(/^#/, '') || 'chats', parts = h.split('/');
    var tab = parts[0], id = parts[1] || null;
    S.solo = tab === 'room' && parts[2] === 'solo';
    if (tab === 'room') { S.route = { tab: 'chats', id: id }; }
    else if (tab === 'notice') { S.route = { tab: 'notices', id: id }; }
    else { S.route = { tab: tab, id: null }; }
    var app = $('#app'); if (!app) return;
    $$('.tab').forEach(function (t) { if (t.getAttribute('data-tab') === S.route.tab) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    app.classList.remove('in-detail', 'in-room', 'single');
    app.classList.toggle('solo', S.solo);
    if (S.route.tab !== 'chats' || !S.route.id) leaveRoom();
    switch (S.route.tab) {
      case 'chats': renderRoomList(); if (S.route.id) { app.classList.add('in-detail', 'in-room'); openRoom(S.route.id); } else renderPlaceholder('대화를 선택해 주세요'); break;
      case 'notices': renderNoticeList(); if (S.route.id) { app.classList.add('in-detail'); openNotice(+S.route.id); } else renderPlaceholder('공지를 선택해 주세요'); break;
      case 'work': single(); renderWork(); break;
      case 'staff': single(); renderStaff(); break;
      case 'admin': single(); if (S.me.role === 'admin') renderAdmin(); break;
      case 'settings': single(); renderSettings(); break;
      default: location.hash = '#chats';
    }
    setBadges();
  }
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

  function renderRoomList() {
    unsingle(); $('#main').style.justifyContent = '';
    var q = (S.roomQuery || '').trim();
    var list = S.rooms.filter(function (r) { return !q || (r.name || '').indexOf(q) > -1; });
    $('#list').innerHTML = header('채팅', { right: '<button class="icon-btn" id="newChat" aria-label="새 대화">' + svg('plus') + '</button>' }) +
      '<div class="search">' + svg('search') + '<input id="roomQ" placeholder="대화방·메시지 검색" value="' + esc(q) + '" aria-label="대화방·메시지 검색"></div><div id="pushAsk"></div>' +
      '<div class="pane-body">' + (q && list.length ? '<div class="group-hd">대화방</div>' : '') + (list.length ? list.map(function (r) {
        var grp = r.type === 'group';
        var face = grp ? '<span class="avatar grp">#</span>' : r.type === 'self' ? av(S.me, 'me') : av(S.profiles[r.other_id] || { name: r.name });
        return '<a class="room-item' + (r.pinned ? ' pinned' : '') + '" href="#room/' + r.id + '" data-room="' + r.id + '"' + (S.route.id === r.id ? ' aria-current="true"' : '') + '>' + face +
          '<span class="ri-main"><span class="ri-top"><b>' + (r.pinned ? '<svg class="pin-ico" viewBox="0 0 24 24">' + IC.pin + '</svg>' : '') + esc(r.name) + (r.type === 'dm' && pTag(S.profiles[r.other_id]) ? '<span class="who-tag">' + esc(pTag(S.profiles[r.other_id])) + '</span>' : '') + (grp ? '<small>' + r.member_count + '</small>' : '') + (r.muted ? ' <svg class="mute-ico" viewBox="0 0 24 24">' + IC.mute + '</svg>' : '') + '</b><time>' + (r.last_body != null ? shortTime(r.last_message_at) : '') + '</time></span>' +
          '<span class="ri-bot"><p>' + esc(r.last_body == null ? '새 대화방' : (grp && r.last_sender ? r.last_sender + ': ' : '') + r.last_body) + '</p>' + (r.unread ? '<span class="badge">' + (r.unread > 99 ? '99+' : r.unread) + '</span>' : '') + '</span></span></a>';
      }).join('') : (q ? '' : '<p class="empty">아직 대화가 없습니다.<br>오른쪽 위 + 버튼으로 대화를 시작하세요.</p>')) +
      (q ? '<div id="msgResults">' + msgResultsHtml(q) + '</div>' : '') + '</div>';
    $('#newChat').onclick = newChatSheet;
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
    var qi = $('#roomQ'); qi.oninput = function () { S.roomQuery = qi.value; var pos = qi.selectionStart; renderRoomList(); var n = $('#roomQ'); n.focus(); n.setSelectionRange(pos, pos); };
    if (q.length >= 2 && (!S.msgSearch || S.msgSearch.q !== q)) searchAllMessages(q);
    renderPushAsk();
    wireMsgResults();
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
    return '<div class="group-hd">메시지 ' + ms.length + (ms.length >= 60 ? '+' : '') + '건</div>' + ms.map(function (m) {
      var r = S.rooms.find(function (x) { return x.id === m.room_id; }) || {}, p = S.profiles[m.sender_id] || { name: '(퇴사자)' };
      return '<button class="hit" data-hit="' + m.id + '">' + av(p, 'sm') + '<span class="hit-main"><span class="hit-top"><b>' + esc(r.name || '') + '</b><time>' + shortTime(m.created_at) + '</time></span>' +
        '<span class="hit-body"><em>' + esc(p.name) + '</em> ' + hl(around(m.body, q), q) + '</span></span></button>';
    }).join('');
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
  function roomSearchBar() {
    var bar = $('#roomSearch'); if (!bar) return;
    if (!bar.hidden) { bar.hidden = true; S.searchQ = ''; renderMessages(false); return; }
    bar.hidden = false;
    bar.innerHTML = '<div class="rs-in">' + svg('search') + '<input id="rsQ" placeholder="이 대화방에서 검색 (두 글자 이상)" aria-label="대화방 안에서 검색"><button type="button" id="rsX" aria-label="검색 닫기">' + svg('x') + '</button></div><div class="rs-list" id="rsList" hidden></div>';
    var inp = $('#rsQ'), list = $('#rsList'), t = null;
    inp.focus();
    $('#rsX').onclick = function () { bar.hidden = true; S.searchQ = ''; renderMessages(false); };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); $('#rsX').click(); } if (e.key === 'Enter') { e.preventDefault(); run(); } });
    inp.addEventListener('input', function () { clearTimeout(t); t = setTimeout(run, 350); });
    function run() {
      var q = inp.value.trim(); S.searchQ = q;
      if (q.length < 2) { list.hidden = true; renderMessages(false); return; }
      var rid = S.room.id, cl = S.room.info && S.room.info.cleared_at;
      var qq = sb.from('messages').select('id, room_id, sender_id, body, created_at').eq('room_id', rid).eq('deleted', false).ilike('body', likePat(q));
      if (cl) qq = qq.gt('created_at', cl);
      qq.order('created_at', { ascending: false }).limit(100).then(function (r) {
        if (!S.room || S.room.id !== rid || S.searchQ !== q) return;
        var rows = r.data || [];
        list.hidden = false;
        list.innerHTML = rows.length ? '<p class="rs-count">' + rows.length + (rows.length >= 100 ? '+' : '') + '건</p>' + rows.map(function (m) {
          var p = S.profiles[m.sender_id] || { name: '(퇴사자)' };
          return '<button data-rs="' + m.id + '"><b>' + esc(nameTag(p)) + '</b><time>' + shortTime(m.created_at) + ' ' + hm(m.created_at) + '</time><span>' + hl(around(m.body, q), q) + '</span></button>';
        }).join('') : '<p class="rs-count">검색 결과가 없습니다.</p>';
        $$('[data-rs]', list).forEach(function (b) { b.onclick = function () { var m = rows.find(function (x) { return x.id === +b.getAttribute('data-rs'); }); list.hidden = true; jumpToMsg(m); }; });
        renderMessages(false);
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

  /* ---- 대화방 ---- */
  function leaveRoom() { S.room = null; S.messages = []; S.members = {}; S.replyTo = null; S.reacts = {}; S.pollSel = {}; }
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
    // 나갔던(숨긴) 방에 다시 들어오면 목록에 다시 보이게
    if (!info && !(S.unhid || (S.unhid = {}))[id]) {
      S.unhid[id] = true;
      sb.from('room_members').update({ hidden: false }).eq('room_id', id).eq('user_id', S.me.id).eq('hidden', true)
        .then(function () { return loadRooms(); })
        .then(function () { if (S.route.id === id) { S.room = null; openRoom(id); } if (!S.solo) refreshRooms(); });
    }
    S.room = { id: id, info: info }; S.messages = []; S.members = {}; S.hasOlder = false;
    $('#main').style.justifyContent = '';
    var title = roomTitle(info);
    var right = '<button class="icon-btn" id="roomSearchBtn" aria-label="대화 내용 검색" title="대화 내용 검색">' + svg('search') + '</button>' + (DESKTOP.matches && !S.solo ? '<button class="icon-btn" id="popOut" aria-label="새 창으로 열기" title="새 창으로 열기">' + svg('pop') + '</button>' : '') +
      '<button class="icon-btn" id="roomMenu" aria-label="대화방 메뉴">' + svg('more') + '</button>';
    $('#main').innerHTML = '<div class="chat">' + header(title, { back: '#chats', right: right }) + '<div id="roomNotice"></div><div class="room-search" id="roomSearch" hidden></div>' +
      '<div class="msgs" id="msgs" aria-live="polite"><p class="empty">불러오는 중…</p></div><div class="uploading" id="upl" hidden></div>' +
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
    $('#roomSearchBtn').onclick = roomSearchBar; S.searchQ = '';
    var pb = $('#pollBtn'); if (pb) pb.onclick = pollCreateSheet;
    var po = $('#popOut'); if (po) po.onclick = function () {
      openRoomWindow(id);
    };
    if (S.solo && info) document.title = info.name + ' · 노블 메신저';
    renderRoomNotice(); applyRoomColor();
    var txt = $('#txt'), btn = $('#sendBtn');
    function grow() { txt.style.height = 'auto'; txt.style.height = Math.min(140, txt.scrollHeight) + 'px'; btn.disabled = !txt.value.trim(); }
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
      postMessage(row);
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

  function renderMessages(toBottom) {
    var el = $('#msgs'); if (!el) return;
    var nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    var html = S.hasOlder ? '<button class="btn btn-line sm load-older" id="older">이전 메시지 보기</button>' : '';
    if (!S.messages.length) html += '<p class="empty">첫 메시지를 보내 보세요.</p>';
    var prev = null, needUrls = [];
    S.messages.forEach(function (m) {
      if (!prev || !sameDay(prev.created_at, m.created_at)) { html += '<div class="day">' + dayLabel(m.created_at) + '</div>'; prev = null; }
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
      var un = unreadCount(m);
      html += '<div class="msg' + (mine ? ' mine' : '') + (cont ? ' cont' : '') + '" data-id="' + m.id + '">' +
        (mine ? '' : av(p, 'sm')) +
        '<div class="col">' + (mine ? '' : '<div class="who">' + esc(p.name || '') + (pTag(p) ? '<span class="who-tag">' + esc(pTag(p)) + '</span>' : '') + '</div>') +
        '<div class="line"><div class="col" style="gap:4px">' + content + '</div><span class="meta">' + (un ? '<span class="unread">' + un + '</span>' : '') + '<time>' + hm(m.created_at) + '</time></span>' +
        (!m.deleted && m.body && !m.poll_id ? '<button class="copy-btn" data-act="copy" title="복사" aria-label="메시지 복사">' + svg('copy') + '</button>' : '') +
        (!m.deleted ? '<span class="msg-acts"><button data-act="react" title="공감" aria-label="공감">' + svg('smile') + '</button><button data-act="reply" title="답장" aria-label="답장">' + svg('reply') + '</button><button data-act="more" title="더보기" aria-label="더보기">' + svg('more') + '</button></span>' : '') +
        '</div>' + reactsHtml(m.id) + '</div></div>';
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
      el.addEventListener('click', function (e) {
        var pb = e.target.closest('[data-popt],[data-pvote],[data-pclose],[data-pwho],[data-predo]');
        if (pb) { pollClick(pb); return; }
        var b = e.target.closest('[data-act],[data-tog],[data-jump]'); if (!b) return;
        if (b.hasAttribute('data-jump')) { jumpTo(+b.getAttribute('data-jump')); return; }
        if (b.hasAttribute('data-tog')) { var t = b.getAttribute('data-tog').split('|'); toggleReact(+t[0], t[1]); return; }
        var mid = +b.closest('.msg').getAttribute('data-id'), msg = S.messages.find(function (x) { return x.id === mid; }); if (!msg) return;
        var a = b.getAttribute('data-act');
        if (a === 'copy') { copyText(msg.body, b); return; }
        if (a === 'reply') setReply(msg); else msgSheet(msg);
      });
      el.addEventListener('contextmenu', function (e) {
        var row = e.target.closest('.msg'); if (!row || e.target.closest('a')) return;
        var msg = S.messages.find(function (x) { return x.id === +row.getAttribute('data-id'); }); if (!msg || msg.deleted) return;
        e.preventDefault(); msgSheet(msg);
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
    if (toBottom || nearBottom) el.scrollTop = el.scrollHeight;
    $$('img', el).forEach(function (im) { im.addEventListener('load', function () { if (toBottom || nearBottom) el.scrollTop = el.scrollHeight; }, { once: true }); });
    signUrls(needUrls.filter(function (p) { return !cachedUrl(p); }));
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
      return '<button class="react' + (mine ? ' on' : '') + '" data-tog="' + mid + '|' + e + '" title="' + esc(names) + '">' + e + ' <b>' + us.length + '</b></button>';
    }).join('') + '</div>';
  }
  function toggleReact(mid, emoji) {
    var list = S.reacts[mid] = S.reacts[mid] || [], i = list.findIndex(function (x) { return x.user_id === S.me.id && x.emoji === emoji; });
    var q;
    if (i > -1) { list.splice(i, 1); q = sb.from('message_reactions').delete().eq('message_id', mid).eq('user_id', S.me.id).eq('emoji', emoji); }
    else { list.push({ message_id: mid, user_id: S.me.id, emoji: emoji }); q = sb.from('message_reactions').insert({ message_id: mid, room_id: S.room.id, user_id: S.me.id, emoji: emoji }); }
    renderMessages(false);
    q.then(function (r) { if (r.error && !/duplicate/i.test(r.error.message)) toast('<b>공감 실패</b> ' + esc(errMsg(r.error))); });
  }
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
    var s = sheet('메시지', '<div class="emoji-row">' + EMOJIS.map(function (e) { return '<button data-e="' + e + '" aria-label="' + e + ' 공감">' + e + '</button>'; }).join('') + '</div>' +
      '<div style="display:grid;gap:8px">' +
      '<button class="btn btn-line" id="mReply">답장</button>' +
      (m.body ? '<button class="btn btn-line" id="mCopy">복사</button>' : '') +
      '<button class="btn btn-line" id="mNotice">이 메시지를 대화방 공지로 등록</button>' +
      (mine ? '<button class="btn btn-danger" id="mDel">삭제</button>' : '') +
      '<button class="btn btn-line" data-close>닫기</button></div>');
    $$('[data-e]', s).forEach(function (b) { b.onclick = function () { closeSheet(s); toggleReact(m.id, b.getAttribute('data-e')); }; });
    $('#mReply', s).onclick = function () { closeSheet(s); setReply(m); };
    var c = $('#mCopy', s); if (c) c.onclick = function () { closeSheet(s); copyText(m.body); };
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

  function postMessage(row) {
    var roomId = S.room.id;
    row.room_id = roomId; row.sender_id = S.me.id;
    return sb.from('messages').insert(row).select().single().then(function (r) {
      if (r.error) throw r.error;
      addMessage(r.data);
      sb.functions.invoke('push', { body: { action: 'message', message_id: r.data.id } }).catch(function () {});
      refreshRooms();
    }).catch(function (e) { toast('<b>전송 실패</b> ' + esc(errMsg(e))); });
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
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') { markRead(); if (S.me) { reloadProfiles().then(function () { return loadRooms(); }).then(function () { if (S.route.tab === 'chats') renderRoomList(); }); loadNotices(); } } });

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

  function renderWork() {
    var admin = S.me.role === 'admin', tab = S.workTab;
    var main = $('#main'); main.style.justifyContent = '';
    main.innerHTML = header('근무 신청') + '<div class="pane-body" id="wbody">' +
      '<div class="seg" role="group" aria-label="근무 신청 메뉴"><button aria-pressed="' + (tab === 'new') + '" data-wt="new">신청하기</button><button aria-pressed="' + (tab === 'mine') + '" data-wt="mine">내 신청 내역</button>' +
      (admin ? '<button aria-pressed="' + (tab === 'all') + '" data-wt="all">전체 관리' + (S.pendingCount ? ' (' + S.pendingCount + ')' : '') + '</button>' : '') + '</div><div id="wcontent"></div></div>';
    $$('[data-wt]').forEach(function (b) { b.onclick = function () { S.workTab = b.getAttribute('data-wt'); renderWork(); }; });
    if (tab === 'new') workForm(); else if (tab === 'mine') workList(false); else workList(true);
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
      box.innerHTML = '<div class="toolbar"><input class="input" type="month" id="am" value="' + month + '" aria-label="월 선택"><select class="input" id="as" aria-label="상태">' +
        ['전체', '대기', '승인', '반려'].map(function (s) { return '<option' + (s === st ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>' +
        '<button class="btn btn-gold sm" id="csv">' + svg('down').replace('<svg', '<svg style="width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2"') + ' 급여정리용 엑셀(CSV)</button></div><div id="wl"><p class="empty">불러오는 중…</p></div>';
      $('#am').onchange = function () { S.adminMonth = this.value || S.adminMonth; workList(true); };
      $('#as').onchange = function () { S.adminStatus = this.value; workList(true); };
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
        wl.innerHTML = (sum ? '<p class="sum">승인 합계: ' + esc(sum) + '</p>' : '') + (rows.length ? rows.map(function (x) {
          var p = S.profiles[x.user_id] || { name: '(퇴사자)', dept: '' };
          return '<div class="req"><div class="req-top"><b>' + esc(p.name) + ' <span class="muted small">' + esc(p.dept) + '</span> · ' + esc(x.kind) + '</b>' + statusPill(x.status) + '</div>' +
            '<p>' + reqLine(x) + '</p>' + (x.reason ? '<p>사유: ' + esc(x.reason) + '</p>' : '') + (x.review_note ? '<p>메모: ' + esc(x.review_note) + '</p>' : '') +
            '<div class="req-actions">' + (x.status !== '승인' ? '<button class="btn btn-navy sm" data-ap="' + x.id + '">승인</button>' : '') + (x.status !== '반려' ? '<button class="btn btn-danger sm" data-rj="' + x.id + '">반려</button>' : '') +
            (x.status !== '대기' ? '<button class="btn btn-line sm" data-rs="' + x.id + '">대기로 되돌리기</button>' : '') + '</div></div>';
        }).join('') : '<p class="empty">이 달 신청 내역이 없습니다.</p>');
        $$('[data-ap]', wl).forEach(function (b) { b.onclick = function () { review(+b.getAttribute('data-ap'), '승인'); }; });
        $$('[data-rj]', wl).forEach(function (b) { b.onclick = function () { review(+b.getAttribute('data-rj'), '반려', true); }; });
        $$('[data-rs]', wl).forEach(function (b) { b.onclick = function () { review(+b.getAttribute('data-rs'), '대기'); }; });
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
    }).catch(function (e) { box.innerHTML = '<p class="empty">' + esc(errMsg(e)) + '</p>'; });
  }
  function review(id, status, askNote) {
    function go(note) {
      var patch = { status: status }; if (note != null) patch.review_note = note;
      sb.from('work_requests').update(patch).eq('id', id).then(function (r) {
        if (r.error) { toast(esc(errMsg(r.error))); return; }
        if (status !== '대기') sb.functions.invoke('push', { body: { action: 'request', request_id: id } }).catch(function () {});
        loadPending(); workList(true);
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
    return sb.from('work_requests').select('id', { count: 'exact', head: true }).eq('status', '대기').then(function (r) { S.pendingCount = r.count || 0; setBadges(); });
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
    var si = $('#sq'); si.oninput = function () { S.staffQuery = si.value; var pos = si.selectionStart; renderStaff(); var n = $('#sq'); n.focus(); n.setSelectionRange(pos, pos); };
    $$('[data-dm]').forEach(function (b) { b.onclick = function () { if (b.getAttribute('data-dm') === S.me.id) { openSelf(); return; } sb.rpc('start_dm', { other: b.getAttribute('data-dm') }).then(function (r) { if (r.error) { toast(esc(errMsg(r.error))); return; } loadRooms().then(function () { location.hash = '#room/' + r.data; }); }); }; });
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
      '<p class="err" id="ue"></p>' +
      '<div class="sheet-actions"><button class="btn btn-line" data-close>닫기</button><button class="btn btn-navy" id="uOk">' + (isNew ? '계정 만들기' : '저장') + '</button></div>' +
      (isNew ? '' : '<hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><div style="display:grid;gap:8px">' +
        '<div class="row2"><input class="input" id="npw" placeholder="새 비밀번호 (8자 이상)" autocomplete="new-password" aria-label="새 비밀번호"><button class="btn btn-line" id="rpw">비밀번호 초기화</button></div>' +
        (p.id !== S.me.id ? '<button class="btn ' + (p.active ? 'btn-danger' : 'btn-line') + '" id="tog">' + (p.active ? '사용 정지 (퇴사 처리)' : '다시 사용하기') + '</button>' : '') + '</div>'));
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
      '<section class="card"><h3>메시지 알림음</h3><p class="muted small" style="margin-bottom:10px">메신저가 켜져 있을 때 새 메시지가 오면 소리로 알려 줍니다. (이 기기에만 적용)<br>※ 아래 <b>알림 켜기</b>를 한 기기는 Windows·휴대폰 알림음이 대신 울립니다.</p>' +
      '<label class="switch-row"><input type="checkbox" id="sndOn"' + (soundOn() ? ' checked' : '') + '> 알림음 켜기</label>' +
      '<div class="snd-row"><select class="input" id="sndKind" aria-label="알림음 종류">' + Object.keys(SOUNDS).map(function (k) { return '<option value="' + k + '"' + (k === soundKind() ? ' selected' : '') + '>' + SOUNDS[k][0] + '</option>'; }).join('') + '</select>' +
      '<span class="small muted">크기</span><input type="range" id="sndVol" min="0.1" max="1" step="0.1" value="' + soundVol() + '" aria-label="소리 크기"><button class="btn btn-line sm" id="sndTest">미리 듣기</button></div></section>' +
      (ND ? '<section class="card"><h3>PC 프로그램</h3><p class="small">노블 메신저 PC 프로그램 ' + esc(ND.version || '') + ' 사용 중입니다. 새 메시지는 화면 오른쪽 아래 <b>Windows 알림</b>으로 표시됩니다.</p><p class="muted small" style="margin-top:6px">창의 X를 누르면 시계 옆 트레이로 숨고 알림은 계속 옵니다. 완전히 끄려면 트레이 아이콘 오른쪽 클릭 → 종료.</p><button class="btn btn-line sm" id="ndTest" style="margin-top:10px">알림 테스트</button><p class="muted small" id="ndTestMsg" style="margin-top:6px"></p></section>'
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
    $('#sndOn').onchange = function () { lsSet('noble-sound', this.checked ? 'on' : 'off'); if (this.checked) playSound(null, true); };
    $('#sndKind').onchange = function () { lsSet('noble-sound-kind', this.value); playSound(this.value, true); };
    $('#sndVol').onchange = function () { lsSet('noble-sound-vol', this.value); playSound(null, true); };
    $('#sndTest').onclick = function () { playSound($('#sndKind').value, true); };
    var ndt = $('#ndTest'); if (ndt) ndt.onclick = function () {
      deskNotify('노블 메신저 알림 테스트', '이 알림이 화면 오른쪽 아래에 보이면 정상입니다.', '#settings');
      $('#ndTestMsg').innerHTML = '알림이 안 보이면: Windows <b>설정 → 시스템 → 알림</b>에서 알림 켜기 · <b>노블 메신저</b> 켜기 · <b>방해 금지(집중 지원)</b> 끄기';
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
      unsubscribePush().then(function () { return sb.auth.signOut(); }).then(function () { S.me = null; if (S.channel) sb.removeChannel(S.channel); location.hash = ''; renderLogin(); });
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
            deskNotify((dr && dr.type === 'group' ? dr.name + ' · ' : '') + nameTag(dsp) + (dmen ? ' (나를 언급)' : ''), m.body ? m.body.slice(0, 120) : '사진·파일을 보냈습니다', '#room/' + m.room_id);
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
          if (ND && p.eventType === 'INSERT' && p.new.author_id !== S.me.id && !S.solo) deskNotify('📢 새 공지', p.new.title, '#notice/' + p.new.id);
          if (p.eventType === 'INSERT' && p.new.author_id !== S.me.id) toast('<b>📢 새 공지</b> ' + esc(p.new.title), function () { location.hash = '#notice/' + p.new.id; });
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_requests' }, function (p) {
        loadPending();
        if (p.eventType === 'UPDATE' && p.new.user_id === S.me.id && p.old && p.new.status !== '대기') toast('<b>근무 신청 ' + esc(p.new.status) + '</b> ' + esc(p.new.kind + ' ' + p.new.work_date), function () { S.workTab = 'mine'; location.hash = '#work'; });
        if (S.route.tab === 'work' && S.workTab !== 'new') workList(S.workTab === 'all');
      })
      .subscribe();
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

  /* ESC: 열린 창(시트) 닫기 → 답장 취소 → 방 검색 닫기 → 채팅방 나가기 (새 창이면 창 닫기) */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return;
    var ms = $$('.modal'); if (ms.length) { e.preventDefault(); ms[ms.length - 1].remove(); return; }
    var epk = $('#emojiPick'); if (epk && !epk.hidden) { e.preventDefault(); epk.hidden = true; return; }
    if (S.replyTo) { e.preventDefault(); setReply(null); return; }
    var rs = $('#roomSearch'); if (rs && !rs.hidden) { e.preventDefault(); var x = $('#rsX'); if (x) x.click(); else rs.hidden = true; return; }
    if (S.route && S.route.tab === 'chats' && S.route.id) {
      e.preventDefault();
      if (S.solo) { window.close(); return; }
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
