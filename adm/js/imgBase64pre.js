/**
 * ==============================================================
 * MÓDULO .: imgBase64pre.js
 * VERSÃO .: 01 - 12/11/2025
 * SISTEMA .: CRUD CONCRETTA - Frontend
 * --------------------------------------------------------------
 * DESCRIÇÃO:
 *   Responsável por processar, converter e comprimir imagens
 *   no formato WebP em Base64 antes do envio ao backend.
 *
 * RESPONSÁVEL .: Equipe Concretta
 * DEPENDÊNCIAS .: Nenhuma (usa apenas APIs nativas do navegador)
 * --------------------------------------------------------------
 * REGRAS:
 *   - Imagem deve ser convertida para WebP.
 *   - Tamanho final ideal: entre 45.000 e 48.000 caracteres.
 *   - Tamanho máximo permitido: 48.000 caracteres.
 * ==============================================================
 */

/**
 * --------------------------------------------------------------
 * Converte arquivos de imagem (FileList) para Base64 WebP
 * com compressão e normalização de tamanho.
 * --------------------------------------------------------------
 * @param {FileList|Array} files - arquivos selecionados
 * @param {string|number} productId - identificador do produto
 * @returns {Promise<Array>} array de objetos:
 *          [{ nome, base64, dataUrl, length }]
 * --------------------------------------------------------------
 */
async function processFilesForProduct(files, productId) {
  const imagens = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const baseName = `ImagemProd${productId}_${i}`;

    const base64 = await compressToWebPBase64(file);
    const nome = baseName;
    const length = base64.length;

    // Reforça regra de tamanho
    if (length > 48000) {
      console.warn(
        `[${nome}] excedeu ${length} caracteres. Tentando recomprimir...`
      );
      const recomprimida = await compressToWebPBase64(file, 0.6);
      imagens.push({
        nome,
        base64: recomprimida,
        dataUrl: recomprimida,
        length: recomprimida.length,
      });
    } else {
      imagens.push({
        nome,
        base64,
        dataUrl: base64,
        length,
      });
    }
  }

  return imagens;
}

/**
 * --------------------------------------------------------------
 * Converte um arquivo de imagem para WebP Base64
 * --------------------------------------------------------------
 * @param {File} file - imagem original
 * @param {number} quality - qualidade (0.1 a 1.0)
 * --------------------------------------------------------------
 */
async function compressToWebPBase64(file, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");

        // Mantém proporção
        const maxDim = 800; // largura/altura máxima
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h *= maxDim / w;
          w = maxDim;
        } else if (h > maxDim) {
          w *= maxDim / h;
          h = maxDim;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL("image/webp", quality);
        const len = dataUrl.length;

        // Verifica se o tamanho está dentro do intervalo ideal
        if (len < 45000 && quality < 1.0) {
          // aumenta qualidade se ficou muito pequeno
          compressToWebPBase64(file, Math.min(quality + 0.05, 1.0)).then(resolve);
        } else if (len > 48000 && quality > 0.3) {
          // reduz qualidade se ficou muito grande
          compressToWebPBase64(file, quality - 0.05).then(resolve);
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

