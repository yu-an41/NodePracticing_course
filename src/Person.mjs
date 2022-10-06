class Person {
    constructor(name = 'noname', age = 18) {
        this.name = name;
        this.age = age;
    }

    toJSON() {
        const {name, age} = this;
        return {name, age};
    }

    toString() {
        return JSON.stringify(this);
    }
}

const p1 = new Person('Mary', 25);

console.log(p1 +'');