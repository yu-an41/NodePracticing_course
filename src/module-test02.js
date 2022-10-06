const {Person, a , b} = require('./Person');

const p2 = new Person('Daivd', 35, 'male');

console.log(p2.toJSON());
console.log({ a });
console.log(b(13));