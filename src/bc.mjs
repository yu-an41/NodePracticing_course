import bcrypt from 'bcryptjs';

const h = await bcrypt.hash('123456', 10);
console.log(h);

const hashStr = '$2a$10$wLMSV/FYzz9UioCr5en4yeyED7LYUmjz4oJJicj4y0m8k2UmA0mqC';
console.log(await bcrypt.compare('123456', hashStr));