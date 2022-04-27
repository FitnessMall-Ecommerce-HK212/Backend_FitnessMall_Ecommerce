class User {
    constructor(id, username, pwd, name, avatar, role,date,nation,sex,phone, height,
        weight, email) {
        this.id = id;
        this.username = username;
        this.pwd = pwd;
        this.name = name;
        this.avatar = avatar;
        this.role = role;
        this.date=date;
        this.nation=nation;
        this.sex=sex;
        this.phone=phone;
        this.height = height;
        this.weight = weight;
        this.email = email;
        // this.informations = informations;
        // information is an array of Info
    }
}

module.exports = User;