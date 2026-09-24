import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const EFFECTS = {
  blur: 'Bulanıklaştır',
  pixelate: 'Pikselleştir',
};

function App() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageUrl, setImageUrl] = useState('');
  const [fileName, setFileName] = useState('anonim-gorsel.png');
  const [effect, setEffect] = useState('blur');
  const [faces, setFaces] = useState([]);
  const [status, setStatus] = useState('Bir görsel seçerek başlayın.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectorAvailable, setDetectorAvailable] = useState(
    typeof window !== 'undefined' && 'FaceDetector' in window,
  );

  useEffect(() => () => imageUrl && URL.revokeObjectURL(imageUrl), [imageUrl]);

  const drawPreview = (regions = faces) => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    regions.forEach((region) => applyEffect(context, region, effect));
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setStatus('Lütfen bir görsel dosyası seçin.');
      return;
    }

    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    setFileName(file.name.replace(/\.[^.]+$/, '') || 'anonim-gorsel');
    setFaces([]);
    setStatus('Görsel hazır. Yüzleri tespit etmek için butona basın.');
  };

  const detectFaces = async () => {
    const image = imageRef.current;
    if (!image) return;
    setIsProcessing(true);

    try {
      if (!('FaceDetector' in window)) {
        setDetectorAvailable(false);
        setStatus('Bu tarayıcı otomatik yüz tespitini desteklemiyor. Görselde bir yüzün üzerine tıklayarak alan ekleyin.');
        drawPreview();
        return;
      }

      const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 20 });
      const detected = await detector.detect(image);
      const regions = detected.map(({ boundingBox }) => ({
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height,
      }));
      setFaces(regions);
      drawPreview(regions);
      setStatus(regions.length ? `${regions.length} yüz bulundu ve anonimleştirildi.` : 'Yüz bulunamadı. Gerekirse manuel alan ekleyin.');
    } catch (error) {
      setStatus('Yüz tespiti sırasında bir hata oluştu. Manuel alan eklemeyi deneyin.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const addManualRegion = (event) => {
    if (!imageRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const bounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;
    const size = Math.min(canvas.width, canvas.height) * 0.18;
    const region = {
      x: Math.max(0, (event.clientX - bounds.left) * scaleX - size / 2),
      y: Math.max(0, (event.clientY - bounds.top) * scaleY - size / 2),
      width: size,
      height: size,
    };
    region.x = Math.min(region.x, canvas.width - region.width);
    region.y = Math.min(region.y, canvas.height - region.height);
    const nextFaces = [...faces, region];
    setFaces(nextFaces);
    drawPreview(nextFaces);
    setStatus(`${nextFaces.length} anonimleştirme alanı hazır.`);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !faces.length) {
      setStatus('Önce en az bir yüz alanı ekleyin veya tespit edin.');
      return;
    }
    const link = document.createElement('a');
    link.download = `${fileName}-anonim.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleEffectChange = (value) => {
    setEffect(value);
    window.requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const image = imageRef.current;
      if (!canvas || !image) return;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      faces.forEach((region) => applyEffect(context, region, value));
    });
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <span className="eyebrow">Gizlilik aracı</span>
        <h1>Fotoğrafını anonimleştir.</h1>
        <p>Yüzleri tarayıcında bulanıklaştır veya pikselleştir. Görsellerin hiçbir zaman sunucuya gönderilmez.</p>
      </section>

      <section className="privacy-note" aria-label="Gizlilik bilgisi">
        <span aria-hidden="true">🔒</span>
        <div><strong>Yerel ve özel</strong><br />İşlem cihazınızda gerçekleşir; fotoğrafınız yüklenmez, kaydedilmez veya paylaşılmaz.</div>
      </section>

      <section className="tool-card">
        <label className="upload-zone" htmlFor="image-upload">
          <span className="upload-icon" aria-hidden="true">↑</span>
          <strong>Görsel seçin</strong>
          <span>PNG, JPG veya WEBP</span>
          <input id="image-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} />
        </label>

        {imageUrl && (
          <div className="editor">
            <div className="canvas-wrap">
              <img ref={imageRef} src={imageUrl} alt="Anonimleştirilecek önizleme" onLoad={() => drawPreview()} />
              <canvas ref={canvasRef} onClick={addManualRegion} aria-label="Görsel önizlemesi; manuel alan eklemek için tıklayın" />
            </div>
            <p className="hint">Otomatik tespit desteklenmiyorsa, görseldeki yüzlerin üzerine tıklayarak alan ekleyin.</p>
            <div className="controls">
              <div className="effect-choice">
                <span>Anonimleştirme</span>
                {Object.entries(EFFECTS).map(([value, label]) => (
                  <label key={value}>
                    <input type="radio" name="effect" value={value} checked={effect === value} onChange={() => handleEffectChange(value)} />
                    {label}
                  </label>
                ))}
              </div>
              <div className="actions">
                <button type="button" className="secondary" onClick={detectFaces} disabled={isProcessing}>
                  {isProcessing ? 'Tespit ediliyor…' : 'Yüzleri tespit et'}
                </button>
                <button type="button" onClick={downloadImage} disabled={!faces.length}>Görseli indir ↓</button>
              </div>
            </div>
          </div>
        )}

        <p className="status" role="status">{status}</p>
        {!detectorAvailable && imageUrl && <p className="support-note">Otomatik tespit için Chromium tabanlı güncel bir tarayıcı kullanın.</p>}
      </section>
    </main>
  );
}

function applyEffect(context, region, effect) {
  const { x, y, width, height } = region;
  if (effect === 'pixelate') {
    const pixelSize = Math.max(8, Math.round(Math.min(width, height) / 10));
    const smallWidth = Math.max(1, Math.round(width / pixelSize));
    const smallHeight = Math.max(1, Math.round(height / pixelSize));
    const pixels = document.createElement('canvas');
    pixels.width = smallWidth;
    pixels.height = smallHeight;
    pixels.getContext('2d').drawImage(context.canvas, x, y, width, height, 0, 0, smallWidth, smallHeight);
    context.imageSmoothingEnabled = false;
    context.drawImage(pixels, 0, 0, smallWidth, smallHeight, x, y, width, height);
    context.imageSmoothingEnabled = true;
  } else {
    context.save();
    context.filter = `blur(${Math.max(12, Math.round(Math.min(width, height) / 5))}px)`;
    context.drawImage(context.canvas, x, y, width, height, x, y, width, height);
    context.restore();
  }
}

export default App;
