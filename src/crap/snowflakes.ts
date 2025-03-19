

export function  genSnowflakes() {
  const outArray: HTMLImageElement[] = [];
  for (let i = 1; i <= 16; i++) {
    const img: HTMLImageElement = document.createElement('img')
    img.src = `/petals/petals${i}.png`
    nPush<HTMLImageElement>(img, outArray, i)
  }
  return outArray
}

function nPush<T>(x: T, a: T[], n: number) {
  for (let i = 0; i < n; i++) {
    a.push(x)
  }
}