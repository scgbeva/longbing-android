export async function renderChartPng(svg) {
  const { width, height } = svg.viewBox.baseVal;
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  const originalShapes = svg.querySelectorAll('line, circle, text');
  clone.querySelectorAll('line, circle, text').forEach((shape, index) => {
    const style = getComputedStyle(originalShapes[index]);
    shape.style.fill = style.fill;
    shape.style.stroke = style.stroke;
    shape.style.fontFamily = style.fontFamily;
  });

  const source = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is unavailable');
    context.fillStyle = getComputedStyle(svg).backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG encoding failed')), 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
