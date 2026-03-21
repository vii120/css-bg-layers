export const EXAMPLES = [
  {
    id: 'gradient',
    label: 'Prince Of Persia',
    source: { name: 'MSHR', url: 'https://www.mshr.app/mesh/1714056175013' },
    css: `div {
  background-color: hsla(65, 60%, 97%, 1);
  background-image:
    radial-gradient(circle at 92% 93%, hsla(190, 56%, 91%, 0.53) 11%, transparent 79%),
    radial-gradient(circle at 24% 86%, hsla(13, 52%, 90%, 1) 16%, transparent 83%),
    radial-gradient(circle at 11% 94%, hsla(43, 55%, 90%, 1) 16%, transparent 51%),
    radial-gradient(circle at 36% 38%, hsla(81, 82%, 98%, 1) 3%, transparent 59%),
    radial-gradient(circle at 44% 9%, hsla(252, 61%, 51%, 0.48) 13%, transparent 83%);
}`,
  },
  {
    id: 'cubes',
    label: '3D cubes',
    source: { name: 'CSS Pattern', url: 'https://css-pattern.com/overlapping-cubes/' },
    note: 'with CSS variables',
    css: `div {
  --s: 50px;
  --c1: #f1f7ff;
  --c2: #dde9fa;
  --c3: #c9dcf4;

  background:
    conic-gradient(             at calc(250%/3) calc(100%/3), var(--c3) 0 120deg, #0000 0),
    conic-gradient(from -120deg at calc( 50%/3) calc(100%/3), var(--c2) 0 120deg, #0000 0),
    conic-gradient(from  120deg at calc(100%/3) calc(250%/3), var(--c1) 0 120deg, #0000 0),
    conic-gradient(from  120deg at calc(200%/3) calc(250%/3), var(--c1) 0 120deg, #0000 0),
    conic-gradient(from -180deg at calc(100%/3) 50%,var(--c2)  60deg, var(--c1) 0 120deg, #0000 0),
    conic-gradient(from   60deg at calc(200%/3) 50%,var(--c1)  60deg, var(--c3) 0 120deg, #0000 0),
    conic-gradient(from  -60deg at 50% calc(100%/3),var(--c1) 120deg, var(--c2) 0 240deg, var(--c3) 0);
  background-size: calc(var(--s)*sqrt(3)) var(--s);
}`,
  },
  {
    id: 'zigzag',
    label: 'ZigZag',
    source: { name: 'MagicPattern', url: 'https://www.magicpattern.design/tools/css-backgrounds' },
    css: `div {
  background-image:
    linear-gradient(135deg, #f4bcaf 25%, transparent 25%),
    linear-gradient(225deg, #f4bcaf 25%, transparent 25%),
    linear-gradient(45deg, #f4bcaf 25%, transparent 25%),
    linear-gradient(315deg, #f4bcaf 25%, #ffe6d9 25%);
  background-position: 10px 0, 10px 0, 0 0, 0 0;
  background-size: 20px 20px;
  background-repeat: repeat;
}`,
  },
]
