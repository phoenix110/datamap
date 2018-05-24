/**
 * Created by hzzcc on 2017/5/11.
 */

import LZString from 'lz-string'
import {app_name} from "../constants/AppConfig";

class Token {
    constructor() {
        let token_cache = localStorage.getItem(app_name + "_token");
        let p12Asn1 = token_cache ? LZString.decompressFromEncodedURIComponent(token_cache) : "";
        this.token = p12Asn1;
    }

    get() {
        return this.token;
    }

    set(token) {
        this.token = token;
        let p12Asn1 = LZString.compressToEncodedURIComponent(token);
        localStorage.setItem(app_name + "_token", p12Asn1);
    }
}

let tokenIns = new Token()

export default tokenIns
