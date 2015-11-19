// User.js

module.exports = User;

function User(){
 
}

User.create = function(name){
    var user = new Object();
    user.name = name;
    return user;
}

