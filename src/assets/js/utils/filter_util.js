/**
  * Created by hzzcc on 2017/12/14.
  * @fileoverview
  */
 'use strict';
 import Pinyin from './PinYin'
 import cloneDeep from 'lodash/cloneDeep';
 import size from 'lodash/size';
 
 function filter_tree(nodes, key, value = '', childKey = "children") {
     nodes = cloneDeep(nodes);
     if (value === '') return nodes;
     if (!nodes || !key) return [];
     var result = [];
     for (var i = 0, l = nodes.length; i < l; i++) {
         if (typeof nodes[i][key] == "string" && !nodes[i].isParent && Pinyin.search(nodes[i][key], value)) {
             result.push(nodes[i]);
         } else {
             if (nodes[i][childKey]) {
                 var children = filter_tree(nodes[i][childKey], key, value, childKey);
                 if (size(children)) {
                     result.push({...nodes[i], [childKey]: children, open: true})
                 }
             }
         }
     }
     return result;
 }
 
 function get_node(nodes, key, value = '', childKey = "children") {
     if (!nodes || !key) return null;
     for (var i = 0, l = nodes.length; i < l; i++) {
         if (nodes[i][key] == value) {
             return nodes[i];
         }
         var tmp = get_node(nodes[i][childKey], key, value);
         if (tmp) return tmp;
     }
     return null;
 }
 
 function render_pid(nodes, pid = null, childKey = "children") {
     if (!nodes) return null;
     for (var i = 0, l = nodes.length; i < l; i++) {
         if (nodes[i][childKey]) {
             render_pid(nodes[i][childKey], nodes[i].id, childKey)
         }
         nodes[i]._pid = pid;
     }
 }

 function filter_list(nodes, value = ''){
     if(value === '') return nodes;
     if(!nodes) return [];
     var result = [];
     for (let i = 0; i < nodes.length; i += 1) {
         if (nodes[i].toLowerCase().indexOf(value.toLowerCase()) >= 0 || value.trim() === '') 
             result.push(nodes[i]);
     }
     return result;
 }
 
 module.exports = {
     filter_tree,
     get_node,
     render_pid,
     filter_list,
 }
 