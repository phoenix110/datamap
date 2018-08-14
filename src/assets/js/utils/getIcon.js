'use strict';

/**
 * 获取地理卡片icon标签class
 * @param cardData
 * @returns {String}
 */
function setIconClass(cardData, index){
    let {geometry_type} = cardData;
    let {hidden, uid, data, style, filters, fake, info_cfg} = cardData.filters[index];
    if(geometry_type === "point"){
        return `icomoon ${style.icon.icon}`;
    }
    else if(geometry_type === "line"){
        return `icon-panel icon-menu`;
    }
    else if(geometry_type === "polygon"){
        return `icon-panel icon-polygon`;
    }
}

/**
 * 获取地理卡片icon标签style
 * @param cardData
 * @returns {String}
 */
function setIconStyle(cardData, index){
    let {geometry_type} = cardData;
    let {hidden, uid, data, style, filters, fake, info_cfg} = cardData.filters[index];
    if(geometry_type === "point"){
        return {
            'color': style.color,
        }
    }
    else if(geometry_type === "line"){
        let color = !hidden ? style && style.color : '#687495';
        return {
            'color': color,
        }
    }
    else if(geometry_type === "polygon"){
        let borderColor = !hidden ? style && style.color : '#687495';
        let borderStyle = style.strokeStyle || "solid";
        return {
            // 'width': '24px',
            // 'height': '24px',
            'borderColor': borderColor,
            'borderStyle': borderStyle,
            // 'backgroundColor': borderColor,
            // 'opacity': .1,
        }
    }
}

export {
    setIconClass,
    setIconStyle,
}