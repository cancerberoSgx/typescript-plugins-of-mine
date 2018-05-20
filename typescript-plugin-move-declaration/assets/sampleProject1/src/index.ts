import { createSomeFruits } from "./tools";

const msg = createSomeFruits().apples.map(a=>a.color).join(', ')
console.log(msg);
