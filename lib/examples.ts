export const EXAMPLES = [
  {
    id: 'cubes',
    label: 'Overlapping cubes',
    css: `div {
  --s: 64px;
  --c1: #fef5e9;
  --c2: #f6e0bc;
  --c3: #f3ca84;

  --_g: 0 120deg, #0000 0;
  background:
    conic-gradient(             at calc(250%/3) calc(100%/3),var(--c3) var(--_g)),
    conic-gradient(from -120deg at calc( 50%/3) calc(100%/3),var(--c2) var(--_g)),
    conic-gradient(from  120deg at calc(100%/3) calc(250%/3),var(--c1) var(--_g)),
    conic-gradient(from  120deg at calc(200%/3) calc(250%/3),var(--c1) var(--_g)),
    conic-gradient(from -180deg at calc(100%/3) 50%,var(--c2)  60deg,var(--c1) var(--_g)),
    conic-gradient(from   60deg at calc(200%/3) 50%,var(--c1)  60deg,var(--c3) var(--_g)),
    conic-gradient(from  -60deg at 50% calc(100%/3),var(--c1) 120deg,var(--c2) 0 240deg,var(--c3) 0);
  background-size: calc(var(--s)*sqrt(3)) var(--s);
}`,
  },
  {
    id: 'arabesque',
    label: 'Arabesque style',
    css: `div {
  --s: 36px;
  --c1: #f3ca84;
  --c2: #fef5e9;

  --t: calc(var(--s)/10);
  --_c: #0000 calc(98% - var(--t)),var(--c1) calc(100% - var(--t)) 98%,#0000;
  --_s: calc(2*var(--s)) calc(5*var(--s)/2);
  --_r0: /var(--_s) radial-gradient(calc(var(--s)/2) at 0    20%,var(--_c));
  --_r1: /var(--_s) radial-gradient(calc(var(--s)/2) at 100% 20%,var(--_c));
  background:
    0 0 var(--_r0),calc(-1*var(--s)) calc(5*var(--s)/4) var(--_r0),
    var(--s) 0 var(--_r1),0 calc(5*var(--s)/4) var(--_r1),
    conic-gradient(at var(--t) calc(20% + 2*var(--t)),#0000 75%,var(--c1) 0)
    calc(var(--t)/-2) calc(var(--s) - var(--t))/var(--s) calc(5*var(--s)/4),
    repeating-conic-gradient(var(--c2) 0 25%,#0000 0 50%)
    var(--s) calc(var(--s)/-8)/var(--_s),
    conic-gradient(from 90deg at var(--t) var(--t),var(--c2) 25%,var(--c1) 0)
    calc((var(--s) - var(--t))/2) calc((var(--s) - var(--t))/2)/var(--s) calc(5*var(--s)/4);
}`,
  },
  {
    id: 'pills',
    label: 'Circles & Pills',
    css: `div {
  --s: 36px;
  --c1: #f3ca84;
  --c2: #fef5e9;

  --_g:/calc(3*var(--s)) calc(2*var(--s))
    conic-gradient(at 33% 25%,#0000 75%,var(--c1) 0);
  background:
     calc(var(--s)/-2) calc(var(--s)/4) var(--_g),
     calc(var(--s)/2) calc(5*var(--s)/4) var(--_g),
    radial-gradient(var(--c1) 34%,var(--c2) 36%) 0 0/var(--s) var(--s);
}`,
  },
]
