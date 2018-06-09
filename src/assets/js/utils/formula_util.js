/**
  * Created by hzzcc on 2017/12/8.
  * @fileoverview
  */
 'use strict';
 import {Tree} from './tree_util'
 import {StringFromCharCodeExt} from './strUtil'
 import uniq from 'lodash/uniq'
 import slice from 'lodash/slice'
 import forEach from 'lodash/forEach'
 
 var getFormulaDFS = function (formula, headers, tdata) {
     tdata = tdata || [[]];
     let fms = {};
     const tree = new Tree();
     tree.add('_root_');
     forEach(formula, (fm, fcol) => {
         fm = fm || '';
         var fnode = tree.findBFS(fcol);
         if (fnode) {
             tree.add(fcol, fnode.data);
         } else {
             tree.add(fcol, '_root_');
         }
         tree.add(fcol, '_root_');
         forEach(headers, (h, index) => {
             let chr = StringFromCharCodeExt(index + 1);
             if (fm.split(`[${h.title}]::`).length >= 2) {
                 if (formula[h.title]) {
                     tree.addDeep(h.title, fcol);
                 }
                 fm = fm.split(`[${h.title}]::`).join(`${chr}$1:${chr}$${tdata[0].length}`);
             }
             if (fm.split(`[${h.title}]`).length >= 2) {
                 if (formula[h.title]) {
                     tree.addDeep(h.title, fcol);
                 }
                 fm = fm.split(`[${h.title}]`).join(`${chr}$1`);
             }
         })
         fms[fcol] = fm;
     });
     let fmArr = [];
     tree.traverseDFS(node => {
         fmArr.push(node.data);
     }, 'postOrder');
     fmArr = slice(fmArr, 0, -1);
     fmArr = uniq(fmArr);
     return [fms, fmArr];
 }
 
 module.exports = {
     getFormulaDFS,
 }
 