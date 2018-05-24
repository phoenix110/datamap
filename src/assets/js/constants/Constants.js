import map from 'lodash/map';

export const colors = ['#20C2E1','#23D561','#9CD523','#F1E229','#FFBF3A','#FB8C00','#FF5252'];

export const tab_menus = [
  {id: "tab_workspace", href: "/home/", icon: "home", title: '工作台'},
  {id: "tab_upload", href: "/upload/", icon: "cloud", title: "数据上传"},
  {id: "tab_data", href: "/data/", icon: "data", title: "数据"},
  {id: "tab_profile", href: "/profile/", icon: "person", title: "我"},
];

export const paths = {
  login: '/',
  home: '/home/',
  upload: '/upload/',
  data: '/data/',
  profile: '/profile/',
  chart_detail: '/chart_detail/vault_type/:vault_type/vault_id/:vault_id/',
  city_choose: '/city_choose/:cityId',
  my_data: '/my_data/'
};



export const sort_desc = 'desc';

export const self_select = "1"; // 自定义区域选择
export const dis_select = "2"; // 自定义距离选择
export const fence_select = "4"; // 自定义围栏选择
export const packet_select = "5"; // 从数据包选择
export const buffer_select = "6"; //buffer选择

export const visualization_colors = ['#FF4F4F','#FFA74F','#FFFF4F','#A7FF4F','#4FFF4F','#4FFFA7','#4FFFFF','#4FA7FF','#4F4FFF','#A74FFF','#FF4FFF','#FF4FA7']
export const poi_icons = map(new Array(10), (_,i) => {
  return {icon: 'icon-location_' + (i+1), content: '\\ue90' + i}
});
export const source_customer = 'customer';
export const source_market = 'market';
export const vault_geo_visualization = 'geo_visualization';// 静态地理分析
export const vault_interactive_map = 'interactive_map';// 可交互地理分析
export const MapVisualTypes = {
  GEO_VISUAL: vault_geo_visualization,
  INTERACTIVE_MAP: vault_interactive_map
}
export const PolygonSourceKey = '__source__';
export const PolygonPackageIdKey = '__packageId__';
export const custom_card_menu = {
  info_cfg: 'info_cfg', //信息卡片配置
  show_col: 'show_col', //展示字段
  detail: 'detail',  //显示详情
  buffer_general: 'buffer_general', //生成buffer选区
}
export const geo_types = {point:'point',polygon:'polygon',line:'line',plain:'plain'};
export const geoTypesMap = {
    [geo_types.point]: '点数据',
    [geo_types.polygon]: '面数据',
    [geo_types.line]: '线数据',
    [geo_types.plain]: '非地理数据',
};
export const h_type_date = 'datetime';
export const h_type_number = 'number';
export const h_type_text = 'text';

export const globalvals = {
    drag_tree_menu: 'drag_tree_menu',
}

export const filter_type_interactive_map = 'filter_type_interactive_map';// 交互式地理分析

export const chart_type_statistics = 'statistics';
export const chart_type_display_table = 'display_table';
export const chart_type_bar = 'bar';
export const chart_type_stack = 'stack';
export const chart_type_per_stack = 'per_stack';
export const chart_type_line = 'line';
export const chart_type_pie = 'pie';
export const chart_type_pie_circle = 'pie_circle';
export const chart_type_pie_rose = 'pie_rose';
export const chart_type_gauge = 'gauge';
export const chart_type_index = 'index';
export const chart_type_radar = 'radar';
export const chart_type_file = 'file';
export const chart_type_hot_table = 'hot_table';
export const map_type_interactive = 'interactive_map';
export const map_type_geo_visualization = 'geo_visualization';
export const login_type_wx = 0; // 微信登录
export const login_type_np = 1; // 账号密码登录

export const pie_colors = [
    '#5181E4','#9BCC66','#3FB27E','#F35351','#EFC446','#F78D48',
    '#CE62D6','#8854D4','#5055B8','#51B4F1','#69D4DB','#D42E6A'
]
export const roundNum = 9;
export const gauge_target_type_column = 'column';
export const editYAxiNumberMenus = {
    count: "计数",
    distinct_count: "去重计数",
    sum: "求和",
    mean: "平均",
    max: "最大值",
    min: "最小值",
    median: "中位数"
};
export const guageExtraValues = {
    percentage:{
        show:false,
        roundNum:roundNum,
        digit:false,
    },
    currentVal:{
        show:false,
        roundNum:roundNum,
        digit:false,
    },
    target:{
        show:false,
        roundNum:roundNum,
        digit:false,
    },
    echoText:{
        show:false,
        fontSize:12,
        color:'#fff',
        info:{realName:'',editType:false,alis:''},
    },
    warningColor:{
        show:true,
        color:'#429AFF'
    },
    section:[
        {per:33,color:pie_colors[0]||'color'},
        {per:66,color:pie_colors[1]||'yellow'},
        {per:100,color:pie_colors[2]||'green'},
    ],
};

export const chart_colors = ['#66B3FF','#66FFB3','#FF6666','#FFFF66','#B366FF',
    '#FFB366','#66FFFF','#FF66FF','#B3FF66','#FF66B3','#6666FF','#80FF80','#E6FF99',
    '#99B3FF','#99FFB3','#E699FF','#FFE699','#99FFE6','#B399FF','#99E5FF'];
export const sort_asc = 'asc';

export const chart_legend_top_right = 'top_right';
export const Newchart_colors =  ['rgba(71,117,208,1)','rgba(137,182,90,1)','rgba(57,167,118,1)','rgba(206,85,85,1)','rgba(221,181,64,1)','rgba(230,130,66,1)',
            'rgba(186,86,193,1)','rgba(126,76,196,1)','rgba(81,85,184,1)','rgba(68,160,216,1)','rgba(86,179,185,1)','rgba(193,56,108,1)'];
export const defaultExtraValues = {
    legendSty: {
        position: chart_legend_top_right,
        textStyle:{
            fontSize:12
        },
        data:[]
    },
    xAxisSty: {
        rotate: '0',
        fontSize: 12,
        color: '#fff',
        interval: false,
        data:[],
    },
    yAxisSty:{
        title:'',
        spliteNum:5,
        axisLabel:{
            fontSize:'12',
            color:"#fff",
        }
    },
    newYAxisSty: {
        title:'',
        spliteNum:5,
        axisLabel:{
            fontSize:'12',
            color:"#fff",
        }
    },
    series:{
        barMaxWidth:'18',
        label: {
            normal: {
                show: false,
                position: 'top',
                color:"white",
                fontSize:12,
            }
        },
    },
    color:Newchart_colors,
    convert:{
        roundNum:roundNum,
        digit:false,
    }
};

export const tableLoadTableRef = 'tableLoadTableRef';
export const  disPlayTabelDefaultVal = {
    titleVal : {}
}

export const market_label_tip = '(数据市场)';

export const EditPoiCardExtraValues = {
    title:{
        show:false,
        fontSize:16,
        color:"#fff",
        editTitle :{}
    },
    poiCard:{
        p_fontSize:12,
        p_color:"#fff",
        roundNum:roundNum,
        digit:false,
    },
}

export const sliceNumber = 20;    //饼图截取展示的数量
export const pieExtraValues = {
    color:pie_colors,
    legendSty: {
        position: chart_legend_top_right,
        textStyle:{
            fontSize:12
        },
        data:[]
    },
    label:{
        pos:'outOfRange',
        showOut:'true'
    },
    forceShow:false,
    convert:{
        roundNum:roundNum,
        digit:false,
    },
    diagram : {
        item:{
            name :'显示百分比标签',
            show : false,
            fontSize:12,
            color:'#fff'
        },
        item1:{
            name :'显示具体数值',
            show : false,
            fontSize:12,
            color:'#fff'
        },
        item2:{
            name :'显示纬度标签',
            show : false,
            fontSize:12,
            color:'#fff'
        },

    }
}

export const radarMenus = {
    sum: "求和",
    mean: "平均",
    max: "最大值",
    min: "最小值",
    median: "中位数"
}
export const radar_colors = ['#4775D0','#89B65A','#39A776', '#CE5555', '#DDB540', '#E68242',
    '#BA56C1', '#7E4CC4', '#5155B8', '#44A0D8', '#56B3B9', '#C1386C'];
export const example_colors = [
      {title: '蓝 - 黄 - 红', colors: ['#3B66E9','#FFFFDD','#E4434E']},
      {title: '绿 - 橙 - 红', colors: ['#61FF7D','#FFDA00','#FF4E4E']},
      {title: '青 - 黄 - 红', colors: ['#2AB6C1','#F6F0C0','#ED410A']},
      {title: '蓝 - 白 - 黄', colors: ['#2B4DE2','#F3EBEB','#FFF00E']},
      {title: '金 - 红', colors: ['#FFCA31','#FF1828']},
      {title: '渐变红', colors: ['#F2E3E3','#FF2027']},
      {title: '渐变蓝', colors: ['#D3DEED','#3B66E9']},
      {title: '渐变绿', colors: ['#C7CCAC','#24BB4F']},
      {title: '渐变紫', colors: ['#C3ACCC','#B524BB']},
  ]

  export const Style = {
    'color': colors[0],
    'radius': 10,
    'opacity': 0.8,
    'size': 12,
};


export const market_level_5 = 5;


export const new_chart_colors = [
    'rgba(71,117,208,1)','rgba(137,182,90,1)','rgba(57,167,118,1)', 'rgba(206,85,85,1)',
    'rgba(221,181,64,1)','rgba(230,130,66,1)', 'rgba(186,86,193,1)', 'rgba(126,76,196,1)',
    'rgba(81,85,184,1)','rgba(68,160,216,1)','rgba(86,179,185,1)','rgba(193,56,108,1)'
];
export const formulaWordMap = {
    ...editYAxiNumberMenus,
    formula: '公式'
}
export const rotate_type_normal = 'normal';
export const defaultLegendPosition = 'top_right';
export const max_setting_type_0 = '0';
export const maxItemLen = 30;
export const sorted_filter_all = 'all';
export const sorted_filter_left = '+';
export const sorted_filter_right = '-';
export const sorted_filter_percent_column = 'column';
export const defaultPieLabelPosition = 'outside';
export const sorted_filter_percent_percent = 'percent'

export const defaultSortedFilter = {
    type: sorted_filter_all,
    value: 10,
    percent: sorted_filter_percent_percent,
};

// 柱状图默认属性值
export const defaultChartExtraValues = {
    legendExt: {
        show: true,
        position: defaultLegendPosition,// 图例位置
    },
    xAxisExt: {
        show: true,
        position: rotate_type_normal, // x轴不旋转，left:x轴居左，right:x轴居右
        fontRotate: '0', // 文字旋转
        fontSize: 12, // 字体大小
        fontColor: '#fff', // 字体颜色
        showAllTick: false, // 显示全部刻度,
    },
    yAxisExt: {
        show: true,
        title: '', // y轴标题
        shortLabel: true,// 科学计数
        splitNum: 5, // y轴分割段数
        fontSize: 12, // y轴字体大小
        fontColor: '#fff',// y轴颜色
    },
    newYAxisExt: {
        show: true,
        title: '', // 新y轴标题
        shortLabel: true,// 科学计数
        splitNum: 5, // 新y轴分割段数
        fontSize: 12, // 新y轴字体大小
        fontColor: '#fff',// 新y轴颜色
    },
    labelExt: {
        show: false,
        fontColor: '#fff',
        fontSize: 12,
        roundNum: 2,
        force: false
    }
};
// 雷达图默认属性值
export const defaultRadarExtraValues = {
    legendExt: {
        show: true,
        position: defaultLegendPosition,// 图例位置
    },
    yAxisExt: {
        showLabel: true,
        labelSize: 12, // y轴标签字体大小
        labelColor: '#fff',// y轴标签颜色
        maxSetting: {type: max_setting_type_0}, // 类目最大值设置

        showValue: false,
        valueSize: 12, // y轴数值字体大小
        valueColor: '#fff',// y轴数值颜色
        valueForce: false, // 是否强制补充
        valueRoundNum: 2, // 强制补充位数
    },
    xAxisExt: {
        maxLen: maxItemLen // 最多展示30个
    }
}
// 仪表盘默认属性值
export  const defaultGaugeExtraValues = {
    legendExt: {
        show: false,
        position: defaultLegendPosition, // 图例位置
    },
    yAxisExt: {
        showPercent: true, // 默认显示百分比
        percentColor: '#fff', // 百分比颜色
        percentForce: false, // 是否强制补充百分比小数位
        percentRoundNum: 1, // 百分比小数位

        showValue: false, // 默认不显示当前值
        valueColor: '#fff', // 当前值颜色
        valueForce: false, // 是否强制补充当前值小数位
        valueRoundNum: 2, // 当前值小数位

        showTarget: false, // 默认不显示目标值
        targetColor: 'rgba(255,255,255,.4)',
        targetForce: false, // 是否强制补充目标值小数位
        targetRoundNum: 2, // 目标值小数位
    }
};
// 饼图默认属性值
export const defaultPieExtraValues = {
    legendExt: {
        show: true,
        position: defaultLegendPosition, // 图例位置
    },
    xAxisExt: {
        filter: {
            type: sorted_filter_left,
            value: maxItemLen,
            percent: sorted_filter_percent_column,
        },
        showRemain: true // 是否汇总剩余数据
    },
    yAxisExt: {
        showPercent: false, // 默认显示百分比
        percentColor: '#fff', // 百分比颜色
        percentSize: 12, // 百分比字体大小
        percentForce: false, // 是否强制补充百分比小数位
        percentRoundNum: 1, // 百分比小数位

        showValue: false, // 默认不显示具体数值
        valueColor: '#fff', // 具体数值颜色
        valueSize: 12, // 具体数值字体大小
        valueForce: false, // 是否强制补充具体数值小数位
        valueRoundNum: 2, // 具体数值小数位

        showLabel: true, // 是否显示文字标签
        labelColor: '#fff', // 文字标签颜色
        labelSize: 12, // 文字标签字体大小
        labelPosition: defaultPieLabelPosition
    }
}
// 指标卡默认属性
export const defaultIndexExtraValues = {
    yAxisExt: {
        valueColor: '#fff', // 具体数值颜色
        valueSize: 24, // 文字标签颜色
        valueForce: false, // 是否强制补充具体数值小数位
        valueRoundNum: 2, // 具体数值小数位
        shortValue: true, // 科学计数

        showLabel: true, // 是否显示文字标签
        labelColor: '#fff', // 文字标签颜色
        labelSize: 12, // 文字标签字体大小
    }
}
// 统计表格默认属性
export const defaultStatisticsExtraValues = {
    yAxisExt: {
        valueForce: false, // 是否强制补充具体数值小数位
        valueRoundNum: 2, // 具体数值小数位
    }
}
// 明细表格默认属性
export const defaultDisPlayExtraValues = {
    yAxisExt: {
        valueForce: false, // 是否强制补充具体数值小数位
        valueRoundNum: 2, // 具体数值小数位
    }
}
// 热力表格默认属性
export const defaultHotTableExtraValues = {
    yAxisExt:{
        showHot: true,
        reverseHotColor: false,
        hotColor: 0,
        showValue: true,
        valueForce: false, // 是否强制补充具体数值小数位
        valueRoundNum: 2, // 具体数值小数位
        valueColor: '#fff'
    },
    xAxisExt:{}
}