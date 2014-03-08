

function User() {
    
}


User.prototype = {
    UserId:null,
    GoogleId:null,
    FacebookId:null,
    TwitterId:null,
//an array of the passport profiles for any of the auth providers linked to the user.
    ProfileData:[],
    Created:null,
    LastLogin:null
}

Object.defineProperty(User.prototype, "DisplayName", {
    enumerable: true,
    get:function() {
        if (this.ProfileData && this.ProfileData[0]) {
            return this.ProfileData[0].displayName;
        }
        return "Why don't I have a name?";
    },
    set:function(val) {
        
    }
})

Object.defineProperty(User.prototype, "DisplayPicture", {
    enumerable: true,
    get:function() {
        if (this.ProfileData && this.ProfileData[0]) {
            var p = this.ProfileData[0];
            if (p.provider == "google") {
                return p._json.picture;
            }
        }
        return "Why don't I have a name?";
    },
    set:function(val) {
        
    }
})


User.fromOauthProfile = function(profile) {
    var u = new User();
    u[User.providers[profile.provider]] = profile.id;
    u.ProfileData.push(profile);
    return u;
}

User.providers = {
    google: "GoogleId",
    facebook: "FacebookId",
    twitter: "TwitterId"
};

module.exports = User;

