let mockerData = {
    "workspace": {
        title: '租房相关数据',
        description: '该部分数据主要反映了上海地区租房情况',
        geo_filters: [],
        items: [
            {
                "id": 4973,
                "name": "chart_c147cc30-fc0a-11e7-a35b-5765c48c50c5",
                "create_time": "2018-01-18 12:48:02",
                "update_time": "2018-04-08 14:41:39",
                "extra": {
                    "name": "chart_c147cc30-fc0a-11e7-a35b-5765c48c50c5",
                    "extra": {
                        "color": [
                            "rgba(71,117,208,1)",
                            "rgba(137,182,90,1)",
                            "rgba(57,167,118,1)"
                        ],
                        "label": {
                            "normal": {
                                "show": false,
                                "position": "top",
                                "textStyle": {
                                    "color": "black"
                                }
                            }
                        },
                        "series": {
                            "barMaxWidth": "18"
                        },
                        "xAxisSty": {
                            "color": "#fff",
                            "rotate": "0",
                            "fontSize": 12,
                            "interval": false
                        },
                        "yAxisSty": {
                            "title": "",
                            "axisLabel": {
                                "color": "#fff",
                                "fontSize": "12"
                            },
                            "spliteNum": 5
                        },
                        "legendSty": {
                            "data": [
                                {
                                    "alis": "主要情节-计数",
                                    "name": "主要情节-计数",
                                    "editType": false
                                },
                                {
                                    "alis": "名称-计数",
                                    "name": "名称-计数",
                                    "editType": false
                                },
                                {
                                    "alis": "派出所-计数",
                                    "name": "派出所-计数",
                                    "editType": false
                                }
                            ],
                            "position": "top_right"
                        },
                        "newYAxisSty": {
                            "title": "",
                            "axisLabel": {
                                "color": "#fff",
                                "fontSize": "12"
                            },
                            "spliteNum": 5
                        }
                    },
                    "title": "ys",
                    "xAxis": [
                        {
                            "db": "str",
                            "key": "应分案由",
                            "h_type": "text",
                            "h_value": "应分案由"
                        }
                    ],
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "主要情节",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "主要情节"
                                },
                                {
                                    "db": "str",
                                    "key": "name",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "名称"
                                },
                                {
                                    "db": "str",
                                    "key": "派出所",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "派出所"
                                }
                            ],
                            "chart_type": "bar"
                        }
                    ],
                    "source": "customer",
                    "filters": [
                        {
                            "db": "str",
                            "key": "主要情节",
                            "h_type": "text",
                            "h_value": "主要情节"
                        },
                        {
                            "db": "datetime",
                            "key": "报警时间",
                            "h_type": "datetime",
                            "h_value": "报警时间"
                        }
                    ],
                    "chart_type": "bar",
                    "object_type": "Minghang_police",
                    "geometry_type": "point"
                }
            },
            {
                "id": 9847,
                "name": "chart_e641a6c0-33cb-11e8-a77d-3fabc65701fb",
                "create_time": "2018-03-30 11:39:07",
                "update_time": "2018-03-30 11:39:07",
                "extra": {
                    "name": "chart_e641a6c0-33cb-11e8-a77d-3fabc65701fb",
                    "title": "dsdsd",
                    "xAxis": [
                        {
                            "db": "str",
                            "key": "应分案由",
                            "h_type": "text",
                            "h_value": "应分案由"
                        },
                        {
                            "db": "str",
                            "key": "派出所",
                            "h_type": "text",
                            "h_value": "派出所"
                        }
                    ],
                    "xFunc": "sum",
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "应分案由",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "应分案由"
                                }
                            ],
                            "chart_type": "hot_table"
                        }
                    ],
                    "yFunc": "sum",
                    "source": "customer",
                    "filters": [],
                    "chart_type": "hot_table",
                    "object_type": "Minghang_police",
                    "xStatistics": false,
                    "yStatistics": false,
                    "geometry_type": "point"
                }
            },
            {
                "id": 9844,
                "name": "chart_521b7930-33cb-11e8-87c8-d19c17777a5f",
                "create_time": "2018-03-30 11:34:58",
                "update_time": "2018-03-30 11:34:58",
                "extra": {
                    "name": "chart_521b7930-33cb-11e8-87c8-d19c17777a5f",
                    "title": "cessds",
                    "xAxis": [
                        {
                            "db": "str",
                            "key": "应分案由",
                            "h_type": "text",
                            "h_value": "应分案由"
                        }
                    ],
                    "xFunc": "sum",
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "name",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "名称"
                                },
                                {
                                    "db": "str",
                                    "key": "主要情节",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "主要情节"
                                }
                            ],
                            "chart_type": "statistics"
                        }
                    ],
                    "yFunc": "sum",
                    "source": "customer",
                    "filters": [],
                    "sortDire": "",
                    "chart_type": "statistics",
                    "sortHeader": "",
                    "object_type": "Minghang_police",
                    "xStatistics": false,
                    "yStatistics": false,
                    "geometry_type": "point"
                }
            },
            {
                "id": 9427,
                "name": "chart_3aabc1f0-2b6b-11e8-a158-a313ded17314",
                "create_time": "2018-03-19 19:46:58",
                "update_time": "2018-03-19 19:47:14",
                "extra": {
                    "name": "chart_3aabc1f0-2b6b-11e8-a158-a313ded17314",
                    "extra": {
                        "color": [
                            "rgba(228, 67, 78, 1)"
                        ],
                        "series": {
                            "label": {
                                "normal": {
                                    "show": false,
                                    "color": "white",
                                    "fontSize": 12,
                                    "position": "top"
                                }
                            },
                            "barMaxWidth": "18"
                        },
                        "convert": {
                            "digit": false,
                            "roundNum": 9
                        },
                        "xAxisSty": {
                            "data": [],
                            "color": "#fff",
                            "rotate": "0",
                            "fontSize": 12,
                            "interval": false
                        },
                        "yAxisSty": {
                            "title": "",
                            "axisLabel": {
                                "color": "#fff",
                                "fontSize": "12"
                            },
                            "spliteNum": 5
                        },
                        "legendSty": {
                            "data": [
                                {
                                    "alis": "派出所-计数",
                                    "name": "派出所-计数",
                                    "editType": false
                                }
                            ],
                            "position": "top_right",
                            "textStyle": {
                                "fontSize": 12
                            }
                        },
                        "newYAxisSty": {
                            "title": "",
                            "axisLabel": {
                                "color": "#fff",
                                "fontSize": "12"
                            },
                            "spliteNum": 5
                        }
                    },
                    "title": "折线测试",
                    "xAxis": [
                        {
                            "db": "datetime",
                            "key": "报警时间",
                            "h_type": "datetime",
                            "h_value": "报警时间"
                        }
                    ],
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "派出所",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "派出所"
                                }
                            ],
                            "chart_type": "line"
                        }
                    ],
                    "source": "customer",
                    "filters": [],
                    "chart_type": "line",
                    "object_type": "Minghang_police",
                    "geometry_type": "point"
                }
            },
            {
                "id": 1945,
                "name": "chart_929d1a70-f1ba-11e7-95bd-23bf7a251afe",
                "create_time": "2018-01-05 09:48:48",
                "update_time": "2018-03-06 17:26:14",
                "extra": {
                    "name": "chart_929d1a70-f1ba-11e7-95bd-23bf7a251afe",
                    "extra": {
                        "color": [
                            "rgba(79, 255, 255, 1)",
                            "rgba(79, 255, 79, 1)",
                            "rgba(79, 255, 255, 1)"
                        ],
                        "label": {
                            "normal": {
                                "show": true,
                                "position": "top",
                                "textStyle": {
                                    "color": "black"
                                }
                            }
                        },
                        "series": {
                            "barMaxWidth": 20
                        },
                        "xAxisSty": {
                            "color": "#fff",
                            "rotate": "15",
                            "fontSize": 12,
                            "interval": false
                        },
                        "yAxisSty": {
                            "title": "dfasd",
                            "axisLabel": {
                                "color": "#fff",
                                "fontSize": 24
                            },
                            "spliteNum": 5
                        },
                        "legendSty": {
                            "position": "top_right"
                        },
                        "newYAxisSty": {
                            "title": "",
                            "axisLabel": {
                                "color": "#fff",
                                "fontSize": "12"
                            },
                            "spliteNum": 5
                        }
                    },
                    "title": "cescescescescescescescescescescescescescescescescescesces",
                    "xAxis": [
                        {
                            "db": "str",
                            "key": "派出所",
                            "h_type": "text",
                            "h_value": "派出所"
                        }
                    ],
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "派出所",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "派出所"
                                },
                                {
                                    "db": "str",
                                    "key": "应分案由",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "应分案由"
                                },
                                {
                                    "db": "str",
                                    "key": "主要情节",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "主要情节"
                                }
                            ],
                            "chart_type": "bar"
                        }
                    ],
                    "source": "customer",
                    "filters": [],
                    "chart_type": "bar",
                    "object_type": "Minghang_police",
                    "geometry_type": "point"
                }
            },
            {
                "id": 4975,
                "name": "chart_dfab0890-fc0a-11e7-a35b-5765c48c50c5",
                "create_time": "2018-01-18 12:48:53",
                "update_time": "2018-03-06 15:57:11",
                "extra": {
                    "name": "chart_dfab0890-fc0a-11e7-a35b-5765c48c50c5",
                    "extra": {
                        "color": [
                            "rgba(71,117,208,1)",
                            "rgba(137,182,90,1)",
                            "rgba(57,167,118,1)"
                        ],
                        "label": {
                            "normal": {
                                "show": false,
                                "position": "top",
                                "textStyle": {
                                    "color": "black"
                                }
                            }
                        },
                        "series": {
                            "barMaxWidth": "18"
                        },
                        "xAxisSty": {
                            "color": "#fff",
                            "rotate": "0",
                            "fontSize": 12,
                            "interval": false
                        },
                        "yAxisSty": {
                            "title": "",
                            "axisLabel": {
                                "color": "#fff",
                                "fontSize": "12"
                            },
                            "spliteNum": 5
                        },
                        "legendSty": {
                            "position": "top_right"
                        },
                        "newYAxisSty": {
                            "title": "",
                            "axisLabel": {
                                "color": "#fff",
                                "fontSize": "12"
                            },
                            "spliteNum": 5
                        }
                    },
                    "title": "ys",
                    "xAxis": [
                        {
                            "db": "str",
                            "key": "派出所",
                            "h_type": "text",
                            "h_value": "派出所"
                        }
                    ],
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "应分案由",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "应分案由"
                                },
                                {
                                    "db": "str",
                                    "key": "派出所",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "派出所"
                                },
                                {
                                    "db": "str",
                                    "key": "主要情节",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "主要情节"
                                }
                            ],
                            "chart_type": "bar"
                        }
                    ],
                    "source": "customer",
                    "filters": [],
                    "chart_type": "bar",
                    "object_type": "Minghang_police",
                    "geometry_type": "point"
                }
            },
            {
                "id": 8137,
                "name": "chart_0d71aab0-1dfb-11e8-a542-3d9959780aeb",
                "create_time": "2018-03-02 17:21:13",
                "update_time": "2018-03-02 17:21:13",
                "extra": {
                    "name": "chart_0d71aab0-1dfb-11e8-a542-3d9959780aeb",
                    "title": "表格",
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "name",
                                    "h_type": "text",
                                    "h_value": "名称"
                                },
                                {
                                    "db": "str",
                                    "key": "主要情节",
                                    "h_type": "text",
                                    "h_value": "主要情节"
                                },
                                {
                                    "db": "str",
                                    "key": "应分案由",
                                    "h_type": "text",
                                    "h_value": "应分案由"
                                },
                                {
                                    "db": "str",
                                    "key": "派出所",
                                    "h_type": "text",
                                    "h_value": "派出所"
                                },
                                {
                                    "db": "datetime",
                                    "key": "报警时间",
                                    "h_type": "datetime",
                                    "h_value": "报警时间"
                                }
                            ],
                            "chart_type": "display_table"
                        }
                    ],
                    "source": "customer",
                    "chart_type": "display_table",
                    "object_type": "Minghang_police",
                    "geometry_type": "point"
                }
            },
            {
                "id": 6475,
                "name": "chart_19749920-068c-11e8-a561-4938016f125d",
                "create_time": "2018-01-31 21:39:02",
                "update_time": "2018-01-31 21:39:02",
                "extra": {
                    "name": "chart_19749920-068c-11e8-a561-4938016f125d",
                    "title": "测试",
                    "xAxis": [
                        {
                            "db": "str",
                            "key": "name",
                            "func": "sum",
                            "h_type": "text",
                            "h_value": "\u540d\u79f0"
                        }
                    ],
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "int",
                                    "key": "去化套数",
                                    "h_type": "number",
                                    "h_value": "去化套数"
                                },
                                {
                                    "db": "float",
                                    "key": "去化率↵(%)",
                                    "h_type": "number",
                                    "h_value": "去化率↵(%)"
                                },
                                {
                                    "db": "int",
                                    "key": "推出套数",
                                    "h_type": "number",
                                    "h_value": "推出套数"
                                }
                            ],
                            "chart_type": "radar"
                        }
                    ],
                    "source": "customer",
                    "filters": [],
                    "chart_type": "radar",
                    "object_type": "公寓",
                    "geometry_type": "point"
                }
            },
            {
                "id": 4977,
                "name": "chart_0fd35f40-fc0b-11e7-a35b-5765c48c50c5",
                "create_time": "2018-01-18 12:50:14",
                "update_time": "2018-01-18 12:50:14",
                "extra": {
                    "name": "chart_0fd35f40-fc0b-11e7-a35b-5765c48c50c5",
                    "title": "df",
                    "xAxis": [],
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "主要情节",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "主要情节"
                                },
                                {
                                    "db": "str",
                                    "key": "name",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "名称"
                                }
                            ],
                            "chart_type": "pie_rose"
                        }
                    ],
                    "source": "customer",
                    "filters": [],
                    "chart_type": "pie_rose",
                    "object_type": "Minghang_police",
                    "geometry_type": "point"
                }
            },
            {
                "id": 4976,
                "name": "chart_01605620-fc0b-11e7-a35b-5765c48c50c5",
                "create_time": "2018-01-18 12:49:50",
                "update_time": "2018-01-18 12:49:50",
                "extra": {
                    "name": "chart_01605620-fc0b-11e7-a35b-5765c48c50c5",
                    "title": "ts",
                    "xAxis": [],
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "name",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "名称"
                                },
                                {
                                    "db": "str",
                                    "key": "应分案由",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "应分案由"
                                }
                            ],
                            "chart_type": "pie"
                        }
                    ],
                    "source": "customer",
                    "filters": [],
                    "chart_type": "pie",
                    "object_type": "Minghang_police",
                    "geometry_type": "point"
                }
            },
            {
                "id": 4974,
                "name": "chart_cd4a7190-fc0a-11e7-a35b-5765c48c50c5",
                "create_time": "2018-01-18 12:48:22",
                "update_time": "2018-01-18 12:48:22",
                "extra": {
                    "name": "chart_cd4a7190-fc0a-11e7-a35b-5765c48c50c5",
                    "title": "ya",
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "主要情节",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "主要情节"
                                },
                                {
                                    "db": "str",
                                    "key": "派出所",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "派出所"
                                }
                            ],
                            "chart_type": "index"
                        }
                    ],
                    "source": "customer",
                    "filters": [],
                    "chart_type": "index",
                    "object_type": "Minghang_police",
                    "geometry_type": "point"
                }
            },
            {
                "id": 4308,
                "name": "chart_c7d06450-fa6a-11e7-9f26-9be790be7768",
                "create_time": "2018-01-16 11:10:18",
                "update_time": "2018-01-16 11:10:18",
                "extra": {
                    "name": "chart_c7d06450-fa6a-11e7-9f26-9be790be7768",
                    "title": "测试",
                    "xAxis": [
                        {
                            "db": "str",
                            "key": "类别_三级",
                            "h_type": "text",
                            "h_value": "类别_三级"
                        }
                    ],
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "类别_三级",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "类别_三级"
                                }
                            ],
                            "chart_type": "pie"
                        }
                    ],
                    "source": "customer",
                    "filters": [],
                    "chart_type": "pie",
                    "object_type": "体育设施",
                    "geometry_type": "point"
                }
            },
            {
                "id": 2109,
                "name": "chart_d8e37d20-f1ed-11e7-9da3-738690be8a8e",
                "create_time": "2018-01-05 15:55:50",
                "update_time": "2018-01-05 15:55:50",
                "extra": {
                    "name": "chart_d8e37d20-f1ed-11e7-9da3-738690be8a8e",
                    "title": "yuiio",
                    "xAxis": [
                        {
                            "db": "datetime",
                            "key": "2017年10月份",
                            "h_type": "datetime",
                            "h_value": "2017年10月份"
                        }
                    ],
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "str",
                                    "key": "分户型段↵(㎡)",
                                    "func": "count",
                                    "h_type": "text",
                                    "h_value": "分户型段↵(㎡)"
                                }
                            ],
                            "chart_type": "pie"
                        }
                    ],
                    "source": "customer",
                    "filters": [],
                    "chart_type": "pie",
                    "object_type": "公寓",
                    "geometry_type": "point"
                }
            }
        ],
        type: "",
    },
    "vauultResult": {
        title: '租房相关数据',
        description: '该部分数据主要反映了上海地区租房情况',
        geo_filters: [],
        items: [
            {
                "id": 2162,
                "name": "file_6ee9e7e0-210b-11e8-8e12-69175886445e",
                "create_time": "2018-03-06 14:53:52",
                "update_time": "2018-03-06 16:21:48",
                "extra": {
                    "name": "file_6ee9e7e0-210b-11e8-8e12-69175886445e",
                    "path": "http://mdt-dev-public.oss-cn-hangzhou.aliyuncs.com/files/7/65572c88bc43dd5fa28e157169468a7a_金地产品问题.pdf",
                    "title": "金地产品问题1",
                    "chart_type": "file"
                }
            }
        ],
        type: "",
    },
    // "vaultResult": [
    // ],
    "useResult": {
        "customer": {
            "line": [
                "地铁线",
                "居住工作联系",
                "南京地铁线（规划）",
                "南京地铁线（已开通）",
                "南京地铁线（在建）",
                "青岛地铁线（已开通）",
                "青岛地铁线（在建）",
                "上海地铁线（规划）",
                "上海地铁线（已开通）",
                "上海地铁线（在建）",
                "深圳地铁线（规划）",
                "深圳地铁线（已开通）",
                "深圳地铁线（在建）"
            ],
            "plain": [
                "canyin",
                "蓝光",
                "土地_plain22",
                "现居住购房需求"
            ],
            "point": [
                "1_sheet_poi",
                "2040居住地",
                "Minghang_police",
                "Minghang_police_steal",
                "poi_with_time_field",
                "pudongjzCenterPopu",
                "Sheet1",
                "test678",
                "餐饮服务;餐饮相关场所;餐饮相关",
                "餐饮服务;茶艺馆;茶艺馆",
                "餐饮服务;糕饼店;糕饼店",
                "餐饮服务;咖啡厅;咖啡厅",
                "餐饮服务;咖啡厅;星巴克咖啡",
                "餐饮服务;咖啡厅;星巴克咖啡|购物服务;购物相关场所;购物相关场所",
                "餐饮服务;快餐厅;茶餐厅",
                "餐饮服务;快餐厅;快餐厅",
                "餐饮服务;冷饮店;冷饮店",
                "餐饮服务;甜品店;甜品店",
                "餐饮服务;外国餐厅;日本料理",
                "餐饮服务;外国餐厅;泰国/越南菜品餐厅",
                "餐饮服务;外国餐厅;外国餐厅",
                "餐饮服务;外国餐厅;西餐厅(综合风味)",
                "餐饮服务;中餐厅;海鲜酒楼",
                "餐饮服务;中餐厅;火锅店",
                "餐饮服务;中餐厅;特色/地方风味餐厅",
                "餐饮服务;中餐厅;中餐厅",
                "产业园",
                "大型商业",
                "地铁站",
                "点点代点",
                "点点点",
                "公寓",
                "杭州市写字楼信息",
                "杭州 星巴克",
                "行政区",
                "淮海经济区圈经济数据（范例）",
                "交通设施服务;火车站;火车站",
                "金地水悦堂测试",
                "居住地",
                "快速路出口",
                "蓝光",
                "南京地铁站（规划）",
                "企业",
                "商办",
                "商务住宅;产业园区;产业园区",
                "商务住宅;楼宇;商务写字楼",
                "商务住宅;商务住宅相关;商务住宅相关",
                "商务住宅;住宅区;住宅小区",
                "上海地铁站（规划）",
                "上海市  幼儿园",
                "上海 五角场 肯德基",
                "上海 五角场 沙县",
                "上海 星巴克",
                "深圳地铁站（规划）",
                "生活服务;旅行社;旅行社",
                "生活服务;美容美发店;美容美发店",
                "生活服务;摄影冲印店;摄影冲印",
                "生活服务;生活服务场所;生活服务场所",
                "生活服务;维修站点;维修站点",
                "生活服务;洗衣店;洗衣店",
                "生活服务;洗浴推拿场所;洗浴推拿场所",
                "随便点",
                "体育设施",
                "体育休闲服务;体育休闲服务场所;体育休闲服务场所",
                "体育休闲服务;休闲场所;游乐场",
                "体育休闲服务;娱乐场所;网吧",
                "体育休闲服务;运动场馆;健身中心",
                "土地",
                "我的家",
                "现有文化设施we",
                "写字楼",
                "新建 Microsoft Excel 工作表",
                "_星巴克_1515747481270",
                "养老",
                "医院",
                "郑州市 麦当劳",
                "郑州 星巴克",
                "住宅",
                "住宅111"
            ],
            "polygon": [
                "104产业园",
                "2017年土地出让明细",
                "345435",
                "fuck",
                "huan",
                "land",
                "test",
                "vcfsdv",
                "w",
                "we1",
                "副中心",
                "高校",
                "济南板块_城市化阶段",
                "济南板块_经济发展水平",
                "济南街镇_城市化阶段",
                "济南街镇_经济发展水平",
                "龙华",
                "脉策人口数据包",
                "上海板块",
                "上海区县",
                "生活服务",
                "土地数据样例",
                "现居住甄别问卷",
                "小区",
                "郑州中心板块",
                "中海板块"
            ]
        },
        "market": {}
    },

    //chart real data
    "chart_c147cc30-fc0a-11e7-a35b-5765c48c50c5": {
        "result": [
            {
                "func": "count",
                "result": {
                    "两抢": 64,
                    "入民宅盗窃": 2975,
                    "其他": 11,
                    "其他入室盗窃": 11,
                    "其他盗窃案件": 20,
                    "其他诈骗类案件": 17,
                    "扒窃": 4020,
                    "盗窃机动车": 337,
                    "盗车内物": 764,
                    "盗非机动车": 9,
                    "虚假信息诈骗": 3,
                    "重复报警": 1,
                    "马路诈骗": 67
                }
            },
            {
                "func": "count",
                "result": {
                    "两抢": 64,
                    "入民宅盗窃": 2975,
                    "其他": 11,
                    "其他入室盗窃": 11,
                    "其他盗窃案件": 20,
                    "其他诈骗类案件": 17,
                    "扒窃": 4020,
                    "盗窃机动车": 337,
                    "盗车内物": 764,
                    "盗非机动车": 9,
                    "虚假信息诈骗": 3,
                    "重复报警": 1,
                    "马路诈骗": 67
                }
            },
            {
                "func": "count",
                "result": {
                    "两抢": 64,
                    "入民宅盗窃": 2975,
                    "其他": 11,
                    "其他入室盗窃": 11,
                    "其他盗窃案件": 20,
                    "其他诈骗类案件": 17,
                    "扒窃": 4020,
                    "盗窃机动车": 337,
                    "盗车内物": 764,
                    "盗非机动车": 9,
                    "虚假信息诈骗": 3,
                    "重复报警": 1,
                    "马路诈骗": 67
                }
            }
        ],
        "from_cache": "2018-04-11 22:17:19"
    },

    "chart_e641a6c0-33cb-11e8-a77d-3fabc65701fb": {
        "result": {
            "x": [
                "盗非机动车",
                "入民宅盗窃",
                "其他盗窃案件",
                "其他入室盗窃",
                "其他",
                "扒窃",
                "其他诈骗类案件",
                "虚假信息诈骗",
                "盗车内物",
                "盗窃机动车",
                "两抢",
                "重复报警",
                "马路诈骗",
                "其他入室盗窃 ",
                "其他诈骗类案件 ",
                "其他 ",
                "重复报警 ",
                "其他盗窃案件 ",
                "盗非机动车 ",
                "虚假信息诈骗 "
            ],
            "y": [
                "马桥所",
                "杜行所",
                "虹桥所",
                "纪王所",
                "吴泾所",
                "颛桥所",
                "塘湾所",
                "浦锦所",
                "七宝所",
                "莘光所",
                "碧江所",
                "莘松所",
                "古美所",
                "鲁汇所",
                "梅陇所",
                "华坪所",
                "曹行所",
                "新虹所",
                "枢纽所",
                "莘庄所",
                "华漕所",
                "金都所",
                "新镇所",
                "航华所",
                "龙柏所",
                "田园所",
                "闵治所",
                "水上所",
                "陈行所"
            ],
            "values": [
                [
                    188.0,
                    77.0,
                    381.0,
                    19.0,
                    142.0,
                    21.0,
                    17.0,
                    75.0,
                    13.0,
                    3.0,
                    1.0,
                    null,
                    1.0,
                    1.0,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    621.0,
                    301.0,
                    904.0,
                    129.0,
                    370.0,
                    220.0,
                    96.0,
                    197.0,
                    52.0,
                    27.0,
                    6.0,
                    8.0,
                    5.0,
                    1.0,
                    3.0,
                    2.0,
                    1.0,
                    1.0,
                    null,
                    1.0
                ],
                [
                    388.0,
                    88.0,
                    545.0,
                    45.0,
                    298.0,
                    221.0,
                    66.0,
                    202.0,
                    28.0,
                    15.0,
                    3.0,
                    null,
                    3.0,
                    2.0,
                    2.0,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    333.0,
                    163.0,
                    308.0,
                    21.0,
                    127.0,
                    46.0,
                    11.0,
                    71.0,
                    41.0,
                    8.0,
                    1.0,
                    2.0,
                    2.0,
                    1.0,
                    null,
                    null,
                    null,
                    1.0,
                    1.0,
                    null
                ],
                [
                    237.0,
                    55.0,
                    292.0,
                    14.0,
                    156.0,
                    85.0,
                    23.0,
                    82.0,
                    17.0,
                    8.0,
                    1.0,
                    null,
                    2.0,
                    null,
                    1.0,
                    null,
                    null,
                    null,
                    1.0,
                    1.0
                ],
                [
                    386.0,
                    202.0,
                    641.0,
                    46.0,
                    281.0,
                    160.0,
                    52.0,
                    136.0,
                    29.0,
                    25.0,
                    2.0,
                    6.0,
                    7.0,
                    1.0,
                    null,
                    2.0,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    151.0,
                    113.0,
                    245.0,
                    27.0,
                    91.0,
                    29.0,
                    11.0,
                    77.0,
                    20.0,
                    8.0,
                    1.0,
                    2.0,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    161.0,
                    152.0,
                    379.0,
                    26.0,
                    167.0,
                    100.0,
                    27.0,
                    86.0,
                    28.0,
                    7.0,
                    null,
                    1.0,
                    1.0,
                    null,
                    null,
                    null,
                    null,
                    2.0,
                    null,
                    null
                ],
                [
                    1054.0,
                    209.0,
                    1082.0,
                    50.0,
                    524.0,
                    867.0,
                    202.0,
                    302.0,
                    89.0,
                    37.0,
                    6.0,
                    5.0,
                    12.0,
                    1.0,
                    1.0,
                    1.0,
                    null,
                    null,
                    1.0,
                    null
                ],
                [
                    257.0,
                    64.0,
                    353.0,
                    38.0,
                    261.0,
                    274.0,
                    53.0,
                    135.0,
                    30.0,
                    12.0,
                    4.0,
                    4.0,
                    2.0,
                    1.0,
                    null,
                    null,
                    null,
                    1.0,
                    null,
                    null
                ],
                [
                    340.0,
                    53.0,
                    404.0,
                    20.0,
                    184.0,
                    125.0,
                    35.0,
                    124.0,
                    18.0,
                    9.0,
                    4.0,
                    null,
                    1.0,
                    1.0,
                    1.0,
                    null,
                    null,
                    1.0,
                    1.0,
                    null
                ],
                [
                    251.0,
                    66.0,
                    318.0,
                    32.0,
                    200.0,
                    224.0,
                    56.0,
                    114.0,
                    27.0,
                    10.0,
                    2.0,
                    1.0,
                    2.0,
                    null,
                    1.0,
                    null,
                    null,
                    2.0,
                    null,
                    null
                ],
                [
                    279.0,
                    87.0,
                    371.0,
                    22.0,
                    222.0,
                    125.0,
                    51.0,
                    160.0,
                    34.0,
                    18.0,
                    4.0,
                    null,
                    4.0,
                    null,
                    3.0,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    197.0,
                    108.0,
                    336.0,
                    20.0,
                    181.0,
                    28.0,
                    24.0,
                    92.0,
                    11.0,
                    8.0,
                    1.0,
                    2.0,
                    null,
                    null,
                    1.0,
                    1.0,
                    null,
                    1.0,
                    null,
                    1.0
                ],
                [
                    525.0,
                    193.0,
                    770.0,
                    52.0,
                    433.0,
                    539.0,
                    79.0,
                    208.0,
                    53.0,
                    18.0,
                    4.0,
                    1.0,
                    7.0,
                    1.0,
                    1.0,
                    2.0,
                    null,
                    1.0,
                    null,
                    null
                ],
                [
                    317.0,
                    60.0,
                    358.0,
                    27.0,
                    140.0,
                    125.0,
                    43.0,
                    102.0,
                    11.0,
                    11.0,
                    3.0,
                    2.0,
                    null,
                    null,
                    null,
                    1.0,
                    null,
                    1.0,
                    1.0,
                    null
                ],
                [
                    215.0,
                    214.0,
                    433.0,
                    36.0,
                    245.0,
                    45.0,
                    15.0,
                    146.0,
                    31.0,
                    10.0,
                    2.0,
                    1.0,
                    1.0,
                    null,
                    null,
                    null,
                    null,
                    2.0,
                    null,
                    null
                ],
                [
                    297.0,
                    94.0,
                    349.0,
                    18.0,
                    155.0,
                    95.0,
                    34.0,
                    134.0,
                    34.0,
                    11.0,
                    2.0,
                    3.0,
                    null,
                    null,
                    2.0,
                    1.0,
                    null,
                    3.0,
                    null,
                    null
                ],
                [
                    336.0,
                    1.0,
                    232.0,
                    34.0,
                    121.0,
                    70.0,
                    18.0,
                    31.0,
                    5.0,
                    6.0,
                    1.0,
                    null,
                    2.0,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    226.0,
                    56.0,
                    304.0,
                    21.0,
                    130.0,
                    80.0,
                    38.0,
                    79.0,
                    30.0,
                    8.0,
                    null,
                    null,
                    1.0,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    501.0,
                    198.0,
                    576.0,
                    46.0,
                    206.0,
                    128.0,
                    40.0,
                    120.0,
                    54.0,
                    20.0,
                    5.0,
                    2.0,
                    3.0,
                    null,
                    null,
                    null,
                    null,
                    1.0,
                    null,
                    null
                ],
                [
                    97.0,
                    44.0,
                    254.0,
                    12.0,
                    79.0,
                    28.0,
                    27.0,
                    88.0,
                    18.0,
                    3.0,
                    null,
                    null,
                    3.0,
                    null,
                    null,
                    null,
                    null,
                    1.0,
                    1.0,
                    null
                ],
                [
                    292.0,
                    75.0,
                    334.0,
                    29.0,
                    164.0,
                    130.0,
                    30.0,
                    70.0,
                    27.0,
                    25.0,
                    4.0,
                    1.0,
                    1.0,
                    1.0,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    79.0,
                    30.0,
                    140.0,
                    9.0,
                    101.0,
                    32.0,
                    17.0,
                    32.0,
                    13.0,
                    12.0,
                    null,
                    null,
                    1.0,
                    null,
                    null,
                    null,
                    null,
                    1.0,
                    null,
                    null
                ],
                [
                    90.0,
                    51.0,
                    112.0,
                    11.0,
                    112.0,
                    42.0,
                    22.0,
                    50.0,
                    13.0,
                    7.0,
                    2.0,
                    1.0,
                    null,
                    null,
                    null,
                    1.0,
                    null,
                    1.0,
                    1.0,
                    null
                ],
                [
                    192.0,
                    84.0,
                    310.0,
                    17.0,
                    119.0,
                    70.0,
                    30.0,
                    86.0,
                    28.0,
                    6.0,
                    2.0,
                    1.0,
                    2.0,
                    null,
                    1.0,
                    null,
                    null,
                    null,
                    1.0,
                    null
                ],
                [
                    7.0,
                    null,
                    25.0,
                    1.0,
                    15.0,
                    null,
                    1.0,
                    11.0,
                    null,
                    null,
                    1.0,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    null,
                    null,
                    1.0,
                    null,
                    1.0,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                [
                    134.0,
                    137.0,
                    193.0,
                    23.0,
                    121.0,
                    111.0,
                    21.0,
                    51.0,
                    10.0,
                    5.0,
                    2.0,
                    null,
                    4.0,
                    null,
                    null,
                    null,
                    null,
                    null,
                    1.0,
                    null
                ]
            ]
        },
        "from_cache": "2018-04-11 22:17:21"
    },

    "chart_521b7930-33cb-11e8-87c8-d19c17777a5f": {
        "result": [
            {
                "func": "count",
                "result": {
                    "两抢": 64,
                    "入民宅盗窃": 2975,
                    "其他": 11,
                    "其他入室盗窃": 11,
                    "其他盗窃案件": 20,
                    "其他诈骗类案件": 17,
                    "扒窃": 4020,
                    "盗窃机动车": 337,
                    "盗车内物": 764,
                    "盗非机动车": 9,
                    "虚假信息诈骗": 3,
                    "重复报警": 1,
                    "马路诈骗": 67,
                }
            },
            {
                "func": "count",
                "result": {
                    "两抢": 64,
                    "入民宅盗窃": 2975,
                    "其他": 11,
                    "其他入室盗窃": 11,
                    "其他盗窃案件": 20,
                    "其他诈骗类案件": 17,
                    "扒窃": 4020,
                    "盗窃机动车": 337,
                    "盗车内物": 764,
                    "盗非机动车": 9,
                    "虚假信息诈骗": 3,
                    "重复报警": 1,
                    "马路诈骗": 67
                }
            }
        ],
        "from_cache": "2018-04-11 22:17:21"
    },

    "chart_3aabc1f0-2b6b-11e8-a158-a313ded17314": {
        "result": [
            {
                "func": "count",
                "result": {
                    "2017-01-01": 152,
                    "2017-01-02": 154,
                    "2017-01-03": 113,
                    "2017-01-04": 141,
                    "2017-01-05": 88,
                    "2017-01-06": 121,
                    "2017-01-07": 139,
                    "2017-01-08": 118,
                    "2017-01-09": 119,
                    "2017-01-10": 116,
                    "2017-01-11": 132,
                    "2017-01-12": 126,
                    "2017-01-13": 101,
                    "2017-01-14": 118,
                    "2017-01-15": 100,
                    "2017-01-16": 101,
                    "2017-01-17": 104,
                    "2017-01-18": 100,
                    "2017-01-19": 94,
                    "2017-01-20": 76,
                    "2017-01-21": 99,
                    "2017-01-22": 74,
                    "2017-01-23": 64,
                    "2017-01-24": 60,
                    "2017-01-25": 68,
                    "2017-01-26": 46,
                    "2017-01-27": 47,
                    "2017-01-28": 40,
                    "2017-01-29": 49,
                    "2017-01-30": 45,
                    "2017-01-31": 48,
                    "2017-02-01": 37,
                    "2017-02-02": 60,
                    "2017-02-03": 45,
                    "2017-02-04": 71,
                    "2017-02-05": 59,
                    "2017-02-06": 59,
                    "2017-02-07": 65,
                    "2017-02-08": 61,
                    "2017-02-09": 67,
                    "2017-02-10": 87,
                    "2017-02-11": 98,
                    "2017-02-12": 95,
                    "2017-02-13": 106,
                    "2017-02-14": 110,
                    "2017-02-15": 92,
                    "2017-02-16": 105,
                    "2017-02-17": 128,
                    "2017-02-18": 143,
                    "2017-02-19": 140,
                    "2017-02-20": 112,
                    "2017-02-21": 121,
                    "2017-02-22": 98,
                    "2017-02-23": 99,
                    "2017-02-24": 146,
                    "2017-02-25": 141,
                    "2017-02-26": 159,
                    "2017-02-27": 139,
                    "2017-02-28": 154,
                    "2017-03-01": 140,
                    "2017-03-02": 155,
                    "2017-03-03": 125,
                    "2017-03-04": 171,
                    "2017-03-05": 131,
                    "2017-03-06": 131,
                    "2017-03-07": 135,
                    "2017-03-08": 132,
                    "2017-03-09": 139,
                    "2017-03-10": 174,
                    "2017-03-11": 164,
                    "2017-03-12": 139,
                    "2017-03-13": 111,
                    "2017-03-14": 117,
                    "2017-03-15": 127,
                    "2017-03-16": 127,
                    "2017-03-17": 162,
                    "2017-03-18": 181,
                    "2017-03-19": 146,
                    "2017-03-20": 117,
                    "2017-03-21": 139,
                    "2017-03-22": 128,
                    "2017-03-23": 113,
                    "2017-03-24": 140,
                    "2017-03-25": 148,
                    "2017-03-26": 161,
                    "2017-03-27": 115,
                    "2017-03-28": 118,
                    "2017-03-29": 137,
                    "2017-03-30": 119,
                    "2017-03-31": 131,
                    "2017-04-01": 132,
                    "2017-04-02": 155,
                    "2017-04-03": 143,
                    "2017-04-04": 131,
                    "2017-04-05": 115,
                    "2017-04-06": 110,
                    "2017-04-07": 103,
                    "2017-04-08": 172,
                    "2017-04-09": 128,
                    "2017-04-10": 102,
                    "2017-04-11": 133,
                    "2017-04-12": 121,
                    "2017-04-13": 137,
                    "2017-04-14": 181,
                    "2017-04-15": 137,
                    "2017-04-16": 155,
                    "2017-04-17": 106,
                    "2017-04-18": 130,
                    "2017-04-19": 129,
                    "2017-04-20": 132,
                    "2017-04-21": 146,
                    "2017-04-22": 148,
                    "2017-04-23": 138,
                    "2017-04-24": 119,
                    "2017-04-25": 137,
                    "2017-04-26": 118,
                    "2017-04-27": 138,
                    "2017-04-28": 122,
                    "2017-04-29": 141,
                    "2017-04-30": 129,
                    "2017-05-01": 114,
                    "2017-05-02": 112,
                    "2017-05-03": 118,
                    "2017-05-04": 137,
                    "2017-05-05": 135,
                    "2017-05-06": 142,
                    "2017-05-07": 131,
                    "2017-05-08": 92,
                    "2017-05-09": 115,
                    "2017-05-10": 115,
                    "2017-05-11": 114,
                    "2017-05-12": 105,
                    "2017-05-13": 99,
                    "2017-05-14": 142,
                    "2017-05-15": 118,
                    "2017-05-16": 97,
                    "2017-05-17": 121,
                    "2017-05-18": 128,
                    "2017-05-19": 130,
                    "2017-05-20": 153,
                    "2017-05-21": 145,
                    "2017-05-22": 115,
                    "2017-05-23": 112,
                    "2017-05-24": 125,
                    "2017-05-25": 131,
                    "2017-05-26": 149,
                    "2017-05-27": 126,
                    "2017-05-28": 132,
                    "2017-05-29": 107,
                    "2017-05-30": 87,
                    "2017-05-31": 98,
                    "2017-06-01": 109,
                    "2017-06-02": 118,
                    "2017-06-03": 111,
                    "2017-06-04": 133,
                    "2017-06-05": 122,
                    "2017-06-06": 96,
                    "2017-06-07": 98,
                    "2017-06-08": 108,
                    "2017-06-09": 128,
                    "2017-06-10": 97,
                    "2017-06-11": 117,
                    "2017-06-12": 113,
                    "2017-06-13": 102,
                    "2017-06-14": 137,
                    "2017-06-15": 134,
                    "2017-06-16": 143,
                    "2017-06-17": 125,
                    "2017-06-18": 117,
                    "2017-06-19": 108,
                    "2017-06-20": 101,
                    "2017-06-21": 108,
                    "2017-06-22": 122,
                    "2017-06-23": 98,
                    "2017-06-24": 101,
                    "2017-06-25": 87,
                    "2017-06-26": 105,
                    "2017-06-27": 113,
                    "2017-06-28": 110,
                    "2017-06-29": 95,
                    "2017-06-30": 114,
                    "2017-07-01": 115,
                    "2017-07-02": 125,
                    "2017-07-03": 119,
                    "2017-07-04": 92,
                    "2017-07-05": 81,
                    "2017-07-06": 120,
                    "2017-07-07": 113,
                    "2017-07-08": 97,
                    "2017-07-09": 117,
                    "2017-07-10": 100,
                    "2017-07-11": 122,
                    "2017-07-12": 99,
                    "2017-07-13": 123,
                    "2017-07-14": 119,
                    "2017-07-15": 107,
                    "2017-07-16": 137,
                    "2017-07-17": 133,
                    "2017-07-18": 120,
                    "2017-07-19": 123,
                    "2017-07-20": 111,
                    "2017-07-21": 119,
                    "2017-07-22": 115,
                    "2017-07-23": 122,
                    "2017-07-24": 119,
                    "2017-07-25": 84,
                    "2017-07-26": 112,
                    "2017-07-27": 101,
                    "2017-07-28": 126,
                    "2017-07-29": 104,
                    "2017-07-30": 118,
                    "2017-07-31": 116,
                    "2017-08-01": 107,
                    "2017-08-02": 117,
                    "2017-08-03": 123,
                    "2017-08-04": 105,
                    "2017-08-05": 102,
                    "2017-08-06": 144,
                    "2017-08-07": 117,
                    "2017-08-08": 113,
                    "2017-08-09": 104,
                    "2017-08-10": 104,
                    "2017-08-11": 123,
                    "2017-08-12": 129,
                    "2017-08-13": 105,
                    "2017-08-14": 116,
                    "2017-08-15": 125,
                    "2017-08-16": 104,
                    "2017-08-17": 99,
                    "2017-08-18": 131,
                    "2017-08-19": 121,
                    "2017-08-20": 105,
                    "2017-08-21": 122,
                    "2017-08-22": 118,
                    "2017-08-23": 114,
                    "2017-08-24": 118,
                    "2017-08-25": 125,
                    "2017-08-26": 124,
                    "2017-08-27": 122,
                    "2017-08-28": 116,
                    "2017-08-29": 114,
                    "2017-08-30": 110,
                    "2017-08-31": 111,
                    "2017-09-01": 127,
                    "2017-09-02": 116,
                    "2017-09-03": 110,
                    "2017-09-04": 116,
                    "2017-09-05": 130,
                    "2017-09-06": 126,
                    "2017-09-07": 103,
                    "2017-09-08": 103,
                    "2017-09-09": 144,
                    "2017-09-10": 122,
                    "2017-09-11": 105,
                    "2017-09-12": 123,
                    "2017-09-13": 110,
                    "2017-09-14": 100,
                    "2017-09-15": 107,
                    "2017-09-16": 118,
                    "2017-09-17": 100,
                    "2017-09-18": 114,
                    "2017-09-19": 104,
                    "2017-09-20": 101,
                    "2017-09-21": 106,
                    "2017-09-22": 113,
                    "2017-09-23": 86,
                    "2017-09-24": 118,
                    "2017-09-25": 100,
                    "2017-09-26": 136,
                    "2017-09-27": 97,
                    "2017-09-28": 67,
                    "2017-09-29": 104,
                    "2017-09-30": 100,
                    "2017-10-01": 93,
                    "2017-10-02": 79,
                    "2017-10-03": 82,
                    "2017-10-04": 70,
                    "2017-10-05": 72,
                    "2017-10-06": 87,
                    "2017-10-07": 80,
                    "2017-10-08": 98,
                    "2017-10-09": 89,
                    "2017-10-10": 102,
                    "2017-10-11": 107,
                    "2017-10-12": 95,
                    "2017-10-13": 91,
                    "2017-10-14": 115,
                    "2017-10-15": 107,
                    "2017-10-16": 102,
                    "2017-10-17": 95,
                    "2017-10-18": 103,
                    "2017-10-19": 99,
                    "2017-10-20": 106,
                    "2017-10-21": 131,
                    "2017-10-22": 129,
                    "2017-10-23": 97,
                    "2017-10-24": 118,
                    "2017-10-25": 108,
                    "2017-10-26": 102,
                    "2017-10-27": 94,
                    "2017-10-28": 102,
                    "2017-10-29": 107,
                    "2017-10-30": 111,
                    "2017-10-31": 94,
                    "2017-11-01": 109,
                    "2017-11-02": 100,
                    "2017-11-03": 101,
                    "2017-11-04": 110,
                    "2017-11-05": 116,
                    "2017-11-06": 96,
                    "2017-11-07": 120,
                    "2017-11-08": 117,
                    "2017-11-09": 109,
                    "2017-11-10": 86,
                    "2017-11-11": 121,
                    "2017-11-12": 106,
                    "2017-11-13": 103,
                    "2017-11-14": 114,
                    "2017-11-15": 116,
                    "2017-11-16": 100,
                    "2017-11-17": 86,
                    "2017-11-18": 100,
                    "2017-11-19": 98,
                    "2017-11-20": 104,
                    "2017-11-21": 92,
                    "2017-11-22": 98,
                    "2017-11-23": 95,
                    "2017-11-24": 118,
                    "2017-11-25": 141,
                    "2017-11-26": 124,
                    "2017-11-27": 105,
                    "2017-11-28": 121,
                    "2017-11-29": 110,
                    "2017-11-30": 123
                }
            }
        ],
        "from_cache": "2018-04-11 22:17:21"
    },

    "chart_929d1a70-f1ba-11e7-95bd-23bf7a251afe": {
        "result": [
            {
                "func": "count",
                "result": {
                    "七宝所": 4443,
                    "华坪所": 1202,
                    "华漕所": 1900,
                    "古美所": 1380,
                    "吴泾所": 975,
                    "塘湾所": 775,
                    "新虹所": 1232,
                    "新镇所": 1183,
                    "曹行所": 1396,
                    "杜行所": 2945,
                    "枢纽所": 857,
                    "梅陇所": 2887,
                    "水上所": 2,
                    "浦锦所": 1137,
                    "田园所": 949,
                    "碧江所": 1321,
                    "纪王所": 1137,
                    "航华所": 467,
                    "莘光所": 1489,
                    "莘庄所": 973,
                    "莘松所": 1306,
                    "虹桥所": 1906,
                    "金都所": 655,
                    "闵治所": 61,
                    "陈行所": 813,
                    "颛桥所": 1976,
                    "马桥所": 939,
                    "鲁汇所": 1012,
                    "龙柏所": 516
                }
            },
            {
                "func": "count",
                "result": {
                    "七宝所": 4443,
                    "华坪所": 1202,
                    "华漕所": 1900,
                    "古美所": 1380,
                    "吴泾所": 975,
                    "塘湾所": 775,
                    "新虹所": 1232,
                    "新镇所": 1183,
                    "曹行所": 1396,
                    "杜行所": 2945,
                    "枢纽所": 857,
                    "梅陇所": 2887,
                    "水上所": 2,
                    "浦锦所": 1137,
                    "田园所": 949,
                    "碧江所": 1321,
                    "纪王所": 1137,
                    "航华所": 467,
                    "莘光所": 1489,
                    "莘庄所": 973,
                    "莘松所": 1306,
                    "虹桥所": 1906,
                    "金都所": 655,
                    "闵治所": 61,
                    "陈行所": 813,
                    "颛桥所": 1976,
                    "马桥所": 939,
                    "鲁汇所": 1012,
                    "龙柏所": 516
                }
            },
            {
                "func": "count",
                "result": {
                    "七宝所": 4443,
                    "华坪所": 1202,
                    "华漕所": 1900,
                    "古美所": 1380,
                    "吴泾所": 975,
                    "塘湾所": 775,
                    "新虹所": 1232,
                    "新镇所": 1183,
                    "曹行所": 1396,
                    "杜行所": 2945,
                    "枢纽所": 857,
                    "梅陇所": 2887,
                    "水上所": 2,
                    "浦锦所": 1137,
                    "田园所": 949,
                    "碧江所": 1321,
                    "纪王所": 1137,
                    "航华所": 467,
                    "莘光所": 1489,
                    "莘庄所": 973,
                    "莘松所": 1306,
                    "虹桥所": 1906,
                    "金都所": 655,
                    "闵治所": 61,
                    "陈行所": 813,
                    "颛桥所": 1976,
                    "马桥所": 939,
                    "鲁汇所": 1012,
                    "龙柏所": 516
                }
            }
        ],
        "from_cache": "2018-04-11 22:17:19"
    },

    "chart_dfab0890-fc0a-11e7-a35b-5765c48c50c5": {
        "result": [
            {
                "func": "count",
                "result": {
                    "七宝所": 4443,
                    "华坪所": 1202,
                    "华漕所": 1900,
                    "古美所": 1380,
                    "吴泾所": 975,
                    "塘湾所": 775,
                    "新虹所": 1232,
                    "新镇所": 1183,
                    "曹行所": 1396,
                    "杜行所": 2945,
                    "枢纽所": 857,
                    "梅陇所": 2887,
                    "水上所": 2,
                    "浦锦所": 1137,
                    "田园所": 949,
                    "碧江所": 1321,
                    "纪王所": 1137,
                    "航华所": 467,
                    "莘光所": 1489,
                    "莘庄所": 973,
                    "莘松所": 1306,
                    "虹桥所": 1906,
                    "金都所": 655,
                    "闵治所": 61,
                    "陈行所": 813,
                    "颛桥所": 1976,
                    "马桥所": 939,
                    "鲁汇所": 1012,
                    "龙柏所": 516
                }
            },
            {
                "func": "count",
                "result": {
                    "七宝所": 4443,
                    "华坪所": 1202,
                    "华漕所": 1900,
                    "古美所": 1380,
                    "吴泾所": 975,
                    "塘湾所": 775,
                    "新虹所": 1232,
                    "新镇所": 1183,
                    "曹行所": 1396,
                    "杜行所": 2945,
                    "枢纽所": 857,
                    "梅陇所": 2887,
                    "水上所": 2,
                    "浦锦所": 1137,
                    "田园所": 949,
                    "碧江所": 1321,
                    "纪王所": 1137,
                    "航华所": 467,
                    "莘光所": 1489,
                    "莘庄所": 973,
                    "莘松所": 1306,
                    "虹桥所": 1906,
                    "金都所": 655,
                    "闵治所": 61,
                    "陈行所": 813,
                    "颛桥所": 1976,
                    "马桥所": 939,
                    "鲁汇所": 1012,
                    "龙柏所": 516
                }
            },
            {
                "func": "count",
                "result": {
                    "七宝所": 4443,
                    "华坪所": 1202,
                    "华漕所": 1900,
                    "古美所": 1380,
                    "吴泾所": 975,
                    "塘湾所": 775,
                    "新虹所": 1232,
                    "新镇所": 1183,
                    "曹行所": 1396,
                    "杜行所": 2945,
                    "枢纽所": 857,
                    "梅陇所": 2887,
                    "水上所": 2,
                    "浦锦所": 1137,
                    "田园所": 949,
                    "碧江所": 1321,
                    "纪王所": 1137,
                    "航华所": 467,
                    "莘光所": 1489,
                    "莘庄所": 973,
                    "莘松所": 1306,
                    "虹桥所": 1906,
                    "金都所": 655,
                    "闵治所": 61,
                    "陈行所": 813,
                    "颛桥所": 1976,
                    "马桥所": 939,
                    "鲁汇所": 1012,
                    "龙柏所": 516
                }
            }
        ],
        "from_cache": "2018-04-11 22:17:19"
    },

    "chart_0fd35f40-fc0b-11e7-a35b-5765c48c50c5": {
        "result": [
            {
                "func": "count",
                "result": {
                    "主要情节": 37836
                }
            },
            {
                "func": "count",
                "result": {
                    "name": 37836
                }
            }
        ],
        "from_cache": "2018-04-11 22:17:19"
    },

    "chart_0d71aab0-1dfb-11e8-a542-3d9959780aeb": {},

    "chart_2b0bfb20-33db-11e8-8316-97572f15498e-beifen": {
        "result": [
            {
                "extra": {
                    "name": "chart_2b0bfb20-33db-11e8-8316-97572f15498e",
                    "extra": {
                        "target": {
                            "show": true,
                            "digit": false,
                            "roundNum": 9
                        },
                        "section": [
                            {
                                "per": 33,
                                "color": "#5181E4"
                            },
                            {
                                "per": 66,
                                "color": "#9BCC66"
                            },
                            {
                                "per": 100,
                                "color": "#3FB27E"
                            }
                        ],
                        "echoText": {
                            "info": {
                                "alis": "2016年数值-求和",
                                "editType": false,
                                "realName": "2016年数值-求和"
                            },
                            "show": false,
                            "color": "#fff",
                            "fontSize": 12
                        },
                        "currentVal": {
                            "show": true,
                            "digit": false,
                            "roundNum": 9
                        },
                        "percentage": {
                            "show": true,
                            "digit": false,
                            "roundNum": 9
                        },
                        "warningColor": {
                            "show": true,
                            "color": "#429AFF"
                        }
                    },
                    "title": "全员劳动生产率(万元/人)2016年/2020年目标",
                    "yAxis": [
                        {
                            "items": [
                                {
                                    "db": "float",
                                    "key": "2016年数值",
                                    "func": "sum",
                                    "h_type": "number",
                                    "h_value": "2016年数值"
                                }
                            ],
                            "chart_type": "gauge"
                        },
                        {
                            "items": [
                                {
                                    "db": "float",
                                    "key": "2020年目标数值",
                                    "func": "sum",
                                    "h_type": "number",
                                    "h_value": "2020年目标数值"
                                }
                            ],
                            "chart_type": "gauge"
                        }
                    ],
                    "source": "customer",
                    "filters": [
                        {
                            "db": "str",
                            "key": "name",
                            "list": [
                                "全员劳动生产率(万元/人)"
                            ],
                            "h_type": "text",
                            "h_value": "名称"
                        }
                    ],
                    "chart_type": "gauge",
                    "object_type": "【试填】GY纲要指标（市政府）",
                    "target_type": "column",
                    "geometry_type": "point"
                },
                "create_time": "2018-03-30 13:28:24",
                "update_time": "2018-04-04 15:36:20"
            }
        ]
    },
    "chart_2b0bfb20-33db-11e8-8316-97572f15498e": {
        "geo_type": "point",
        "iconSkin": "tree_poi_icon",
        "id": "point_体育设施_customer_",
        "isParent": false,
        "items": [{
            "config": {
                "chart_type": "gauge",
                "filters": [
                    {
                        "db": "str",
                        "key": "name",
                        "list": [
                            "全员劳动生产率(万元/人)"
                        ],
                        "h_type": "text",
                        "h_value": "名称"
                    }
                ],
                "geometry_type": "point",
                "name": "chart_2b0bfb20-33db-11e8-8316-97572f15498e",
                "object_type": "【试填】GY纲要指标（市政府）",
                "source": "customer",
                "target_type": "column",
                "title": "全员劳动生产率(万元/人)2016年/2020年目标",
                "extra": {
                    "target": {
                        "show": true,
                        "digit": false,
                        "roundNum": 9
                    },
                    "section": [
                        {
                            "per": 33,
                            "color": "#5181E4"
                        },
                        {
                            "per": 66,
                            "color": "#9BCC66"
                        },
                        {
                            "per": 100,
                            "color": "#3FB27E"
                        }
                    ],
                    "echoText": {
                        "info": {
                            "alis": "2016年数值-求和",
                            "editType": false,
                            "realName": "2016年数值-求和"
                        },
                        "show": false,
                        "color": "#fff",
                        "fontSize": 12
                    },
                    "currentVal": {
                        "show": true,
                        "digit": false,
                        "roundNum": 9
                    },
                    "percentage": {
                        "show": true,
                        "digit": false,
                        "roundNum": 9
                    },
                    "warningColor": {
                        "show": true,
                        "color": "#429AFF"
                    }
                },
                "yAxis": [
                    {
                        "items": [
                            {
                                "db": "float",
                                "key": "2016年数值",
                                "func": "sum",
                                "h_type": "number",
                                "h_value": "2016年数值"
                            }
                        ],
                        "chart_type": "gauge"
                    },
                    {
                        "items": [
                            {
                                "db": "float",
                                "key": "2020年目标数值",
                                "func": "sum",
                                "h_type": "number",
                                "h_value": "2020年目标数值"
                            }
                        ],
                        "chart_type": "gauge"
                    }
                ],
            }
        }],
        "name": "体育设施",
        "packageId": "",
        "source": "customer"
    },

    "tableData": {
        "result": {
            "columns": ["app使用习惯", "lng", "家庭结构", "性别"],
            "values": [
                ["手机工具", 121.076, "婚姻-未婚", "男"],
                ["房产", 121.026, "婚姻-已婚未育", "男"],
                ["手机银行", 121.037, "婚姻-未婚", "男"],
                ["航班", 121.451, "家有小宝宝", "男"],
                ["房产", 121.04, "家有大宝宝", "男"],
                ["家居", 121.636, "家有小宝宝", "男"],
                ["打车", 121.256, "家有小宝宝", "男"],
                ["应用商店", 121.234, "家有小宝宝", "男"],
                ["外语", 121.044, "子女分户", "男"],
                ["词典翻译", 121.099, "婚姻-未婚", "男"]
            ]
        }
    }
}

module.exports = mockerData;