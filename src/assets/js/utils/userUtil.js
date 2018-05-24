/**
 * Created by hzz on 2017/9/9.
 */

import {app_name} from "../constants/AppConfig";
class UserInfo {
    constructor() {
        let user = localStorage.getItem(app_name + "_user");
        this.user = {};
        try {
            this.user = JSON.parse(user);
        }catch(err) {
            console.error(err);
        }
    }

    get() {
        return this.user
    }

    set(user) {
        this.user = user;
        localStorage.setItem(app_name + "_user", JSON.stringify(user));
    }
}

let userIns = new UserInfo()

export default userIns
