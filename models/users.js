class User {
    constructor(id, username, pwd, name, avatar, role, height,
        weight, email) {
        this.id = id;
        this.username = username;
        this.pwd = pwd;
        this.name = name;
        this.avatar = avatar;
        this.role = role;
        this.height = height;
        this.weight = weight;
        this.email = email;
        // this.informations = informations;
        // information is an array of Info
    }
}

module.exports = User;