class Person {
    constructor(name = 'noname', age = 18, gender) {
        this.name = name;
        this.age = age;
        this.gender = gender;
    }

    toJSON() {
        const { name, age, gender } = this;
        return { name, age, gender };
    }

    toString() {
        return JSON.stringify(this);
    }
}

const p1 = new Person('Mary', 25, 'female');

console.log(p1);

const a = 10;
const b = n => n * (n + 1);

module.exports = {Person, a, b};