const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fields = {
  serviceName: document.getElementById("serviceName"),
  workUrl: document.getElementById("workUrl"),
  title: document.getElementById("title"),
  genre: document.getElementById("genre"),
  description: document.getElementById("description"),
  characterName: document.getElementById("characterName"),
  characterDescription: document.getElementById("characterDescription"),
  tags: document.getElementById("tags"),
  catchcopy: document.getElementById("catchcopy"),
  theme: document.getElementById("theme")
};

const imageInput = document.getElementById("imageInput");
const qrInput = document.getElementById("qrInput");
const removeQr = document.getElementById("removeQr");
const imageZoom = document.getElementById("imageZoom");
const imageX = document.getElementById("imageX");
const imageY = document.getElementById("imageY");
const zoomValue = document.getElementById("zoomValue");
const xValue = document.getElementById("xValue");
const yValue = document.getElementById("yValue");
const resetImage = document.getElementById("resetImage");
const downloadButton = document.getElementById("download");
const status = document.getElementById("status");

let uploadedImage = null;
let uploadedQr = null;
let dragging = false;
let lastPointer = null;

const imagePosition = {
  zoom: 100,
  x: 0,
  y: 0
};

/* =========================================================
   デザイン設定
   ---------------------------------------------------------
   完成画像の見た目を微調整するときは、基本的にここだけ
   変更すればOKです。

   X座標：右へ行くほど大きく
   Y座標：下へ行くほど大きく
   ========================================================= */
const DESIGN = {
  // 全体
  canvasWidth: 1200,
  canvasHeight: 675,
  leftWidth: 675,

  // 左側の余白（左端の揃え位置 / 右端の余白）
  marginLeft: 64,
  marginRight: 56,

  // ヘッダー（サービス名・URL・区切り線）
  serviceY: 46,
  serviceFontSize: 26,
  serviceLetterSpacing: 2,
  urlY: 54,
  urlFontSize: 15,
  urlLetterSpacing: 0.5,
  headerLineY: 94,
  headerLineAlpha: 0.35,

  // 作品タイトル
  titleY: 118,
  titleFontSize: 54,
  titleMinFontSize: 34,
  titleMaxWidth: 555,
  titleFontWeight: 700,
  titleLetterSpacing: 3,

  // 作品ジャンル（先頭に短いアクセント線）
  genreY: 188,
  genreFontSize: 16,
  genreFontWeight: 600,
  genreLetterSpacing: 2,
  genreBarWidth: 22,
  genreBarGap: 12,

  // 作品紹介文
  descriptionY: 232,
  descriptionWidth: 545,
  descriptionFontSize: 19,
  descriptionLineHeight: 32,
  descriptionMaxLines: 3,
  descriptionLetterSpacing: 0.6,

  // CHARACTER 見出し（右に細い線が伸びる）
  characterLabelY: 346,
  characterLabelFontSize: 14,
  characterLabelLetterSpacing: 5,
  characterLabelLineGap: 18,
  characterLabelLineAlpha: 0.45,

  // キャラクター名
  characterNameY: 374,
  characterNameFontSize: 22,
  characterNameFontWeight: 700,
  characterNameLetterSpacing: 2,

  // キャラ紹介文
  characterDescriptionY: 414,
  characterDescriptionWidth: 545,
  characterDescriptionFontSize: 17,
  characterDescriptionLineHeight: 28,
  characterDescriptionMaxLines: 4,
  characterDescriptionLetterSpacing: 0.4,

  // タグ
  tagY: 540,
  tagHeight: 34,
  tagRadius: 17,
  tagFontSize: 15,
  tagPaddingX: 17,
  tagGap: 10,
  tagLetterSpacing: 1,
  tagTextColor: null,

  // キャッチコピー
  catchcopyY: 596,
  catchcopyFontSize: 27,
  catchcopyMinFontSize: 18,
  catchcopyMaxWidth: 555,
  catchcopyLetterSpacing: 1,

  // QRコード
  qrX: 1075,
  qrY: 550,
  qrSize: 100,

  // フォント
  fontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif",
  characterLabelFontFamily: "'Shippori Mincho B1', 'Noto Serif JP', serif"
};

const themes = {  
  seashore: {
    bg: "#e1dedb",
    right: "#a8a8a8",
    text: "#763f03",
    muted: "#815221",
    tag: "#b2b7ba",
    tagText: "#763f03",
    accent: "#038a8b"
  },
  nightcities: {
    bg: "#10120e",
    right: "#a8a8a8",
    text: "#ccd6da",
    muted: "#adb9be",
    tag: "#a0121c",
    tagText: "#ffffff",
    accent: "#df992a"
  },
  flowers: {
    bg: "#fdfdef",
    right: "#a8a8a8",
    text: "#0e1512",
    muted: "#30423a",
    tag: "#e9a052",
    tagText: "#0e1512",
    accent: "#ffa5a3"
  },
  teacups: {
    bg: "#dfdde0",
    right: "#a8a8a8",
    text: "#72420d",
    muted: "#765737",
    tag: "#978d8c",
    tagText: "#ffffff",
    accent: "#ce8d03"
  },
  cleancities: {
    bg: "#d6dee2",
    right: "#a8a8a8",
    text: "#141a1a",
    muted: "#354040",
    tag: "#c1a08d",
    tagText: "#ffffff",
    accent: "#0486b8"
  },
  basketgoal: {
    bg: "#e9e3df",
    right: "#a8a8a8",
    text: "#1b1c18",
    muted: "#41413a",
    tag: "#f5f5f5",
    tagText: "#1b1c18",
    accent: "#f48863"
  },
  ayame: {
    bg: "#353866",
    right: "#a8a8a8",
    text: "#F8FAFF",
    muted: "#c4c8d4",
    tag: "#AAABD3",
    tagText: "#353866",
    accent: "#CBA6C3"
  },
  pistachio: {
    bg: "#e2e7e9",
    right: "#a8a8a8",
    text: "#142718",
    muted: "#273f2c",
    tag: "#b5b067",
    tagText: "#142718",
    accent: "#8b634d"
  },
  greenapple: {
    bg: "#c6d3c8",
    right: "#a8a8a8",
    text: "#0c1601",
    muted: "#172904",
    tag: "#9f8322",
    tagText: "#c6d3c8",
    accent: "#639d01"
  },
  cyberpunk: {
    bg: "#1a1a1a",
    right: "#a8a8a8",
    text: "#8addcb",
    muted: "#5f9e91",
    tag: "#127c8c",
    tagText: "#8addcb",
    accent: "#f35e5c"
  },
  purplesmoke: {
    bg: "#566270",
    right: "#a8a8a8",
    text: "#FFFFF3",
    muted: "#d1d1c7",
    tag: "#837b93",
    tagText: "#ffffff",
    accent: "#A593E0"
  },
  berrychocolate: {
    bg: "#5D3140",
    right: "#a8a8a8",
    text: "#F6D8BD",
    muted: "#d4b59a",
    tag: "#F39399",
    tagText: "#000000",
    accent: "#CF4173"
  },
};


// 字間（letter-spacing）。非対応ブラウザでは何もしない
function setSpacing(px) {
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${px}px`;
}

// 行頭に来てはいけない文字（禁則処理）。はみ出す場合は前の行にぶら下げる
const NO_LINE_START = "、。，．,.)）]］}｝〕〉》」』】〙〗？！?!・：；:;ーぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ…‥”’";

function wrapText(text, maxWidth, font, spacing = 0) {
  ctx.font = font;
  setSpacing(spacing);
  const lines = [];
  const paragraphs = String(text || "").split("\n");

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push("");
      continue;
    }

    let line = "";
    for (const char of paragraph) {
      const test = line + char;
      if (ctx.measureText(test).width > maxWidth && line && !NO_LINE_START.includes(char)) {
        lines.push(line);
        line = char;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }

  return lines;
}

function drawTextBlock(text, x, y, maxWidth, font, lineHeight, color, maxLines = 99, spacing = 0) {
  const lines = wrapText(text, maxWidth, font, spacing).slice(0, maxLines);
  ctx.font = font;
  setSpacing(spacing);
  ctx.fillStyle = color;
  ctx.textBaseline = "top";

  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });

  setSpacing(0);
  return y + lines.length * lineHeight;
}

// 横線（細い区切り線）
function drawHLine(x1, x2, y, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x1, Math.round(y), x2 - x1, 1.5);
  ctx.restore();
}

function getImageGeometry(img, x, y, w, h) {
  const zoom = imagePosition.zoom / 100;
  const coverScale = Math.max(w / img.width, h / img.height);
  const scale = coverScale * zoom;
  const sw = img.width * scale;
  const sh = img.height * scale;

  const movableX = Math.max(0, sw - w) / 2;
  const movableY = Math.max(0, sh - h) / 2;

  const sx = x + (w - sw) / 2 + movableX * (imagePosition.x / 100);
  const sy = y + (h - sh) / 2 + movableY * (imagePosition.y / 100);

  return { sx, sy, sw, sh };
}

function drawCoverImage(img, x, y, w, h) {
  const { sx, sy, sw, sh } = getImageGeometry(img, x, y, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh);
  ctx.restore();
}

function render() {
  const t = themes[fields.theme.value] || themes.seashore;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setSpacing(0);

  const leftW = DESIGN.leftWidth;
  const imageX0 = leftW;
  const imageY0 = 0;
  const imageW = DESIGN.canvasWidth - leftW;
  const imageH = DESIGN.canvasHeight;

  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, leftW, DESIGN.canvasHeight);

  ctx.fillStyle = t.right;
  ctx.fillRect(imageX0, imageY0, imageW, imageH);

  if (uploadedImage) {
    drawCoverImage(uploadedImage, imageX0, imageY0, imageW, imageH);
  } else {
    ctx.fillStyle = "#6e6e6e";
    ctx.font = "700 50px Arial, 'Noto Sans JP', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("イラスト欄", imageX0 + imageW / 2, imageH / 2);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
  }

  const x = DESIGN.marginLeft;
  const right = leftW - DESIGN.marginRight;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  // ---- ヘッダー：サービス名（左）／URL（右揃え）／区切り線 ----
  ctx.fillStyle = t.accent;
  ctx.font = `700 ${DESIGN.serviceFontSize}px ${DESIGN.fontFamily}`;
  setSpacing(DESIGN.serviceLetterSpacing);
  ctx.fillText(fields.serviceName.value || "サービス名", x, DESIGN.serviceY);

  ctx.fillStyle = t.muted;
  ctx.font = `${DESIGN.urlFontSize}px ${DESIGN.fontFamily}`;
  setSpacing(DESIGN.urlLetterSpacing);
  ctx.textAlign = "right";
  ctx.fillText(fields.workUrl.value || "", right, DESIGN.urlY);
  ctx.textAlign = "left";
  setSpacing(0);

  drawHLine(x, right, DESIGN.headerLineY, t.muted, DESIGN.headerLineAlpha);

  // ---- タイトル：実際の横幅を測って自動縮小 ----
  const title = fields.title.value || "作品タイトル";
  let titleSize = DESIGN.titleFontSize;
  setSpacing(DESIGN.titleLetterSpacing);
  while (titleSize > DESIGN.titleMinFontSize) {
    ctx.font = `${DESIGN.titleFontWeight} ${titleSize}px ${DESIGN.fontFamily}`;
    if (ctx.measureText(title).width <= DESIGN.titleMaxWidth) break;
    titleSize -= 1;
  }
  ctx.fillStyle = t.text;
  ctx.font = `${DESIGN.titleFontWeight} ${titleSize}px ${DESIGN.fontFamily}`;
  ctx.fillText(title, x, DESIGN.titleY);
  setSpacing(0);

  // ---- ジャンル：短いアクセント線＋文字 ----
  const genre = fields.genre.value || "";
  if (genre) {
    const barY = DESIGN.genreY + DESIGN.genreFontSize / 2 + 1;
    ctx.fillStyle = t.accent;
    ctx.fillRect(x, Math.round(barY), DESIGN.genreBarWidth, 2);

    ctx.font = `${DESIGN.genreFontWeight} ${DESIGN.genreFontSize}px ${DESIGN.fontFamily}`;
    setSpacing(DESIGN.genreLetterSpacing);
    ctx.fillText(genre, x + DESIGN.genreBarWidth + DESIGN.genreBarGap, DESIGN.genreY);
    setSpacing(0);
  }

  // ---- 作品紹介文 ----
  drawTextBlock(
    fields.description.value,
    x,
    DESIGN.descriptionY,
    DESIGN.descriptionWidth,
    `${DESIGN.descriptionFontSize}px ${DESIGN.fontFamily}`,
    DESIGN.descriptionLineHeight,
    t.muted,
    DESIGN.descriptionMaxLines,
    DESIGN.descriptionLetterSpacing
  );

  // ---- CHARACTER 見出し＋右へ伸びる線 ----
  ctx.fillStyle = t.accent;
  ctx.font = `700 ${DESIGN.characterLabelFontSize}px ${DESIGN.characterLabelFontFamily}`;
  setSpacing(DESIGN.characterLabelLetterSpacing);
  ctx.fillText("CHARACTER", x, DESIGN.characterLabelY);
  const labelW = ctx.measureText("CHARACTER").width;
  setSpacing(0);
  drawHLine(
    x + labelW + DESIGN.characterLabelLineGap,
    right,
    DESIGN.characterLabelY + DESIGN.characterLabelFontSize / 2 + 1,
    t.accent,
    DESIGN.characterLabelLineAlpha
  );

  // ---- キャラクター名 ----
  ctx.fillStyle = t.text;
  ctx.font = `${DESIGN.characterNameFontWeight} ${DESIGN.characterNameFontSize}px ${DESIGN.fontFamily}`;
  setSpacing(DESIGN.characterNameLetterSpacing);
  ctx.fillText(fields.characterName.value || "キャラクター名", x, DESIGN.characterNameY);
  setSpacing(0);

  // ---- キャラ紹介文 ----
  drawTextBlock(
    fields.characterDescription.value,
    x,
    DESIGN.characterDescriptionY,
    DESIGN.characterDescriptionWidth,
    `${DESIGN.characterDescriptionFontSize}px ${DESIGN.fontFamily}`,
    DESIGN.characterDescriptionLineHeight,
    t.muted,
    DESIGN.characterDescriptionMaxLines,
    DESIGN.characterDescriptionLetterSpacing
  );

  // ---- タグ（文字は縦中央に配置） ----
  const tags = fields.tags.value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  let tx = x;
  ctx.font = `${DESIGN.tagFontSize}px ${DESIGN.fontFamily}`;
  setSpacing(DESIGN.tagLetterSpacing);
  tags.forEach(tag => {
    const tw = ctx.measureText(tag).width + DESIGN.tagPaddingX * 2;
    ctx.fillStyle = t.tag;
    ctx.beginPath();
    ctx.roundRect(tx, DESIGN.tagY, tw, DESIGN.tagHeight, DESIGN.tagRadius);
    ctx.fill();

    ctx.fillStyle = DESIGN.tagTextColor || t.tagText;
    ctx.textBaseline = "middle";
    ctx.fillText(tag, tx + DESIGN.tagPaddingX, DESIGN.tagY + DESIGN.tagHeight / 2 + 1);
    ctx.textBaseline = "top";
    tx += tw + DESIGN.tagGap;
  });
  setSpacing(0);

  // ---- キャッチコピー：横幅に合わせて自動縮小 ----
  const catchcopy = "“" + (fields.catchcopy.value || "キャッチコピー") + "”";
  let catchcopySize = DESIGN.catchcopyFontSize;
  setSpacing(DESIGN.catchcopyLetterSpacing);
  while (catchcopySize > DESIGN.catchcopyMinFontSize) {
    ctx.font = `700 ${catchcopySize}px ${DESIGN.fontFamily}`;
    if (ctx.measureText(catchcopy).width <= DESIGN.catchcopyMaxWidth) break;
    catchcopySize -= 1;
  }
  ctx.fillStyle = t.accent;
  ctx.font = `700 ${catchcopySize}px ${DESIGN.fontFamily}`;
  ctx.fillText(catchcopy, x, DESIGN.catchcopyY);
  setSpacing(0);

  // ---- QRコード ----
  if (uploadedQr) {
    ctx.drawImage(uploadedQr, DESIGN.qrX, DESIGN.qrY, DESIGN.qrSize, DESIGN.qrSize);
  }
}


Object.values(fields).forEach(el => {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files && imageInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    status.textContent = "画像ファイルを選択してください。";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      uploadedImage = img;
      imagePosition.zoom = 100;
      imagePosition.x = 0;
      imagePosition.y = 0;

      imageZoom.value = "100";
      imageX.value = "0";
      imageY.value = "0";
      updateImageLabels();

      status.textContent = "画像を読み込みました。ドラッグで位置を調整できます。";
      render();
    };

    img.onerror = () => {
      status.textContent = "画像を読み込めませんでした。";
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
});


qrInput.addEventListener("change", () => {
  const file = qrInput.files && qrInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    status.textContent = "QRコード画像を選択してください。";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = () => {
      uploadedQr = img;
      removeQr.disabled = false;
      status.textContent = "QRコードを読み込みました。";
      render();
    };

    img.onerror = () => {
      status.textContent = "QRコード画像を読み込めませんでした。";
    };

    img.src = reader.result;
  };

  reader.readAsDataURL(file);
});

removeQr.addEventListener("click", () => {
  uploadedQr = null;
  qrInput.value = ""; // 同じファイルをもう一度選べるようにリセット
  removeQr.disabled = true;
  status.textContent = "QRコードを外しました。";
  render();
});

function updateImageLabels() {
  zoomValue.textContent = `${imagePosition.zoom}%`;
  xValue.textContent = `${imagePosition.x > 0 ? "+" : ""}${imagePosition.x}`;
  yValue.textContent = `${imagePosition.y > 0 ? "+" : ""}${imagePosition.y}`;
}

function updateImageControls() {
  imagePosition.zoom = Number(imageZoom.value);
  imagePosition.x = Number(imageX.value);
  imagePosition.y = Number(imageY.value);
  updateImageLabels();
  render();
}

[imageZoom, imageX, imageY].forEach(control => {
  control.addEventListener("input", updateImageControls);
});

resetImage.addEventListener("click", () => {
  imageZoom.value = "100";
  imageX.value = "0";
  imageY.value = "0";
  updateImageControls();
});

canvas.addEventListener("pointerdown", event => {
  if (!uploadedImage) return;

  dragging = true;
  lastPointer = { x: event.clientX, y: event.clientY };
  canvas.classList.add("dragging");
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", event => {
  if (!dragging || !uploadedImage || !lastPointer) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const dx = (event.clientX - lastPointer.x) * scaleX;
  const dy = (event.clientY - lastPointer.y) * scaleY;

  const imageAreaW = DESIGN.canvasWidth - DESIGN.leftWidth;
  const imageAreaH = DESIGN.canvasHeight;
  const zoom = imagePosition.zoom / 100;
  const coverScale = Math.max(
    imageAreaW / uploadedImage.width,
    imageAreaH / uploadedImage.height
  );
  const sw = uploadedImage.width * coverScale * zoom;
  const sh = uploadedImage.height * coverScale * zoom;

  const movableX = Math.max(1, sw - imageAreaW) / 2;
  const movableY = Math.max(1, sh - imageAreaH) / 2;

  imagePosition.x = Math.max(-100, Math.min(100, imagePosition.x + (dx / movableX) * 100));
  imagePosition.y = Math.max(-100, Math.min(100, imagePosition.y + (dy / movableY) * 100));

  imageX.value = String(Math.round(imagePosition.x));
  imageY.value = String(Math.round(imagePosition.y));

  updateImageLabels();
  render();

  lastPointer = { x: event.clientX, y: event.clientY };
});

function stopDragging(event) {
  if (!dragging) return;
  dragging = false;
  lastPointer = null;
  canvas.classList.remove("dragging");

  if (event && canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

canvas.addEventListener("pointerup", stopDragging);
canvas.addEventListener("pointercancel", stopDragging);
canvas.addEventListener("pointerleave", event => {
  if (dragging && event.pointerType === "mouse") {
    // Keep pointer capture active; dragging can continue outside the canvas.
  }
});

downloadButton.addEventListener("click", () => {
  render();

  canvas.toBlob(blob => {
    if (!blob) {
      status.textContent = "画像の書き出しに失敗しました。";
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "talelynx-x-post.png";
    a.click();
    URL.revokeObjectURL(url);

    status.textContent = "PNGを書き出しました。";
  }, "image/png");
});

updateImageLabels();
render();

// Webフォントの読み込み完了後に描き直す（未読込のままだと代替フォントで描画されてしまうため）
if (document.fonts && document.fonts.load) {
  const weights = [400, 600, 700];
  Promise.all(weights.map(w => document.fonts.load(`${w} 20px 'Shippori Mincho B1'`, "あA")))
    .catch(() => {})
    .finally(render);
}
