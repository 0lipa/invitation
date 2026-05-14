// ── 특별 이미지 대상 이름 목록 ──────────────────────
  const specialNames = ['박지수', '유시오', '박지해', '조주선', '신금진', '윤민교', '정우진'];
  const blockedNames = ['이용채', '이민형'];
  const BLOCKED_NAME_SET = new Set(blockedNames.map(name => name.normalize('NFC')));

  async function findImage(name) {
    const exts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    for (const ext of exts) {
      const path = `images/${name}.${ext}`;
      try {
        const res = await fetch(path, { method: 'HEAD' });
        if (res.ok) return path;
      } catch { /* skip */ }
    }
    return null;
  }

  // ── 배경 파티클 ──────────────────────────────────────
  const colors = ['#ff6b2b','#ffd166','#06d6a0','#ef233c','#a8dadc'];
  const bgDeco = document.getElementById('bgDeco');
  for (let i = 0; i < 18; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    const size = Math.random() * 60 + 20;
    dot.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${Math.random()*14+8}s;animation-delay:-${Math.random()*14}s;`;
    bgDeco.appendChild(dot);
  }

  // ── 화면 전환 ─────────────────────────────────────────
  function goToScreen(n) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen' + n).classList.add('active');
    if (n === 2) positionNoBtn();
  }

  function rectsOverlap(a, b, padding = 0) {
    return !(
      a.right < b.left - padding ||
      a.left > b.right + padding ||
      a.bottom < b.top - padding ||
      a.top > b.bottom + padding
    );
  }

  function getNoButtonSafePosition() {
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.querySelector('.btn-yes');
    const margin = 20;
    const gap = 28;
    const yesRect = yesBtn.getBoundingClientRect();
    const maxX = Math.max(margin, window.innerWidth - noBtn.offsetWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - noBtn.offsetHeight - margin);

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * (maxX - margin) + margin;
      const y = Math.random() * (maxY - margin) + margin;
      const nextRect = {
        left: x,
        top: y,
        right: x + noBtn.offsetWidth,
        bottom: y + noBtn.offsetHeight
      };

      if (!rectsOverlap(nextRect, yesRect, gap)) {
        return { x, y };
      }
    }

    const corners = [
      { x: margin, y: margin },
      { x: maxX, y: margin },
      { x: margin, y: maxY },
      { x: maxX, y: maxY }
    ];
    const yesCenterX = yesRect.left + yesRect.width / 2;
    const yesCenterY = yesRect.top + yesRect.height / 2;

    return corners.sort((a, b) => {
      const distA = Math.hypot(a.x - yesCenterX, a.y - yesCenterY);
      const distB = Math.hypot(b.x - yesCenterX, b.y - yesCenterY);
      return distB - distA;
    })[0];
  }

  function positionNoBtn() {
    const btn = document.getElementById('noBtn');
    const card = document.querySelector('#screen2 .card');
    if (!card) return;

    btn.style.display = 'inline-block';
    const position = getNoButtonSafePosition();
    btn.style.left = position.x + 'px';
    btn.style.top = position.y + 'px';
  }

  // ── 도망가는 아니오 버튼 ──────────────────────────────
  let runCount = 0;

  function getMaxScale() {
    return Math.max(1, (Math.min(window.innerWidth, window.innerHeight) * 0.55) / 160);
  }
  function growYesBtn() {
    const btn = document.querySelector('.btn-yes');
    const scale = 1 + (getMaxScale() - 1) * Math.pow(Math.min(runCount / 15, 1), 2);
    btn.style.transition = 'transform 0.3s cubic-bezier(.34,1.56,.64,1), font-size 0.3s, box-shadow 0.3s';
    btn.style.transform = `scale(${scale})`;
    btn.style.fontSize = (1.1 * Math.min(scale, 2.2)) + 'rem';
    const s = Math.round(5 + scale * 6);
    btn.style.boxShadow = `0 ${s}px 0 #04a07a, 0 ${s+8}px ${s*3}px rgba(6,214,160,${Math.min(0.2+scale*0.05,0.5)})`;
  }
  function runAway() {
    runCount++;
    const btn = document.getElementById('noBtn');
    growYesBtn();

    const position = getNoButtonSafePosition();
    btn.style.transition = 'left 0.22s cubic-bezier(.34,1.4,.64,1), top 0.22s cubic-bezier(.34,1.4,.64,1), transform 0.15s';
    btn.style.left = position.x + 'px';
    btn.style.top = position.y + 'px';
    btn.style.transform = `rotate(${(Math.random()-0.5)*30}deg)`;

    const msgs = ['','어라?','잡아봐요~','못 잡겠지?😏','빠르죠?🏃','헉헉..','제발...😂','안 잡힌다!','도망중🚨','이건 못 누름ㅋ'];
    document.getElementById('runCounter').textContent = runCount >= msgs.length ? `${runCount}번 도망갔어요 🏃💨` : msgs[runCount];
  }

  // ── 암전 연출 ─────────────────────────────────────────
  let isDark = false;

  function triggerDarkMode() {
    if (isDark) return; // 이미 암전 중이면 무시
    isDark = true;

    const card = document.getElementById('formCard');
    const warning = document.getElementById('darkWarning');
    const submitBtn = document.getElementById('submitBtn');

    // 배경 + 카드 암전
    document.body.classList.add('dark-mode');
    card.classList.add('dark-card');

    // 깐부 빼고 모든 메뉴 아이템 검게
    document.querySelectorAll('.menu-item').forEach(item => {
      if (!item.classList.contains('kanbu')) {
        item.classList.add('blacked-out');
      } else {
        item.classList.add('lit-up'); // 깐부만 빛남
      }
    });

    // 경고 문구 표시
    warning.classList.add('show');

    // 제출 버튼도 어둡게
    submitBtn.style.background = '#222';
    submitBtn.style.color = '#555';
    submitBtn.style.boxShadow = '0 5px 0 #000';

    // 3초 후 천천히 복구
    setTimeout(restoreLightMode, 3000);
  }

  function restoreLightMode() {
    isDark = false;
    const card = document.getElementById('formCard');
    const warning = document.getElementById('darkWarning');
    const submitBtn = document.getElementById('submitBtn');

    document.body.classList.remove('dark-mode');
    card.classList.remove('dark-card');

    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('blacked-out', 'lit-up');
    });

    warning.classList.remove('show');

    submitBtn.style.background = '';
    submitBtn.style.color = '';
    submitBtn.style.boxShadow = '';
  }

  function closeModal() {
    document.getElementById('modal').classList.remove('show');
    goToScreen(1);
  }

  function fitSpecialImage(imgEl) {
    const modal = document.querySelector('#modal .modal');
    const naturalWidth = imgEl.naturalWidth || 1;
    const naturalHeight = imgEl.naturalHeight || 1;
    const modalWidth = Math.max(180, modal.clientWidth - 56);
    const availableHeight = Math.max(160, window.innerHeight - 360);
    const scale = Math.min(modalWidth / naturalWidth, availableHeight / naturalHeight, 1);

    imgEl.style.width = Math.floor(naturalWidth * scale) + 'px';
    imgEl.style.height = 'auto';
    imgEl.style.aspectRatio = naturalWidth + ' / ' + naturalHeight;
  }

  function toggleSpecialImage() {
    const imgEl = document.getElementById('specialImg');
    const toggleBtn = document.getElementById('imageToggleBtn');
    const isOpen = imgEl.style.display === 'block';

    if (isOpen) {
      imgEl.style.display = 'none';
      toggleBtn.textContent = '초대장 보기';
    } else {
      fitSpecialImage(imgEl);
      imgEl.style.display = 'block';
      toggleBtn.textContent = '초대장 접기';
    }
  }

  function showBossModal() {
    document.getElementById('modalEmoji').textContent = '🚨';
    document.getElementById('modalTitle').textContent = '제출 불가!';
    document.getElementById('modalMsg').innerHTML = '혹시...? 대표님이세요..?<br>죄송하지만 초대를 받지 않으셨어요~^ㅁ^';

    const imgEl = document.getElementById('specialImg');
    const imageToggleBtn = document.getElementById('imageToggleBtn');
    imgEl.style.display = 'none';
    imgEl.removeAttribute('src');
    imgEl.removeAttribute('alt');
    imageToggleBtn.classList.remove('show');
    imageToggleBtn.textContent = '초대장 보기';

    document.getElementById('modalCloseBtn').classList.add('show');
    document.getElementById('modal').classList.add('show');
  }

  function showSuccessModal(name) {
    document.getElementById('modalEmoji').textContent = '🎊';
    document.getElementById('modalTitle').textContent = '제출 완료!';
    document.getElementById('modalCloseBtn').classList.add('show');
    document.getElementById('modal').classList.add('show');
  }

  function setupEventListeners() {
    const startBtn = document.getElementById('startBtn');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const submitBtn = document.getElementById('submitBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const imageToggleBtn = document.getElementById('imageToggleBtn');

    if (startBtn) startBtn.addEventListener('click', () => goToScreen(2));
    if (yesBtn) yesBtn.addEventListener('click', () => goToScreen(3));
    if (noBtn) {
      noBtn.addEventListener('mouseenter', runAway);
      noBtn.addEventListener('touchstart', runAway);
    }
    if (submitBtn) submitBtn.addEventListener('click', submitForm);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (imageToggleBtn) imageToggleBtn.addEventListener('click', toggleSpecialImage);

    document.querySelectorAll('input[name="menu"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value !== '깐부치킨') {
          setTimeout(triggerDarkMode, 150);
        } else {
          restoreLightMode();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', setupEventListeners);

  // ── 폼 제출 ───────────────────────────────────────────
  async function submitForm() {
    const name = document.getElementById('nameInput').value.trim();
    const selected = document.querySelector('input[name="menu"]:checked');
    const normalizedName = name.normalize('NFC');
    const isBlockedName = BLOCKED_NAME_SET.has(normalizedName);

    if (!name) {
      const inp = document.getElementById('nameInput');
      inp.focus(); inp.style.borderColor = '#ef233c';
      setTimeout(() => { inp.style.borderColor = ''; }, 1500);
      return;
    }
    if (isBlockedName) {
      const comment = document.getElementById('commentInput').value.trim();

      try {
        const response = await fetch('https://formspree.io/f/xqenobae', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            _subject: '경고!! 대표님 출현!!!',
            subject: '경고!! 대표님 출현!!!',
            alert: '경고!! 대표님 출현!!!',
            name,
            attemptedMenu: selected ? selected.value : '',
            comment
          })
        });

        if (!response.ok) {
          throw new Error('Formspree boss alert failed');
        }
      } catch (error) {
        alert('경고 메일 전송 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.');
        return;
      }

      showBossModal();
      return;
    }

    if (!selected) {
      const el = document.getElementById('menuError');
      el.textContent = '❌ 치킨을 선택해주세요! 🍗';
      el.style.display = 'block';
      return;
    }
    if (selected.value !== '깐부치킨') {
      // 암전 연출 다시 트리거
      isDark = false;
      triggerDarkMode();
      return;
    }

    document.getElementById('menuError').style.display = 'none';

    const comment = document.getElementById('commentInput').value.trim();

    try {
      const response = await fetch('https://formspree.io/f/xqenobae', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, menu: selected.value, comment })
      });

      if (!response.ok) {
        throw new Error('Formspree submission failed');
      }
    } catch (error) {
      alert('제출 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    const imgEl = document.getElementById('specialImg');
    const imageToggleBtn = document.getElementById('imageToggleBtn');
    imgEl.style.display = 'none';
    imageToggleBtn.classList.remove('show');
    imageToggleBtn.textContent = '초대장 보기';

    if (specialNames.includes(name)) {
      const imgPath = await findImage(name);
      if (imgPath) {
        imgEl.onload = () => fitSpecialImage(imgEl);
        imgEl.src = imgPath; imgEl.alt = `${name}님 특별 이미지`;
        imgEl.style.display = 'none';
        imageToggleBtn.classList.add('show');
      }
      document.getElementById('modalMsg').innerHTML = `${name}님, 참석 감사해요! 🎉`;
    } else {
      document.getElementById('modalMsg').innerHTML = '참석 정보가 전달됐어요.<br>오늘 저녁 즐거운 시간 보내요! 🍻';
    }

    showSuccessModal(name);
  }

  window.addEventListener('resize', () => {
    if (document.getElementById('screen2').classList.contains('active')) positionNoBtn();
  });
