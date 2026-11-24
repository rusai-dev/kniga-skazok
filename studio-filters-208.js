'use strict';

(() => {
  function tone(pixels, options) {
    const brightness = options.brightness * 2.55;
    const contrast = 1 + options.contrast / 100;
    const saturation = 1 + options.saturation / 100;
    const radians = options.hue * Math.PI / 180;
    const cos = Math.cos(radians), sin = Math.sin(radians);
    const matrix = [
      .213 + cos * .787 - sin * .213, .715 - cos * .715 - sin * .715, .072 - cos * .072 + sin * .928,
      .213 - cos * .213 + sin * .143, .715 + cos * .285 + sin * .140, .072 - cos * .072 - sin * .283,
      .213 - cos * .213 - sin * .787, .715 - cos * .715 + sin * .715, .072 + cos * .928 + sin * .072
    ];
    for (let i = 0; i < pixels.length; i += 4) {
      if (!pixels[i + 3]) continue;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      const luma = .213 * r + .715 * g + .072 * b;
      const grey = luma * (1 - saturation);
      for (let c = 0; c < 3; c++) {
        const j = c * 3;
        const channel = grey + saturation * (matrix[j] * r + matrix[j + 1] * g + matrix[j + 2] * b);
        pixels[i + c] = (channel - 127.5) * contrast + 127.5 + brightness;
      }
    }
    return pixels;
  }

  function boxPass(source, target, width, height, radius, horizontal, channels) {
    const lines = horizontal ? height : width, length = horizontal ? width : height;
    const advance = horizontal ? channels : width * channels;
    const row = horizontal ? width * channels : channels;
    const window = radius * 2 + 1;
    for (let line = 0; line < lines; line++) {
      const origin = line * row;
      for (let channel = 0; channel < channels; channel++) {
        const offset = origin + channel;
        let sum = source[offset] * radius;
        for (let k = 0; k <= radius; k++) sum += source[offset + Math.min(k, length - 1) * advance];
        for (let x = 0; x < length; x++) {
          target[offset + x * advance] = sum / window;
          const left = Math.max(0, x - radius), right = Math.min(length - 1, x + radius + 1);
          sum += source[offset + right * advance] - source[offset + left * advance];
        }
      }
    }
  }

  function gaussian(source, width, height, sigma, channels) {
    // Three separable box filters approximate a Gaussian in linear time.
    const ideal = Math.sqrt(4 * sigma * sigma + 1);
    const low = Math.max(1, 2 * Math.floor((ideal - 1) / 2) + 1);
    const count = Math.max(0, Math.min(3, Math.round((12 * sigma * sigma - 3 * low * low - 12 * low - 9) / (-4 * low - 4))));
    const scratch = new Uint8ClampedArray(source.length);
    for (let pass = 0; pass < 3; pass++) {
      const radius = (low - 1) / 2 + Number(pass >= count);
      if (!radius) continue;
      boxPass(source, scratch, width, height, radius, true, channels);
      boxPass(scratch, source, width, height, radius, false, channels);
    }
  }

  function blur(pixels, width, height, radius) {
    for (let i = 0; i < pixels.length; i += 4) {
      const alpha = pixels[i + 3] / 255;
      pixels[i] *= alpha; pixels[i + 1] *= alpha; pixels[i + 2] *= alpha;
    }
    gaussian(pixels, width, height, radius, 4);
    for (let i = 0; i < pixels.length; i += 4) {
      const divisor = pixels[i + 3] ? 255 / pixels[i + 3] : 0;
      pixels[i] *= divisor; pixels[i + 1] *= divisor; pixels[i + 2] *= divisor;
    }
    return pixels;
  }

  function glow(pixels, width, height, {radius, strength, rgb}) {
    const coverage = new Uint8ClampedArray(width * height);
    for (let i = 0; i < coverage.length; i++) coverage[i] = pixels[i * 4 + 3];
    gaussian(coverage, width, height, radius, 1);
    for (let i = 0; i < coverage.length; i++) {
      const j = i * 4;
      const ink = pixels[j + 3] / 255;
      const light = Math.min(1, coverage[i] * strength / 25500) * (1 - ink);
      const alpha = ink + light;
      if (!light) continue;
      for (let c = 0; c < 3; c++) pixels[j + c] = (pixels[j + c] * ink + rgb[c] * light) / alpha;
      pixels[j + 3] = alpha * 255;
    }
    return pixels;
  }

  function renderStudioFilter(pixels, width, height, options) {
    if (!(pixels instanceof Uint8ClampedArray) || pixels.length !== 4 * width * height) throw Error('pixels');
    if (options.kind === 'tone') return tone(pixels, options);
    if (options.kind === 'blur' && options.radius > 0) return blur(pixels, width, height, options.radius);
    if (options.kind === 'glow' && options.radius > 0) return glow(pixels, width, height, options);
    return pixels;
  }

  if (typeof document !== 'undefined') window.renderStudioFilter = renderStudioFilter;
  else if (typeof module !== 'undefined') module.exports = renderStudioFilter;
  else self.onmessage = event => {
    const {bytes, width, height, options} = event.data;
    try {
      const result = renderStudioFilter(new Uint8ClampedArray(bytes), width, height, options);
      self.postMessage({bytes: result.buffer}, [result.buffer]);
    } catch (error) {
      self.postMessage({failed: true});
    }
  };
})();
