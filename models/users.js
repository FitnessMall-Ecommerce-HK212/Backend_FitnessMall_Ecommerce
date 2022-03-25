class User {
    constructor(id, username, pwd, name, avatar,role, height,
        weight, information) {
        this.id = id;
        this.username = username;
        this.pwd = pwd;
        this.name = name;
        this.avatar=avatar;
        this.role = role;
        
        this.height = height;
        this.weight = weight;
        this.information = information;
        // information is an array of Info
    }
}

module.exports = User;